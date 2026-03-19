from pydantic import BaseModel
from typing import Optional
from datetime import date

class AttendanceTrendPoint(BaseModel):
    date: date
    present: int
    absent: int
    late: int
    percentage: float

class GradeDistribution(BaseModel):
    grade: str       # O, A+, A, B+, B, F
    count: int
    percentage: float

class AtRiskStudent(BaseModel):
    student_id: str
    name: str
    email: str
    attendance_percentage: float
    marks_percentage: Optional[float] = None
    risk_reason: str  # "attendance" | "marks" | "both"

class SubjectComparison(BaseModel):
    subject_id: str
    subject_name: str
    subject_code: str
    avg_attendance: float
    avg_marks: float
