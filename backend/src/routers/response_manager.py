from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy import select, and_
from typing import List
from src.core.dependencies import DBSession, ProjectEditor, ProjectMemberAny, ProjectAuthor
from src.core.types import ID
from src.dtos.events import ResponseApprovedEvent, ResponseSavedEvent
from src.logic.document_converter import DocumentConverter
from src.models.response import Response
from src.models.comment.comment import Comment
from src.dtos.response.response import ExportDTO, ResponseApproveDTO, ResponseDTO, ResponseSaveDTO
from src.core.events.event_dispatcher import EventDispatcher

router = APIRouter(prefix="/responses", tags=["responses"])

@router.get("/", response_model=ResponseDTO)
async def get_comment_response(project_id: ID, reviewer_id: ID, comment_id: ID, db: DBSession, current_user: ProjectMemberAny):
    query = select(Response).join(Comment, Response.comment_id == Comment.id).where(Response.comment_id == comment_id, Comment.deleted_at==None)
    result = await db.execute(query)
    response = result.scalar_one_or_none()
    if not response:
        raise HTTPException(404, "Ответ на замечание не найден")
    return response

@router.post("/", response_model=ResponseDTO)
async def save_response(project_id: ID, reviewer_id: ID, comment_id: ID, data: ResponseSaveDTO, db: DBSession, current_user: ProjectAuthor, background_tasks: BackgroundTasks):
    comment = await db.get(Comment, comment_id)
    if not comment:
        raise HTTPException(404, "Замечание не найдено")

    query = select(Response).where(Response.comment_id == comment_id)
    result = await db.execute(query)
    response = result.scalar_one_or_none()

    if response:
        response.update(data)
    else:
        response = Response(comment_id=comment_id, response_md=data.response_md)
        db.add(response)

    await db.commit()
    await db.refresh(response)

    event = ResponseSavedEvent(user_id=current_user.user.id, project_id=project_id, reviewer_id=reviewer_id, comment_id=comment.id, response_id=response.id)
    EventDispatcher.create_event(background_tasks, event)

    return response

@router.patch("/{response_id}", response_model=ResponseDTO)
async def approve_response(project_id: ID, reviewer_id: ID, comment_id: ID, response_id: ID, data: ResponseApproveDTO, db: DBSession, current_user: ProjectEditor, background_tasks: BackgroundTasks):
    response = await db.get(Response, response_id)
    if not response:
        raise HTTPException(404, "Ответ не найден")
    
    response.approve(data)
    await db.commit()
    await db.refresh(response)

    event = ResponseApprovedEvent(user_id=current_user.user.id, project_id=project_id, reviewer_id=reviewer_id, comment_id=comment_id, response_id=response.id)
    EventDispatcher.create_event(background_tasks, event)

    return response

@router.post("/{response_id}/export")
async def export_response(project_id: ID, reviewer_id: ID, comment_id: ID, response_id: ID, data: ExportDTO, db: DBSession, current_user: ProjectMemberAny) -> FileResponse:
    response = await db.get(Response, response_id)
    if not response:
        raise HTTPException(404, "Ответ не найден")

    content = response.response_md
    file_path = DocumentConverter.convert(content, to_format=data.format, is_file=False)
        
    return FileResponse(
        path=file_path,
        filename=f"Response_{response_id}.{data.format}",
        media_type="application/octet-stream"
    )