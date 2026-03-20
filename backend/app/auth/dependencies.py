import base64
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import httpx

from app.config import settings
from app.utils.supabase import admin_client

bearer = HTTPBearer()

# Fetch Supabase JWKS once on startup
JWKS_URL = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
_jwks = None

async def get_jwks():
    global _jwks
    if _jwks is None:
        async with httpx.AsyncClient() as client:
            res = await client.get(JWKS_URL)
            _jwks = res.json()
    return _jwks

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
) -> dict:
    token = credentials.credentials
    try:
        # Get public keys from Supabase
        jwks = await get_jwks()
        
        # Decode using ES256 with JWKS
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["ES256"],
            options={"verify_aud": False},
        )
    except JWTError as e:
        print(f"JWT decode failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject",
        )

    res = (
        admin_client.table("profiles")
        .select("*")
        .eq("id", user_id)
        .single()
        .execute()
    )

    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    return res.data


async def require_faculty(user: dict = Depends(get_current_user)) -> dict:
    if user["role"] not in ("faculty", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Faculty or admin access required",
        )
    return user


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user
