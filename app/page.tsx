"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Plus, Calendar, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SettingsMenu } from "@/components/settings-menu"
import { AuthRequiredModal } from "@/components/auth-required-modal"
import { useAuthGuard } from "@/hooks/use-auth-guard"
import { useEmotionRecords } from "@/hooks/use-emotion-records"
import { getMoodEmoji, formatDisplayDate } from "@/lib/utils"
import type { EmotionRecord, EmotionRecordRequest } from "@/lib/types"

// 날짜 포맷팅 함수 (date-fns 대신)
const formatDate = (date: Date, formatStr: string): string => {
  if (formatStr === "yyyy-MM-dd") {
    return date.toISOString().split("T")[0]
  }
  return date.toLocaleDateString("ko-KR")
}

export default function EmotionCalendar() {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date(), "yyyy-MM-dd"))
  const [currentEntry, setCurrentEntry] = useState({
    grateful: "",
    sad: "",
    angry: "",
    notes: "",
    mood: 3,
  })

  // UI 상태
  const [currentScreen, setCurrentScreen] = useState<"main" | "calendar" | "entry" | "view">("main")
  const [viewingEntry, setViewingEntry] = useState<EmotionRecord | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // 인증 가드 훅 사용
  const { showAuthModal, authModalAction, checkAuth, closeAuthModal, isAuthenticated } = useAuthGuard()

  // 감정 기록 관리 훅 사용 (로그인 상태일 때만)
  const { records, loading, error, createRecord, updateRecord, deleteRecord, getRecordByDate, clearError } =
    useEmotionRecords()

  // 토스트 메시지 표시
  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // 저장 함수 (API 사용)
  const saveEntry = useCallback(async () => {
    // 로그인 확인
    if (!checkAuth("save")) {
      return
    }

    if (
      !currentEntry.grateful.trim() &&
      !currentEntry.sad.trim() &&
      !currentEntry.angry.trim() &&
      !currentEntry.notes.trim()
    ) {
      showToast("최소한 하나의 항목은 작성해야 합니다", "error")
      return
    }

    try {
      const recordData: EmotionRecordRequest = {
        date: selectedDate,
        grateful: currentEntry.grateful || undefined,
        sad: currentEntry.sad || undefined,
        angry: currentEntry.angry || undefined,
        notes: currentEntry.notes || undefined,
        mood: currentEntry.mood,
      }

      // 기존 기록이 있는지 확인
      const existingRecord = await getRecordByDate(selectedDate)

      if (existingRecord) {
        // 기존 기록 수정
        await updateRecord(existingRecord.id, recordData)
        showToast("✨ 감정 기록이 수정되었습니다")
      } else {
        // 새 기록 생성
        await createRecord(recordData)
        showToast("✨ 감정 기록이 저장되었습니다")
      }

      setCurrentScreen("main")
    } catch (err) {
      console.error("기록 저장 실패:", err)
      showToast("기록 저장에 실패했습니다. 다시 시도해주세요.", "error")
    }
  }, [currentEntry, selectedDate, checkAuth, showToast, createRecord, updateRecord, getRecordByDate])

  // 삭제 함수 (API 사용)
  const handleDeleteEntry = useCallback(
    async (recordId: number) => {
      // 로그인 확인
      if (!checkAuth("save")) {
        return
      }

      try {
        await deleteRecord(recordId)
        showToast("기록이 삭제되었습니다")
        setViewingEntry(null)
        setCurrentScreen("main")
      } catch (err) {
        console.error("기록 삭제 실패:", err)
        showToast("기록 삭제에 실패했습니다. 다시 시도해주세요.", "error")
      }
    },
    [deleteRecord, showToast, checkAuth],
  )

  const recentEntries = useMemo(() => records.slice(0, 3), [records])
  const entryDates = useMemo(() => records.map((record) => record.date), [records])

  // 새 기록 작성 버튼 핸들러
  const handleNewEntry = () => {
    // 로그인 확인
    if (!checkAuth("save")) {
      return
    }
    setSelectedDate(formatDate(new Date(), "yyyy-MM-dd"))
    setCurrentScreen("entry")
  }

  // 캘린더 화면 이동 핸들러
  const handleGoToCalendar = () => {
    // 로그인 확인
    if (!checkAuth("view")) {
      return
    }
    setCurrentScreen("calendar")
  }

  // 기록 보기 핸들러
  const handleViewEntry = (entry: EmotionRecord) => {
    // 로그인 확인
    if (!checkAuth("view")) {
      return
    }
    setViewingEntry(entry)
    setCurrentScreen("view")
  }

  // 오늘 기록 조회
  const todayRecord = useMemo(() => {
    const today = formatDate(new Date(), "yyyy-MM-dd")
    return records.find((record) => record.date === today)
  }, [records])

  // 에러 처리
  useEffect(() => {
    if (error) {
      showToast(error, "error")
      clearError()
    }
  }, [error, showToast, clearError])

  // 기존 엔트리 로드
  useEffect(() => {
    const loadExistingEntry = async () => {
      console.log(`기존 엔트리 로드 시작 - 날짜: ${selectedDate}, 인증 상태: ${isAuthenticated}`)

      if (!isAuthenticated) {
        // 로그인하지 않은 경우 빈 상태로 초기화
        console.log("로그인하지 않은 상태, 빈 엔트리로 초기화")
        setCurrentEntry({
          grateful: "",
          sad: "",
          angry: "",
          notes: "",
          mood: 3,
        })
        return
      }

      try {
        console.log(`날짜 ${selectedDate}의 기존 기록 조회 중...`)
        const existingRecord = await getRecordByDate(selectedDate)

        if (existingRecord) {
          console.log("기존 기록 발견, 폼에 로드:", existingRecord)
          setCurrentEntry({
            grateful: existingRecord.grateful || "",
            sad: existingRecord.sad || "",
            angry: existingRecord.angry || "",
            notes: existingRecord.notes || "",
            mood: existingRecord.mood || 3,
          })
        } else {
          // 기록이 없는 경우 빈 상태로 초기화
          console.log("기존 기록 없음, 빈 엔트리로 초기화")
          setCurrentEntry({
            grateful: "",
            sad: "",
            angry: "",
            notes: "",
            mood: 3,
          })
        }
      } catch (err) {
        console.error("기존 기록 로드 중 예상치 못한 오류:", err)
        // 어떤 에러가 발생해도 빈 상태로 초기화하여 UI 중단 방지
        setCurrentEntry({
          grateful: "",
          sad: "",
          angry: "",
          notes: "",
          mood: 3,
        })

        // 사용자에게 알림 (선택적)
        showToast("기록을 불러오는 중 문제가 발생했습니다. 새로 작성해주세요.", "error")
      }
    }

    loadExistingEntry()
  }, [selectedDate, getRecordByDate, isAuthenticated, showToast])

  // 날짜 선택 핸들러
  const handleDateSelect = async (date: Date | undefined) => {
    if (!date) return

    const formattedDate = formatDate(date, "yyyy-MM-dd")
    setSelectedDate(formattedDate)

    if (!isAuthenticated) {
      checkAuth("view")
      return
    }

    try {
      const existingRecord = await getRecordByDate(formattedDate)
      if (existingRecord) {
        setViewingEntry(existingRecord)
        setCurrentScreen("view")
      } else {
        if (!checkAuth("save")) {
          return
        }
        setCurrentScreen("entry")
      }
    } catch (err) {
      console.error("기록 조회 실패:", err)
      showToast("기록을 불러오는데 실패했습니다.", "error")
    }
  }

  // 메인 화면
  if (currentScreen === "main") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white px-4 py-6 shadow-sm">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">안녕하세요! 👋</h1>
              <p className="text-gray-600">오늘 하루는 어떠셨나요?</p>
            </div>
            <SettingsMenu />
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-6 space-y-6">
          {/* 로그인 유도 배너 (비로그인 상태일 때만 표시) */}
          {!isAuthenticated && (
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-5 rounded-2xl shadow-sm">
              <h3 className="font-semibold text-lg mb-2">감정 기록을 안전하게 보관하세요</h3>
              <p className="text-sm text-purple-100 mb-4">
                회원가입하면 모든 기기에서 감정 기록을 확인하고 안전하게 보관할 수 있어요.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => (window.location.href = "/register")}
                  className="bg-white text-purple-700 hover:bg-purple-50 flex-1"
                >
                  회원가입
                </Button>
                <Button
                  onClick={() => (window.location.href = "/login")}
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white/20 flex-1"
                >
                  로그인
                </Button>
              </div>
            </div>
          )}

          {/* 로딩 상태 (로그인 상태일 때만) */}
          {isAuthenticated && loading && (
            <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">기록을 불러오는 중...</p>
            </div>
          )}

          {/* 오늘의 기록 카드 */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">오늘의 기록</h2>
              <div className="text-sm text-blue-100">
                {new Date().toLocaleDateString("ko-KR", {
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                })}
              </div>
            </div>

            {isAuthenticated && todayRecord ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm text-blue-100">기록 완료</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30"
                  onClick={() => handleViewEntry(todayRecord)}
                >
                  오늘 기록 보기
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  <span className="text-sm text-blue-100">
                    {isAuthenticated ? "아직 기록하지 않았어요" : "로그인하고 기록을 시작하세요"}
                  </span>
                </div>
                <Button className="w-full bg-white text-blue-600 hover:bg-blue-50" onClick={handleNewEntry}>
                  {isAuthenticated ? "오늘 기록하기" : "기록 시작하기"}
                </Button>
              </div>
            )}
          </div>

          {/* 메뉴 카드들 */}
          <div className="space-y-4">
            <div
              className="bg-white p-4 rounded-2xl shadow-sm border-0 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={handleGoToCalendar}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">캘린더</h3>
                    <p className="text-sm text-gray-500">날짜별 기록 보기</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">{records.length}</div>
                  <div className="text-xs text-gray-500">개의 기록</div>
                </div>
              </div>
            </div>

            <div
              className="bg-white p-4 rounded-2xl shadow-sm border-0 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={handleNewEntry}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">새 기록 작성</h3>
                  <p className="text-sm text-gray-500">감정과 경험을 기록해보세요</p>
                </div>
              </div>
            </div>
          </div>

          {/* 최근 기록 (로그인 상태일 때만) */}
          {isAuthenticated && recentEntries.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800">최근 기록</h2>
              {recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => handleViewEntry(entry)}
                  className="bg-white rounded-2xl shadow-sm border-0 p-4 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-800">{formatDisplayDate(entry.date)}</p>
                        <span className="text-lg">{getMoodEmoji(entry.mood || 3)}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {entry.grateful || entry.sad || entry.angry || entry.notes}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 팁 카드 */}
          <div className="bg-blue-50 p-4 rounded-2xl">
            <h4 className="font-medium text-blue-900 mb-1">💡 감정 기록 팁</h4>
            <p className="text-sm text-blue-700">매일 조금씩이라도 기록하면 마음의 변화를 더 잘 이해할 수 있어요.</p>
          </div>
        </div>

        {/* 플로팅 버튼 */}
        <button
          onClick={handleNewEntry}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40 active:scale-95"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* 토스트 메시지 */}
        {toast && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div
              className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium ${
                toast.type === "error" ? "bg-red-500" : "bg-green-500"
              }`}
            >
              {toast.message}
            </div>
          </div>
        )}

        {/* 인증 필요 모달 */}
        <AuthRequiredModal isOpen={showAuthModal} onClose={closeAuthModal} action={authModalAction} />
      </div>
    )
  }

  // 캘린더 화면
  if (currentScreen === "calendar") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCurrentScreen("main")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">캘린더</h1>
        </div>

        <div className="max-w-md mx-auto px-4 py-6">
          {/* 캘린더 UI 구현 */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {new Date().getFullYear()}년 {new Date().getMonth() + 1}월
              </h2>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 mb-2">
              {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => {
                const date = new Date(new Date().getFullYear(), new Date().getMonth(), i - new Date().getDay() + 1)
                const dateStr = formatDate(date, "yyyy-MM-dd")
                const isToday = dateStr === formatDate(new Date(), "yyyy-MM-dd")
                const hasEntry = entryDates.includes(dateStr)

                return (
                  <div
                    key={i}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer
                      ${isToday ? "bg-blue-100" : hasEntry ? "bg-green-50" : "hover:bg-gray-100"}
                    `}
                    onClick={() => handleDateSelect(date)}
                  >
                    <span
                      className={`text-sm font-medium ${
                        isToday ? "text-blue-600" : date.getMonth() !== new Date().getMonth() ? "text-gray-300" : ""
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {hasEntry && <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1"></div>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 최근 기록 */}
          <div className="mt-6 space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">최근 기록</h2>
            {recentEntries.length > 0 ? (
              recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => handleViewEntry(entry)}
                  className="bg-white rounded-2xl shadow-sm border-0 p-4 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-800">{formatDisplayDate(entry.date)}</p>
                        <span className="text-lg">{getMoodEmoji(entry.mood || 3)}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {entry.grateful || entry.sad || entry.angry || entry.notes}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border-0 p-6 text-center">
                <p className="text-gray-500">아직 기록이 없습니다</p>
                <Button className="mt-3" onClick={handleNewEntry}>
                  첫 기록 작성하기
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 토스트 메시지 */}
        {toast && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div
              className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium ${
                toast.type === "error" ? "bg-red-500" : "bg-green-500"
              }`}
            >
              {toast.message}
            </div>
          </div>
        )}
      </div>
    )
  }

  // 기록 작성 화면
  if (currentScreen === "entry") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCurrentScreen("main")}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">감정 기록</h1>
          </div>
          <Button onClick={saveEntry} className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl">
            저장
          </Button>
        </div>

        <div className="max-w-md mx-auto px-4 py-6 space-y-6">
          {/* 날짜 표시 */}
          <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">날짜</p>
              <p className="text-lg font-medium text-gray-900">{formatDisplayDate(selectedDate)}</p>
            </div>
            <Button variant="outline" className="border-gray-200" onClick={() => handleDateSelect(new Date())}>
              오늘
            </Button>
          </div>

          {/* 기분 선택 */}
          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
            <p className="text-sm text-gray-500">오늘의 기분</p>
            <div className="flex justify-between">
              {[1, 2, 3, 4, 5].map((mood) => (
                <button
                  key={mood}
                  onClick={() => setCurrentEntry((prev) => ({ ...prev, mood }))}
                  className={`w-12 h-12 flex items-center justify-center rounded-full text-2xl ${
                    currentEntry.mood === mood ? "bg-blue-100 ring-2 ring-blue-500" : "bg-gray-100"
                  }`}
                >
                  {getMoodEmoji(mood)}
                </button>
              ))}
            </div>
          </div>

          {/* 감사한 일 */}
          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
            <p className="text-sm text-gray-500">감사한 일</p>
            <textarea
              value={currentEntry.grateful}
              onChange={(e) => setCurrentEntry((prev) => ({ ...prev, grateful: e.target.value }))}
              placeholder="오늘 감사했던 일을 적어보세요"
              className="w-full h-24 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 슬픈 일 */}
          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
            <p className="text-sm text-gray-500">슬픈 일</p>
            <textarea
              value={currentEntry.sad}
              onChange={(e) => setCurrentEntry((prev) => ({ ...prev, sad: e.target.value }))}
              placeholder="오늘 슬펐던 일을 적어보세요"
              className="w-full h-24 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 화난 일 */}
          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
            <p className="text-sm text-gray-500">화난 일</p>
            <textarea
              value={currentEntry.angry}
              onChange={(e) => setCurrentEntry((prev) => ({ ...prev, angry: e.target.value }))}
              placeholder="오늘 화났던 일을 적어보세요"
              className="w-full h-24 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 기타 메모 */}
          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
            <p className="text-sm text-gray-500">기타 메모</p>
            <textarea
              value={currentEntry.notes}
              onChange={(e) => setCurrentEntry((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="기타 기록하고 싶은 내용을 적어보세요"
              className="w-full h-24 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 저장 버튼 */}
          <Button
            onClick={saveEntry}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-12 text-base"
          >
            저장하기
          </Button>
        </div>

        {/* 토스트 메시지 */}
        {toast && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div
              className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium ${
                toast.type === "error" ? "bg-red-500" : "bg-green-500"
              }`}
            >
              {toast.message}
            </div>
          </div>
        )}
      </div>
    )
  }

  // 기록 보기 화면
  if (currentScreen === "view" && viewingEntry) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCurrentScreen("main")}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">기록 보기</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => {
                setSelectedDate(viewingEntry.date)
                setCurrentEntry({
                  grateful: viewingEntry.grateful || "",
                  sad: viewingEntry.sad || "",
                  angry: viewingEntry.angry || "",
                  notes: viewingEntry.notes || "",
                  mood: viewingEntry.mood || 3,
                })
                setCurrentScreen("entry")
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-red-500"
              onClick={() => handleDeleteEntry(viewingEntry.id)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="m8 6 4 4" />
                <path d="m12 6 4 4" />
              </svg>
            </Button>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-6 space-y-6">
          {/* 날짜와 기분 */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-lg font-medium text-gray-900">{formatDisplayDate(viewingEntry.date)}</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getMoodEmoji(viewingEntry.mood || 3)}</span>
              </div>
            </div>
            <div className="h-px bg-gray-100 my-3"></div>
            <p className="text-sm text-gray-500">
              작성일: {new Date(viewingEntry.createdAt).toLocaleDateString("ko-KR")}
            </p>
          </div>

          {/* 감사한 일 */}
          {viewingEntry.grateful && (
            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
              <p className="text-sm text-gray-500">감사한 일</p>
              <p className="text-gray-900 whitespace-pre-wrap">{viewingEntry.grateful}</p>
            </div>
          )}

          {/* 슬픈 일 */}
          {viewingEntry.sad && (
            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
              <p className="text-sm text-gray-500">슬픈 일</p>
              <p className="text-gray-900 whitespace-pre-wrap">{viewingEntry.sad}</p>
            </div>
          )}

          {/* 화난 일 */}
          {viewingEntry.angry && (
            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
              <p className="text-sm text-gray-500">화난 일</p>
              <p className="text-gray-900 whitespace-pre-wrap">{viewingEntry.angry}</p>
            </div>
          )}

          {/* 기타 메모 */}
          {viewingEntry.notes && (
            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
              <p className="text-sm text-gray-500">기타 메모</p>
              <p className="text-gray-900 whitespace-pre-wrap">{viewingEntry.notes}</p>
            </div>
          )}
        </div>

        {/* 토스트 메시지 */}
        {toast && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div
              className={`px-4 py-3 rounded-lg shadow-lg text-white font-medium ${
                toast.type === "error" ? "bg-red-500" : "bg-green-500"
              }`}
            >
              {toast.message}
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}
