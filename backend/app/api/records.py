from fastapi import APIRouter, Depends
from app.core.supabase import get_supabase_client
from app.core.auth import get_current_user_id
from app.models.schemas import WeightCreate

router = APIRouter()


@router.get("/weights")
async def get_weights(user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase_client()

    result = supabase.table("weights") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("date", desc=True) \
        .limit(30) \
        .execute()

    return result.data


@router.post("/weights")
async def create_weight(request: WeightCreate, user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase_client()

    result = supabase.table("weights").insert({
        "user_id": user_id,
        "date": request.date,
        "weight": request.weight,
    }).execute()

    return result.data


@router.get("/streak")
async def get_streak(user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase_client()

    profile = supabase.table("users") \
        .select("streak, total_score, level, dopamine_energy") \
        .eq("id", user_id) \
        .single() \
        .execute()

    return profile.data
