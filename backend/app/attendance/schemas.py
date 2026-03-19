from pydantic import BaseModel
from typing import Optional, Literal
from datetime import date

AttendanceStatus = Literal["present","absent","late"]

class AttendanceCreate(BaseModel):
    student_id: str
    subject_id: str
    date: date
    status: AttendanceStatus

class AttendanceUpdate(BaseModel):
    status: AttendanceStatus

class AttendanceResponse(BaseModel):
    id: str
    student_id: str
    subject_id: str
    date: date
    status: AttendanceStatus

class AttendanceSummary(BaseModel):
    student_id: str
    subject_id: str
    total: int
    present: int
    absent: int
    late: int
    percentage: float
    at_risk: bool
