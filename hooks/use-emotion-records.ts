// 감정 기록 관리를 위한 커스텀 훅
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
import type { EmotionRecord, EmotionRecordRequest, ApiResponse } from "@/lib/types"

export function useEmotionRecords() {
  const [records, setRecords] = useState<EmotionRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 기록 목록 조회
  const fetchRecords = useCallback(async (limit = 50, offset = 0) => {
    setLoading(true)
    setError(null)

    try {
      const response: ApiResponse<EmotionRecord[]> = await getRecordsApi(limit, offset)
      if (response.success && response.data) {
        setRecords(response.data)
      }
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  // 특정 날짜 기록 조회
  const getRecordByDate = useCallback(async (date: string): Promise<EmotionRecord | null> => {
    try {
      const response: ApiResponse<EmotionRecord> = await getRecordByDateApi(date)
      return response.success && response.data ? response.data : null
    } catch (err) {
      // 404는 정상적인 경우 (해당 날짜에 기록이 없음)
      if (err instanceof Error && err.message.includes("404")) {
        return null
      }
      throw err
    }
  }, [])

  // 기록 생성
  const createRecord = useCallback(async (recordData: EmotionRecordRequest): Promise<EmotionRecord | null> => {
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
      setError(handleApiError(err))
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // 기록 수정
  const updateRecord = useCallback(
    async (id: number, recordData: EmotionRecordRequest): Promise<EmotionRecord | null> => {
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
    setLoading(true)
    setError(null)

    try {
      await deleteRecordApi(id)
      // 기존 목록에서 해당 기록 제거
      setRecords((prev) => prev.filter((r) => r.id !== id))
      return true
    } catch (err) {
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
      setLoading(true)
      setError(null)

      try {
        const response: ApiResponse<EmotionRecord[]> = await searchRecordsApi(params)
        return response.success && response.data ? response.data : []
      } catch (err) {
        setError(handleApiError(err))
        return []
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  // 초기 데이터 로드
  useEffect(() => {
    fetchRecords()
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
