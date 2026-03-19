from pydantic import BaseModel
from typing import Optional


class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    role: str
    avatar_url: Optional[str] = None


class VerifyResponse(BaseModel):
    valid: bool
    user: UserProfile
