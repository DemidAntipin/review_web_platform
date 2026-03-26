from pydantic import BaseModel, ConfigDict, Field
from src.models.user.user_role import UserRole
from src.core.types import ID, UsernameStr

class ProjectMemberDTO(BaseModel):
    user_id: ID
    project_id: ID
    role: UserRole

    model_config = ConfigDict(from_attributes=True)

class ProjectMemberDeleteDTO(BaseModel):
    user_id: ID

class ProjectMemberPreviewDTO(ProjectMemberDTO):
    username: UsernameStr = Field(validation_alias="user.username")