// 환경 설정 관리 (API 스펙에 맞춰 업데이트)
export const CONFIG = {
  // 개발 환경 여부 확인
  isDevelopment: process.env.NODE_ENV === "development",

  // API 기본 URL (사용자 제공 URL로 업데이트)
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "https://diary.hyunjun.org",

  // 앱 정보
  app: {
    name: "감정 일기",
    version: "1.0.0",
  },
} as const

// 개발 모드 여부 확인 함수
export const isDev = () => CONFIG.isDevelopment
