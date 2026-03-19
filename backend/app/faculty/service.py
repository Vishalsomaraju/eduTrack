from app.utils.supabase import admin_client

def list_faculty() -> list[dict]:
    res = admin_client.table("profiles")\
        .select("*")\
        .eq("role", "faculty")\
        .order("name")\
        .execute()
    return res.data or []

def get_faculty_member(faculty_id: str) -> dict | None:
    res = admin_client.table("profiles")\
        .select("*")\
        .eq("id", faculty_id)\
        .eq("role", "faculty")\
        .single()\
        .execute()
    return res.data
