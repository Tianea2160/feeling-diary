// 캘린더 데이터 관리를 위한 커스텀 훅
"use client"

import { useState, useCallback } from "react"
import { getCalendarDataApi, handleApiError } from "@/lib/api"
import type { CalendarData, ApiResponse } from "@/lib/types"

export function useCalendar() {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 월별 캘린더 데이터 조회
  const fetchCalendarData = useCallback(async (year: number, month: number) => {
    setLoading(true)
    setError(null)

    try {
      const response: ApiResponse<CalendarData> = await getCalendarDataApi(year, month)
      if (response.success && response.data) {
        setCalendarData(response.data)
      }
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  // 특정 날짜에 기록이 있는지 확인
  const hasRecordOnDate = useCallback(
    (date: string): boolean => {
      if (!calendarData) return false
      return calendarData.records[date]?.hasRecord || false
    },
    [calendarData],
  )

  // 특정 날짜의 기분 가져오기
  const getMoodOnDate = useCallback(
    (date: string): number | undefined => {
      if (!calendarData) return undefined
      return calendarData.records[date]?.mood
    },
    [calendarData],
  )

  return {
    calendarData,
    loading,
    error,
    fetchCalendarData,
    hasRecordOnDate,
    getMoodOnDate,
    clearError: () => setError(null),
  }
}
