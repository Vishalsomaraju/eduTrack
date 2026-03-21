from fastapi import APIRouter, Depends, HTTPException
from app.courses.schemas import (
    ElectiveRegistration,
    ElectiveRegistrationResponse,
    SyllabusUpdate,
    SubjectWithSyllabus,
)
from app.courses import service
from app.auth.dependencies import (
    get_current_user,
    require_faculty,
)

router = APIRouter(prefix='/courses', tags=['courses'])

# Get all subjects (all semesters)
@router.get('/subjects', response_model=list[SubjectWithSyllabus])
async def get_all_subjects(user: dict = Depends(get_current_user)):
    return service.get_all_subjects()

# Get my elective registrations
@router.get('/my-electives', response_model=list[ElectiveRegistrationResponse])
async def get_my_electives(user: dict = Depends(get_current_user)):
    return service.get_my_registrations(user['id'])

# Get elective deadlines
@router.get('/deadlines')
async def get_deadlines(user: dict = Depends(get_current_user)):
    return service.get_deadlines()

# Register an elective
@router.post('/register-elective', response_model=ElectiveRegistrationResponse)
async def register_elective(data: ElectiveRegistration, user: dict = Depends(get_current_user)):
    if user['role'] != 'student':
        raise HTTPException(403, 'Students only')
    try:
        return service.register_elective(
            user['id'],
            data.subject_id,
            data.slot,
            data.semester,
        )
    except ValueError as e:
        raise HTTPException(400, str(e))

# Update syllabus (faculty only)
@router.patch('/subjects/{subject_id}/syllabus')
async def update_syllabus(subject_id: str, data: SyllabusUpdate, user: dict = Depends(require_faculty)):
    return service.update_syllabus(subject_id, data.syllabus_text)
