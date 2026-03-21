from fastapi import APIRouter, Depends
from app.lab_marks.schemas import (
  LabMarksCreate, LabMarksUpdate,
  LabMarksResponse
)
from app.lab_marks import service
from app.auth.dependencies import (
  get_current_user, require_faculty
)

router = APIRouter(
  prefix='/lab-marks', tags=['lab-marks']
)

@router.get('/{subject_id}',
  response_model=list[LabMarksResponse])
async def get_lab_marks(
  subject_id: str,
  user: dict = Depends(require_faculty)
):
  return service.get_lab_marks_for_subject(
    subject_id
  )

@router.get('/student/me',
  response_model=list[LabMarksResponse])
async def get_my_lab_marks(
  user: dict = Depends(get_current_user)
):
  return service.get_my_lab_marks(user['id'])

@router.post('/',
  response_model=LabMarksResponse,
  status_code=201)
async def upsert_lab_mark(
  data: LabMarksCreate,
  user: dict = Depends(require_faculty)
):
  return service.upsert_lab_mark(
    data.model_dump()
  )

@router.patch('/{student_id}/{subject_id}',
  response_model=LabMarksResponse)
async def update_lab_mark(
  student_id: str,
  subject_id: str,
  data: LabMarksUpdate,
  user: dict = Depends(require_faculty)
):
  clean = data.model_dump(exclude_none=True)
  clean['student_id'] = student_id
  clean['subject_id'] = subject_id
  return service.upsert_lab_mark(clean)
