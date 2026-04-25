from typing import List
from fastapi import APIRouter, BackgroundTasks, File, HTTPException, UploadFile
from sqlalchemy import select
from src.core.dependencies import DBSession, ProjectCoauthor, ProjectMemberAny
from src.core.events.event_dispatcher import EventDispatcher
from src.core.types import ID
from src.dtos.events import AttachmentUploadedEvent
from src.dtos.task.task import AttachmentDTO
from src.logic.attachment_service import AttachmentService
from src.models.attachment import Attachment
from src.models.comment.comment import Comment
from src.models.reviewer import Reviewer
from src.models.task.task import Task


router = APIRouter(prefix="/attachments", tags=["attachments"])

@router.post("", response_model=AttachmentDTO)
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

@router.get("", response_model=List[AttachmentDTO])
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

@router.get("/{attachment_id}/preview")
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

@router.get("/{attachment_id}/download")
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