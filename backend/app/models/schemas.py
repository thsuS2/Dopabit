from pydantic import BaseModel
from datetime import datetime


# Auth
class SignUpRequest(BaseModel):
    email: str
    password: str
    nickname: str


class SignInRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    user_id: str
    email: str
    nickname: str


# User
class UserProfile(BaseModel):
    id: str
    email: str
    nickname: str
    level: int = 1
    streak: int = 0
    total_score: int = 0
    created_at: datetime | None = None


class UserUpdate(BaseModel):
    nickname: str | None = None


# Routine
class RoutineCreate(BaseModel):
    type: str
    date: str  # YYYY-MM-DD


class RoutineToggle(BaseModel):
    routine_id: str
    completed: bool


class RoutineResponse(BaseModel):
    id: str
    user_id: str
    date: str
    type: str
    completed: bool
    score: int
    created_at: datetime | None = None


# Weight
class WeightCreate(BaseModel):
    date: str  # YYYY-MM-DD
    weight: float


class WeightResponse(BaseModel):
    id: str
    user_id: str
    date: str
    weight: float
    created_at: datetime | None = None


# BragLog (AI Coach)
class BragCreate(BaseModel):
    message: str


class BragResponse(BaseModel):
    id: str
    user_id: str
    message: str
    ai_response: str
    created_at: datetime | None = None
