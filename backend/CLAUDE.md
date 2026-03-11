# EduTrack Backend — Master Agent Context

# Read this entire file before doing anything. No exceptions.

---

## 🧠 What This Project Is

**EduTrack Backend** — REST API service for the EduTrack academic management platform.
This is the backend half. The frontend lives in `edutrack-frontend` repo.

**Stack:**

- Language: Python 3.11+
- Framework: FastAPI
- Database: Supabase (PostgreSQL) — via supabase-py client
- Auth: Supabase Auth + JWT verification
- Deploy: Render (free tier)
- API Docs: Auto-generated at `/docs` (Swagger) and `/redoc`

---

## 📁 File Structure — Always Follow This

```
backend/
├── CLAUDE.md
├── CLAUDE.local.md          ← gitignored, personal only
├── main.py                  ← FastAPI app entry point
├── requirements.txt
├── .env                     ← gitignored, real keys
├── .env.example             ← committed, placeholder keys
│
├── app/
│   ├── __init__.py
│   ├── config.py            ← env vars, settings
│   ├── dependencies.py      ← shared FastAPI dependencies (get_db, get_current_user)
│   │
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── router.py        ← /auth endpoints
│   │   └── utils.py         ← JWT decode, role extraction
│   │
│   ├── students/
│   │   ├── __init__.py
│   │   ├── router.py        ← /students endpoints
│   │   ├── schemas.py       ← Pydantic models for this module
│   │   └── service.py       ← Business logic (no DB calls in router)
│   │
│   ├── faculty/
│   │   ├── __init__.py
│   │   ├── router.py
│   │   ├── schemas.py
│   │   └── service.py
│   │
│   ├── subjects/
│   │   ├── __init__.py
│   │   ├── router.py
│   │   ├── schemas.py
│   │   └── service.py
│   │
│   ├── attendance/
│   │   ├── __init__.py
│   │   ├── router.py        ← /attendance endpoints
│   │   ├── schemas.py
│   │   └── service.py       ← Risk detection logic lives here
│   │
│   ├── marks/
│   │   ├── __init__.py
│   │   ├── router.py
│   │   ├── schemas.py
│   │   └── service.py
│   │
│   └── analytics/
│       ├── __init__.py
│       ├── router.py        ← /analytics endpoints
│       └── service.py       ← Aggregation queries live here
│
└── tests/
    ├── __init__.py
    └── test_attendance.py   ← At minimum, test the risk detection logic
```

---

## 🗄️ Database Schema — Know This Cold

All tables live in Supabase. Access via `supabase-py`.
**Never redefine or migrate schema from the backend** — schema is managed in Supabase dashboard.

```
profiles      → id (uuid, FK auth.users), role, name, email, avatar_url, created_at
subjects      → id, name, code, semester (int), faculty_id (FK profiles), created_at
enrollments   → id, student_id (FK profiles), subject_id (FK subjects), created_at
              → UNIQUE(student_id, subject_id)
attendance    → id, student_id, subject_id, date, status (present|absent|late), created_at
marks         → id, student_id, subject_id, type (internal|assignment), score, max_score, created_at
              → UNIQUE(student_id, subject_id, type)
```

### Supabase client pattern (ALWAYS use this):

```python
# app/config.py
from supabase import create_client
from app.config import settings

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
```

```python
# Standard query pattern
response = supabase.table("attendance")\
    .select("*, profiles(name)")\
    .eq("subject_id", subject_id)\
    .execute()

data = response.data   # list of dicts
```

---

## 🔐 Auth & Role Rules

JWT tokens come from Supabase Auth. The backend verifies them.

### Dependency pattern — use this in every protected route:

```python
# app/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.auth.utils import decode_jwt

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    payload = decode_jwt(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

async def require_faculty(user=Depends(get_current_user)):
    if user["role"] not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Faculty access required")
    return user

async def require_admin(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
```

### Role rules:

- `admin` → can access everything
- `faculty` → can access their own subjects, mark attendance, upload marks
- `student` → read-only access to their own data only
- A faculty member can NEVER read another faculty's class data
- A student can NEVER read another student's marks or attendance

---

## 🌐 API Contract — Endpoints

These are the agreed endpoints shared with the frontend team.
**Do not change method, path, or response shape without updating the frontend team.**

### Auth

```
POST   /auth/verify          → Verify JWT, return user profile + role
GET    /auth/me              → Return current user profile
```

### Students

```
GET    /students/            → [admin] List all students
GET    /students/{id}        → [admin, faculty] Get student profile
GET    /students/me          → [student] Get own profile
```

### Subjects

```
GET    /subjects/            → [all] List subjects (filtered by role)
POST   /subjects/            → [admin] Create subject
PUT    /subjects/{id}        → [admin] Update subject
DELETE /subjects/{id}        → [admin] Delete subject
GET    /subjects/{id}/students → [faculty, admin] Get enrolled students
```

### Attendance

