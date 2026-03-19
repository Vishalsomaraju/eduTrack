from fastapi import APIRouter, Depends

from app.auth.schemas import UserProfile, VerifyResponse
from app.auth.dependencies import get_current_user
from app.auth import service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/verify", response_model=VerifyResponse)
async def verify_token(user: dict = Depends(get_current_user)):
    """Verify a Supabase JWT and return the user profile + role."""
    return VerifyResponse(valid=True, user=UserProfile(**user))


@router.get("/me", response_model=UserProfile)
async def get_me(user: dict = Depends(get_current_user)):
    """Return the current user's profile."""
    return UserProfile(**user)
