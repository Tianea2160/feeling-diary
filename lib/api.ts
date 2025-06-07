// API 호출 유틸리티 (디버깅 및 오류 처리 개선)
import { getAuthHeaders, refreshAccessToken, logout } from "@/lib/auth"
import { CONFIG } from "@/lib/config"

/**
 * 타임아웃이 있는 fetch 함수
 */
export const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 10000) => {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    console.log(`API 요청: ${options.method || "GET"} ${url}`, options.body ? JSON.parse(options.body as string) : "")

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      // CORS 문제 해결을 위한 설정 추가
      credentials: "include",
      mode: "cors",
    })

    clearTimeout(id)
    console.log(`API 응답 상태: ${response.status} ${response.statusText}`)
    return response
  } catch (error) {
    clearTimeout(id)
    console.error(`API 요청 실패: ${url}`, error)
    throw error
  }
}

/**
 * API 응답 처리 함수
 */
export const handleApiResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type")

  try {
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()
      console.log("API 응답 데이터:", data)

      if (!response.ok) {
        throw new Error(data.message || `API 오류: ${response.status}`)
      }

      return data
    } else {
      if (!response.ok) {
        const text = await response.text()
        console.error("API 오류 응답:", text)
        throw new Error(`API 오류: ${response.status}`)
      }

      const text = await response.text()
      console.log("API 텍스트 응답:", text)
      return text
    }
  } catch (error) {
    console.error("응답 처리 오류:", error)
    throw error
  }
}

/**
 * API 오류 처리 함수
 */
export const handleApiError = (error: unknown): string => {
  console.error("API 오류:", error)

  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "서버에 연결할 수 없습니다. 네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요."
  } else if (error instanceof DOMException && error.name === "AbortError") {
    return "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요."
  } else {
    return error instanceof Error ? error.message : "요청 처리 중 오류가 발생했습니다."
  }
}

/**
 * API 엔드포인트
 */
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${CONFIG.apiBaseUrl}/api/auth/login`,
  REGISTER: `${CONFIG.apiBaseUrl}/api/auth/register`,
  REFRESH: `${CONFIG.apiBaseUrl}/api/auth/refresh`,

  // User
  USER_ME: `${CONFIG.apiBaseUrl}/api/users/me`,
  USER_BY_ID: (id: number) => `${CONFIG.apiBaseUrl}/api/users/${id}`,

  // Records
  RECORDS: `${CONFIG.apiBaseUrl}/api/records`,
  RECORD_BY_ID: (id: number) => `${CONFIG.apiBaseUrl}/api/records/${id}`,
  RECORD_BY_DATE: (date: string) => `${CONFIG.apiBaseUrl}/api/records/${date}`,
  RECORD_DETAIL: (id: number) => `${CONFIG.apiBaseUrl}/api/records/detail/${id}`,
  RECORDS_SEARCH: `${CONFIG.apiBaseUrl}/api/records/search`,

  // Calendar
  CALENDAR: (year: number, month: number) => `${CONFIG.apiBaseUrl}/api/calendar/${year}/${month}`,

  // Stats
  STATS_OVERVIEW: `${CONFIG.apiBaseUrl}/api/stats/overview`,
  STATS_WEEKLY: `${CONFIG.apiBaseUrl}/api/stats/weekly`,
  STATS_MONTHLY: `${CONFIG.apiBaseUrl}/api/stats/monthly`,

  // Health
  HEALTH: `${CONFIG.apiBaseUrl}/hello`,
}

/**
 * 로그인 API 호출 (개선된 버전)
 */
export const loginApi = async (email: string, password: string) => {
  try {
    const response = await fetchWithTimeout(API_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    return await handleApiResponse(response)
  } catch (error) {
    console.error("로그인 API 오류:", error)
    throw error
  }
}

/**
 * 회원가입 API 호출 (개선된 버전)
 */
export const registerApi = async (email: string, name: string, password: string) => {
  try {
    const response = await fetchWithTimeout(API_ENDPOINTS.REGISTER, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name, password }),
    })

    return await handleApiResponse(response)
  } catch (error) {
    console.error("회원가입 API 오류:", error)
    throw error
  }
}

/**
 * 토큰 갱신 API 호출
 */
export const refreshTokenApi = async (refreshToken: string) => {
  try {
    const response = await fetchWithTimeout(API_ENDPOINTS.REFRESH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    })

    return await handleApiResponse(response)
  } catch (error) {
    console.error("토큰 갱신 API 오류:", error)
    throw error
  }
}

/**
 * 인증이 필요한 API 호출 함수 (개선된 버전)
 */
export const fetchApi = async (
  url: string,
  options: RequestInit = {},
  withAuth = true,
  timeout = 10000,
): Promise<any> => {
  const headers = {
    "Content-Type": "application/json",
    ...(withAuth ? getAuthHeaders() : {}),
    ...options.headers,
  }

  try {
    const response = await fetchWithTimeout(
      url,
      {
        ...options,
        headers,
      },
      timeout,
    )

    // 401 Unauthorized 처리 (토큰 만료)
    if (response.status === 401 && withAuth) {
      console.log("인증 만료, 토큰 갱신 시도")
      const refreshed = await refreshAccessToken()

      if (refreshed) {
        console.log("토큰 갱신 성공, 요청 재시도")
        return fetchApi(url, options, withAuth, timeout)
      } else {
        console.log("토큰 갱신 실패, 로그아웃 처리")
        logout()
        window.location.href = "/login?expired=true"
        throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.")
      }
    }

    return handleApiResponse(response)
  } catch (error) {
    console.error(`API 호출 오류 (${url}):`, error)
    throw error
  }
}

// 나머지 API 함수들은 그대로 유지...
