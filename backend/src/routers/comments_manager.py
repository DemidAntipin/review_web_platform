from datetime import datetime
from typing import List
from fastapi import APIRouter, BackgroundTasks, HTTPException
from sqlalchemy import and_, case, distinct, func, select, update
from src.core.dependencies import DBSession, ProjectAuthor, ProjectMemberAny
from src.core.events.event_dispatcher import EventDispatcher
from src.core.types import ID
from src.dtos.events import CommentAddedEvent, CommentDecomposedEvent, CommentDeletedEvent, CommentUpdatedEvent
from src.dtos.reviewer.reviewer_comment import CommentCreateDTO, CommentDTO, CommentDetailDTO, CommentUpdateDTO
from src.dtos.task.task import TaskDecompositionDTO
from src.models.comment.comment import Comment
from src.models.project.project import Project
from src.models.reviewer import Reviewer
from src.models.task.task import Task
from src.models.task.task_status import TaskStatus
from src.routers import response_manager

router = APIRouter(prefix="/comments", tags=["comments"])
router.include_router(response_manager.router, prefix="/{comment_id}")

@router.post("/add", response_model=CommentDTO)
async def create_comment(project_id: ID, reviewer_id: ID, data: CommentCreateDTO, db: DBSession, current_user: ProjectAuthor, background_tasks: BackgroundTasks):   
    comment = Comment(**data.model_dump(), reviewer_id=reviewer_id)
    db.add(comment)
    await db.commit()
    await db.refresh(comment)

    event = CommentAddedEvent(user_id=current_user.user.id, project_id=project_id, comment_id=comment.id, reveiwer_id=reviewer_id)
    EventDispatcher.create_event(background_tasks, event)

    return comment

@router.patch("/{comment_id}", response_model=CommentDTO)
async def update_comment(project_id: ID, reviewer_id: ID, comment_id: ID, data: CommentUpdateDTO, db: DBSession, current_user: ProjectAuthor, background_tasks: BackgroundTasks):
    query=(select(
        Comment,
        (Reviewer.id != None).label("reviewer_exists")
        ).outerjoin(Reviewer, and_(
            Comment.reviewer_id == Reviewer.id,
            Reviewer.id == reviewer_id
        )).outerjoin(Project, Reviewer.project_id == Project.id)
        .where(Comment.id == comment_id, Comment.deleted_at==None)
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

@router.get("/{comment_id}", response_model=CommentDetailDTO)
async def get_comment(project_id: ID, reviewer_id: ID, comment_id: ID, db: DBSession, current_user: ProjectMemberAny):
    query = (select(Comment,
                    func.count(distinct(case((Task.deleted_at == None, Task.id), else_=None))).label("tasks_count"),
                    func.count(distinct(case((and_(Task.status == TaskStatus.ready_for_review, Task.deleted_at == None), Task.id), else_=None))).label("completed_tasks_count")
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

@router.delete("/{comment_id}")
async def delete_comment(project_id: ID, reviewer_id: ID, comment_id: ID, db: DBSession, current_user: ProjectAuthor, background_tasks: BackgroundTasks):
    query = (select(Comment)
             .join(Reviewer, Reviewer.id == Comment.reviewer_id)
             .where(Comment.id == comment_id, Reviewer.project_id == project_id, Comment.deleted_at == None)).limit(1)
    result = await db.execute(query)
    responses = result.fetchone()

    if not responses:
        raise HTTPException(status_code=404, detail="Замечание не найдено")
    
    responses.Comment.deleted_at = datetime.now()
    update_tasks_query = (
        update(Task)
        .where(Task.comment_id == comment_id, Task.deleted_at == None)
        .values(deleted_at=datetime.now())
    )
    await db.execute(update_tasks_query)
    await db.commit()

    event = CommentDeletedEvent(user_id=current_user.user.id, project_id=project_id, comment_id=comment_id)
    EventDispatcher.create_event(background_tasks, event)

    return {"success": "ok"}

@router.post("/{comment_id}/decompose")
async def decompose_comment(project_id: ID, reviewer_id: ID, comment_id: ID, data:List[TaskDecompositionDTO], db: DBSession, current_user: ProjectAuthor, background_tasks: BackgroundTasks):
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
        raise HTTPException(status_code=404, detail="Замечание не найдено")
    
    query = select(Task).where(Task.comment_id == comment_id, Task.deleted_at==None)
    result = await db.execute(query)
    existing_tasks = {t.id: t for t in result.scalars().all()}
    data_tasks = {t.id for t in data if t.id is not None}

    updated_tasks = []
    created_tasks = []

    for dto in data:
        if dto.id in existing_tasks:
            task = existing_tasks[dto.id]
            task.update(dto)
            updated_tasks.append(dto.id)
        else:
            new_task = Task(**dto.model_dump(exclude={"id"}), comment_id=comment_id)
            db.add(new_task)
            created_tasks.append(new_task)

    deleted_tasks = list(set(existing_tasks) - set(data_tasks))
    if deleted_tasks:
        for id in deleted_tasks:
            task = existing_tasks[id]
            task.deleted_at=datetime.now()

    await db.flush()
    created_tasks = [task.id for task in created_tasks]
    await db.commit()

    event = CommentDecomposedEvent(user_id=current_user.user.id, project_id=project_id, comment_id=comment_id, created=created_tasks, updated=updated_tasks, deleted=deleted_tasks)
    EventDispatcher.create_event(background_tasks, event)

    return {"success": "ok"}