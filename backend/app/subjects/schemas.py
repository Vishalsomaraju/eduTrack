from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SubjectCreate(BaseModel):
    name: str
    code: str
    semester: int
    faculty_id: Optional[str] = None

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    semester: Optional[int] = None
    faculty_id: Optional[str] = None

class SubjectResponse(BaseModel):
    id: str
    name: str
    code: str
    semester: int
    faculty_id: Optional[str] = None
    created_at: Optional[datetime] = None
