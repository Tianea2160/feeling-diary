import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { MOOD_CONFIG, MOODS } from "./constants"

export interface JournalEntry {
  id: string
  date: string
  dailyLog: string
  gratefulFor: string
  memorable: string
  createdAt: string
  mood?: number
}

// 기분 관련 유틸리티
export const getMoodEmoji = (mood: number = MOODS.NEUTRAL): string => {
  const moodConfig = MOOD_CONFIG.find((config) => config.value === mood)
  return moodConfig?.emoji || MOOD_CONFIG[2].emoji
}

export const getMoodColor = (mood?: number): string => {
  if (!mood) return "bg-gray-100"
  const moodConfig = MOOD_CONFIG.find((config) => config.value === mood)
  return moodConfig?.color || "bg-gray-100"
}

export const getMoodLabel = (mood: number = MOODS.NEUTRAL): string => {
  const moodConfig = MOOD_CONFIG.find((config) => config.value === mood)
  return moodConfig?.label || MOOD_CONFIG[2].label
}

// 날짜 포맷팅 유틸리티
export const formatDisplayDate = (dateString: string): string => {
  return format(new Date(dateString), "M월 d일 (E)", { locale: ko })
}

export const formatFullDate = (dateString: string): string => {
  return format(new Date(dateString), "yyyy년 M월 d일 (E)", { locale: ko })
}

export const formatMonthYear = (date: Date): string => {
  return format(date, "yyyy년 M월", { locale: ko })
}

// 일기 내용 유틸리티
export const getEntryPreview = (entry: JournalEntry): string => {
  return entry.dailyLog || entry.gratefulFor || entry.memorable || ""
}

export const isEntryEmpty = (entry: Partial<JournalEntry>): boolean => {
  return !entry.dailyLog?.trim() && !entry.gratefulFor?.trim() && !entry.memorable?.trim()
}

export const generateEntryId = (date: string): string => {
  return `${date}-${Date.now()}`
}

// 통계 계산 유틸리티
export const calculateAverageMood = (entries: JournalEntry[]): number => {
  if (entries.length === 0) return MOODS.NEUTRAL
  const sum = entries.reduce((acc, entry) => acc + (entry.mood || MOODS.NEUTRAL), 0)
  return sum / entries.length
}

export const getWeeklyStats = (entries: JournalEntry[] = []): { count: number; avgMood: number } => {
  const thisWeek = entries.filter((entry) => {
    const entryDate = new Date(entry.date)
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    return entryDate >= weekAgo && entryDate <= today
  })

  return {
    count: thisWeek.length,
    avgMood: thisWeek.length > 0 ? Math.round(calculateAverageMood(thisWeek) * 10) / 10 : MOODS.NEUTRAL,
  }
}

export const getMonthlyStats = (
  entries: JournalEntry[] = [],
  currentDate: Date,
): { count: number; avgMood: number } => {
  const monthEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date)
    return entryDate.getMonth() === currentDate.getMonth() && entryDate.getFullYear() === currentDate.getFullYear()
  })

  return {
    count: monthEntries.length,
    avgMood: calculateAverageMood(monthEntries),
  }
}

// 검색 유틸리티
export const filterEntriesBySearch = (entries: JournalEntry[] = [], searchTerm: string): JournalEntry[] => {
  if (!searchTerm.trim()) return entries

  const term = searchTerm.toLowerCase()
  return entries.filter(
    (entry) =>
      entry.dailyLog.toLowerCase().includes(term) ||
      entry.gratefulFor.toLowerCase().includes(term) ||
      entry.memorable.toLowerCase().includes(term),
  )
}

// 정렬 유틸리티
export const sortEntriesByDate = (entries: JournalEntry[] = [], ascending = false): JournalEntry[] => {
  return [...entries].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return ascending ? dateA - dateB : dateB - dateA
  })
}
