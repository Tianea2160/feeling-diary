// 목업 API 데이터 및 함수
import type { AuthResponse } from "@/lib/auth"

// 목업 사용자 데이터
const MOCK_USERS = [
  {
    id: 1,
    email: "test@example.com",
    name: "테스트 사용자",
    role: "USER",
    password: "password123", // 실제로는 해시된 비밀번호
  },
  {
    id: 2,
    email: "cho2160@naver.com",
    name: "tianea",
    role: "USER",
    password: "password123",
  },
]

// JWT 토큰 생성 (목업용)
const generateMockToken = (email: string): string => {
  const header = btoa(JSON.stringify({ alg: "HS512" }))
  const payload = btoa(
    JSON.stringify({
      sub: email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400, // 24시간
    }),
  )
  const signature = btoa("mock-signature")
  return `${header}.${payload}.${signature}`
}

// 목업 로그인 API
export const mockLogin = async (email: string, password: string): Promise<AuthResponse> => {
  // 실제 API 호출을 시뮬레이션하기 위한 지연
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const user = MOCK_USERS.find((u) => u.email === email && u.password === password)

  if (!user) {
    throw new Error("이메일 또는 비밀번호가 올바르지 않습니다")
  }

  const accessToken = generateMockToken(email)
  const refreshToken = generateMockToken(email + "-refresh")

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  }
}

// 목업 회원가입 API
export const mockRegister = async (email: string, name: string, password: string): Promise<void> => {
  // 실제 API 호출을 시뮬레이션하기 위한 지연
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const existingUser = MOCK_USERS.find((u) => u.email === email)

  if (existingUser) {
    throw new Error("이미 존재하는 이메일입니다")
  }

  // 목업 데이터에 새 사용자 추가 (실제로는 서버에 저장)
  MOCK_USERS.push({
    id: MOCK_USERS.length + 1,
    email,
    name,
    role: "USER",
    password,
  })
}

// 목업 토큰 갱신 API
export const mockRefreshToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  // 간단한 토큰 검증 (실제로는 서버에서 검증)
  if (!refreshToken.includes("refresh")) {
    throw new Error("유효하지 않은 리프레시 토큰입니다")
  }

  // 새로운 액세스 토큰 생성
  const newAccessToken = generateMockToken("refreshed-user")

  return {
    accessToken: newAccessToken,
  }
}
