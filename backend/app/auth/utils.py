from jose import jwt, JWTError

from app.config import settings


def decode_jwt(token: str) -> dict | None:
    """Decode and verify a Supabase JWT token.

    Returns the payload dict on success, or None on failure.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        return payload
    except JWTError:
        return None
