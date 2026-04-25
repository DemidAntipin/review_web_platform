
from typing import List

from fastapi import APIRouter, BackgroundTasks, HTTPException
from sqlalchemy import and_, select

from src.core.dependencies import DBSession, ProjectMemberAny
from src.core.events.event_dispatcher import EventDispatcher
from src.core.types import ID
from src.core.utils.dtos_builder import get_task_comment_preview
from src.dtos.events import TaskCommentAddedEvent
from src.dtos.task.task import TaskCommentCreateDTO, TaskCommentPreviewDTO
from src.models.comment.comment import Comment
from src.models.project_member import ProjectMember
from src.models.reviewer import Reviewer
from src.models.task.task import Task
from src.models.task_comment import TaskComment
from src.models.user.user import User


router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("", response_model=TaskCommentPreviewDTO)
async def add_task_comment(project_id: ID, task_id: ID, data: TaskCommentCreateDTO, db: DBSession, current_user: ProjectMemberAny, background_tasks: BackgroundTasks):
    query = (
        select(Task.id)
        .join(Comment, Comment.id == Task.comment_id)
        .join(Reviewer, Comment.reviewer_id == Reviewer.id)
        .where(Task.id == task_id, Task.deleted_at == None, Reviewer.project_id == project_id).limit(1)
        )
    result = await db.execute(query)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(404, detail="Задача не найдена")
    
    chat_message = TaskComment(task_id=task_id, user_id=current_user.user.id, message=data.message)
    db.add(chat_message)
    await db.commit()
    await db.refresh(chat_message)

    event = TaskCommentAddedEvent(user_id=current_user.user.id, project_id=project_id, task_id=task_id, chat_message_id=chat_message.id)
    EventDispatcher.create_event(background_tasks, event)

    return await get_task_comment_preview(chat_message.id)

@router.get("", response_model=List[TaskCommentPreviewDTO])
async def get_task_comments(project_id: ID, task_id: ID, db: DBSession, current_user: ProjectMemberAny):
    query = (
        select(Task.id)
        .join(Comment, Comment.id == Task.comment_id)
        .join(Reviewer, Comment.reviewer_id == Reviewer.id)
        .where(Task.id == task_id, Task.deleted_at == None, Reviewer.project_id == project_id).limit(1)
        )
    result = await db.execute(query)
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, detail="Задача не найдена")
    
    query = (
        select(
            TaskComment.id,
            TaskComment.task_id,
            TaskComment.user_id,
            User.username,
            ProjectMember.role,
            TaskComment.message,
            TaskComment.created_at
        )
        .join(User, TaskComment.user_id == User.id)
        .join(Task, TaskComment.task_id == Task.id)
        .join(Comment, Task.comment_id == Comment.id)
        .join(Reviewer, Comment.reviewer_id == Reviewer.id)
        .join(
            ProjectMember, 
            and_(
                ProjectMember.user_id == User.id,
                ProjectMember.project_id == Reviewer.project_id
            )
        )
        .where(TaskComment.task_id == task_id)
        .order_by(TaskComment.created_at.asc())
    )
    result = await db.execute(query)
    comments = result.mappings().all()
    return comments