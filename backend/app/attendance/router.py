from fastapi import APIRouter, Depends, HTTPException
from collections import defaultdict
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


@router.get("/my-summary")
async def get_my_attendance_summary_all_subjects(
    user: dict = Depends(get_current_user)
):
    """
    Batch: returns attendance summary for ALL enrolled subjects in one call.
    Response: { [subject_id]: { present, absent, late, total, percentage, at_risk } }
    """
    student_id = user["id"]

    enroll_res = admin_client.table("enrollments")\
        .select("subject_id")\
        .eq("student_id", student_id)\
        .execute()

    subject_ids = [r["subject_id"] for r in (enroll_res.data or [])]
    if not subject_ids:
        return {}

    att_res = admin_client.table("attendance")\
        .select("subject_id, status")\
        .eq("student_id", student_id)\
        .in_("subject_id", subject_ids)\
        .execute()

    buckets: dict = defaultdict(lambda: {"present": 0, "absent": 0, "late": 0, "total": 0})
    for row in (att_res.data or []):
        sid = row["subject_id"]
        buckets[sid]["total"] += 1
        status = row["status"]
        if status in ("present", "absent", "late"):
            buckets[sid][status] += 1

    result = {}
    for sid in subject_ids:
        b = buckets[sid]
        total   = b["total"]
        present = b["present"]
        pct = round(present / total * 100, 2) if total > 0 else 0.0
        result[sid] = {
            "subject_id": sid,
            "present":    present,
            "absent":     b["absent"],
            "late":       b["late"],
            "total":      total,
            "percentage": pct,
            "at_risk":    pct < 75.0,
        }
    return result


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


@router.get("/{subject_id}/summary")
async def get_summary(
    subject_id: str,
    student_id: str = None,
    user: dict = Depends(get_current_user)
):
    """
    Student role            → own summary only (single object)
    Faculty/Admin + id      → that student's summary (single object)
    Faculty/Admin, no id    → ALL students' summaries (array) — no more 400
    """
    if user["role"] == "student":
        return service.get_summary(subject_id, user["id"])

    if user["role"] in ("faculty", "admin"):
        if student_id:
            return service.get_summary(subject_id, student_id)
        # No student_id → return all students for this subject as array
        return service.get_all_summaries(subject_id)

    raise HTTPException(403, "Unauthorized")


@router.post("/", response_model=AttendanceResponse, status_code=201)
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