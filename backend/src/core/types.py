from typing import Annotated
from pydantic import Field, AfterValidator
from src.core.utils.validators import validate_string, validate_password

ID = Annotated[int, Field(gt=0)]

UsernameStr = Annotated[str, Field(min_length=3, max_length=30, pattern=r"^[a-zA-Z0-9._]+$"), AfterValidator(validate_string)]

PasswordStr = Annotated[str, Field(min_length=8, max_length=128), AfterValidator(validate_password)]

TitleStr = Annotated[str, Field(min_length=3, max_length=255), AfterValidator(validate_string)]

JournalStr = Annotated[str, Field(min_length=3, max_length=255), AfterValidator(validate_string)]

DescriptionStr = Annotated[str, Field(max_length=1000), AfterValidator(validate_string)]

ActionTypeStr = Annotated[str, Field(pattern=r"^[A-Z_]+$")]