from datetime import date
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
    records = get_my_attendance(subject_id, student_id)
    total = len(records)
    present = sum(1 for r in records if r["status"] == "present")
    absent = sum(1 for r in records if r["status"] == "absent")
    late = sum(1 for r in records if r["status"] == "late")
    pct = calculate_percentage(present, total)
    
    return {
        "student_id": student_id,
        "subject_id": subject_id,
        "total": total,
        "present": present,
        "absent": absent,
        "late": late,
        "percentage": pct,
        "at_risk": is_at_risk(pct),
    }

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
