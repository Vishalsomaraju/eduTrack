#!/usr/bin/env python3

# --- SAME IMPORTS ---
import os
import sys
import time
import random
from datetime import date, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
random.seed(42)

# ================================
# KEEP YOUR DATA EXACTLY SAME
# (ADMIN, FACULTY, STUDENTS, ELECTIVE_CHOICES, MARKS_RANGES)
# ================================

# ⚠️ NOT PASTING AGAIN (unchanged) — keep your existing blocks exactly
# ═══════════════════════════════════════════════════════════════════
# ADMIN
# Code     : KPRIT-ADM-001
# Email    : adm001@kprit.com
# Password : Adm001@Kprit
# ═══════════════════════════════════════════════════════════════════

ADMIN = {
    "name":        "Dr. Venkat Prasad Reddy",
    "code":        "KPRIT-ADM-001",
    "email":       "adm001@kprit.com",
    "password":    "Adm001@Kprit",
    "role":        "admin",
    "phone":       "9848012345",
    "dob":         "1975-03-15",
    "gender":      "male",
    "blood_group": "O+",
    "aadhar":      "234567890123",
    "address":     "Plot 45, Kukatpally Housing Board, Hyderabad - 500072",
    "department":  "CSE",
}


# ═══════════════════════════════════════════════════════════════════
# FACULTY
# Code     : KPRIT-FAC-001 to 005
# Email    : fac001@kprit.com  ...  fac005@kprit.com
# Password : Fac001@Kprit  ...  Fac005@Kprit
# ═══════════════════════════════════════════════════════════════════

FACULTY = [
    {
        "name": "Dr. Ramesh Babu Naidu",
        "code": "KPRIT-FAC-001",
        "email": "fac001@kprit.com",
        "password": "Fac001@Kprit",
        "role": "faculty",
        "phone": "9848023456",
        "dob": "1978-06-20",
        "gender": "male",
        "blood_group": "A+",
        "aadhar": "345678901234",
        "address": "H.No 23, Miyapur Colony, Hyderabad - 500049",
        "department": "CSE",
        "designation": "Associate Professor",
        "qualification": "Ph.D (CSE)",
        "specialization": "Data Structures & Algorithms",
        "experience_years": 10,
        "joined_date": "2014-06-01",
        "subject_codes": [
            "CS302PC", "CS501PC", "CS702PC",
            "CS304PC", "CS306PC", "CS308PC",
        ],
    },
    {
        "name": "Mrs. Lakshmi Devi Sharma",
        "code": "KPRIT-FAC-002",
        "email": "fac002@kprit.com",
        "password": "Fac002@Kprit",
        "role": "faculty",
        "phone": "9848034567",
        "dob": "1982-09-14",
        "gender": "female",
        "blood_group": "B+",
        "aadhar": "456789012345",
        "address": "Flat 12B, Madhapur Heights, Hyderabad - 500081",
        "department": "CSE",
        "designation": "Assistant Professor",
        "qualification": "M.Tech (CSE)",
        "specialization": "Database Systems & Software Engineering",
        "experience_years": 5,
        "joined_date": "2019-07-15",
        "subject_codes": [
            "CS401PC", "CS404PC", "CS405PC",
            "CS406PC", "CS407PC", "CS408PC",
        ],
    },
    {
        "name": "Dr. Srinivas Rao Varma",
        "code": "KPRIT-FAC-003",
        "email": "fac003@kprit.com",
        "password": "Fac003@Kprit",
        "role": "faculty",
        "phone": "9848045678",
        "dob": "1976-12-05",
        "gender": "male",
        "blood_group": "O-",
        "aadhar": "567890123456",
        "address": "Plot 8, Gachibowli Layout, Hyderabad - 500032",
        "department": "CSE",
        "designation": "Associate Professor",
        "qualification": "Ph.D (Computer Networks)",
        "specialization": "Computer Networks & Cyber Security",
        "experience_years": 12,
        "joined_date": "2012-06-01",
        "subject_codes": [
            "CS403PC", "CS502PC", "CS701PC",
            "CS504PC", "CS703PC", "CS704PC",
        ],
    },
    {
        "name": "Mr. Praveen Kumar Joshi",
        "code": "KPRIT-FAC-004",
        "email": "fac004@kprit.com",
        "password": "Fac004@Kprit",
        "role": "faculty",
        "phone": "9848056789",
        "dob": "1985-04-22",
        "gender": "male",
        "blood_group": "AB+",
        "aadhar": "678901234567",
        "address": "H.No 56, Kondapur Road, Hyderabad - 500084",
        "department": "CSE",
        "designation": "Assistant Professor",
        "qualification": "M.Tech (AI & ML)",
        "specialization": "Artificial Intelligence & Machine Learning",
        "experience_years": 4,
        "joined_date": "2020-07-01",
        "subject_codes": [
            "CS601PC", "CS602PC", "CS603PC",
            "CS604PC", "CS605PC", "CS606PC",
        ],
    },
    {
        "name": "Mrs. Padma Reddy Goud",
        "code": "KPRIT-FAC-005",
        "email": "fac005@kprit.com",
        "password": "Fac005@Kprit",
        "role": "faculty",
        "phone": "9848067890",
        "dob": "1980-07-18",
        "gender": "female",
        "blood_group": "A-",
        "aadhar": "789012345678",
        "address": "Flat 4A, Nallagandla Residency, Hyderabad - 500019",
        "department": "CSE",
        "designation": "Assistant Professor",
        "qualification": "M.Tech (Software Engineering)",
        "specialization": "Web Technologies & DevOps",
        "experience_years": 6,
        "joined_date": "2018-06-01",
        "subject_codes": [
            "CS301PC", "CS303PC", "CS305PC",
            "CS503PC", "CS505PC", "CS506PC",
            "CS307PC", "CS409PC",
        ],
    },
]


