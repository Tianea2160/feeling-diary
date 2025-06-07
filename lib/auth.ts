// 토큰 관리 유틸리티
import { refreshTokenApi } from "@/lib/api"

// 사용자 정보 타입 정의
export interface User {
  id: number
  email: string
  name: string
  role: string
}

// 인증 응답 타입 정의
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

// 액세스 토큰 저장
export const setAccessToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", token)
  }
}

// 리프레시 토큰 저장
export const setRefreshToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("refreshToken", token)
  }
}

// 액세스 토큰 가져오기
export const getAccessToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken")
  }
  return null
}

// 리프레시 토큰 가져오기
export const getRefreshToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refreshToken")
  }
  return null
}

// 토큰 삭제 (로그아웃)
export const removeTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
  }
}

// 로그인 여부 확인
export const isLoggedIn = (): boolean => {
  return !!getAccessToken()
}

// 인증 헤더 생성
export const getAuthHeaders = (): HeadersInit => {
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// 사용자 정보 가져오기
export const getUser = (): User | null => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch (e) {
        console.error("사용자 정보 파싱 오류:", e)
        return null
      }
    }
  }
  return null
}

// 사용자 정보 저장
export const setUser = (user: User) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user))
  }
}

// 사용자 정보 삭제
export const removeUser = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user")
  }
}

// 로그아웃 함수
export const logout = () => {
  removeTokens()
  removeUser()
}

// 인증 정보 저장 (로그인 성공 시 호출)
export const saveAuthData = (authResponse: AuthResponse) => {
  setAccessToken(authResponse.accessToken)
  setRefreshToken(authResponse.refreshToken)
  setUser(authResponse.user)
}

// 토큰 갱신 함수
export const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    return false
  }

  try {
    const data = await refreshTokenApi(refreshToken)
    setAccessToken(data.accessToken)

    // 새로운 리프레시 토큰이 있다면 저장
    if (data.refreshToken) {
      setRefreshToken(data.refreshToken)
    }

    return true
  } catch (error) {
    console.error("토큰 갱신 오류:", error)
    return false
  }
}
