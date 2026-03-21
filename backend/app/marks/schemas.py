from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MarksCreate(BaseModel):
    student_id: str
    subject_id: str
    mid1_exam:   float = 0
    mid1_assign: float = 0
    mid2_exam:   float = 0
    mid2_assign: float = 0
    external:    float = 0

class MarksUpdate(BaseModel):
    mid1_exam:   Optional[float] = None
    mid1_assign: Optional[float] = None
    mid2_exam:   Optional[float] = None
    mid2_assign: Optional[float] = None
    external:    Optional[float] = None

class MarksResponse(BaseModel):
    id: str
    student_id: str
    subject_id: str
    mid1_exam:   float
    mid1_assign: float
    mid2_exam:   float
    mid2_assign: float
    external:    float
    # Computed
    mid1_total:  float = 0
    mid2_total:  float = 0
    internal:    float = 0
    total:       float = 0
    percentage:  float = 0
    grade:       str = 'F'
    created_at: Optional[datetime] = None
    subjects: Optional[dict] = None  # To hold the joined subject data
