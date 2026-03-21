from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ElectiveRegistration(BaseModel):
    subject_id: str
    slot: str
    semester: int

class ElectiveRegistrationResponse(BaseModel):
    id: str
    student_id: str
    subject_id: str
    slot: str
    semester: int
    registered_at: Optional[datetime] = None
    subjects: Optional[dict] = None

class SyllabusUpdate(BaseModel):
    syllabus_text: str

class SubjectWithSyllabus(BaseModel):
    id: str
    name: str
    code: str
    semester: int
    year: int
    sem_half: str
    credits: int
    subject_type: str
    syllabus_text: Optional[str] = None
    syllabus_updated_at: Optional[datetime] = None