# ═══════════════════════════════════════════════════════════════════
# STUDENTS
#
# Roll format : {YY}{TYPE}1A05{SERIAL}
#   YY   = year joined  (22 = 2022, 23 = 2023 lateral)
#   TYPE = RA convenor | MA management | LA lateral
#   1A05 = KPRIT CSE dept code
#   SER  = two uppercase letters
#
# Email    : roll.lower()@kprit.com
# Password : roll number UPPERCASE  e.g. 22RA1A05AA
#
# attendance_pct < 0.75 → AT RISK banner shows on dashboard
# marks_level F         → AT RISK marks shown in analytics
# ═══════════════════════════════════════════════════════════════════

STUDENTS = [
    # ── Year 1, Sem 1 ────────────────────────────────────────────
    {
        "name": "Aarav Sharma",
        "roll": "22RA1A05AA",
        "gender": "male",    "dob": "2004-05-12",
        "blood_group": "O+", "aadhar": "111122223333",
        "phone": "9876543210",
        "address": "H.No 12, Bachupally, Hyderabad - 500090",
        "year": 1, "semester": 1, "admission_type": "convenor",
        "joined_date": "2022-11-01",
        "father_name": "Rajesh Sharma",    "father_phone": "9848111222",
        "father_email": "rajesh.sharma@gmail.com",
        "mother_name": "Sunita Sharma",   "mother_phone": "9848111333",
        "mother_email": "sunita.sharma@gmail.com",
        "guardian_name": None, "guardian_phone": None,
        "attendance_pct": 0.88, "marks_level": "B+",
    },
    # ── Year 1, Sem 2 ────────────────────────────────────────────
    {
        "name": "Priya Reddy",
        "roll": "22MA1A05AB",
        "gender": "female",  "dob": "2004-08-25",
        "blood_group": "B+", "aadhar": "222233334444",
        "phone": "9876543211",
        "address": "Plot 34, Kompally, Hyderabad - 500014",
        "year": 1, "semester": 2, "admission_type": "management",
        "joined_date": "2022-11-01",
        "father_name": "Suresh Reddy",    "father_phone": "9848222333",
        "father_email": "suresh.reddy@gmail.com",
        "mother_name": "Vijaya Reddy",    "mother_phone": "9848222444",
        "mother_email": "vijaya.reddy@gmail.com",
        "guardian_name": None, "guardian_phone": None,
        "attendance_pct": 0.72,            # ⚠ AT RISK
        "marks_level": "F",                # ⚠ AT RISK
    },
    # ── Year 2, Sem 3 ────────────────────────────────────────────
    {
        "name": "Rohan Verma",
        "roll": "22RA1A05AC",
        "gender": "male",    "dob": "2004-02-18",
        "blood_group": "A+", "aadhar": "333344445555",
        "phone": "9876543212",
        "address": "H.No 67, Nizampet, Hyderabad - 500090",
        "year": 2, "semester": 3, "admission_type": "convenor",
        "joined_date": "2022-11-01",
        "father_name": "Amit Verma",      "father_phone": "9848333444",
        "father_email": "amit.verma@gmail.com",
        "mother_name": "Rekha Verma",     "mother_phone": "9848333555",
        "mother_email": "rekha.verma@gmail.com",
        "guardian_name": None, "guardian_phone": None,
        "attendance_pct": 0.91, "marks_level": "A",
    },
    # ── Year 2, Sem 4  ← CURRENT_SEM ────────────────────────────
    {
        "name": "Sneha Patel",
        "roll": "22RA1A05AD",
        "gender": "female",   "dob": "2003-11-30",
        "blood_group": "AB+", "aadhar": "444455556666",
        "phone": "9876543213",
        "address": "Flat 8C, KPHB Colony, Hyderabad - 500072",
        "year": 2, "semester": 4, "admission_type": "convenor",
        "joined_date": "2022-11-01",
        "father_name": "Mahesh Patel",    "father_phone": "9848444555",
        "father_email": "mahesh.patel@gmail.com",
        "mother_name": "Geeta Patel",     "mother_phone": "9848444666",
        "mother_email": "geeta.patel@gmail.com",
        "guardian_name": None, "guardian_phone": None,
        "attendance_pct": 0.85, "marks_level": "A+",
    },
    # ── Year 3, Sem 5 ────────────────────────────────────────────
    {
        "name": "Arjun Nair",
        "roll": "22RA1A05AE",
        "gender": "male",    "dob": "2003-07-08",
        "blood_group": "O-", "aadhar": "555566667777",
        "phone": "9876543214",
        "address": "H.No 89, Pragathi Nagar, Hyderabad - 500090",
        "year": 3, "semester": 5, "admission_type": "convenor",
        "joined_date": "2022-11-01",
        "father_name": "Sunil Nair",      "father_phone": "9848555666",
        "father_email": "sunil.nair@gmail.com",
        "mother_name": "Meena Nair",      "mother_phone": "9848555777",
        "mother_email": "meena.nair@gmail.com",
        "guardian_name": None, "guardian_phone": None,
        "attendance_pct": 0.78, "marks_level": "B",
    },
    # ── Year 3, Sem 6 ────────────────────────────────────────────
    {
        "name": "Divya Krishnan",
        "roll": "22MA1A05AF",
        "gender": "female",  "dob": "2003-03-22",
        "blood_group": "B-", "aadhar": "666677778888",
        "phone": "9876543215",
        "address": "Plot 23, Hafeezpet, Hyderabad - 500049",
        "year": 3, "semester": 6, "admission_type": "management",
        "joined_date": "2022-11-01",
        "father_name": "Mohan Krishnan",  "father_phone": "9848666777",
        "father_email": "mohan.krishnan@gmail.com",
        "mother_name": "Sarada Krishnan", "mother_phone": "9848666888",
        "mother_email": "sarada.krishnan@gmail.com",
        "guardian_name": None, "guardian_phone": None,
        "attendance_pct": 0.68,            # ⚠ AT RISK
        "marks_level": "F",                # ⚠ AT RISK
    },
    # ── Year 4, Sem 7 ────────────────────────────────────────────
    {
        "name": "Kiran Rao Challa",
        "roll": "22RA1A05AG",
        "gender": "male",    "dob": "2003-09-15",
        "blood_group": "A-", "aadhar": "777788889999",
        "phone": "9876543216",
        "address": "H.No 45, Bowenpally, Hyderabad - 500011",
        "year": 4, "semester": 7, "admission_type": "convenor",
        "joined_date": "2022-11-01",
        "father_name": "Venkatesh Rao",   "father_phone": "9848777888",
        "father_email": "venkatesh.rao@gmail.com",
        "mother_name": "Kalyani Rao",     "mother_phone": "9848777999",
        "mother_email": "kalyani.rao@gmail.com",
        "guardian_name": "Ravi Kumar Rao", "guardian_phone": "9848700111",
        "attendance_pct": 0.94, "marks_level": "O",
    },
    # ── Year 4, Sem 8 ────────────────────────────────────────────
    {
        "name": "Meera Iyer",
        "roll": "22RA1A05AH",
        "gender": "female",  "dob": "2002-12-01",
        "blood_group": "O+", "aadhar": "888899990000",
        "phone": "9876543217",
        "address": "Flat 2A, Manikonda Residency, Hyderabad - 500089",
        "year": 4, "semester": 8, "admission_type": "convenor",
        "joined_date": "2022-11-01",
        "father_name": "Krishnaswamy Iyer", "father_phone": "9848888999",
        "father_email": "krishna.iyer@gmail.com",
        "mother_name": "Kamala Iyer",       "mother_phone": "9848888000",
        "mother_email": "kamala.iyer@gmail.com",
        "guardian_name": None, "guardian_phone": None,
        "attendance_pct": 0.82, "marks_level": "A",
    },
    # ── Lateral Entry — Year 2, Sem 3 ────────────────────────────
    {
        "name": "Suresh Kumar Yadav",
        "roll": "23LA1A05AA",
        "gender": "male",    "dob": "2003-06-10",
        "blood_group": "B+", "aadhar": "999900001111",
        "phone": "9876543218",
        "address": "H.No 78, Alwal, Hyderabad - 500010",
        "year": 2, "semester": 3, "admission_type": "lateral_entry",
        "joined_date": "2023-11-01",
        "father_name": "Bhaskar Yadav",   "father_phone": "9848999000",
        "father_email": "bhaskar.yadav@gmail.com",
        "mother_name": "Saritha Yadav",   "mother_phone": "9848999111",
        "mother_email": "saritha.yadav@gmail.com",
        "guardian_name": None, "guardian_phone": None,
        "attendance_pct": 0.79, "marks_level": "B+",
    },
    # ── Lateral Entry — Year 3, Sem 5 ────────────────────────────
    {
        "name": "Ananya Singh Chauhan",
        "roll": "23LA1A05AB",
        "gender": "female",  "dob": "2002-10-28",
        "blood_group": "A+", "aadhar": "000011112222",
        "phone": "9876543219",
        "address": "Flat 6D, Chandanagar Township, Hyderabad - 500050",
        "year": 3, "semester": 5, "admission_type": "lateral_entry",
        "joined_date": "2023-11-01",
        "father_name": "Rajinder Singh",  "father_phone": "9848000111",
        "father_email": "rajinder.singh@gmail.com",
        "mother_name": "Paramjeet Singh", "mother_phone": "9848000222",
        "mother_email": "paramjeet.singh@gmail.com",
        "guardian_name": "Harpreet Kaur", "guardian_phone": "9848000333",
        "attendance_pct": 0.90, "marks_level": "A",
    },
]


