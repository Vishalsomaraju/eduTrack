from fastapi import APIRouter, Depends, Query
from app.analytics.schemas import (
    AttendanceTrendPoint,
    GradeDistribution,
    AtRiskStudent,
    SubjectComparison,
)
from app.analytics import service
from app.auth.dependencies import (
    get_current_user,
    require_faculty,
)

router = APIRouter(
    prefix="/analytics", tags=["analytics"]
)

@router.get(
    "/attendance-trend",
    response_model=list[AttendanceTrendPoint]
)
async def attendance_trend(
    subject_id: str = Query(...),
    days: int = Query(30, ge=7, le=90),
    user: dict = Depends(require_faculty)
):
    return service.attendance_trend(
        subject_id, days
    )

@router.get(
    "/grade-distribution",
    response_model=list[GradeDistribution]
)
async def grade_distribution(
    subject_id: str = Query(...),
    user: dict = Depends(require_faculty)
):
    return service.grade_distribution(subject_id)

@router.get(
    "/at-risk",
    response_model=list[AtRiskStudent]
)
async def at_risk(
    subject_id: str = Query(...),
    user: dict = Depends(require_faculty)
):
    return service.at_risk_students(subject_id)

@router.get(
    "/subject-comparison",
    response_model=list[SubjectComparison]
)
async def subject_comparison(
    user: dict = Depends(require_faculty)
):
    return service.subject_comparison()
