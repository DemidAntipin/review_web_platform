from pydantic import AliasPath, BaseModel, ConfigDict, Field
from src.models.user.user_role import UserRole
from src.core.types import ID, UsernameStr

class ProjectMemberDTO(BaseModel):
    user_id: ID
    role: UserRole

    model_config = ConfigDict(from_attributes=True)

class ProjectMemberDeleteDTO(BaseModel):
    user_id: ID

class ProjectMemberUpdateDTO(BaseModel):
    role: UserRole

class ProjectMemberPreviewDTO(ProjectMemberDTO):
    username: UsernameStr = Field(validation_alias=AliasPath("user", "username"))