# ═══════════════════════════════════════════════════════════════════
# ELECTIVE CHOICES  {roll → {slot: subject_code}}
# ═══════════════════════════════════════════════════════════════════

ELECTIVE_CHOICES = {
    "22RA1A05AE": {
        "PE1": "CS511PE", "PE2": "CS521PE",
    },
    "22MA1A05AF": {
        "PE1": "CS513PE", "PE2": "CS522PE",
        "OE1": "CS611OE", "PE3": "CS631PE",
    },
    "22RA1A05AG": {
        "PE1": "CS512PE", "PE2": "CS523PE",
        "OE1": "CS612OE", "PE3": "CS632PE",
        "PE4": "CS741PE", "PE5": "CS751PE", "OE2": "CS721OE",
    },
    "22RA1A05AH": {
        "PE1": "CS514PE", "PE2": "CS524PE",
        "OE1": "CS611OE", "PE3": "CS633PE",
        "PE4": "CS742PE", "PE5": "CS752PE", "OE2": "CS722OE",
        "PE6": "CS861PE", "OE3": "CS831OE",
    },
    "23LA1A05AB": {
        "PE1": "CS515PE", "PE2": "CS525PE",
    },
}


# ═══════════════════════════════════════════════════════════════════
# MARKS RANGES  (fraction of max score)
# ═══════════════════════════════════════════════════════════════════

