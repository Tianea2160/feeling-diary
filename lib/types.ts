// API 응답 타입 정의
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message: string
  total?: number
}

// 감정 기록 관련 타입
export interface EmotionRecord {
  id: number
  date: string
  grateful?: string
  sad?: string
  angry?: string
  notes?: string
  mood?: number
  createdAt: string
  updatedAt: string
}

export interface EmotionRecordRequest {
  date: string
  grateful?: string
  sad?: string
  angry?: string
  notes?: string
  mood?: number
}

// 사용자 관련 타입
export interface User {
  id: number
  email: string
  name: string
  role: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

// 캘린더 관련 타입
export interface CalendarRecord {
  hasRecord: boolean
  mood?: number
  preview?: string
}

export interface CalendarData {
  year: number
  month: number
  records: Record<string, CalendarRecord>
}

// 통계 관련 타입
export interface Period {
  start: string
  end: string
}

export interface PeriodStatsData {
  count: number
  avgMood?: number
  moodDistribution: Record<string, number>
  period: Period
}

export interface OverviewStatsData {
  totalRecords: number
  averageMood?: number
  streakDays: number
  mostFrequentMood?: number
  firstRecordDate?: string
  lastRecordDate?: string
}

// 기존 타입과의 호환성을 위한 별칭
export type EmotionEntry = EmotionRecord
