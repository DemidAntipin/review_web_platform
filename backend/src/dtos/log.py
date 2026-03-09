from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class LogRequestDTO(BaseModel):
    user_ids: Optional[List[int]] = None
    project_ids: Optional[List[int]] = None
    start_period: Optional[datetime] = None
    end_period: Optional[datetime] = None

class ActivityLogDTO(BaseModel):
    id: int
    user_id: int
    project_id: int
    action_type: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True