MARKS_RANGES = {
    "O":  (0.90, 0.97),
    "A+": (0.78, 0.89),
    "A":  (0.65, 0.77),
    "B+": (0.55, 0.64),
    "B":  (0.45, 0.54),
    "F":  (0.25, 0.42),
}



# ================================
# HELPERS
# ================================

def batch_insert(table, rows, size=100):
    for i in range(0, len(rows), size):
        supabase.table(table).insert(rows[i:i+size]).execute()


def get_working_days(n=30):
    days = []
    d = date.today() - timedelta(days=1)
    while len(days) < n:
        if d.weekday() != 6:
            days.append(d)
        d -= timedelta(days=1)
    return days


def get_semesters(stu):
    start = 3 if stu["admission_type"] == "lateral_entry" else 1
    return list(range(start, stu["semester"] + 1))


def gen_status(pct):
    r = random.random()
    if r < pct - 0.07:
        return "present"
    elif r < pct:
        return "late"
    return "absent"


# ================================
# SAFE AUTH USER CREATION
# ================================
def get_all_users():
    users = []
    page = 1

    while True:
        resp = supabase.auth.admin.list_users(page=page, per_page=100)

        batch = resp if isinstance(resp, list) else getattr(resp, "users", [])

        if not batch:
            break

        users.extend(batch)

        if len(batch) < 100:
            break

        page += 1

    return users

