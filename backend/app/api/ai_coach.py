from fastapi import APIRouter, Depends
from app.core.supabase import get_supabase_client
from app.core.auth import get_current_user_id
from app.models.schemas import BragCreate
from app.services.ai_service import generate_praise, generate_craving_response

router = APIRouter()


@router.post("/brag")
async def brag(request: BragCreate, user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase_client()

    ai_response = await generate_praise(request.message)

    result = supabase.table("brag_logs").insert({
        "user_id": user_id,
        "message": request.message,
        "ai_response": ai_response,
    }).execute()

    return {
        "message": request.message,
        "ai_response": ai_response,
        "log": result.data,
    }


@router.post("/craving")
async def handle_craving(request: BragCreate, user_id: str = Depends(get_current_user_id)):
    ai_response = await generate_craving_response(request.message)

    return {
        "craving": request.message,
        "ai_response": ai_response,
    }


@router.get("/history")
async def get_brag_history(user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase_client()

    result = supabase.table("brag_logs") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("created_at", desc=True) \
        .limit(50) \
        .execute()

    return result.data
