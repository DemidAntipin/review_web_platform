from datetime import datetime

from fastapi import APIRouter, BackgroundTasks, HTTPException
from sqlalchemy import and_, case, distinct, func, select, update
from src.core.dependencies import DBSession, ProjectAuthor, ProjectMemberAny
from src.core.events.event_dispatcher import EventDispatcher
from src.core.types import ID
from src.dtos.events import ReviewerAddedEvent, ReviewerRemovedEvent, ReviewerUpdatedEvent
from src.dtos.reviewer.reviewer import ProjectReviewersPageDTO, ReviewerCommentsDTO, ReviewerCreateDTO, ReviewerDTO
from src.dtos.reviewer.reviewer_comment import CommentDetailDTO
from src.models.comment.comment import Comment
from src.models.project.project import Project
from src.models.reviewer import Reviewer
from src.models.task.task import Task
from src.models.task.task_status import TaskStatus
from src.routers import comments_manager


router = APIRouter(prefix="/reviewers", tags=["reviewers"])
router.include_router(comments_manager.router, prefix="/{reviewer_id}")

@router.post("/add", response_model=ReviewerDTO)
async def add_reviewer(project_id: ID, data: ReviewerCreateDTO, db:DBSession, current_user: ProjectAuthor, background_tasks: BackgroundTasks): 
    reviewer = Reviewer(**data.model_dump(), project_id=project_id)
    db.add(reviewer)
    await db.commit()
    await db.refresh(reviewer)

    event = ReviewerAddedEvent(user_id=current_user.user.id, project_id=project_id, reviewer_id=reviewer.id)
    EventDispatcher.create_event(background_tasks, event)

    return reviewer

@router.patch("/{reviewer_id}", response_model=ReviewerDTO)
async def update_reviewer(project_id: ID, reviewer_id: ID, data: ReviewerCreateDTO, db:DBSession, current_user: ProjectAuthor, background_tasks: BackgroundTasks): 
    query=(select(Reviewer).where(Reviewer.id == reviewer_id, Reviewer.project_id == project_id, Reviewer.deleted_at==None).limit(1))
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

@router.delete("/{reviewer_id}")
async def delete_reviewer(project_id:ID, reviewer_id: ID, db:DBSession, current_user: ProjectAuthor, background_tasks: BackgroundTasks):
    query = (select(Reviewer).where(Reviewer.id == reviewer_id, Reviewer.project_id == project_id, Reviewer.deleted_at==None)).limit(1)
    result = await db.execute(query)
    reviewer = result.scalar_one_or_none()
    if not reviewer:
        raise HTTPException(status_code=404, detail="Рецензент не найден")
    now = func.now()
    await db.execute(update(Task).where(
            Task.comment_id.in_(select(Comment.id).where(Comment.reviewer_id == reviewer_id)),
            Task.deleted_at == None
        ).values(deleted_at=now)
    )
    await db.execute(update(Comment)
        .where(Comment.reviewer_id == reviewer_id, Comment.deleted_at == None)
        .values(deleted_at=now)
    )
    reviewer.deleted_at = datetime.now()
    await db.commit()

    event = ReviewerRemovedEvent(user_id=current_user.user.id, project_id=project_id, reviewer_id=reviewer.id)
    EventDispatcher.create_event(background_tasks, event)

    return {"success": "ok"}

@router.get("", response_model=ProjectReviewersPageDTO)
async def get_reviewers_board(project_id: ID, db: DBSession, current_user: ProjectMemberAny):
    query = (
        select(
            Reviewer,
            Comment,
            func.count(distinct(case((Task.deleted_at == None, Task.id), else_=None))).label("tasks_count"),
            func.count(distinct(case((and_(Task.status == TaskStatus.ready_for_review, Task.deleted_at == None), Task.id), else_=None))).label("completed_tasks_count")
        )
        .join(Project, Reviewer.project_id == Project.id)
        .outerjoin(Comment, and_(Comment.reviewer_id == Reviewer.id, Comment.deleted_at == None))
        .outerjoin(Task, and_(Comment.id == Task.comment_id, Task.deleted_at==None))
        .where(
            Project.id == project_id,
            Project.deleted_at == None,
            Reviewer.deleted_at==None
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
            comment_dto = CommentDetailDTO.model_validate(r.Comment)
            comment_dto.tasks_count = r.tasks_count
            comment_dto.completed_tasks_count = r.completed_tasks_count
            reviewers[rev_id].comments.append(comment_dto)
    return ProjectReviewersPageDTO(reviewers=list(reviewers.values()))