from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from app.auth.schemas import (
    UserProfile, VerifyResponse,
    FullProfileResponse,
    ProfileUpdate,
    StudentProfileUpdate,
    FacultyProfileUpdate,
)
from app.auth.dependencies import get_current_user, require_faculty
from app.auth import service
from app.utils.supabase import admin_client

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/verify", response_model=VerifyResponse)
async def verify_token(user: dict = Depends(get_current_user)):
    return VerifyResponse(valid=True, user=UserProfile(**user))


@router.get("/me", response_model=UserProfile)
async def get_me(user: dict = Depends(get_current_user)):
    return UserProfile(**user)


@router.get("/profile/me", response_model=FullProfileResponse)
async def get_my_full_profile(user: dict = Depends(get_current_user)):
    full = service.get_full_profile(user["id"], user["role"])
    return full


@router.patch("/profile/me", response_model=UserProfile)
async def update_my_profile(
    data: ProfileUpdate,
    user: dict = Depends(get_current_user)
):
    updated = service.update_profile(
        user["id"],
        data.model_dump(exclude_none=True)
    )
    if not updated:
        raise HTTPException(404, "Profile not found")
    return updated


@router.patch("/profile/me/student")
async def update_student_detail(
    data: StudentProfileUpdate,
    user: dict = Depends(get_current_user)
):
    if user["role"] != "student":
        raise HTTPException(403, "Students only")
    return service.upsert_student_detail(
        user["id"],
        data.model_dump(exclude_none=True)
    )


@router.patch("/profile/me/faculty")
async def update_faculty_detail(
    data: FacultyProfileUpdate,
    user: dict = Depends(get_current_user)
):
    if user["role"] not in ("faculty", "admin"):
        raise HTTPException(403, "Faculty only")
    return service.upsert_faculty_detail(
        user["id"],
        data.model_dump(exclude_none=True)
    )


@router.post("/profile/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user)
):
    contents = await file.read()
    path = f"avatars/{user['id']}"
    admin_client.storage.from_("avatars")\
        .upload(path, contents,
                file_options={"content-type": file.content_type,
                              "upsert": "true"})
    url = admin_client.storage.from_("avatars")\
        .get_public_url(path)
    service.update_profile(user["id"], {"avatar_url": url})
    return {"avatar_url": url}


@router.get("/profile/{user_id}", response_model=FullProfileResponse)
async def get_profile_by_id(
    user_id: str,
    user: dict = Depends(require_faculty)
):
    target = service.get_profile(user_id)
    if not target:
        raise HTTPException(404, "Profile not found")
    full = service.get_full_profile(user_id, target["role"])
    return full