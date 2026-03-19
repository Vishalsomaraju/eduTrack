from pydantic_settings import BaseSettings
from supabase import create_client, Client


class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_JWT_SECRET: str
    FRONTEND_URL: str = "http://localhost:5173"
    ENVIRONMENT: str = "development"

    model_config = {"env_file": ".env"}


settings = Settings()

# Admin client (service key) — used by the old dependencies.py shim.
# New code should import from app.utils.supabase instead.
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
