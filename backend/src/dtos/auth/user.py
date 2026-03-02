from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional

class UserBaseDTO(BaseModel):
	username : str
	email : EmailStr
	role: int

class UserCreateDTO(UserBaseDTO):
	password : str

class UserUpdateDTO(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: str
    new_password: Optional[str] = None
    role: Optional[int] = None

class UserDTO(UserBaseDTO):
	id: int
	
	model_config = ConfigDict(from_attributes=True)