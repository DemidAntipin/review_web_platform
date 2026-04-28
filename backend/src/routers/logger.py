from fastapi import APIRouter
from sqlalchemy import asc, desc, func, select, and_
from src.models.activity_log import ActivityLog
from src.dtos.log import ActivityLogDTO, ActivityLogResponse, LogRequestDTO
from src.core.dependencies import DBSession, AdminUser
from typing import List

router = APIRouter(prefix="/logs", tags=["logs"])

@router.post("/", response_model=ActivityLogResponse)
async def get_logs(data: LogRequestDTO, db: DBSession, current_user: AdminUser):
    filters=[]
    if data.project_ids:
        filters.append(ActivityLog.project_id.in_(data.project_ids))    
    if data.user_ids:
        filters.append(ActivityLog.user_id.in_(data.user_ids))
    if data.start_period:
        filters.append(ActivityLog.created_at >= data.start_period)
    if data.end_period:
        filters.append(ActivityLog.created_at <= data.end_period)

    sort_attr = getattr(ActivityLog, data.sort_field or "created_at", ActivityLog.created_at)
    sort_func = desc if data.sort_order == "desc" else asc
    
    result = await db.execute(
        select(
            ActivityLog, 
            func.count(ActivityLog.id).over().label("total_count")
        )
        .where(and_(True, *filters))
        .order_by(sort_func(sort_attr))
        .offset(data.offset).limit(data.limit))
    rows = result.all()
    items = [row[0] for row in rows]
    total = rows[0][1] if rows else 0
    return ActivityLogResponse(items=items, total=total)
