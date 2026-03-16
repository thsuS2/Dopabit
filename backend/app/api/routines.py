from fastapi import APIRouter, Depends
from app.core.supabase import get_supabase_client
from app.core.auth import get_current_user_id
from app.models.schemas import RoutineCreate, RoutineToggle

router = APIRouter()

ROUTINE_DEFAULTS = [
    {"type": "weight_check", "score": 10},
    {"type": "water_2l", "score": 10},
    {"type": "walk_10000", "score": 30},
    {"type": "stretching", "score": 20},
    {"type": "no_late_snack", "score": 30},
]


@router.get("/today/{date}")
async def get_or_create_today(date: str, user_id: str = Depends(get_current_user_id)):
    """오늘 루틴 조회. 없으면 기본 5개 자동 생성."""
    supabase = get_supabase_client()

    result = supabase.table("routines") \
        .select("*") \
        .eq("user_id", user_id) \
        .eq("date", date) \
        .execute()

    if not result.data:
        rows = [
            {
                "user_id": user_id,
                "date": date,
                "type": r["type"],
                "completed": False,
                "score": r["score"],
            }
            for r in ROUTINE_DEFAULTS
        ]
        result = supabase.table("routines").insert(rows).execute()

    return result.data


@router.get("/{date}")
async def get_routines(date: str, user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase_client()

    result = supabase.table("routines") \
        .select("*") \
        .eq("user_id", user_id) \
        .eq("date", date) \
        .execute()

    return result.data


@router.post("/")
async def create_routine(request: RoutineCreate, user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase_client()

    score_map = {
        "weight_check": 10,
        "water_2l": 10,
        "walk_10000": 30,
        "stretching": 20,
        "no_late_snack": 30,
    }

    result = supabase.table("routines").insert({
        "user_id": user_id,
        "date": request.date,
        "type": request.type,
        "completed": False,
        "score": score_map.get(request.type, 10),
    }).execute()

    return result.data


@router.put("/toggle")
async def toggle_routine(request: RoutineToggle, user_id: str = Depends(get_current_user_id)):
    supabase = get_supabase_client()

    result = supabase.table("routines") \
        .update({"completed": request.completed}) \
        .eq("id", request.routine_id) \
        .execute()

    return result.data
