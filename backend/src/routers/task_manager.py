from fastapi import APIRouter, File, HTTPException, BackgroundTasks, UploadFile
from sqlalchemy import select, func, and_, case, distinct
from sqlalchemy.orm import selectinload
from sqlalchemy.sql.functions import coalesce
from typing import List
from datetime import datetime
from src.core.utils.dtos_builder import get_task_comment_preview
from src.dtos.events import ReviewerAddedEvent, CommentAddedEvent, CommentUpdatedEvent, ReviewerUpdatedEvent, TaskUpdatedEvent, TaskDeletedEvent, CommentDecomposedEvent, AttachmentUploadedEvent, TaskCommentAddedEvent
from src.core.events.event_dispatcher import EventDispatcher
from src.core.dependencies import DBSession, ProjectAuthor, ProjectMemberAny, ProjectCoauthor
from src.core.types import ID
from src.logic.attachment_service import AttachmentService
from src.models.comment.comment import Comment
from src.models.project_member import ProjectMember
from src.models.task.task import Task
from src.models.task.task_status import TaskStatus
from src.models.reviewer import Reviewer
from src.models.task_comment import TaskComment
from src.models.attachment import Attachment
from src.models.project.project import Project
from src.models.user.user_role import UserRole
from src.models.user.user import User
from src.dtos.reviewer.reviewer_comment import CommentDTO, CommentCreateDTO, CommentUpdateDTO, CommentShortDTO, CommentDetailDTO
from src.dtos.task.task import TaskPreviewDTO, TaskDetailDTO, TaskCreateDTO, TaskUpdateDTO, TaskDTO, TaskCommentCreateDTO, AttachmentCreateDTO, TaskCommentPreviewDTO, AttachmentDTO
from src.dtos.reviewer.reviewer import ReviewerDTO, ReviewerCreateDTO, ReviewerCommentsDTO, ProjectReviewersPageDTO

router = APIRouter(tags=["tasks"])

@router.post("/reviewers/add", response_model=ReviewerDTO)
async def add_reviewer(project_id: ID, data: ReviewerCreateDTO, db:DBSession, current_user: ProjectAuthor, background_tasks: BackgroundTasks): 
    reviewer = Reviewer(**data.model_dump(), project_id=project_id)
    db.add(reviewer)
    await db.commit()
    await db.refresh(reviewer)

    event = ReviewerAddedEvent(user_id=current_user.user.id, project_id=project_id, reviewer_id=reviewer.id)
    EventDispatcher.create_event(background_tasks, event)

    return reviewer

@router.patch("/reviewers/{reviewer_id}", response_model=ReviewerDTO)
async def update_reviewer(project_id: ID, reviewer_id: ID, data: ReviewerCreateDTO, db:DBSession, current_user: ProjectAuthor, background_tasks: BackgroundTasks): 
    query=(select(Reviewer).where(Reviewer.id == reviewer_id, Reviewer.project_id == project_id).limit(1))
    result = await db.execute(query)
    reviewer = result.scalar_one_or_none()
    if not reviewer:
        raise HTTPException(status_code=404, detail="Рецензент не найден")
    reviewer.update(data)
    await db.commit()
    await db.refresh(reviewer)

    event = ReviewerUpdatedEvent(user_id=current_user.user.id, project_id=project_id, reviewer_id=reviewer.id)
    EventDispatcher.create_event(background_tasks, event)

    return reviewer

@router.post("/reviewers/{reviewer_id}/comments/add", response_model=CommentDTO)
async def create_comment(project_id: ID, reviewer_id: ID, data: CommentCreateDTO, db: DBSession, current_user: ProjectAuthor, background_tasks: BackgroundTasks):   
    comment = Comment(**data.model_dump(), reviewer_id=reviewer_id)
    db.add(comment)
    await db.commit()
    await db.refresh(comment)

    event = CommentAddedEvent(user_id=current_user.user.id, project_id=project_id, reveiwer_id=reviewer_id)
    EventDispatcher.create_event(background_tasks, event)

    return comment

