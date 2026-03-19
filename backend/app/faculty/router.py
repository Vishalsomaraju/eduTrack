from fastapi import APIRouter, Depends, HTTPException
from app.faculty.schemas import FacultyProfile
from app.faculty import service
from app.auth.dependencies import (
    get_current_user, require_admin
)

router = APIRouter(
    prefix="/faculty", tags=["faculty"]
)

@router.get("/", response_model=list[FacultyProfile])
async def list_faculty(
    user: dict = Depends(require_admin)
):
    return service.list_faculty()

@router.get("/{faculty_id}",
    response_model=FacultyProfile)
async def get_faculty(
    faculty_id: str,
    user: dict = Depends(get_current_user)
):
    member = service.get_faculty_member(faculty_id)
    if not member:
        raise HTTPException(404, "Faculty not found")
    return member
