from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.admin.router import router as admin_router
from app.auth.router import router as auth_router
from app.students.router import router as students_router
from app.faculty.router import router as faculty_router
from app.subjects.router import router as subjects_router
from app.attendance.router import router as attendance_router
from app.marks.router import router as marks_router
from app.analytics.router import router as analytics_router
from app.courses.router import router as courses_router
from app.lab_marks.router import router as lab_marks_router

app = FastAPI(
    title="EduTrack API",
    version="1.0.0",
    description="Smart Academic Management System",
)

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    settings.FRONTEND_URL,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global exception handler ─────────────────────────────────────────────────
# FastAPI's CORS middleware does NOT add CORS headers to unhandled 500 responses.
# This handler ensures CORS headers are always present so the browser shows the
# real error instead of a misleading "CORS policy" message.

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin", "")
    cors_origin = origin if origin in ALLOWED_ORIGINS else ALLOWED_ORIGINS[0]

    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {type(exc).__name__}: {exc}"},
        headers={
            "Access-Control-Allow-Origin":      cors_origin,
            "Access-Control-Allow-Credentials": "true",
        },
    )

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(admin_router)
app.include_router(auth_router)
app.include_router(students_router)
app.include_router(faculty_router)
app.include_router(subjects_router)
app.include_router(attendance_router)
app.include_router(marks_router)
app.include_router(analytics_router)
app.include_router(courses_router)
app.include_router(lab_marks_router)


@app.get("/health", tags=["meta"])
async def health():
    return {"status": "ok", "service": "EduTrack API"}


