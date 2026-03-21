from app.utils.supabase import admin_client

def compute_marks(row: dict) -> dict:
    mid1 = row.get('mid1_exam', 0) + row.get('mid1_assign', 0)
    mid2 = row.get('mid2_exam', 0) + row.get('mid2_assign', 0)
    internal = round((mid1 + mid2) / 2, 2)
    external = row.get('external', 0)
    total = round(internal + external, 2)
    pct = round(total, 2)  # already out of 100

    if pct >= 90: grade = 'O'
    elif pct >= 75: grade = 'A+'
    elif pct >= 60: grade = 'A'
    elif pct >= 50: grade = 'B+'
    elif pct >= 40: grade = 'B'
    else: grade = 'F'

    return {
        **row,
        'mid1_total': round(mid1, 2),
        'mid2_total': round(mid2, 2),
        'internal': internal,
        'total': total,
        'percentage': pct,
        'grade': grade,
    }

def get_marks_for_subject(subject_id: str) -> list[dict]:
    res = admin_client.table('marks')\
        .select('*')\
        .eq('subject_id', subject_id)\
        .execute()
    return [compute_marks(r) for r in (res.data or [])]

def get_my_marks(student_id: str) -> list[dict]:
    res = admin_client.table('marks')\
        .select('*, subjects(name,code,semester,year,sem_half,credits)')\
        .eq('student_id', student_id)\
        .execute()
    return [compute_marks(r) for r in (res.data or [])]

def upsert_mark(data: dict) -> dict:
    res = admin_client.table('marks')\
        .upsert(data, on_conflict='student_id,subject_id')\
        .execute()
    return compute_marks(res.data[0])
