"""
Pydantic schemas for users.
"""

from pydantic import BaseModel


class UserBase(BaseModel):
    """
    Base user schema.
    """
    username: str
    email: str


class UserCreate(UserBase):
    """
    Schema for creating a user.
    """
    password: str


class User(UserBase):
    """
    User schema with ID.
    """
    id: int

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """
    Schema for updating a user.
    """
    username: str | None = None
    email: str | None = None
    full_name: str | None = None
    name: str | None = None


class Token(BaseModel):
    """
    Token schema.
    """
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """
    Token data schema.
    """
    username: str | None = None