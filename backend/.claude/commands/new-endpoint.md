# /new-endpoint

You are the API Builder for EduTrack backend. Read CLAUDE.md fully before proceeding.

## Your Job

Build a complete, production-ready FastAPI endpoint with router, schema, and service layer.

## Step 1 — Gather Info

Ask all at once:

1. What module is this for? (students / faculty / subjects / attendance / marks / analytics)
2. What does the endpoint do in one sentence?
3. HTTP method + path? (e.g. POST /attendance/)
4. Which role(s) can access it? (admin / faculty / student)
5. What does the request body look like? (fields + types)
6. What does the response look like?
7. Any special business logic or validation needed?

## Step 2 — Pre-flight Check

- Check CLAUDE.md API Contract section — does this endpoint already exist?
- Check the module's existing router.py — don't duplicate a route
- If the endpoint changes data visible to students — confirm it also respects
  the "students only see their own data" rule

## Step 3 — Build All Three Layers

### Layer 1 — Schema (schemas.py)

```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class AttendanceCreate(BaseModel):
    student_id: UUID
    subject_id: UUID
    date: str          # "YYYY-MM-DD"
    status: str        # "present" | "absent" | "late"

class AttendanceResponse(BaseModel):
    id: UUID
    student_id: UUID
    subject_id: UUID
    date: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
```

### Layer 2 — Service (service.py)

```python
from app.config import supabase

async def create_attendance(data: AttendanceCreate, user: dict) -> dict:
    # Validate faculty owns this subject
    subject = supabase.table("subjects")\
        .select("faculty_id")\
        .eq("id", str(data.subject_id))\
        .single()\
        .execute()

    if subject.data["faculty_id"] != user["sub"]:
        raise ValueError("You are not assigned to this subject")

    # Insert record
    response = supabase.table("attendance")\
        .insert({
            "student_id": str(data.student_id),
            "subject_id": str(data.subject_id),
            "date": data.date,
            "status": data.status
        })\
        .execute()

    return response.data[0]
```

### Layer 3 — Router (router.py)

```python
from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import require_faculty
from app.attendance import service, schemas

router = APIRouter(prefix="/attendance", tags=["attendance"])

@router.post("/", response_model=schemas.AttendanceResponse)
async def create_attendance(
    data: schemas.AttendanceCreate,
    user=Depends(require_faculty)
):
    try:
        result = await service.create_attendance(data, user)
        return result
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
```

## Step 4 — Error Handling Rules

Every service function must handle these cases:

- Record not found → raise ValueError("Not found")
- Unauthorized access → raise ValueError("Unauthorized")
- Supabase error → check `response.error`, raise Exception
- Invalid input → let Pydantic handle it (don't re-validate manually)

The router catches ValueError → 403/404, Exception → 500.

## Step 5 — Output

Provide:

1. The schema additions for `schemas.py` (just the new classes)
2. The service function for `service.py`
3. The router endpoint for `router.py`
4. If main.py needs updating (new router registration) — show that too
5. Notify: "Tell the frontend team to update their API contract"

## Hard Stops

- Never put DB calls in the router — service only
- Never return sensitive fields (passwords, service keys, full user objects)
- Never skip the role dependency on a protected route
- If a student route — always filter by user["sub"], never trust client-provided student_id
