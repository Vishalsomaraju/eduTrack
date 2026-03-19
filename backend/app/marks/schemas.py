from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

MarkType = Literal["internal", "assignment"]

class MarksCreate(BaseModel):
    student_id: str
    subject_id: str
    type: MarkType
    score: float
    max_score: float

class MarksResponse(BaseModel):
    id: str
    student_id: str
    subject_id: str
    type: MarkType
    score: float
    max_score: float
    created_at: Optional[datetime] = None
