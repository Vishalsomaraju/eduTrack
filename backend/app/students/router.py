from fastapi import APIRouter, Depends, HTTPException
from app.students.schemas import StudentProfile
from app.students import service
from app.auth.dependencies import (
    get_current_user, require_admin
)

router = APIRouter(
    prefix="/students", tags=["students"]
)

@router.get("/", response_model=list[StudentProfile])
async def list_students(
    user: dict = Depends(require_admin)
):
    return service.list_students()

@router.get("/me", response_model=StudentProfile)
async def get_me(
    user: dict = Depends(get_current_user)
):
    if user["role"] != "student":
        raise HTTPException(403, "Students only")
    return user

@router.get("/{student_id}",
    response_model=StudentProfile)
async def get_student(
    student_id: str,
    user: dict = Depends(require_admin)
):
    student = service.get_student(student_id)
    if not student:
        raise HTTPException(404, "Student not found")
    return student
