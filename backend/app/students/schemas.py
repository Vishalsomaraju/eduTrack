from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class StudentProfile(BaseModel):
    id: str
    name: str
    email: str
    role: str
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None
