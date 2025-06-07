// 감정 기록 관리를 위한 커스텀 훅 (개선된 버전)
"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getRecordsApi,
  createRecordApi,
  updateRecordApi,
  deleteRecordApi,
  getRecordByDateApi,
  searchRecordsApi,
  handleApiError,
} from "@/lib/api"
import { isLoggedIn } from "@/lib/auth"
import type { EmotionRecord, EmotionRecordRequest, ApiResponse } from "@/lib/types"

export function useEmotionRecords() {
  const [records, setRecords] = useState<EmotionRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 기록 목록 조회
  const fetchRecords = useCallback(async (limit = 50, offset = 0) => {
    // 로그인하지 않은 경우 빈 배열 반환
    if (!isLoggedIn()) {
      setRecords([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response: ApiResponse<EmotionRecord[]> = await getRecordsApi(limit, offset)
      if (response.success && response.data) {
        setRecords(response.data)
      } else {
        setRecords([])
      }
    } catch (err) {
      console.error("기록 조회 실패:", err)
      setError(handleApiError(err))
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [])

  // 특정 날짜 기록 조회
  const getRecordByDate = useCallback(async (date: string): Promise<EmotionRecord | null> => {
    if (!isLoggedIn()) {
      console.log("로그인하지 않은 상태, null 반환")
      return null
    }

    try {
      console.log(`날짜 ${date}의 기록 조회 시작`)
      const response = await getRecordByDateApi(date)

      // 성공적으로 데이터를 받았고, 데이터가 있는 경우
      if (response.success && response.data) {
        console.log(`날짜 ${date}의 기록 조회 성공:`, response.data)
        return response.data
      }

      // 데이터가 없는 경우 (404 포함)
      console.log(`날짜 ${date}의 기록이 없음`)
      return null
    } catch (err) {
      console.error(`날짜 ${date} 기록 조회 실패:`, err)
      // 모든 에러를 null로 처리 (기록 없음으로 간주하여 UI 중단 방지)
      return null
    }
  }, [])

  // 기록 생성
  const createRecord = useCallback(async (recordData: EmotionRecordRequest): Promise<EmotionRecord | null> => {
    if (!isLoggedIn()) {
      throw new Error("로그인이 필요합니다.")
    }

    setLoading(true)
    setError(null)

    try {
      const response: ApiResponse<EmotionRecord> = await createRecordApi(recordData)
      if (response.success && response.data) {
        // 기존 목록에 새 기록 추가
        setRecords((prev) => [response.data!, ...prev.filter((r) => r.date !== recordData.date)])
        return response.data
      }
      return null
    } catch (err) {
      console.error("기록 생성 실패:", err)
      setError(handleApiError(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // 기록 수정
  const updateRecord = useCallback(
    async (id: number, recordData: EmotionRecordRequest): Promise<EmotionRecord | null> => {
      if (!isLoggedIn()) {
        throw new Error("로그인이 필요합니다.")
      }

      setLoading(true)
      setError(null)

      try {
        const response: ApiResponse<EmotionRecord> = await updateRecordApi(id, recordData)
        if (response.success && response.data) {
          // 기존 목록에서 해당 기록 업데이트
          setRecords((prev) => prev.map((r) => (r.id === id ? response.data! : r)))
          return response.data
        }
        return null
      } catch (err) {
        console.error("기록 수정 실패:", err)
        setError(handleApiError(err))
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  // 기록 삭제
  const deleteRecord = useCallback(async (id: number): Promise<boolean> => {
    if (!isLoggedIn()) {
      throw new Error("로그인이 필요합니다.")
    }

    setLoading(true)
    setError(null)

    try {
      await deleteRecordApi(id)
      // 기존 목록에서 해당 기록 제거
      setRecords((prev) => prev.filter((r) => r.id !== id))
      return true
    } catch (err) {
      console.error("기록 삭제 실패:", err)
      setError(handleApiError(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // 기록 검색
  const searchRecords = useCallback(
    async (params: {
      q?: string
      date_from?: string
      date_to?: string
    }): Promise<EmotionRecord[]> => {
      if (!isLoggedIn()) {
        return []
      }

      setLoading(true)
      setError(null)

      try {
        const response: ApiResponse<EmotionRecord[]> = await searchRecordsApi(params)
        return response.success && response.data ? response.data : []
      } catch (err) {
        console.error("기록 검색 실패:", err)
        setError(handleApiError(err))
        return []
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  // 초기 데이터 로드 (로그인 상태일 때만)
  useEffect(() => {
    if (isLoggedIn()) {
      fetchRecords()
    } else {
      setRecords([])
    }
  }, [fetchRecords])

  return {
    records,
    loading,
    error,
    fetchRecords,
    getRecordByDate,
    createRecord,
    updateRecord,
    deleteRecord,
    searchRecords,
    clearError: () => setError(null),
  }
}
