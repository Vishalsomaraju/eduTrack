from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, List
from app.auth.dependencies import require_admin
from app.admin import schemas, service

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/users", response_model=schemas.ProfileResponse)
async def create_user(
    data: schemas.UserCreate, 
    user: dict = Depends(require_admin)
):
    return service.create_user(data)

@router.delete("/users/{user_id}", response_model=schemas.DeleteResponse)
async def delete_user(
    user_id: str,
    data: schemas.AdminPasswordVerify,
    admin_user: dict = Depends(require_admin)
):
    admin_email = admin_user.get("email")
    if not admin_email:
        raise HTTPException(status_code=400, detail="Admin email not found in token")
        
    return service.delete_user(user_id, data.admin_password, admin_email)

@router.patch("/subjects/{subject_id}/assign-faculty", response_model=schemas.SubjectResponse)
async def assign_faculty(
    subject_id: str,
    data: schemas.AssignFaculty,
    user: dict = Depends(require_admin)
):
    return service.assign_faculty(subject_id, data.faculty_id)

@router.patch("/elective-deadlines/{slot}", response_model=schemas.DeadlineResponse)
async def update_elective_deadline(
    slot: str,
    data: schemas.ElectiveDeadlineUpdate,
    user: dict = Depends(require_admin)
):
    return service.update_elective_deadline(slot, data.deadline)

@router.get("/users", response_model=List[dict])
async def list_users(
    role: str = "all",
    user: dict = Depends(require_admin)
):
    return service.list_users(role)
