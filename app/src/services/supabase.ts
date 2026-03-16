// 앱에서는 Supabase를 직접 사용하지 않고, 백엔드 API를 통해 접근합니다.
// 이 파일은 추후 Supabase Storage(이미지 업로드) 등 직접 접근이 필요한 경우를 위해 남겨둡니다.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
