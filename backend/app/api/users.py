from fastapi import APIRouter, Depends
from app.core.supabase import get_supabase_client
from app.core.auth import get_current_user_id
from app.models.schemas import UserUpdate

router = APIRouter()


@router.get("/me")
async def get_profile(user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase_client()

    result = supabase.table("users") \
        .select("id, email, nickname, level, streak, total_score, created_at, updated_at") \
        .eq("id", user_id) \
        .single() \
        .execute()

    return result.data


@router.put("/me")
async def update_profile(request: UserUpdate, user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase_client()

    update_data = {}
    if request.nickname is not None:
        update_data["nickname"] = request.nickname

    result = supabase.table("users") \
        .update(update_data) \
        .eq("id", user_id) \
        .execute()

    return result.data
