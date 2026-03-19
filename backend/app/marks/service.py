from app.utils.supabase import admin_client

MARKS_AT_RISK_THRESHOLD = 40.0

def is_marks_at_risk(score: float, max_score: float) -> bool:
    if max_score == 0:
        return True
    return (score / max_score * 100) < MARKS_AT_RISK_THRESHOLD

def get_marks_for_subject(subject_id: str) -> list[dict]:
    res = admin_client.table("marks")\
        .select("*")\
        .eq("subject_id", subject_id)\
        .execute()
    return res.data or []

def get_my_marks(student_id: str) -> list[dict]:
    res = admin_client.table("marks")\
        .select("*, subjects(name, code)")\
        .eq("student_id", student_id)\
        .execute()
    return res.data or []

def upsert_mark(data: dict) -> dict:
    res = admin_client.table("marks")\
        .upsert(
            data,
            on_conflict="student_id,subject_id,type"
        )\
        .execute()
    return res.data[0]
