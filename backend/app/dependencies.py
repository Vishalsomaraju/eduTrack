from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.auth.utils import decode_jwt
from app.config import supabase

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Decode JWT token and fetch user profile with role from the database."""
    token = credentials.credentials
    payload = decode_jwt(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Fetch role from profiles table (source of truth for roles)
    user_id = payload.get("sub")
    response = (
        supabase.table("profiles")
        .select("role, name, email")
        .eq("id", user_id)
        .single()
        .execute()
    )

    if not response.data:
        raise HTTPException(status_code=401, detail="User profile not found")

    payload["role"] = response.data["role"]
    payload["name"] = response.data["name"]
    payload["email"] = response.data["email"]
    return payload


async def require_faculty(user=Depends(get_current_user)):
    """Dependency that requires faculty or admin role."""
    if user["role"] not in ["faculty", "admin"]:
        raise HTTPException(status_code=403, detail="Faculty access required")
    return user


async def require_admin(user=Depends(get_current_user)):
    """Dependency that requires admin role."""
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
