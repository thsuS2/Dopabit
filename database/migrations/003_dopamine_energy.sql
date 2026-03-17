-- 도파민 에너지 시스템
-- users 테이블에 dopamine_energy 컬럼 추가

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS dopamine_energy INTEGER NOT NULL DEFAULT 0;
