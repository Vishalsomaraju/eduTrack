from fastapi import APIRouter, Depends, HTTPException
from app.attendance.schemas import (
    AttendanceCreate, AttendanceUpdate,
    AttendanceResponse, AttendanceSummary
)
from app.attendance import service
from app.auth.dependencies import (
    get_current_user, require_faculty
)
from app.utils.supabase import admin_client

router = APIRouter(
    prefix="/attendance", tags=["attendance"]
)

# ← MUST be before /{subject_id} routes
@router.get("/student/me", response_model=list[AttendanceResponse])
async def get_all_my_attendance(
    user: dict = Depends(get_current_user)
):
    if user["role"] != "student":
        raise HTTPException(403, "Students only")
    res = admin_client.table("attendance")\
        .select("*")\
        .eq("student_id", user["id"])\
        .order("date", desc=True)\
        .execute()
    return res.data or []

@router.get("/{subject_id}", response_model=list[AttendanceResponse])
async def get_attendance(
    subject_id: str,
    user: dict = Depends(require_faculty)
):
    return service.get_attendance(subject_id)

@router.get("/{subject_id}/student/me", response_model=list[AttendanceResponse])
async def get_my_attendance(
    subject_id: str,
    user: dict = Depends(get_current_user)
):
    return service.get_my_attendance(subject_id, user["id"])

# Fix summary — students can access their own
@router.get("/{subject_id}/summary", response_model=AttendanceSummary)
async def get_summary(
    subject_id: str,
    student_id: str = None,
    user: dict = Depends(get_current_user)
):
    # Students can only get their own summary
    if user["role"] == "student":
        student_id = user["id"]
    if not student_id:
        raise HTTPException(400, "student_id required")
    return service.get_summary(subject_id, student_id)

@router.post("/",
    response_model=AttendanceResponse,
    status_code=201)
async def mark_attendance(
    data: AttendanceCreate,
    user: dict = Depends(require_faculty)
):
    return service.mark_attendance(data.model_dump())

@router.put("/{record_id}", response_model=AttendanceResponse)
async def update_attendance(
    record_id: str,
    data: AttendanceUpdate,
    user: dict = Depends(require_faculty)
):
    updated = service.update_attendance(record_id, data.status)
    if not updated:
        raise HTTPException(404, "Record not found")
    return updated