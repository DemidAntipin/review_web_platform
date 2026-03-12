from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
from src.core.types import UsernameStr, PasswordStr, ID

class UserBaseDTO(BaseModel):
	username : UsernameStr
	email : EmailStr
	role: int

class UserCreateDTO(UserBaseDTO):
	password : PasswordStr

class UserUpdateDTO(BaseModel):
    username: Optional[UsernameStr] = None
    email: Optional[EmailStr] = None
    password: str
    new_password: Optional[PasswordStr] = None
    role: Optional[int] = None

class UserDTO(UserBaseDTO):
	id: ID
	
	model_config = ConfigDict(from_attributes=True)