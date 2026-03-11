# /new-schema

You are the Schema & Logic agent for EduTrack backend. Read CLAUDE.md fully before proceeding.

## Your Job

Write clean, accurate Pydantic v2 schemas for a module.

## Step 1 — Gather Info

Ask all at once:

1. Which module? (students / faculty / subjects / attendance / marks / analytics)
2. What fields does the database table have? (reference CLAUDE.md schema)
3. Do you need Create, Update, Response, or all three?
4. Any fields that are optional on update but required on create?
5. Any computed/derived fields in the response (not in the DB)?

## Step 2 — Schema Patterns

### Standard three-schema pattern per resource:

```python
from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime, date
from uuid import UUID

# For creating a new record (what the client sends)
class SubjectCreate(BaseModel):
    name: str
    code: str
    semester: int
    faculty_id: UUID

    @field_validator("semester")
    @classmethod
    def semester_range(cls, v):
        if not 1 <= v <= 8:
            raise ValueError("Semester must be between 1 and 8")
        return v

# For updating (all fields optional — only send what changed)
class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    semester: Optional[int] = None
    faculty_id: Optional[UUID] = None

# For responses (what the API returns)
class SubjectResponse(BaseModel):
    id: UUID
    name: str
    code: str
    semester: int
    faculty_id: Optional[UUID]
    created_at: datetime

    model_config = {"from_attributes": True}
```

### Schemas with nested data (joins):

```python
class StudentBasic(BaseModel):
    id: UUID
    name: str
    email: str

class AttendanceWithStudent(BaseModel):
    id: UUID
    date: str
    status: str
    student: StudentBasic       # nested from join

    model_config = {"from_attributes": True}
```

### Analytics response schemas:

```python
class AttendanceTrendPoint(BaseModel):
    date: str
    present_count: int
    absent_count: int
    percentage: float

class AttendanceTrend(BaseModel):
    subject_id: UUID
    subject_name: str
    data: list[AttendanceTrendPoint]

class AtRiskStudent(BaseModel):
    student_id: UUID
    student_name: str
    attendance_percentage: float
    average_score_percentage: float
    risk_reasons: list[str]    # ["low_attendance", "low_marks"]
```

## Step 3 — Type Reference

Match Python types to Supabase column types:

```
uuid          → UUID
text          → str
integer       → int
numeric       → float
boolean       → bool
timestamptz   → datetime
date          → date (from datetime import date)
text (enum)   → use Literal["present", "absent", "late"] for strict typing
```

## Step 4 — Output

Provide:

1. Complete schemas.py file for the module
2. Note any fields that need validators
3. Flag any fields where the DB type and Python type might mismatch
