from supabase import create_client, Client
from app.config import settings

# Admin client — uses service role key, bypasses RLS
admin_client: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_KEY,
)

# Anon client — for user-scoped / RLS-respecting queries
anon_client: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_ANON_KEY,
)
