import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 감정 기록 타입 정의
export interface EmotionEntry {
  id: string
  date: string // YYYY-MM-DD 형식
  grateful?: string
  sad?: string
  angry?: string
  notes?: string
  mood?: number
  createdAt: string
  updatedAt: string
}

// 기분 설정
export const MOOD_CONFIG = [
  { value: 1, emoji: "😢", label: "매우 나쁨" },
  { value: 2, emoji: "😕", label: "나쁨" },
  { value: 3, emoji: "😐", label: "보통" },
  { value: 4, emoji: "😊", label: "좋음" },
  { value: 5, emoji: "😄", label: "매우 좋음" },
]

// 기분 이모지 가져오기
export const getMoodEmoji = (mood = 3): string => {
  const moodConfig = MOOD_CONFIG.find((config) => config.value === mood)
  return moodConfig?.emoji || "😐"
}

// 날짜 포맷팅 (date-fns 대신 내장 함수 사용)
export const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    weekday: "short",
  }
  return date.toLocaleDateString("ko-KR", options)
}

// 주간 통계 계산
export const getWeeklyStats = (entries: EmotionEntry[] = []): { count: number; avgMood: number } => {
  const thisWeek = entries.filter((entry) => {
    const entryDate = new Date(entry.date)
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    return entryDate >= weekAgo && entryDate <= today
  })

  const avgMood =
    thisWeek.length > 0 ? thisWeek.reduce((sum, entry) => sum + (entry.mood || 3), 0) / thisWeek.length : 3

  return {
    count: thisWeek.length,
    avgMood: Math.round(avgMood * 10) / 10,
  }
}

// 검색 필터링
export const filterEntries = (entries: EmotionEntry[] = [], searchTerm: string): EmotionEntry[] => {
  if (!searchTerm.trim()) return entries

  const term = searchTerm.toLowerCase()
  return entries.filter(
    (entry) =>
      entry.grateful?.toLowerCase().includes(term) ||
      entry.sad?.toLowerCase().includes(term) ||
      entry.angry?.toLowerCase().includes(term) ||
      entry.notes?.toLowerCase().includes(term),
  )
}

// 안전한 로컬 스토리지
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(key, value)
    } catch {
      // 저장 실패 시 무시
    }
  },
}

// 디바운스 함수
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
