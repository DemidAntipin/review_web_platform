from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from src.core.types import ID, ActionTypeStr, DescriptionStr

class LogRequestDTO(BaseModel):
    user_ids: Optional[List[ID]] = None
    project_ids: Optional[List[ID]] = None
    start_period: Optional[datetime] = None
    end_period: Optional[datetime] = None

class ActivityLogDTO(BaseModel):
    id: ID
    user_id: ID
    project_id: ID
    action_type: ActionTypeStr
    description: DescriptionStr
    created_at: datetime

    class Config:
        from_attributes = True