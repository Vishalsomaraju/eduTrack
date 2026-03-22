from datetime import date, timedelta
from collections import defaultdict
from app.utils.supabase import admin_client

AT_RISK_ATTENDANCE = 75.0
AT_RISK_MARKS = 40.0

def compute_grade(percentage: float) -> str:
    if percentage >= 90: return "O"
    if percentage >= 75: return "A+"
    if percentage >= 60: return "A"
    if percentage >= 50: return "B+"
    if percentage >= 40: return "B"
    return "F"

def _compute_total(row: dict) -> float:
    mid1 = row.get('mid1_exam', 0) + row.get('mid1_assign', 0)
    mid2 = row.get('mid2_exam', 0) + row.get('mid2_assign', 0)
    internal = (mid1 + mid2) / 2
    return round(internal + row.get('external', 0), 2)

# ─── Attendance Trend ───────────────────────
def attendance_trend(subject_id: str, days: int = 30) -> list[dict]:
    since = date.today() - timedelta(days=days)
    res = admin_client.table("attendance")\
        .select("date, status")\
        .eq("subject_id", subject_id)\
        .gte("date", since.isoformat())\
        .order("date")\
        .execute()

    by_date = defaultdict(lambda: {"present": 0, "absent": 0, "late": 0})
    for row in (res.data or []):
        by_date[row["date"]][row["status"]] += 1

    result = []
    for d, counts in sorted(by_date.items()):
        total = sum(counts.values())
        present = counts["present"]
        pct = round(present / total * 100, 2) if total else 0.0
        result.append({
            "date": d,
            "present": present,
            "absent": counts["absent"],
            "late": counts["late"],
            "percentage": pct,
        })
    return result

# ─── Grade Distribution ─────────────────────
def grade_distribution(subject_id: str) -> list[dict]:
    res = admin_client.table("marks")\
        .select("student_id, mid1_exam, mid1_assign, mid2_exam, mid2_assign, external")\
        .eq("subject_id", subject_id)\
        .execute()

    grade_counts = defaultdict(int)
    student_ids = set()
    for row in (res.data or []):
        sid = row["student_id"]
        student_ids.add(sid)
        total = _compute_total(row)
        grade_counts[compute_grade(total)] += 1

    total_students = len(student_ids)
    grades = ["O", "A+", "A", "B+", "B", "F"]
    return [
        {
            "grade": g,
            "count": grade_counts.get(g, 0),
            "percentage": round(grade_counts.get(g, 0) / total_students * 100, 2) if total_students else 0.0,
        }
        for g in grades
    ]

# ─── At-Risk Students ───────────────────────
def at_risk_students(subject_id: str) -> list[dict]:
    enroll = admin_client.table("enrollments")\
        .select("student_id, profiles(id,name,email)")\
        .eq("subject_id", subject_id)\
        .execute()

    students = {
        row["student_id"]: row["profiles"]
        for row in (enroll.data or [])
        if row.get("profiles")
    }
    if not students:
        return []

    att = admin_client.table("attendance")\
        .select("student_id, status")\
        .eq("subject_id", subject_id)\
        .execute()

    att_totals = defaultdict(lambda: {"present": 0, "total": 0})
    for row in (att.data or []):
        sid = row["student_id"]
        att_totals[sid]["total"] += 1
        if row["status"] == "present":
            att_totals[sid]["present"] += 1

    marks = admin_client.table("marks")\
        .select("student_id, mid1_exam, mid1_assign, mid2_exam, mid2_assign, external")\
        .eq("subject_id", subject_id)\
        .execute()

    marks_totals = {}
    for row in (marks.data or []):
        marks_totals[row["student_id"]] = _compute_total(row)

    result = []
    for sid, profile in students.items():
        att_data = att_totals.get(sid, {})
        total = att_data.get("total", 0)
        present = att_data.get("present", 0)
        att_pct = round(present / total * 100, 2) if total else 0.0

        marks_pct = marks_totals.get(sid, None)

        att_risk = att_pct < AT_RISK_ATTENDANCE
        marks_risk = marks_pct is not None and marks_pct < AT_RISK_MARKS

        if not att_risk and not marks_risk:
            continue

        reason = "both" if (att_risk and marks_risk) else ("attendance" if att_risk else "marks")

        result.append({
            "student_id": sid,
            "name": profile["name"],
            "email": profile["email"],
            "attendance_percentage": att_pct,
            "marks_percentage": marks_pct,
            "risk_reason": reason,
        })

    return sorted(result, key=lambda x: x["attendance_percentage"])

# ─── Subject Comparison ─────────────────────
def subject_comparison() -> list[dict]:
    subjects = admin_client.table("subjects")\
        .select("id, name, code")\
        .execute()
    if not subjects.data:
        return []

    subject_ids = [s["id"] for s in subjects.data]

    att_res = admin_client.table("attendance")\
        .select("subject_id, status")\
        .in_("subject_id", subject_ids)\
        .execute()

    marks_res = admin_client.table("marks")\
        .select("subject_id, student_id, mid1_exam, mid1_assign, mid2_exam, mid2_assign, external")\
        .in_("subject_id", subject_ids)\
        .execute()

    # Aggregate attendance per subject
    att_map = defaultdict(lambda: {"present": 0, "total": 0})
    for row in (att_res.data or []):
        sid = row["subject_id"]
        att_map[sid]["total"] += 1
        if row["status"] == "present":
            att_map[sid]["present"] += 1

    # Aggregate marks per subject (one row per student, use total)
    marks_map = defaultdict(list)
    for row in (marks_res.data or []):
        marks_map[row["subject_id"]].append(_compute_total(row))

    result = []
    for subj in subjects.data:
        sid = subj["id"]
        a = att_map[sid]
        avg_att = round(a["present"] / a["total"] * 100, 2) if a["total"] else 0.0
        totals = marks_map[sid]
        avg_marks = round(sum(totals) / len(totals), 2) if totals else 0.0
        result.append({
            "subject_id": sid,
            "subject_name": subj["name"],
            "subject_code": subj["code"],
            "avg_attendance": avg_att,
            "avg_marks": avg_marks,
        })

    return result