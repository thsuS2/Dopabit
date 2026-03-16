from supabase import create_client, Client
from app.core.config import settings


def get_supabase_client() -> Client:
    """service_role key로 접근 (RLS 우회, 백엔드에서 JWT로 인증 처리)"""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
