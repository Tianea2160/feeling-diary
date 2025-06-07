// 환경 설정 관리
export const CONFIG = {
  // 개발 환경 여부 확인
  isDevelopment: process.env.NODE_ENV === "development",

  // API 모드 설정 (환경 변수로 제어)
  apiMode: (process.env.NEXT_PUBLIC_API_MODE as "mock" | "real") || "mock",

  // API 기본 URL
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "https://diary.hyunjun.org/api",

  // 앱 정보
  app: {
    name: "감정 일기",
    version: "1.0.0",
  },

  // 개발용 테스트 계정
  dev: {
    testEmail: "test@example.com",
    testPassword: "password123",
  },
} as const

// 개발 모드 여부 확인 함수
export const isDev = () => CONFIG.isDevelopment

// API 모드 확인 함수
export const isApiMockMode = () => CONFIG.apiMode === "mock"

// 개발용 정보 표시 여부
export const shouldShowDevInfo = () => CONFIG.isDevelopment || CONFIG.apiMode === "mock"
