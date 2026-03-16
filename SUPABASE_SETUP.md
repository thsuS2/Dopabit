# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. https://supabase.com 접속 → 로그인
2. **New Project** 클릭
3. 프로젝트 설정:
   - **Organization**: 본인 조직 선택
   - **Name**: `dopabit`
   - **Database Password**: 안전한 비밀번호 설정
   - **Region**: `Northeast Asia (Seoul)` 선택
4. **Create new project** 클릭 → 프로비저닝 대기 (2-3분)

## 2. API 키 확인

프로젝트 생성 후 **Settings → API** 에서 확인:

| 항목 | 설명 | 사용처 |
|------|------|--------|
| **Project URL** | `https://xxxxx.supabase.co` | 앱 + 백엔드 |
| **anon (public) key** | 클라이언트용 키 | 앱 (EXPO_PUBLIC_SUPABASE_ANON_KEY) |
| **service_role key** | 서버용 키 (절대 노출 금지) | 백엔드 (SUPABASE_SERVICE_ROLE_KEY) |

## 3. 데이터베이스 테이블 생성

Supabase 대시보드 → **SQL Editor** → **New query**

### 3-1. 기본 스키마 실행
`database/migrations/001_initial_schema.sql` 파일 내용을 복사해서 실행

→ users, routines, weights, brag_logs 테이블 + RLS 정책 생성됨

### 3-2. 함수/트리거 실행
`database/migrations/002_functions.sql` 파일 내용을 복사해서 실행

→ 스트릭 계산, 레벨 계산, 루틴 완료 시 자동 점수 업데이트 트리거 생성됨

## 4. Authentication 설정

Supabase 대시보드 → **Authentication → Providers**

### 이메일 로그인
- **Email** 프로바이더: 기본 활성화 상태 확인
- **Confirm email**: 개발 중에는 OFF 추천 (가입 즉시 사용 가능)

### Google 로그인 (추후)
1. Google Cloud Console → OAuth 2.0 클라이언트 생성
2. Supabase → Auth → Providers → Google 활성화
3. Client ID / Secret 입력

### Apple 로그인 (추후)
1. Apple Developer → Sign in with Apple 설정
2. Supabase → Auth → Providers → Apple 활성화

## 5. 환경변수 설정

### 앱 (app/.env)
```bash
cp app/.env.example app/.env
```
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
EXPO_PUBLIC_API_URL=http://localhost:8000
```

### 백엔드 (backend/.env)
```bash
cp backend/.env.example backend/.env
```
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGci...          # anon key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # service_role key
GEMINI_API_KEY=your_gemini_api_key
```

## 6. RLS (Row Level Security) 확인

모든 테이블에 RLS가 적용되어 있음:
- 사용자는 **본인 데이터만** 조회/수정 가능
- `auth.uid() = user_id` 조건으로 자동 필터링
- Supabase 대시보드 → **Table Editor** → 각 테이블 → **RLS Policies** 탭에서 확인 가능

## 7. 테이블 구조 요약

```
users
├── id (UUID, PK → auth.users)
├── email
├── nickname
├── level (default: 1)
├── streak (default: 0)
├── total_score (default: 0)
├── created_at
└── updated_at

routines
├── id (UUID, PK)
├── user_id (FK → users)
├── date
├── type (weight_check, water_2l, walk_10000, stretching, no_late_snack)
├── completed (default: false)
├── score
└── created_at

weights
├── id (UUID, PK)
├── user_id (FK → users)
├── date
├── weight (DECIMAL)
└── created_at

brag_logs
├── id (UUID, PK)
├── user_id (FK → users)
├── message
├── ai_response
└── created_at
```

## 8. 로컬 개발 시작

```bash
# 백엔드
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# 앱
cd app
npm install
npx expo start
```
