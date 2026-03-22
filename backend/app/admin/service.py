import logging
from app.utils.supabase import admin_client, anon_client
from app.admin import schemas
from fastapi import HTTPException
from datetime import datetime

logger = logging.getLogger(__name__)

def create_user(data: schemas.UserCreate) -> dict:
    try:
        auth_res = admin_client.auth.admin.create_user({
            "email": data.email,
            "password": data.password,
            "email_confirm": True,
            "user_metadata": {
                "name": data.name,
                "role": data.role
            }
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    
    new_user_id = auth_res.user.id

    profile_data = {
        "id": new_user_id,
        "name": data.name,
        "email": data.email,
        "role": data.role,
        "avatar_url": None
    }
    
    prof_res = admin_client.table("profiles").upsert(profile_data).execute()
    
    if data.role == "student":
        student_profile_data = {
            "id": new_user_id,
            "roll_number": f"KPRIT{new_user_id[:6].upper()}",
            "current_semester": data.entry_semester or 1,
            "batch_year": datetime.now().year
        }
        try:
            admin_client.table("student_profiles").upsert(student_profile_data).execute()
        except Exception as e:
            logger.error(f"Failed to upsert student_profiles for {new_user_id}: {e}")
            
        entry_sem = data.entry_semester if data.entry_semester in [1, 3] else 1
        subjects_res = admin_client.table("subjects").select("id").eq("semester", entry_sem).in_("subject_type", ["core", "lab", "mc"]).execute()
        if subjects_res.data:
            enrollments = [{"student_id": new_user_id, "subject_id": s["id"]} for s in subjects_res.data]
            admin_client.table("enrollments").upsert(enrollments, on_conflict="student_id,subject_id").execute()
            
    elif data.role == "faculty":
        try:
            admin_client.table("faculty_profiles").upsert({"id": new_user_id}).execute()
        except Exception as e:
            logger.error(f"Failed to upsert faculty_profiles for {new_user_id}: {e}")

    return prof_res.data[0]

def delete_user(user_id: str, admin_password: str, admin_email: str) -> dict:
    try:
        result = anon_client.auth.sign_in_with_password({"email": admin_email, "password": admin_password})
        # sign out immediately since we only need verification
        anon_client.auth.sign_out()
        if not result.user:
            raise HTTPException(status_code=403, detail="Invalid admin password")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=403, detail="Invalid admin password") from e
        
    steps = [
        ("attendance", lambda: admin_client.table("attendance").delete().eq("student_id", user_id).execute()),
        ("marks", lambda: admin_client.table("marks").delete().eq("student_id", user_id).execute()),
        ("lab_marks", lambda: admin_client.table("lab_marks").delete().eq("student_id", user_id).execute()),
        ("elective_registrations", lambda: admin_client.table("elective_registrations").delete().eq("student_id", user_id).execute()),
        ("enrollments", lambda: admin_client.table("enrollments").delete().eq("student_id", user_id).execute()),
        ("subjects", lambda: admin_client.table("subjects").update({"faculty_id": None}).eq("faculty_id", user_id).execute()),
        ("student_profiles", lambda: admin_client.table("student_profiles").delete().eq("id", user_id).execute()),
        ("faculty_profiles", lambda: admin_client.table("faculty_profiles").delete().eq("id", user_id).execute()),
        ("profiles", lambda: admin_client.table("profiles").delete().eq("id", user_id).execute()),
    ]
    
    for step_name, op in steps:
        try:
            op()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Delete failed at step {step_name}: {e}") from e

    try:
        admin_client.auth.admin.delete_user(user_id)
    except Exception as e:
        logger.error(f"Failed to delete auth user {user_id}: {e}")
        
    return {"deleted": True}

def assign_faculty(subject_id: str, faculty_id: str | None) -> dict:
    try:
        res = admin_client.table("subjects").update({"faculty_id": faculty_id}).eq("id", subject_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Subject not found")
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"Failed to assign faculty: {e}") from e

def update_elective_deadline(slot: str, deadline: datetime) -> dict:
    try:
        res = admin_client.table("elective_deadlines").upsert({
            "slot": slot,
            "deadline": deadline.isoformat()
        }).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to update deadline")
        return res.data[0]
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=f"Failed to update deadline: {e}") from e

def list_users(role: str) -> list[dict]:
    try:
        query = admin_client.table("profiles").select("*, student_profiles(*), faculty_profiles(*)")
        if role in ["student", "faculty"]:
            query = query.eq("role", role)
        res = query.execute()
        return res.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list users: {e}") from e
