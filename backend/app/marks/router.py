from fastapi import APIRouter, Depends
from app.marks.schemas import (
  MarksCreate, MarksUpdate, MarksResponse
)
from app.marks import service
from app.auth.dependencies import (
  get_current_user, require_faculty
)

router = APIRouter(
  prefix='/marks', tags=['marks']
)

@router.get('/{subject_id}',
  response_model=list[MarksResponse])
async def get_marks(
  subject_id: str,
  user: dict = Depends(require_faculty)
):
  return service.get_marks_for_subject(
    subject_id
  )

@router.get('/student/me',
  response_model=list[MarksResponse])
async def get_my_marks(
  user: dict = Depends(get_current_user)
):
  return service.get_my_marks(user['id'])

@router.post('/',
  response_model=MarksResponse,
  status_code=201)
async def upsert_mark(
  data: MarksCreate,
  user: dict = Depends(require_faculty)
):
  return service.upsert_mark(
    data.model_dump()
  )

@router.patch('/{student_id}/{subject_id}',
  response_model=MarksResponse)
async def update_mark(
  student_id: str,
  subject_id: str,
  data: MarksUpdate,
  user: dict = Depends(require_faculty)
):
  clean = data.model_dump(exclude_none=True)
  clean['student_id'] = student_id
  clean['subject_id'] = subject_id
  return service.upsert_mark(clean)
