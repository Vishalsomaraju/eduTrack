from app.utils.supabase import admin_client
from datetime import datetime, timezone

def get_all_subjects() -> list[dict]:
    res = admin_client.table('subjects')\
        .select('*')\
        .order('semester')\
        .execute()
    return res.data or []

def get_my_registrations(student_id: str) -> list[dict]:
    res = admin_client.table('elective_registrations')\
        .select('*, subjects(*)')\
        .eq('student_id', student_id)\
        .execute()
    return res.data or []

def get_deadlines() -> dict:
    res = admin_client.table('elective_deadlines')\
        .select('*')\
        .execute()
    return {
        row['slot']: row['deadline']
        for row in (res.data or [])
    }

def is_locked(slot: str) -> bool:
    deadlines = get_deadlines()
    if slot not in deadlines:
        return False
    deadline = datetime.fromisoformat(deadlines[slot].replace('Z', '+00:00'))
    return datetime.now(timezone.utc) > deadline

def register_elective(student_id: str, subject_id: str, slot: str, semester: int) -> dict:
    if is_locked(slot):
        raise ValueError(f'Registration for {slot} is closed')

    # Upsert registration
    res = admin_client.table('elective_registrations').upsert({
        'student_id': student_id,
        'subject_id': subject_id,
        'slot': slot,
        'semester': semester,
    }, on_conflict='student_id,slot').execute()

    # Auto-create enrollment
    admin_client.table('enrollments').upsert({
        'student_id': student_id,
        'subject_id': subject_id,
    }, on_conflict='student_id,subject_id')\
        .execute()

    return res.data[0] if res.data else {}

def update_syllabus(subject_id: str, text: str) -> dict:
    res = admin_client.table('subjects')\
        .update({
            'syllabus_text': text,
            'syllabus_updated_at': datetime.now(timezone.utc).isoformat()
        })\
        .eq('id', subject_id)\
        .execute()
    return res.data[0] if res.data else {}
