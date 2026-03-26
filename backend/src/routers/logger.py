from fastapi import APIRouter
from sqlalchemy import select, and_
from src.models.activity_log import ActivityLog
from src.dtos.log import ActivityLogDTO, LogRequestDTO
from src.core.dependencies import DBSession, AdminUser
from typing import List

router = APIRouter(prefix="/logs", tags=["logs"])

@router.post("/", response_model=List[ActivityLogDTO])
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
    result = await db.execute(select(ActivityLog).where(and_(True, *filters)).order_by(ActivityLog.created_at.desc()))
    return result.scalars().all()