def create_auth_user(data):
    uid = None

    try:
        res = supabase.auth.admin.create_user({
            "email": data["email"],
            "password": data["password"],
            "email_confirm": True,
        })
        uid = res.user.id

    except Exception:
        # handle duplicate email safely
        users = get_all_users()
        for u in users:
            if u.email == data["email"]:
                supabase.table("profiles").delete().eq("id", u.id).execute()
                supabase.auth.admin.delete_user(u.id)
                time.sleep(0.3)
                break

        res = supabase.auth.admin.create_user({
            "email": data["email"],
            "password": data["password"],
            "email_confirm": True,
        })
        uid = res.user.id

    # ensure no leftover profile
    supabase.table("profiles").delete().eq("id", uid).execute()

    supabase.table("profiles").insert({
        "id": uid,
        "name": data["name"],
        "email": data["email"],
        "role": data["role"],
        "phone": data.get("phone"),
        "date_of_birth": data.get("dob"),
        "gender": data.get("gender"),
        "blood_group": data.get("blood_group"),
        "aadhar": data.get("aadhar"),
        "address": data.get("address"),
        "department": data.get("department", "CSE"),
    }).execute()

    return uid


# ================================
# USERS
# ================================

def seed_users():
    print("\n👤 Creating users...")
    uids = {}

    # ADMIN
    uids["admin"] = create_auth_user(ADMIN)

    # FACULTY
    for fac in FACULTY:
        uid = create_auth_user(fac)
        uids[fac["code"]] = uid

        supabase.table("faculty_profiles").insert({
            "id": uid,
            "employee_id": fac["code"],
            "designation": fac["designation"],
            "qualification": fac["qualification"],
            "specialization": fac["specialization"],
            "experience_years": fac["experience_years"],
            "joined_date": fac["joined_date"],
        }).execute()

    # STUDENTS (🔥 FIX APPLIED HERE)
    for stu in STUDENTS:
        stu["email"] = f"{stu['roll'].lower()}@kprit.com"
        stu["password"] = stu["roll"]
        stu["role"] = "student"

        uid = create_auth_user(stu)
        uids[stu["roll"]] = uid

        supabase.table("student_profiles").insert({
            "id": uid,
            "roll_number": stu["roll"],
            "year": stu["year"],
            "semester": stu["semester"],
            "admission_type": stu["admission_type"],
            "father_name": stu.get("father_name"),
            "father_phone": stu.get("father_phone"),
            "father_email": stu.get("father_email"),
            "mother_name": stu.get("mother_name"),
            "mother_phone": stu.get("mother_phone"),
            "mother_email": stu.get("mother_email"),
            "guardian_name": stu.get("guardian_name"),
            "guardian_phone": stu.get("guardian_phone"),
            "joined_date": stu["joined_date"],
        }).execute()

    return uids


# ================================
# SUBJECTS
# ================================

def fetch_subjects():
    data = supabase.table("subjects").select("*").execute().data
    return {s["code"]: s for s in data}


def assign_faculty(uids, subjects):
    for fac in FACULTY:
        uid = uids[fac["code"]]
        for code in fac["subject_codes"]:
            if code in subjects:
                supabase.table("subjects").update({
                    "faculty_id": uid
                }).eq("id", subjects[code]["id"]).execute()


# ================================
# ENROLLMENTS (FIXED)
# ================================

