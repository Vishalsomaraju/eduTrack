from datetime import date, timedelta
from collections import defaultdict
from app.utils.supabase import admin_client

# Thresholds (match frontend useMarks.js)
AT_RISK_ATTENDANCE = 75.0
AT_RISK_MARKS = 40.0

# Grade scale (match frontend useMarks.js)
def compute_grade(percentage: float) -> str:
    if percentage >= 90: return "O"
    if percentage >= 75: return "A+"
    if percentage >= 60: return "A"
    if percentage >= 50: return "B+"
    if percentage >= 40: return "B"
    return "F"

# ─── Attendance Trend ───────────────────────
def attendance_trend(subject_id: str, days: int = 30) -> list[dict]:
    since = date.today() - timedelta(days=days)

    res = admin_client.table("attendance")\
        .select("date, status")\
        .eq("subject_id", subject_id)\
        .gte("date", since.isoformat())\
        .order("date")\
        .execute()

    # Group by date
    by_date: dict = defaultdict(lambda: {"present": 0, "absent": 0, "late": 0})
    for row in (res.data or []):
        d = row["date"]
        by_date[d][row["status"]] += 1

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
        .select("student_id, score, max_score")\
        .eq("subject_id", subject_id)\
        .execute()

    # Aggregate per student (sum score / sum max)
    student_totals: dict = defaultdict(lambda: {"score": 0.0, "max": 0.0})
    for row in (res.data or []):
        sid = row["student_id"]
        student_totals[sid]["score"] += row["score"]
        student_totals[sid]["max"] += row["max_score"]

    grade_counts: dict = defaultdict(int)
    for totals in student_totals.values():
        pct = (totals["score"] / totals["max"] * 100) if totals["max"] else 0.0
        grade_counts[compute_grade(pct)] += 1

    total_students = len(student_totals)
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
    # Get all enrolled students
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

    # Attendance per student
    att = admin_client.table("attendance")\
        .select("student_id, status")\
        .eq("subject_id", subject_id)\
        .execute()

    att_totals: dict = defaultdict(lambda: {"present": 0, "total": 0})
    for row in (att.data or []):
        sid = row["student_id"]
        att_totals[sid]["total"] += 1
        if row["status"] == "present":
            att_totals[sid]["present"] += 1

    # Marks per student
    marks = admin_client.table("marks")\
        .select("student_id, score, max_score")\
        .eq("subject_id", subject_id)\
        .execute()

    marks_totals: dict = defaultdict(lambda: {"score": 0.0, "max": 0.0})
    for row in (marks.data or []):
        sid = row["student_id"]
        marks_totals[sid]["score"] += row["score"]
        marks_totals[sid]["max"] += row["max_score"]

    result = []
    for sid, profile in students.items():
        att_data = att_totals.get(sid, {})
        total = att_data.get("total", 0)
        present = att_data.get("present", 0)
        att_pct = round(present / total * 100, 2) if total else 0.0

        m = marks_totals.get(sid, {})
        marks_pct = round(
            m["score"] / m["max"] * 100, 2
        ) if m.get("max") else None

        att_risk = att_pct < AT_RISK_ATTENDANCE
        marks_risk = marks_pct is not None and marks_pct < AT_RISK_MARKS

        if not att_risk and not marks_risk:
            continue

        if att_risk and marks_risk:
            reason = "both"
        elif att_risk:
            reason = "attendance"
        else:
            reason = "marks"

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

    result = []
    for subj in (subjects.data or []):
        sid = subj["id"]

        # Avg attendance
        att = admin_client.table("attendance")\
            .select("status")\
            .eq("subject_id", sid)\
            .execute()
        records = att.data or []
        total = len(records)
        present = sum(1 for r in records if r["status"] == "present")
        avg_att = round(present / total * 100, 2) if total else 0.0

        # Avg marks
        marks = admin_client.table("marks")\
            .select("score, max_score")\
            .eq("subject_id", sid)\
            .execute()
        mdata = marks.data or []
        total_score = sum(r["score"] for r in mdata)
        total_max = sum(r["max_score"] for r in mdata)
        avg_marks = round(total_score / total_max * 100, 2) if total_max else 0.0

        result.append({
            "subject_id": sid,
            "subject_name": subj["name"],
            "subject_code": subj["code"],
            "avg_attendance": avg_att,
            "avg_marks": avg_marks,
        })

    return result
