export interface User {
  id: string;
  email: string;
  nickname: string;
  level: number;
  streak: number;
  total_score: number;
  created_at: string;
  updated_at: string;
}

export interface Routine {
  id: string;
  user_id: string;
  date: string;
  type: string;
  completed: boolean;
  score: number;
  created_at: string;
}

export interface Weight {
  id: string;
  user_id: string;
  date: string;
  weight: number;
  created_at: string;
}

export interface BragLog {
  id: string;
  user_id: string;
  message: string;
  ai_response: string;
  created_at: string;
}

export type RoutineType =
  | 'weight_check'
  | 'water_2l'
  | 'walk_10000'
  | 'stretching'
  | 'no_late_snack';

export interface RoutineConfig {
  type: RoutineType;
  label: string;
  score: number;
  emoji: string;
}

export const ROUTINE_CONFIGS: RoutineConfig[] = [
  { type: 'weight_check', label: '체중 측정', score: 10, emoji: '⚖️' },
  { type: 'water_2l', label: '물 2L', score: 10, emoji: '💧' },
  { type: 'walk_10000', label: '10000보 걷기', score: 30, emoji: '🚶' },
  { type: 'stretching', label: '스트레칭', score: 20, emoji: '🧘' },
  { type: 'no_late_snack', label: '야식 금지', score: 30, emoji: '🚫' },
];

export const LEVEL_CONFIGS = [
  { level: 1, name: '시작', minScore: 0 },
  { level: 3, name: '루틴러', minScore: 300 },
  { level: 5, name: '자기관리러', minScore: 1000 },
  { level: 10, name: '갓생러', minScore: 3000 },
  { level: 20, name: '인생관리자', minScore: 10000 },
];
