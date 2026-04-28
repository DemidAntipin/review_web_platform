from pydantic import BaseModel
from typing import Optional, List
from src.core.types import ID, ActionTypeStr, DescriptionStr, UTCDatetime

class LogRequestDTO(BaseModel):
    user_ids: Optional[List[ID]] = None
    project_ids: Optional[List[ID]] = None
    start_period: Optional[UTCDatetime] = None
    end_period: Optional[UTCDatetime] = None
    limit: int
    offset: int
    sort_field: Optional[str] = "created_at"
    sort_order: Optional[str] = "desc"

class ActivityLogDTO(BaseModel):
    id: ID
    user_id: ID
    project_id: ID
    action_type: ActionTypeStr
    description: DescriptionStr
    created_at: UTCDatetime

    class Config:
        from_attributes = True

class ActivityLogResponse(BaseModel):
    items: List[ActivityLogDTO]
    total: int