def seed_enrollments(uids, subjects):
    print("\n📋 Seeding enrollments...")

    by_sem = {}
    for code, subj in subjects.items():
        if subj["subject_type"] != "elective":
            by_sem.setdefault(subj["semester"], []).append(subj)

    rows = []

    for stu in STUDENTS:
        uid = uids[stu["roll"]]
        seen = set()

        for sem in get_semesters(stu):
            for subj in by_sem.get(sem, []):
                key = (uid, subj["id"])
                if key not in seen:
                    rows.append({
                        "student_id": uid,
                        "subject_id": subj["id"]
                    })
                    seen.add(key)

        # 🔥 FIX: skip electives in sem 5 & 6
        for code in ELECTIVE_CHOICES.get(stu["roll"], {}).values():
            if code in subjects:
                subj = subjects[code]

                if subj["semester"] in [5, 6]:
                    continue

                key = (uid, subj["id"])
                if key not in seen:
                    rows.append({
                        "student_id": uid,
                        "subject_id": subj["id"]
                    })
                    seen.add(key)

    batch_insert("enrollments", rows)
    print(f"   ✅ {len(rows)} enrollments")


# ================================
# ATTENDANCE (FIXED)
# ================================

def seed_attendance(uids):
    print("\n📅 Seeding attendance...")

    days = get_working_days(30)
    rows = []

    for stu in STUDENTS:
        uid = uids[stu["roll"]]

        enrolled = supabase.table("enrollments") \
            .select("subject_id, subjects(*)") \
            .eq("student_id", uid) \
            .execute().data

        cur_sem = stu["semester"]

        subjects = [
            row["subjects"]
            for row in enrolled
            if row["subjects"]["semester"] == cur_sem
        ]

        for subj in subjects:
            for d in days:
                rows.append({
                    "student_id": uid,
                    "subject_id": subj["id"],
                    "date": d.isoformat(),
                    "status": gen_status(stu["attendance_pct"])
                })

    batch_insert("attendance", rows)
    print(f"   ✅ {len(rows)} attendance rows")


# ================================
# MARKS (unchanged logic)
# ================================
def gen_theory_marks(level):
    ranges = {
        "O":  (0.90, 0.97),
        "A+": (0.78, 0.89),
        "A":  (0.65, 0.77),
        "B+": (0.55, 0.64),
        "B":  (0.45, 0.54),
        "F":  (0.25, 0.42),
    }

    lo, hi = ranges[level]
    base = random.uniform(lo, hi)

    def scale(max_val):
        val = base * max_val * random.uniform(0.9, 1.1)
        return int(max(0, min(max_val, val)))

    return {
        "mid1_exam": scale(30),
        "mid1_assign": scale(10),
        "mid2_exam": scale(30),
        "mid2_assign": scale(10),
        "external": scale(60),
    }

def gen_lab_marks(level):
    ranges = {
        "O":  (0.90, 0.97),
        "A+": (0.78, 0.89),
        "A":  (0.65, 0.77),
        "B+": (0.55, 0.64),
        "B":  (0.45, 0.54),
        "F":  (0.25, 0.42),
    }

    lo, hi = ranges[level]
    base = random.uniform(lo, hi)

    def scale(max_val):
        val = base * max_val * random.uniform(0.9, 1.1)
        return int(max(0, min(max_val, val)))

    return {
        "internal_viva": scale(10),
        "observation_record": scale(10),
        "lab_performance": scale(20),
        "external_viva": scale(10),
        "external_record": scale(10),
        "lab_exam": scale(40),
    }

def seed_marks(uids, subjects):
    print("\n📝 Seeding marks...")

    theory, labs = [], []

    for stu in STUDENTS:
        uid = uids[stu["roll"]]
        level = stu["marks_level"]

        for sem in get_semesters(stu):
            for code, subj in subjects.items():
                if subj["semester"] != sem:
                    continue

                if subj["subject_type"] == "lab":
                    labs.append({
                        "student_id": uid,
                        "subject_id": subj["id"],
                        **gen_lab_marks(level)
                    })

                elif subj["subject_type"] != "mc":
                    theory.append({
                        "student_id": uid,
                        "subject_id": subj["id"],
                        **gen_theory_marks(level)
                    })

    batch_insert("marks", theory)
    batch_insert("lab_marks", labs)

    print("   ✅ marks inserted")


# ================================
# MAIN
# ================================

def main():
    print("\n🚀 Seeder Running...")

    uids = seed_users()
    subjects = fetch_subjects()

    assign_faculty(uids, subjects)
    seed_enrollments(uids, subjects)
    seed_attendance(uids)
    seed_marks(uids, subjects)

    print("\n✅ DONE")


if __name__ == "__main__":
    main()