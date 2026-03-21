from pydantic import BaseModel, field_validator
from typing import Optional, Literal
from datetime import date

AttendanceStatus = Literal["present", "absent", "late"]

class AttendanceCreate(BaseModel):
    student_id: str
    subject_id: str
    date: date
    status: AttendanceStatus

    def model_dump(self, **kwargs):
        d = super().model_dump(**kwargs)
        if isinstance(d.get('date'), date):
            d['date'] = d['date'].isoformat()
        return d

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