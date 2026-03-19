from app.utils.supabase import admin_client

def list_students() -> list[dict]:
    res = admin_client.table("profiles")\
        .select("*")\
        .eq("role", "student")\
        .order("name")\
        .execute()
    return res.data or []

def get_student(student_id: str) -> dict | None:
    res = admin_client.table("profiles")\
        .select("*")\
        .eq("id", student_id)\
        .eq("role", "student")\
        .single()\
        .execute()
    return res.data
