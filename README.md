# Dopabit (도파빗)

도파민 + 습관 = 도파빗! 게이미피케이션 기반 건강 습관 트래킹 앱

## 기술 스택

- **앱**: React Native (Expo SDK 54)
- **백엔드**: FastAPI + 자체 JWT 인증
- **DB**: Supabase (PostgreSQL)
- **AI**: Google Gemini 2.0 Flash

## 환경설정

### 1. 백엔드

```bash
cd backend

# 가상환경 생성 & 활성화
python3 -m venv venv
source venv/bin/activate

# 패키지 설치
pip install -r requirements.txt

# .env 파일 생성
cp .env.example .env
# .env 에 Supabase, Gemini 키 입력

# 실행
uvicorn main:app --host 0.0.0.0 --port 8010 --reload
```

### 2. 앱 (Expo)

```bash
cd app

# 패키지 설치
npm install

# .env 파일 생성
cp .env.example .env
# EXPO_PUBLIC_API_URL 에 ngrok URL 입력

# 실행 (실기기 테스트시 --tunnel)
npx expo start --tunnel
```

### 3. ngrok (실기기 테스트용)

```bash
# 백엔드 터널링
ngrok http 8010

# 나온 URL을 app/.env 의 EXPO_PUBLIC_API_URL 에 설정
```

## .env 설정

**backend/.env**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

**app/.env**
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_API_URL=https://your-ngrok-url.ngrok-free.app
```

## 프로젝트 구조

```
Dopabit/
├── app/                  # Expo React Native 앱
│   ├── src/
│   │   ├── components/   # 공통 컴포넌트 (ScreenLayout, DopabitCharacter)
│   │   ├── screens/      # 홈, 기록, AI코치, 마이페이지
│   │   ├── navigation/   # 탭 네비게이션
│   │   ├── services/     # API 서비스
│   │   ├── stores/       # 상태관리 (authStore)
│   │   ├── styles/       # 색상, 타이포그래피
│   │   └── types/        # 타입 정의
│   └── App.tsx
├── backend/              # FastAPI 백엔드
│   ├── app/
│   │   ├── api/          # 라우터 (auth, routines, records, ai_coach, users)
│   │   ├── core/         # 설정, 인증, Supabase 클라이언트
│   │   ├── models/       # Pydantic 스키마
│   │   └── services/     # AI 서비스 (Gemini)
│   └── main.py
└── database/             # SQL 마이그레이션
    ├── migrations/
    └── seed.sql
```