@router.patch("/reviewers/{reviewer_id}/comments/{comment_id}", response_model=CommentDTO)
async def update_comment(project_id: ID, comment_id: ID, data: CommentUpdateDTO, db: DBSession, current_user: ProjectAuthor, background_tasks: BackgroundTasks):
    query=(select(
        Comment,
        (Reviewer.id != None).label("reviewer_exists")
        ).outerjoin(Reviewer, and_(
            Comment.reviewer_id == Reviewer.id,
            Reviewer.id == data.reviewer_id
        )).outerjoin(Project, Reviewer.project_id == Project.id)
        .where(Comment.id == comment_id)
    )
    result = await db.execute(query)
    responses = result.fetchone()
    if not responses:
        raise HTTPException(status_code=404, detail="Замечание не найдено")
    if not responses.reviewer_exists:
        raise HTTPException(status_code=404, detail="Рецензия не найдена")

    comment = responses.Comment
    comment.update(data)
    await db.commit()
    await db.refresh(comment)

    event = CommentUpdatedEvent(user_id=current_user.user.id, project_id=project_id, comment_id=comment.id, changed_fields=list(data.model_dump(exclude_unset=True).keys()))
    EventDispatcher.create_event(background_tasks, event)

    return comment

@router.get("/reviewers", response_model=ProjectReviewersPageDTO)
async def get_reviewers_board(project_id: ID, db: DBSession, current_user: ProjectMemberAny):
    query = (
        select(
            Reviewer,
            Comment,
            func.count(distinct(Task.id)).label("tasks_count"),
            coalesce(func.count(distinct(case((Task.status == TaskStatus.ready_for_review, Task.id)))), 0).label("completed_tasks_count")
        )
        .join(Project, Reviewer.project_id == Project.id)
        .outerjoin(Comment, and_(Comment.reviewer_id == Reviewer.id, Comment.deleted_at == None))
        .outerjoin(Task, Comment.id == Task.comment_id)
        .where(
            Project.id == project_id,
            Project.deleted_at == None
        )
        .group_by(Reviewer.id, Comment.id)
        .order_by(Reviewer.name, Comment.created_at.desc())
    )
    response = await db.execute(query)
    results = response.all()
    reviewers = {}
    for r in results:
        rev_id = r.Reviewer.id
        if rev_id not in reviewers:
            reviewers[rev_id] = ReviewerCommentsDTO.model_validate({**ReviewerDTO.model_validate(r.Reviewer).model_dump()})
            reviewers[rev_id].comments = []
        if r.Comment:
            comment_dto = CommentShortDTO.model_validate(r.Comment)
            comment_dto.tasks_count = r.tasks_count
            comment_dto.completed_tasks_count = r.completed_tasks_count
            reviewers[rev_id].comments.append(comment_dto)
    return ProjectReviewersPageDTO(reviewers=list(reviewers.values()))

@router.get("/reviewers/{reviewer_id}/comments/{comment_id}", response_model=CommentDetailDTO)
async def get_comment(comment_id: ID, db: DBSession, current_user: ProjectMemberAny):
    query = (select(Comment,
                    func.count(distinct(Task.id)).label("tasks_count"),
                coalesce(func.count(distinct(case((Task.status == TaskStatus.ready_for_review, Task.id), else_=None))), 0).label("completed_tasks_count")
                ).outerjoin(Task, Comment.id == Task.comment_id)
            .join(Reviewer, Comment.reviewer_id == Reviewer.id)
            .join(Project, Reviewer.project_id == Project.id))
    query = query.where(
        Comment.id == comment_id,
        Comment.deleted_at == None,
        Project.deleted_at == None
    ).group_by(Comment.id)
    response = await db.execute(query)
    result=response.fetchone()
    if not result:
        raise HTTPException(status_code=404, detail="Замечание не найдено")
    comment = CommentDetailDTO.model_validate(result.Comment)
    comment.tasks_count = result.tasks_count
    comment.completed_tasks_count = result.completed_tasks_count
    return comment  

