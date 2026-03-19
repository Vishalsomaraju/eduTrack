from app.utils.supabase import admin_client


def get_profile(user_id: str) -> dict | None:
    """Fetch a user profile row from the profiles table by user UUID."""
    res = (
        admin_client.table("profiles")
        .select("*")
        .eq("id", user_id)
        .single()
        .execute()
    )
    return res.data
