from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.auth.router import router as auth_router

app = FastAPI(
    title="EduTrack API",
    version="1.0.0",
    description="Smart Academic Management System",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",  # ← add this
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",  # ← add this
        settings.FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ─────────────────────────────────────────────────────────────────
from app.students.router import router as students_router
from app.faculty.router import router as faculty_router
from app.subjects.router import router as subjects_router
from app.attendance.router import router as attendance_router
from app.marks.router import router as marks_router
from app.analytics.router import router as analytics_router

app.include_router(auth_router)
app.include_router(students_router)
app.include_router(faculty_router)
app.include_router(subjects_router)
app.include_router(attendance_router)
app.include_router(marks_router)
app.include_router(analytics_router)



# ── Health ───────────────────────────────────────────────────────────────────
@app.get("/health", tags=["meta"])
async def health():
    return {"status": "ok", "service": "EduTrack API"}
