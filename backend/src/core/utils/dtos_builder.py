from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from src.core.types import ID
from src.dtos.project.project import ProjectDTO, ProjectPreviewDTO
from src.dtos.project.project_member import ProjectMemberPreviewDTO
from src.dtos.reviewer.reviewer import ReviewerDTO
from src.dtos.reviewer.reviewer_comment import CommentDTO
from src.models.attachment import Attachment
from src.models.project_member import ProjectMember
from src.models.task_comment import TaskComment
from src.models.comment.comment import Comment
from src.models.task.task import Task
from src.models.reviewer import Reviewer
from src.models.user.user import User
from src.models.project.project import Project
from src.dtos.task.task import *
from src.core.database import DBSession


async def get_task_preview(task_id: ID) -> TaskPreviewDTO:
    attachments_count_sub = (
        select(func.count(Attachment.id))
        .where(Attachment.task_id == Task.id)
        .scalar_subquery()
    )   
    task_comments_count_sub = (
        select(func.count(TaskComment.id))
        .where(TaskComment.task_id == Task.id)
        .scalar_subquery()
    )
    
    query = (
        select(
            Task,
            Comment.priority,
            Reviewer.id.label("reviewer_id"),
            User.username.label("assignee"),
            Project.deadline.label("deadline"),
            attachments_count_sub.label("attachments_count"),
            task_comments_count_sub.label("task_comments_count")
        )
        .join(Comment, Task.comment_id == Comment.id)
        .join(Reviewer, Comment.reviewer_id == Reviewer.id)
        .outerjoin(User, Task.assignee_id == User.id)
        .join(Project, Reviewer.project_id == Project.id)
        .where(Task.id == task_id)
    )
    async with DBSession() as db:
        result = await db.execute(query)
    r = result.fetchone()
    if not r:
        return {}

    data=TaskPreviewDTO.model_validate({
        **TaskDTO.model_validate(r.Task).model_dump(),
        "reviewer_id": r.reviewer_id,
        "deadline": r.deadline,
        "priority": r.priority,
        "assignee": r.assignee,
        "comments_count": r.task_comments_count or 0,
        "attachments_count": r.attachments_count or 0
    })
    return data

async def get_project_preview(project_id: ID) -> ProjectPreviewDTO:
    query = (
        select(
            Project,
            func.count(Task.id).label("total_tasks_count"),
            func.count(Task.id).filter(Task.completed_at != None).label("completed_tasks_count")
        )
        .outerjoin(Reviewer, Reviewer.project_id == Project.id)
        .outerjoin(Comment, Comment.reviewer_id == Reviewer.id)
        .outerjoin(Task, Task.comment_id == Comment.id)
        .where(Project.id == project_id)
        .group_by(Project.id)
    )
    async with DBSession() as db:
        result = await db.execute(query)
        r = result.fetchone()
        if not r: return None
        return ProjectPreviewDTO.model_validate({
            **ProjectDTO.model_validate(r.Project).model_dump(),
            "total_tasks_count": r.total_tasks_count,
            "completed_tasks_count": r.completed_tasks_count
        })

async def get_task_comment_preview(comment_id: ID) -> TaskCommentPreviewDTO:
    query = (
        select(TaskComment, User.username, ProjectMember.role)
        .join(User, TaskComment.user_id == User.id)
        .join(Task, Task.id == TaskComment.task_id)
        .join(Comment, Comment.id == Task.comment_id)
        .join(Reviewer, Reviewer.id == Comment.reviewer_id)
        .join(Project, Reviewer.project_id == Project.id)
        .join(ProjectMember, ProjectMember.project_id == Project.id)
        .where(TaskComment.id == comment_id, User.id==ProjectMember.user_id)
    )
    async with DBSession() as db:
        result = await db.execute(query)
    r = result.fetchone()
    if not r: return None
    return TaskCommentPreviewDTO(
        username=r.username,
        role=r.role,
        message=r.TaskComment.message,
        created_at=r.TaskComment.created_at
    )

async def get_attachment_dto(attachment_id: ID) -> AttachmentDTO:
    async with DBSession() as db:
        res = await db.get(Attachment, attachment_id)
        return AttachmentDTO.model_validate(res) if res else None

async def get_comment_dto(comment_id: ID) -> CommentDTO:
    async with DBSession() as db:
        res = await db.get(Comment, comment_id)
        return CommentDTO.model_validate(res) if res else None
    
async def get_member_preview(project_id: ID, user_id: ID) -> ProjectMemberPreviewDTO:
    query = (
        select(ProjectMember)
        .options(selectinload(ProjectMember.user))
        .where(ProjectMember.project_id == project_id, ProjectMember.user_id == user_id)
    )
    async with DBSession() as db:
        res = await db.execute(query)
        member = res.scalar_one_or_none()
        return ProjectMemberPreviewDTO.model_validate(member) if member else None

async def get_tasks_by_comment(comment_id: ID) -> list[TaskPreviewDTO]:
    attachments_count_sub = (
        select(func.count(Attachment.id))
        .where(Attachment.task_id == Task.id)
        .scalar_subquery()
    )   
    task_comments_count_sub = (
        select(func.count(TaskComment.id))
        .where(TaskComment.task_id == Task.id)
        .scalar_subquery()
    )
    
    query = (
        select(
            Task,
            Comment.priority,
            Reviewer.id.label("reviewer_id"),
            User.username.label("assignee"),
            Project.deadline.label("deadline"),
            attachments_count_sub.label("attachments_count"),
            task_comments_count_sub.label("task_comments_count")
        )
        .join(Comment, Task.comment_id == Comment.id)
        .join(Reviewer, Comment.reviewer_id == Reviewer.id)
        .outerjoin(User, Task.assignee_id == User.id)
        .join(Project, Reviewer.project_id == Project.id)
        .where(Task.comment_id == comment_id)
    )

    async with DBSession() as db:
        result = await db.execute(query)
        rows = result.all()
        
    return [
        TaskPreviewDTO.model_validate({
            **TaskDTO.model_validate(r.Task).model_dump(),
            "reviewer_id": r.reviewer_id,
            "priority": r.priority,
            "assignee": r.assignee,
            "deadline": r.deadline,
            "attachments_count": r.attachments_count,
            "comments_count": r.task_comments_count
        }) for r in rows
    ]

async def get_reviewer_dto(reviewer_id: ID) -> ReviewerDTO:
    async with DBSession() as db:
        query = select(Reviewer).where(Reviewer.id == reviewer_id)
        result = await db.execute(query)
        reviewer = result.scalar_one_or_none()
        
        if not reviewer:
            return None
            
        return ReviewerDTO.model_validate(reviewer)