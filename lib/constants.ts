// 기분 관련 상수
export const MOODS = {
  VERY_BAD: 1,
  BAD: 2,
  NEUTRAL: 3,
  GOOD: 4,
  VERY_GOOD: 5,
} as const

export const MOOD_CONFIG = [
  {
    value: MOODS.VERY_BAD,
    emoji: "😢",
    label: "매우 나쁨",
    color: "bg-red-200",
    textColor: "text-red-600",
    borderColor: "border-red-200",
  },
  {
    value: MOODS.BAD,
    emoji: "😕",
    label: "나쁨",
    color: "bg-orange-200",
    textColor: "text-orange-600",
    borderColor: "border-orange-200",
  },
  {
    value: MOODS.NEUTRAL,
    emoji: "😐",
    label: "보통",
    color: "bg-yellow-200",
    textColor: "text-yellow-600",
    borderColor: "border-yellow-200",
  },
  {
    value: MOODS.GOOD,
    emoji: "😊",
    label: "좋음",
    color: "bg-green-200",
    textColor: "text-green-600",
    borderColor: "border-green-200",
  },
  {
    value: MOODS.VERY_GOOD,
    emoji: "😄",
    label: "매우 좋음",
    color: "bg-blue-200",
    textColor: "text-blue-600",
    borderColor: "border-blue-200",
  },
]

// 요일 상수
export const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"] as const

// 스토리지 키
export const STORAGE_KEYS = {
  JOURNAL_ENTRIES: "journalEntries",
  NOTIFICATION_ENABLED: "notificationEnabled",
  GOOGLE_CALENDAR_TOKEN: "googleCalendarToken",
} as const

// 애니메이션 지속시간
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
} as const

// 색상 테마
export const COLORS = {
  PRIMARY: "from-blue-600 to-purple-600",
  PRIMARY_HOVER: "from-blue-700 to-purple-700",
  BACKGROUND: "from-blue-50 via-white to-purple-50",
  SUCCESS: "text-green-600",
  ERROR: "text-red-600",
  WARNING: "text-amber-600",
} as const

// 레이아웃 상수
export const LAYOUT = {
  MAX_WIDTH: "max-w-md",
  PADDING: "px-4",
  SPACING: "space-y-6",
  BOTTOM_PADDING: "pb-24",
} as const

// 폼 검증 메시지
export const VALIDATION_MESSAGES = {
  EMPTY_ENTRY: "최소한 하나의 항목은 작성해야 합니다",
  SAVE_SUCCESS: "✨ 저장 완료!",
  SAVE_SUCCESS_DESC: "소중한 기록이 저장되었습니다",
  DELETE_SUCCESS: "삭제 완료",
  DELETE_SUCCESS_DESC: "기록이 삭제되었습니다",
} as const
