from fastapi import APIRouter, Depends, HTTPException
from app.subjects.schemas import (
    SubjectCreate, SubjectUpdate, SubjectResponse
)
from app.subjects import service
from app.auth.dependencies import (
    get_current_user, require_admin, require_faculty
)

router = APIRouter(
    prefix="/subjects", tags=["subjects"]
)

@router.get("/", response_model=list[SubjectResponse])
async def list_subjects(
    user: dict = Depends(get_current_user)
):
    return service.list_subjects(user)

@router.get("/{subject_id}", response_model=SubjectResponse)
async def get_subject(
    subject_id: str,
    user: dict = Depends(get_current_user)
):
    subject = service.get_subject(subject_id)
    if not subject:
        raise HTTPException(404, "Subject not found")
    return subject

@router.post("/",
    response_model=SubjectResponse,
    status_code=201)
async def create_subject(
    data: SubjectCreate,
    user: dict = Depends(require_admin)
):
    return service.create_subject(data.model_dump())

@router.put("/{subject_id}", response_model=SubjectResponse)
async def update_subject(
    subject_id: str,
    data: SubjectUpdate,
    user: dict = Depends(require_admin)
):
    updated = service.update_subject(
        subject_id,
        data.model_dump(exclude_none=True)
    )
    if not updated:
        raise HTTPException(404, "Subject not found")
    return updated

@router.delete("/{subject_id}", status_code=204)
async def delete_subject(
    subject_id: str,
    user: dict = Depends(require_admin)
):
    service.delete_subject(subject_id)

@router.get("/{subject_id}/students")
async def get_students(
    subject_id: str,
    user: dict = Depends(require_faculty)
):
    return service.get_enrolled_students(subject_id)
