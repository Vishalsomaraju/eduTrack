from app.utils.supabase import admin_client

def compute_lab_marks(row: dict) -> dict:
  internal = (
    row.get('internal_viva', 0) +
    row.get('observation_record', 0) +
    row.get('lab_performance', 0)
  )
  external = (
    row.get('external_viva', 0) +
    row.get('external_record', 0) +
    row.get('lab_exam', 0)
  )
  total = round(internal + external, 2)
  pct = total  # already out of 100

  if pct >= 90:   grade = 'O'
  elif pct >= 75: grade = 'A+'
  elif pct >= 60: grade = 'A'
  elif pct >= 50: grade = 'B+'
  elif pct >= 40: grade = 'B'
  else:           grade = 'F'

  return {
    **row,
    'internal_total': round(internal, 2),
    'external_total': round(external, 2),
    'total': total,
    'percentage': pct,
    'grade': grade,
  }

def get_lab_marks_for_subject(
  subject_id: str
) -> list[dict]:
  res = admin_client.table('lab_marks')\
    .select('*')\
    .eq('subject_id', subject_id)\
    .execute()
  return [compute_lab_marks(r)
          for r in (res.data or [])]

def get_my_lab_marks(
  student_id: str
) -> list[dict]:
  res = admin_client.table('lab_marks')\
    .select('*, subjects(name,code,semester,'
            'year,sem_half,credits)')\
    .eq('student_id', student_id)\
    .execute()
  return [compute_lab_marks(r)
          for r in (res.data or [])]

def upsert_lab_mark(data: dict) -> dict:
  res = admin_client.table('lab_marks')\
    .upsert(data,
      on_conflict='student_id,subject_id')\
    .execute()
  return compute_lab_marks(res.data[0])
