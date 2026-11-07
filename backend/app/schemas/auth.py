from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: Optional[str] = "DevOps_Engineer"
    workspace_name: Optional[str] = "Production SRE Team"

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    workspace_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

Token.model_rebuild()
