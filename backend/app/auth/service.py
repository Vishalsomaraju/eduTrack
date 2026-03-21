from app.utils.supabase import admin_client


def get_profile(user_id: str) -> dict | None:
    """Fetch a user profile row from the profiles table by user UUID."""
    res = (
        admin_client.table("profiles")
        .select("*")
        .eq("id", user_id)
        .single()
        .execute()
    )
    return res.data


def get_full_profile(user_id: str, role: str) -> dict:
    profile = get_profile(user_id)
    if not profile:
        return None

    detail = None
    if role == "student":
        res = admin_client.table("student_profiles")\
            .select("*")\
            .eq("id", user_id)\
            .execute()
        detail = res.data[0] if res.data else {}
    elif role == "faculty":
        res = admin_client.table("faculty_profiles")\
            .select("*")\
            .eq("id", user_id)\
            .execute()
        detail = res.data[0] if res.data else {}

    return {"profile": profile, "detail": detail}


def update_profile(user_id: str, data: dict) -> dict | None:
    # Remove None values
    clean = {k: v for k, v in data.items() if v is not None}
    if not clean:
        return get_profile(user_id)
    res = admin_client.table("profiles")\
        .update(clean)\
        .eq("id", user_id)\
        .execute()
    return res.data[0] if res.data else None


def upsert_student_detail(user_id: str, data: dict) -> dict:
    clean = {k: v for k, v in data.items() if v is not None}
    clean["id"] = user_id
    res = admin_client.table("student_profiles")\
        .upsert(clean, on_conflict="id")\
        .execute()
    return res.data[0] if res.data else {}


def upsert_faculty_detail(user_id: str, data: dict) -> dict:
    clean = {k: v for k, v in data.items() if v is not None}
    clean["id"] = user_id
    res = admin_client.table("faculty_profiles")\
        .upsert(clean, on_conflict="id")\
        .execute()
    return res.data[0] if res.data else {}
