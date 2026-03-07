from pydantic import BaseModel, ConfigDict
from src.models.user.user_role import UserRole

class ProjectMemberDTO(BaseModel):
    user_id: int
    project_id: int
    role: UserRole

    model_config = ConfigDict(from_attributes=True)

class ProjectMemberDeleteDTO(BaseModel):
    user_id: int
    project_id: int