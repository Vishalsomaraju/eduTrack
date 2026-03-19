from app.utils.supabase import admin_client

def list_subjects(user: dict) -> list[dict]:
    role = user["role"]
    q = admin_client.table("subjects").select("*")

    if role == "faculty":
        # Faculty only sees their own subjects
        q = q.eq("faculty_id", user["id"])
    elif role == "student":
        # Student sees subjects they're enrolled in
        enroll = admin_client.table("enrollments")\
            .select("subject_id")\
            .eq("student_id", user["id"])\
            .execute()
        ids = [e["subject_id"] for e in (enroll.data or [])]
        if not ids:
            return []
        q = q.in_("id", ids)
    # admin sees all — no filter

    res = q.order("name").execute()
    return res.data or []

def get_subject(subject_id: str) -> dict | None:
    res = admin_client.table("subjects")\
        .select("*")\
        .eq("id", subject_id)\
        .single()\
        .execute()
    return res.data

def create_subject(data: dict) -> dict:
    res = admin_client.table("subjects")\
        .insert(data)\
        .execute()
    return res.data[0]

def update_subject(subject_id: str, data: dict) -> dict | None:
    res = admin_client.table("subjects")\
        .update(data)\
        .eq("id", subject_id)\
        .execute()
    return res.data[0] if res.data else None

def delete_subject(subject_id: str) -> bool:
    res = admin_client.table("subjects")\
        .delete()\
        .eq("id", subject_id)\
        .execute()
    return True

def get_enrolled_students(subject_id: str) -> list[dict]:
    res = admin_client.table("enrollments")\
        .select("student_id, profiles(*)")\
        .eq("subject_id", subject_id)\
        .execute()
    return [
        row["profiles"]
        for row in (res.data or [])
        if row.get("profiles")
    ]
