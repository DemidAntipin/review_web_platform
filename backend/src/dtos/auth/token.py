from pydantic import BaseModel
from typing import Optional

class TokenDTO(BaseModel):
    access_token : str
    token_type : str
