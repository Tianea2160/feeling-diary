// API 호출 유틸리티 (개선된 오류 처리)
import { getAuthHeaders, refreshAccessToken, logout, isLoggedIn } from "@/lib/auth"
import { CONFIG } from "@/lib/config"

/**
 * 타임아웃이 있는 fetch 함수
 */
export const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 10000) => {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    console.log(`API 요청: ${options.method || "GET"} ${url}`)
    if (options.body) {
      console.log("요청 데이터:", JSON.parse(options.body as string))
    }

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
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
 * API 응답 처리 함수 (개선된 버전)
 */
export const handleApiResponse = async (response: Response) => {
  // 404 응답은 특별 처리 (기록 없음으로 간주)
  if (response.status === 404) {
    console.log("API 응답: 404 - 리소스를 찾을 수 없음 (정상 처리)")
    return { success: false, data: null, message: "리소스를 찾을 수 없습니다." }
  }

  // 500번대 서버 에러는 안전하게 처리
  if (response.status >= 500) {
    console.error(`API 응답: ${response.status} - 서버 내부 오류`)
    return { success: false, data: null, message: "서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요." }
  }

  const contentType = response.headers.get("content-type")

  try {
    // JSON 응답 처리
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json()
      console.log("API 응답 데이터:", data)

      if (!response.ok) {
        const errorMessage = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
      }

      return data
    }
    // 텍스트 응답 처리
    else {
      const text = await response.text()
      console.log("API 텍스트 응답:", text)

      if (!response.ok) {
        const errorMessage = text || `HTTP ${response.status}: ${response.statusText}`
        console.error("API 오류 응답:", errorMessage)
        throw new Error(errorMessage)
      }

      // 빈 응답이면 성공으로 처리
      return text || { success: true }
    }
  } catch (error) {
    console.error("응답 처리 오류:", error)

    // JSON 파싱 오류인 경우
    if (error instanceof SyntaxError) {
      console.error("JSON 파싱 실패, 서버 응답이 올바르지 않음")
      return { success: false, data: null, message: "서버 응답 형식이 올바르지 않습니다." }
    }

    throw error
  }
}

/**
 * API 오류 처리 함수 (개선된 버전)
 */
export const handleApiError = (error: unknown): string => {
  console.error("API 오류:", error)

  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return "서버에 연결할 수 없습니다. 네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요."
  } else if (error instanceof DOMException && error.name === "AbortError") {
    return "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요."
  } else if (error instanceof Error) {
    // 구체적인 에러 메시지가 있으면 그대로 사용
    if (error.message.includes("HTTP")) {
      return error.message
    }
    return error.message || "요청 처리 중 오류가 발생했습니다."
  } else {
    return "알 수 없는 오류가 발생했습니다."
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
  RECORD_BY_DATE: (date: string) => `${CONFIG.apiBaseUrl}/api/records/date/${date}`,
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
 * 로그인 API 호출
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
 * 회원가입 API 호출
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
  // 인증이 필요한데 로그인하지 않은 경우
  if (withAuth && !isLoggedIn()) {
    throw new Error("로그인이 필요합니다.")
  }

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
        throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.")
      }
    }

    return handleApiResponse(response)
  } catch (error) {
    console.error(`API 호출 오류 (${url}):`, error)
    throw error
  }
}

/**
 * 감정 기록 관련 API 함수들
 */

// 기록 목록 조회
export const getRecordsApi = async (limit = 50, offset = 0) => {
  if (!isLoggedIn()) {
    throw new Error("로그인이 필요합니다.")
  }

  const url = `${API_ENDPOINTS.RECORDS}?limit=${limit}&offset=${offset}`
  return fetchApi(url, { method: "GET" }, true)
}

// 특정 날짜 기록 조회
export const getRecordByDateApi = async (date: string) => {
  if (!isLoggedIn()) {
    throw new Error("로그인이 필요합니다.")
  }

  try {
    const response = await fetchApi(API_ENDPOINTS.RECORD_BY_DATE(date), { method: "GET" }, true)
    return response
  } catch (error) {
    console.error(`날짜 ${date} 기록 조회 중 오류:`, error)

    // 모든 에러를 기록 없음으로 처리 (UI 중단 방지)
    return { success: false, data: null, message: "기록을 불러올 수 없습니다." }
  }
}

// 새 기록 생성
export const createRecordApi = async (recordData: any) => {
  if (!isLoggedIn()) {
    throw new Error("로그인이 필요합니다.")
  }

  return fetchApi(
    API_ENDPOINTS.RECORDS,
    {
      method: "POST",
      body: JSON.stringify(recordData),
    },
    true,
  )
}

// 기록 수정
export const updateRecordApi = async (id: number, recordData: any) => {
  if (!isLoggedIn()) {
    throw new Error("로그인이 필요합니다.")
  }

  return fetchApi(
    API_ENDPOINTS.RECORD_BY_ID(id),
    {
      method: "PUT",
      body: JSON.stringify(recordData),
    },
    true,
  )
}

// 기록 삭제
export const deleteRecordApi = async (id: number) => {
  if (!isLoggedIn()) {
    throw new Error("로그인이 필요합니다.")
  }

  return fetchApi(
    API_ENDPOINTS.RECORD_BY_ID(id),
    {
      method: "DELETE",
    },
    true,
  )
}

// 기록 검색
export const searchRecordsApi = async (params: {
  q?: string
  date_from?: string
  date_to?: string
}) => {
  if (!isLoggedIn()) {
    throw new Error("로그인이 필요합니다.")
  }

  const searchParams = new URLSearchParams()
  if (params.q) searchParams.append("q", params.q)
  if (params.date_from) searchParams.append("date_from", params.date_from)
  if (params.date_to) searchParams.append("date_to", params.date_to)

  const url = `${API_ENDPOINTS.RECORDS_SEARCH}?${searchParams.toString()}`
  return fetchApi(url, { method: "GET" }, true)
}

// 캘린더 데이터 조회
export const getCalendarDataApi = async (year: number, month: number) => {
  if (!isLoggedIn()) {
    throw new Error("로그인이 필요합니다.")
  }

  return fetchApi(API_ENDPOINTS.CALENDAR(year, month), { method: "GET" }, true)
}
