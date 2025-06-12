from typing import Optional, Annotated
from pydantic import BaseModel, EmailStr, Field, BeforeValidator


# This custom type will be used to validate MongoDB's ObjectId.
# It will convert the ObjectId to a string before Pydantic performs its validation.
# This is the modern Pydantic v2 way to handle this conversion.
PyObjectId = Annotated[str, BeforeValidator(str)]


class UserBase(BaseModel):
    """
    The basic information about a user

    Args:
        BaseModel (_type_): _description_
    Attributes:
        email (EmailStr): The user's email address
    """

    email: EmailStr


class UserCreate(UserBase):
    """
    The data we expect to receive from a user when they sign up (email and a plain text password).

    Args:
        UserBase (_type_): _description_
    Attributes:
        password (str): The user's password
    """

    password: str


class UserInDB(UserBase):
    """
    The data as it is stored in our database (with a hashed password).
    We use Field(alias=_id) because MongoDB uses `_id` for its primary key.""

    Args:
        UserBase -> email: EmailStr
    Attributes:
        id (str): The user's unique identifier in the database
        hashed_password (str): The user's password, hashed for security
    """

    # We use the new PyObjectId type for the 'id' field.
    # The 'alias' is still "_id" to match the MongoDB field name.
    id: PyObjectId = Field(alias="_id")
    hashed_password: str


class Token(BaseModel):
    """Models for handling the JWT authentication tokens."""

    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Models for handling the JWT authentication tokens."""

    email: Optional[str] = None