```
GET    /attendance/{subject_id}          → [faculty, admin] Get all attendance for subject
GET    /attendance/{subject_id}/student/{student_id} → [student] Get own attendance
POST   /attendance/                      → [faculty] Create attendance record
PUT    /attendance/{id}                  → [faculty] Update attendance record
GET    /attendance/{subject_id}/summary  → [all] Get % summary per student
```

### Marks

```
GET    /marks/{subject_id}               → [faculty, admin] Get all marks for subject
GET    /marks/student/me                 → [student] Get own marks
POST   /marks/                           → [faculty] Create or update mark (upsert)
```

### Analytics

```
GET    /analytics/attendance-trend       → [faculty, admin] 30-day attendance trend
GET    /analytics/grade-distribution     → [faculty, admin] Score distribution data
GET    /analytics/at-risk                → [faculty, admin] List of at-risk students
GET    /analytics/subject-comparison     → [admin] Cross-subject performance data
```

---

## 📐 Pydantic Schema Rules

Every module has its own `schemas.py`. Follow this naming:

```python
# Request bodies
class AttendanceCreate(BaseModel): ...
class AttendanceUpdate(BaseModel): ...

# Response bodies
class AttendanceResponse(BaseModel): ...
class AttendanceSummary(BaseModel): ...

# Always use Optional for nullable fields
# Always include created_at in response schemas
```

---

## 🚨 Risk Detection Logic

This is the core business logic. Lives in `app/attendance/service.py`.

```python
# Thresholds — do not change without syncing with frontend
ATTENDANCE_RISK_THRESHOLD = 75.0   # percent
MARKS_RISK_THRESHOLD = 40.0        # percent of max_score

def calculate_attendance_percentage(present: int, total: int) -> float:
    if total == 0:
        return 0.0
    return round((present / total) * 100, 2)

def is_attendance_at_risk(percentage: float) -> bool:
    return percentage < ATTENDANCE_RISK_THRESHOLD

def is_marks_at_risk(score: float, max_score: float) -> bool:
    if max_score == 0:
        return False
    return (score / max_score * 100) < MARKS_RISK_THRESHOLD
```

---

## ⚙️ FastAPI App Rules

### Every router follows this pattern:

```python
# app/attendance/router.py
from fastapi import APIRouter, Depends
from app.dependencies import get_current_user, require_faculty
from app.attendance import service, schemas

router = APIRouter(prefix="/attendance", tags=["attendance"])

@router.post("/", response_model=schemas.AttendanceResponse)
async def create_attendance(
    data: schemas.AttendanceCreate,
    user=Depends(require_faculty)
):
    return await service.create_attendance(data, user)
```

### main.py registers all routers:

```python
from app.attendance.router import router as attendance_router
app.include_router(attendance_router)
```

### CORS — required for frontend connection:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-vercel-url.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## ✅ Task Checklist (update weekly)

### Month 1 — Foundation

- [x] FastAPI project setup + folder structure
- [x] requirements.txt + .env.example  ← .env.example still needs committing
- [x] Supabase client connected
- [x] Auth verification endpoint + JWT decode
- [ ] Student CRUD endpoints
- [ ] Subject CRUD endpoints
- [ ] Faculty endpoints

### Month 2 — Core Features

- [ ] Attendance POST/PUT/GET endpoints
- [ ] Attendance summary (% per student per subject)
- [ ] Marks upsert + retrieval endpoints
- [ ] Risk detection logic (attendance + marks)
- [ ] At-risk students endpoint

### Month 3 — Analytics + Polish

- [ ] Analytics endpoints (trend, distribution, comparison)
- [ ] Proper error handling across all routes
- [ ] Input validation tightened
- [ ] Deployment on Render
- [ ] Environment variables set on Render dashboard

---

## ⚠️ Hard Rules — Never Break These

1. **No DB calls in routers.** Business logic and queries live in `service.py` only.
2. **No raw SQL.** Use the Supabase Python client exclusively.
3. **Every protected route has a dependency.** Never leave an endpoint unprotected.
4. **A student can only see their own data.** Always filter by `user["sub"]` for student routes.
5. **Never return passwords, tokens, or service keys** in any response.
6. **All responses use Pydantic schemas.** No raw dicts returned from endpoints.
7. **CORS origins must include both localhost and the Vercel URL** before deployment.
8. **Commit messages follow:** `feat:`, `fix:`, `refactor:`, `chore:`

---

## 👥 Team

- **Frontend:** Vishal — React, Supabase client, UI
- **Backend (you):** FastAPI, PostgreSQL queries, business logic

### API contract rule:

Any endpoint change → notify frontend immediately.
Update the API Contract section in this file AND in `API_CONTRACT.md`.

---

## 🔄 Current Status

> Update this section every week

**Week:** 1
**Phase:** Foundation — Core infra done
**In progress:** main.py + config + auth/utils + dependencies implemented; CRUD endpoints next
**Blocked by:** Nothing
**Last updated:** 2026-03-11