@router.get("/tasks", response_model=List[TaskPreviewDTO])
async def get_kanban_tasks(project_id: ID, db: DBSession, current_user: ProjectMemberAny):
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
    filters = [
        Reviewer.project_id == project_id,
        Task.deleted_at == None
    ]
    if current_user.role == UserRole.coauthor:
        filters.append(Task.assignee_id == current_user.user.id)
    query = (
        select(
            Task,
            Comment.priority,
            Reviewer.id.label("reviewer_id"),
            User.username.label("assignee"),
            Project.deadline.label("deadline"),
            attachments_count_sub.label("attachments_count"),
            task_comments_count_sub.label("comments_count")
        )
        .join(Comment, Task.comment_id == Comment.id)
        .join(Reviewer, Comment.reviewer_id == Reviewer.id)
        .outerjoin(User, Task.assignee_id == User.id)
        .join(Project, Reviewer.project_id == Project.id)
        .where(*filters)
        .order_by(Task.created_at.desc())
    )
    result = await db.execute(query)
    rows = result.all()
    tasks = []
    for r in rows:
        task = TaskPreviewDTO.model_validate({
            **TaskDTO.model_validate(r.Task).model_dump(),
            "reviewer_id": r.reviewer_id,
            "deadline": r.deadline,
            "priority": r.priority,
            "assignee": r.assignee,
            "comments_count": r.comments_count,
            "attachments_count": r.attachments_count
        }).model_dump() 
        tasks.append(task)
    return tasks

@router.get("/tasks/{task_id}", response_model=TaskDetailDTO)
async def get_task_details(project_id: ID, task_id: ID, db: DBSession, current_user: ProjectMemberAny):
    query = (
        select(Task)
        .options(selectinload(Task.attachments), selectinload(Task.task_comments))
        .join(Comment, Comment.id == Task.comment_id).join(Reviewer, Reviewer.id == Comment.reviewer_id)
        .where(Task.id == task_id, Reviewer.project_id == project_id, Task.deleted_at == None)
    ).limit(1)
    result = await db.execute(query)
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, detail="Задача не найдена")
    return TaskDetailDTO.model_validate(task)

@router.patch("/tasks/{task_id}", response_model=TaskDTO)
async def update_task(project_id: ID, task_id: ID, data: TaskUpdateDTO, db: DBSession, current_user: ProjectMemberAny, background_tasks: BackgroundTasks):
    query = (
        select(Task)
        .join(Comment, Comment.id == Task.comment_id).join(Reviewer, Reviewer.id == Comment.reviewer_id)
        .where(Task.id == task_id, Reviewer.project_id == project_id, Task.deleted_at == None)).limit(1)
    result = await db.execute(query)
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, detail="Задача не найдена")
    if current_user.role == UserRole.coauthor:
        if task.assignee_id != current_user.user.id:
            raise HTTPException(403, detail="Недостаточно прав. Вы не являетесь исполнителем задачи.")
        if set(data.model_dump(exclude_unset=True).keys()) > {"status"}:
            raise HTTPException(403, detail="Исполнитель может менять только статус")
        allowed = {TaskStatus.todo, TaskStatus.in_progress, TaskStatus.completed}
        if data.status and data.status not in allowed:
            raise HTTPException(403, f"Недопустимый статус для исполнителя")
    elif current_user.role == UserRole.editor:
        if set(data.model_dump(exclude_unset=True).keys()) > {"status"}:
            raise HTTPException(403, detail="Редактор может менять только статус")
        allowed = {TaskStatus.completed, TaskStatus.ready_for_review, TaskStatus.in_progress}
        if data.status and data.status not in allowed:
            raise HTTPException(403, "Недопустимый статус для редактора")
    task.update(data)

    await db.commit()
    await db.refresh(task)

    event = TaskUpdatedEvent(user_id=current_user.user.id, project_id=project_id, task_id=task.id, changed_fields=list(data.model_dump(exclude_unset=True).keys()))
    EventDispatcher.create_event(background_tasks, event)
        
    return task

