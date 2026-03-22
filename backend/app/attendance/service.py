from datetime import date
from collections import defaultdict
from app.utils.supabase import admin_client

AT_RISK_THRESHOLD = 75.0

def calculate_percentage(present: int, total: int) -> float:
    if total == 0:
        return 0.0
    return round((present / total) * 100, 2)

def is_at_risk(percentage: float) -> bool:
    return percentage < AT_RISK_THRESHOLD

def get_attendance(subject_id: str) -> list[dict]:
    res = admin_client.table("attendance")\
        .select("*")\
        .eq("subject_id", subject_id)\
        .order("date", desc=True)\
        .execute()
    return res.data or []

def get_my_attendance(subject_id: str, student_id: str) -> list[dict]:
    res = admin_client.table("attendance")\
        .select("*")\
        .eq("subject_id", subject_id)\
        .eq("student_id", student_id)\
        .order("date", desc=True)\
        .execute()
    return res.data or []

def get_summary(subject_id: str, student_id: str) -> dict:
    """Single student summary — used by student role."""
    records = get_my_attendance(subject_id, student_id)
    total   = len(records)
    present = sum(1 for r in records if r["status"] == "present")
    absent  = sum(1 for r in records if r["status"] == "absent")
    late    = sum(1 for r in records if r["status"] == "late")
    pct     = calculate_percentage(present, total)
    return {
        "student_id": student_id,
        "subject_id": subject_id,
        "total":      total,
        "present":    present,
        "absent":     absent,
        "late":       late,
        "percentage": pct,
        "at_risk":    is_at_risk(pct),
    }

def get_all_summaries(subject_id: str) -> list[dict]:
    """
    All-student summary for a subject — used by faculty/admin.
    Uses 2 queries total (enrollments + attendance) instead of N queries.
    Returns a list so the frontend Table component can map over it.
    """
    # 1. Enrolled students (with profile names)
    enroll_res = admin_client.table("enrollments")\
        .select("student_id, profiles(id, name, email)")\
        .eq("subject_id", subject_id)\
        .execute()

    if not enroll_res.data:
        return []

    student_map = {
        row["student_id"]: row.get("profiles") or {}
        for row in enroll_res.data
    }

    # 2. All attendance records for this subject in one query
    att_res = admin_client.table("attendance")\
        .select("student_id, status")\
        .eq("subject_id", subject_id)\
        .execute()

    # Aggregate in Python
    buckets: dict = defaultdict(
        lambda: {"present": 0, "absent": 0, "late": 0, "total": 0}
    )
    for row in (att_res.data or []):
        sid = row["student_id"]
        buckets[sid]["total"] += 1
        status = row.get("status")
        if status in ("present", "absent", "late"):
            buckets[sid][status] += 1

    result = []
    for sid, profile in student_map.items():
        b   = buckets[sid]
        total   = b["total"]
        present = b["present"]
        pct = calculate_percentage(present, total)
        result.append({
            "student_id": sid,
            "name":       profile.get("name", ""),
            "email":      profile.get("email", ""),
            "subject_id": subject_id,
            "present":    present,
            "absent":     b["absent"],
            "late":       b["late"],
            "total":      total,
            "percentage": pct,
            "at_risk":    is_at_risk(pct),
            # camelCase alias for frontend compatibility
            "atRisk":     is_at_risk(pct),
        })

    return sorted(result, key=lambda x: x["name"])

def mark_attendance(data: dict) -> dict:
    res = admin_client.table("attendance")\
        .upsert(data, on_conflict="student_id,subject_id,date")\
        .execute()
    return res.data[0]

def update_attendance(record_id: str, status: str) -> dict | None:
    res = admin_client.table("attendance")\
        .update({"status": status})\
        .eq("id", record_id)\
        .execute()
    return res.data[0] if res.data else None