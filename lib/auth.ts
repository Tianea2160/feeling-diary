// 토큰 관리 유틸리티 (개선된 버전)
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
    console.log("액세스 토큰 저장됨")
  }
}

// 리프레시 토큰 저장
export const setRefreshToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("refreshToken", token)
    console.log("리프레시 토큰 저장됨")
  }
}

// 액세스 토큰 가져오기
export const getAccessToken = (): string | null => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken")
    return token
  }
  return null
}

// 리프레시 토큰 가져오기
export const getRefreshToken = (): string | null => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("refreshToken")
    return token
  }
  return null
}

// 토큰 삭제 (로그아웃)
export const removeTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    console.log("토큰 삭제됨 (로그아웃)")
  }
}

// 로그인 여부 확인
export const isLoggedIn = (): boolean => {
  const token = getAccessToken()
  return !!token
}

// 인증 헤더 생성
export const getAuthHeaders = (): HeadersInit => {
  const token = getAccessToken()
  if (!token) {
    console.log("인증 토큰 없음")
    return {}
  }
  console.log("인증 헤더 생성")
  return { Authorization: `Bearer ${token}` }
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
    console.log("사용자 정보 저장됨:", user.name)
  }
}

// 사용자 정보 삭제
export const removeUser = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user")
    console.log("사용자 정보 삭제됨")
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
  console.log("인증 정보 저장 완료")
}

// 토큰 갱신 함수 (개선된 버전)
export const refreshAccessToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    console.log("리프레시 토큰 없음, 갱신 불가")
    return false
  }

  try {
    console.log("토큰 갱신 시도")
    const data = await refreshTokenApi(refreshToken)
    setAccessToken(data.accessToken)

    // 새로운 리프레시 토큰이 있다면 저장
    if (data.refreshToken) {
      setRefreshToken(data.refreshToken)
    }

    console.log("토큰 갱신 성공")
    return true
  } catch (error) {
    console.error("토큰 갱신 오류:", error)
    return false
  }
}