@router.delete("/tasks/{task_id}")
async def delete_task(project_id: ID, task_id: ID, db: DBSession, current_user: ProjectAuthor, background_tasks: BackgroundTasks):
    query = (select(Task)
             .join(Comment, Comment.id == Task.comment_id)
             .join(Reviewer, Reviewer.id == Comment.reviewer_id)
             .where(Reviewer.project_id == project_id, Task.deleted_at == None)).limit(1)
    result = await db.execute(query)
    responses = result.fetchone()
    responses.Task.deleted_at = datetime.now()
    await db.commit()

    event = TaskDeletedEvent(user_id=current_user.user.id, project_id=project_id, task_id=task_id, payload={"task_id": task_id})
    EventDispatcher.create_event(background_tasks, event)

    return {"message": "Задача удалена"}

@router.post("/reviewers/{reviewer_id}/comments/{comment_id}/decompose", response_model=List[TaskDTO])
async def decompose_comment(project_id: ID, reviewer_id: ID, comment_id: ID, data:List[TaskCreateDTO], db: DBSession, current_user: ProjectAuthor, background_tasks: BackgroundTasks):
    query = (
        select(Comment, Project.deadline)
        .join(Reviewer, Comment.reviewer_id == Reviewer.id)
        .join(Project, Project.id == Reviewer.project_id)
        .where(
            Comment.id == comment_id,
            Reviewer.id == reviewer_id,
            Reviewer.project_id == project_id,
            Comment.deleted_at == None,
            Project.deleted_at == None
        ).limit(1)
    )
    response = await db.execute(query)
    results = response.fetchone()

    if not results:
        raise HTTPException(
            status_code=404, 
            detail="Замечание не найдено"
        )
    tasks=[]
    for t in data:
        task=Task(**t.model_dump(), comment_id=comment_id)
        tasks.append(task)
    db.add_all(tasks)
    await db.commit()

    event = CommentDecomposedEvent(user_id=current_user.user.id, project_id=project_id, comment_id=comment_id)
    EventDispatcher.create_event(background_tasks, event)

    return tasks

@router.post("/tasks/{task_id}/chat", response_model=TaskCommentPreviewDTO)
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

@router.get("/tasks/{task_id}/chat", response_model=List[TaskCommentPreviewDTO])
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

@router.post("/tasks/{task_id}/attachments", response_model=AttachmentDTO)
async def upload_attachment(project_id: ID, task_id: ID, db: DBSession, current_user: ProjectCoauthor, background_tasks: BackgroundTasks, file: UploadFile = File(...)):
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
    attachment = await AttachmentService.upload_file(db, task_id, file)
    await db.commit()
    await db.refresh(attachment)

    event = AttachmentUploadedEvent(user_id=current_user.user.id, project_id=project_id, task_id=task_id, attachment_id=attachment.id)
    EventDispatcher.create_event(background_tasks, event)
    
    return attachment

@router.get("/tasks/{task_id}/attachments", response_model=List[AttachmentDTO])
async def get_attachments(project_id: ID, task_id: ID, db: DBSession, current_user: ProjectMemberAny):
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
        select(Attachment)
        .where(Attachment.task_id == task_id)
        .order_by(Attachment.uploaded_at.asc())
    )
    result = await db.execute(query)
    attachments = result.scalars().all()
    
    return attachments

@router.get("/tasks/{task_id}/attachments/{attachment_id}/preview")
async def preview_attachment(task_id: ID, attachment_id: ID, db: DBSession, current_user: ProjectMemberAny):
    query = (
        select(Attachment)
        .where(Attachment.task_id == task_id, Attachment.id == attachment_id).limit(1)
        )
    result = await db.execute(query)
    attachment = result.scalar_one_or_none()
    if not attachment:
        raise HTTPException(status_code=404, detail="Вложение не найдено")
    return await AttachmentService.get_file_preview(attachment)

@router.get("/tasks/{task_id}/attachments/{attachment_id}/download")
async def download_attachment(task_id: ID, attachment_id: ID, db: DBSession, current_user: ProjectMemberAny):
    query = (
        select(Attachment)
        .where(Attachment.task_id == task_id, Attachment.id == attachment_id).limit(1)
        )
    result = await db.execute(query)
    attachment = result.scalar_one_or_none()
    if not attachment:
        raise HTTPException(status_code=404, detail="Вложение не найдено")
    return await AttachmentService.download_file(attachment)