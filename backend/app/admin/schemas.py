from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: str = Field(..., pattern="^(student|faculty)$")
    entry_semester: Optional[int] = None # 1 or 3, only for students

    @field_validator("entry_semester")
    @classmethod
    def validate_entry_semester(cls, v, info):
        if info.data.get("role") == "student":
            if v not in (1, 3):
                raise ValueError("entry_semester must be 1 or 3")
        return v

class AdminPasswordVerify(BaseModel):
    admin_password: str

class AssignFaculty(BaseModel):
    faculty_id: Optional[str] = None

class ElectiveDeadlineUpdate(BaseModel):
    deadline: datetime

class ProfileResponse(BaseModel):
    id: str
    role: str
    name: str
    email: str
    avatar_url: Optional[str] = None
    created_at: str

class DeleteResponse(BaseModel):
    deleted: bool

class SubjectResponse(BaseModel):
    id: str
    name: str
    code: str
    semester: int
    faculty_id: Optional[str] = None
    created_at: str

class DeadlineResponse(BaseModel):
    slot: str
    deadline: datetime
