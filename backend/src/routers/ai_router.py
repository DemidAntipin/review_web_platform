import asyncio
import time

from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from src.core.dependencies import DBSession, ProjectAuthor
from src.core.types import ID
from src.core.utils.prompt_builder import PromptBuilder
from src.logic.ai_service import AIService
from src.dtos.ai import AIRequestDTO, AIResponseDTO
from src.models.comment.comment import Comment
from src.models.project.project import Project
from src.models.task.task import Task
from src.models.task.task_status import TaskStatus

router = APIRouter(prefix="/ai", tags=["ai"])

service = AIService()

@router.post("/generate_response", response_model=AIResponseDTO)
async def generate_response(project_id: ID, reviewer_id: ID, comment_id: ID, db: DBSession, current_user: ProjectAuthor):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Проект не найден")

    result = await db.execute(
        select(Comment)
        .options(joinedload(Comment.reviewer))
        .where(Comment.id == comment_id)
    )
    comment = result.scalar_one_or_none()
    if not comment or comment.reviewer.project_id != project.id:
        raise HTTPException(status_code=404, detail="Замечание не найдено в данном проекте")

    query = select(Task).where(Task.comment_id == comment_id, Task.status == TaskStatus.ready_for_review)
    result = await db.execute(query)
    tasks = list(result.scalars().all())

    generated_text = await service.generate_template(project, comment, tasks)

    return AIResponseDTO(response=generated_text)