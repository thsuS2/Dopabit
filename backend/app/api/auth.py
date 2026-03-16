from fastapi import APIRouter, HTTPException
from app.core.supabase import get_supabase_client
from app.core.auth import hash_password, verify_password, create_access_token
from app.models.schemas import SignUpRequest, SignInRequest, AuthResponse

router = APIRouter()


@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignUpRequest):
    supabase = get_supabase_client()

    # 이메일 중복 확인
    existing = supabase.table("users") \
        .select("id") \
        .eq("email", request.email) \
        .execute()

    if existing.data:
        raise HTTPException(status_code=400, detail="이미 가입된 이메일입니다")

    # 사용자 생성
    password_hashed = hash_password(request.password)
    result = supabase.table("users").insert({
        "email": request.email,
        "password_hash": password_hashed,
        "nickname": request.nickname,
        "level": 1,
        "streak": 0,
        "total_score": 0,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="회원가입 실패")

    user = result.data[0]
    access_token = create_access_token(user["id"])

    return AuthResponse(
        access_token=access_token,
        user_id=user["id"],
        email=user["email"],
        nickname=user["nickname"],
    )


@router.post("/signin", response_model=AuthResponse)
async def signin(request: SignInRequest):
    supabase = get_supabase_client()

    # 사용자 조회
    result = supabase.table("users") \
        .select("*") \
        .eq("email", request.email) \
        .execute()

    if not result.data:
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 틀렸습니다")

    user = result.data[0]

    # 비밀번호 검증
    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 틀렸습니다")

    access_token = create_access_token(user["id"])

    return AuthResponse(
        access_token=access_token,
        user_id=user["id"],
        email=user["email"],
        nickname=user["nickname"],
    )
