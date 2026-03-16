from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, routines, records, ai_coach, users
from app.core.config import settings

app = FastAPI(
    title="Dopabit API",
    description="도파빗 - 미래의 나를 키우는 도파민 루틴",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(routines.router, prefix="/api/routines", tags=["routines"])
app.include_router(records.router, prefix="/api/records", tags=["records"])
app.include_router(ai_coach.router, prefix="/api/ai", tags=["ai"])
app.include_router(users.router, prefix="/api/users", tags=["users"])


@app.get("/")
async def root():
    return {"message": "Dopabit API", "version": "0.1.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}
