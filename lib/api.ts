// API 호출 유틸리티
import { getAuthHeaders, refreshAccessToken, logout } from "@/lib/auth"
import { CONFIG } from "@/lib/config"

/**
 * 타임아웃이 있는 fetch 함수
 */
export const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 10000) => {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

/**
 * API 응답 처리 함수
 */
export const handleApiResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type")

  if (contentType && contentType.includes("application/json")) {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || `API 오류: ${response.status}`)
    }

    return data
  } else {
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`)
    }

    return await response.text()
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
  LOGIN: `${CONFIG.apiBaseUrl}/auth/login`,
  REGISTER: `${CONFIG.apiBaseUrl}/auth/register`,
  REFRESH: `${CONFIG.apiBaseUrl}/auth/refresh`,
}

/**
 * 로그인 API 호출
 */
export const loginApi = async (email: string, password: string) => {
  const response = await fetchWithTimeout(API_ENDPOINTS.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  return await handleApiResponse(response)
}

/**
 * 회원가입 API 호출
 */
export const registerApi = async (email: string, name: string, password: string) => {
  const response = await fetchWithTimeout(API_ENDPOINTS.REGISTER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, name, password }),
  })

  return await handleApiResponse(response)
}

/**
 * 토큰 갱신 API 호출
 */
export const refreshTokenApi = async (refreshToken: string) => {
  const response = await fetchWithTimeout(API_ENDPOINTS.REFRESH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  })

  return await handleApiResponse(response)
}

/**
 * 인증이 필요한 API 호출 함수
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
      const refreshed = await refreshAccessToken()

      if (refreshed) {
        return fetchApi(url, options, withAuth, timeout)
      } else {
        logout()
        window.location.href = "/login?expired=true"
        throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.")
      }
    }

    return handleApiResponse(response)
  } catch (error) {
    throw error
  }
}
