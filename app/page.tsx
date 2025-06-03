"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Plus, Calendar, Heart, Frown, Angry, FileText, ArrowLeft, Edit3, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar as CalendarUI } from "@/components/ui/calendar"
import {
  type EmotionEntry,
  getMoodEmoji,
  formatDisplayDate,
  getWeeklyStats,
  cn,
  safeLocalStorage,
  debounce,
  MOOD_CONFIG,
} from "@/lib/utils"

// 날짜 포맷팅 함수 (date-fns 대신)
const formatDate = (date: Date, formatStr: string): string => {
  if (formatStr === "yyyy-MM-dd") {
    return date.toISOString().split("T")[0]
  }
  return date.toLocaleDateString("ko-KR")
}

export default function EmotionCalendar() {
  const [entries, setEntries] = useState<EmotionEntry[]>([])
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date(), "yyyy-MM-dd"))
  const [searchTerm, setSearchTerm] = useState("")
  const [currentEntry, setCurrentEntry] = useState({
    grateful: "",
    sad: "",
    angry: "",
    notes: "",
    mood: 3,
  })

  // UI 상태
  const [currentScreen, setCurrentScreen] = useState<"main" | "calendar" | "entry" | "view">("main")
  const [viewingEntry, setViewingEntry] = useState<EmotionEntry | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // 데이터 로드
  useEffect(() => {
    try {
      const savedEntries = safeLocalStorage.getItem("emotionEntries")
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries))
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error)
    }
  }, [])

  // 기존 엔트리 로드
  useEffect(() => {
    const existingEntry = entries.find((entry) => entry.date === selectedDate)
    if (existingEntry) {
      setCurrentEntry({
        grateful: existingEntry.grateful || "",
        sad: existingEntry.sad || "",
        angry: existingEntry.angry || "",
        notes: existingEntry.notes || "",
        mood: existingEntry.mood || 3,
      })
    } else {
      setCurrentEntry({
        grateful: "",
        sad: "",
        angry: "",
        notes: "",
        mood: 3,
      })
    }
  }, [selectedDate, entries])

  // 토스트 메시지 표시
  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // 저장 함수
  const saveEntry = useCallback(() => {
    if (
      !currentEntry.grateful.trim() &&
      !currentEntry.sad.trim() &&
      !currentEntry.angry.trim() &&
      !currentEntry.notes.trim()
    ) {
      showToast("최소한 하나의 항목은 작성해야 합니다", "error")
      return
    }

    const newEntry: EmotionEntry = {
      id: `${selectedDate}-${Date.now()}`,
      date: selectedDate,
      grateful: currentEntry.grateful,
      sad: currentEntry.sad,
      angry: currentEntry.angry,
      notes: currentEntry.notes,
      mood: currentEntry.mood,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedEntries = entries.filter((entry) => entry.date !== selectedDate)
    updatedEntries.push(newEntry)
    updatedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setEntries(updatedEntries)
    safeLocalStorage.setItem("emotionEntries", JSON.stringify(updatedEntries))

    showToast("✨ 감정 기록이 저장되었습니다")
    setCurrentScreen("main")
  }, [currentEntry, selectedDate, entries, showToast])

  // 삭제 함수
  const deleteEntry = useCallback(
    (entryId: string) => {
      const updatedEntries = entries.filter((entry) => entry.id !== entryId)
      setEntries(updatedEntries)
      safeLocalStorage.setItem("emotionEntries", JSON.stringify(updatedEntries))

      showToast("기록이 삭제되었습니다")
      setViewingEntry(null)
      setCurrentScreen("main")
    },
    [entries, showToast],
  )

  // 디바운스된 검색
  const debouncedSearch = useMemo(() => debounce((term: string) => setSearchTerm(term), 300), [])

  const stats = useMemo(() => getWeeklyStats(entries), [entries])
  const recentEntries = useMemo(() => entries.slice(0, 3), [entries])
  const entryDates = useMemo(() => entries.map((entry) => entry.date), [entries])

  // 날짜 선택 핸들러
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    const formattedDate = formatDate(date, "yyyy-MM-dd")
    setSelectedDate(formattedDate)

    const existingEntry = entries.find((entry) => entry.date === formattedDate)
    if (existingEntry) {
      setViewingEntry(existingEntry)
      setCurrentScreen("view")
    } else {
      setCurrentScreen("entry")
    }
  }

  // 메인 화면
  if (currentScreen === "main") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white px-4 py-6 shadow-sm">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">안녕하세요! 👋</h1>
            <p className="text-gray-600">오늘 하루는 어떠셨나요?</p>
          </div>
        </div>

        <div className="max-w-md mx-auto px-4 py-6 space-y-6">
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

            {entries.find((entry) => entry.date === formatDate(new Date(), "yyyy-MM-dd")) ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm text-blue-100">기록 완료</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30"
                  onClick={() => {
                    const todayEntry = entries.find((entry) => entry.date === formatDate(new Date(), "yyyy-MM-dd"))
                    if (todayEntry) {
                      setViewingEntry(todayEntry)
                      setCurrentScreen("view")
                    }
                  }}
                >
                  오늘 기록 보기
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  <span className="text-sm text-blue-100">아직 기록하지 않았어요</span>
                </div>
                <Button
                  className="w-full bg-white text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    setSelectedDate(formatDate(new Date(), "yyyy-MM-dd"))
                    setCurrentScreen("entry")
                  }}
                >
                  오늘 기록하기
                </Button>
              </div>
            )}
          </div>

          {/* 메뉴 카드들 */}
          <div className="space-y-4">
            <div
              className="bg-white p-4 rounded-2xl shadow-sm border-0 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setCurrentScreen("calendar")}
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
                  <div className="text-lg font-semibold text-gray-900">{entries.length}</div>
                  <div className="text-xs text-gray-500">개의 기록</div>
                </div>
              </div>
            </div>

            <div
              className="bg-white p-4 rounded-2xl shadow-sm border-0 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setCurrentScreen("entry")}
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

          {/* 최근 기록 */}
          {recentEntries.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-800">최근 기록</h2>
              {recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => {
                    setViewingEntry(entry)
                    setCurrentScreen("view")
                  }}
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
          onClick={() => setCurrentScreen("entry")}
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
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">캘린더</h1>
        </div>

        <div className="px-4 py-6 max-w-md mx-auto">
          {/* 캘린더 카드 */}
          <div className="mb-6 p-6 bg-white rounded-2xl shadow-sm border-0">
            <CalendarUI
              mode="single"
              onSelect={handleDateSelect}
              className="mx-auto"
              modifiers={{
                hasEntry: (date) => {
                  const formatted = formatDate(date, "yyyy-MM-dd")
                  return entryDates.includes(formatted)
                },
              }}
              modifiersClassNames={{
                hasEntry: "bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200",
              }}
            />
          </div>

          {/* 안내 카드 */}
          <div className="p-4 bg-blue-50 rounded-2xl border-0">
            <div className="text-center">
              <div className="text-blue-600 mb-2">📅</div>
              <h3 className="font-medium text-blue-900 mb-1">날짜를 선택해보세요</h3>
              <p className="text-sm text-blue-700">기록이 있는 날짜는 파란색으로 표시됩니다</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 기록 작성 화면
  if (currentScreen === "entry") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCurrentScreen("main")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">감정 기록</h1>
            <p className="text-sm text-gray-500">{formatDisplayDate(selectedDate)}</p>
          </div>
        </div>

        <div className="px-4 py-6 max-w-md mx-auto space-y-4">
          {/* 날짜 선택 */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border-0">
            <Label className="mb-2 block">날짜</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border-0 bg-gray-50 rounded-xl"
            />
          </div>

          {/* 기분 선택 */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border-0">
            <Label className="mb-3 block">오늘의 기분</Label>
            <div className="flex justify-between items-center bg-gray-50 rounded-xl p-4">
              {MOOD_CONFIG.map((moodConfig) => (
                <button
                  key={moodConfig.value}
                  onClick={() => setCurrentEntry((prev) => ({ ...prev, mood: moodConfig.value }))}
                  className={cn(
                    "text-2xl p-2 rounded-full transition-all",
                    currentEntry.mood === moodConfig.value ? "bg-blue-100 scale-110" : "hover:bg-white hover:scale-105",
                  )}
                >
                  {moodConfig.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* 감사한 일 */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">감사한 일</h3>
            </div>
            <Textarea
              placeholder="오늘 감사했던 일을 적어보세요"
              value={currentEntry.grateful}
              onChange={(e) => setCurrentEntry((prev) => ({ ...prev, grateful: e.target.value }))}
              className="border-0 bg-gray-50 rounded-xl resize-none"
              rows={3}
            />
          </div>

          {/* 속상한 일 */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Frown className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">속상한 일</h3>
            </div>
            <Textarea
              placeholder="속상했던 일을 적어보세요"
              value={currentEntry.sad}
              onChange={(e) => setCurrentEntry((prev) => ({ ...prev, sad: e.target.value }))}
              className="border-0 bg-gray-50 rounded-xl resize-none"
              rows={3}
            />
          </div>

          {/* 화나는 일 */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Angry className="w-4 h-4 text-red-600" />
              </div>
              <h3 className="font-medium text-gray-900">화나는 일</h3>
            </div>
            <Textarea
              placeholder="화났던 일을 적어보세요"
              value={currentEntry.angry}
              onChange={(e) => setCurrentEntry((prev) => ({ ...prev, angry: e.target.value }))}
              className="border-0 bg-gray-50 rounded-xl resize-none"
              rows={3}
            />
          </div>

          {/* 기타 메모 */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">기타 메모</h3>
            </div>
            <Textarea
              placeholder="기타 기록하고 싶은 내용을 적어보세요"
              value={currentEntry.notes}
              onChange={(e) => setCurrentEntry((prev) => ({ ...prev, notes: e.target.value }))}
              className="border-0 bg-gray-50 rounded-xl resize-none"
              rows={3}
            />
          </div>

          {/* 저장 버튼 */}
          <div className="pt-4">
            <Button
              onClick={saveEntry}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl h-12 text-base font-medium"
            >
              저장하기
            </Button>
          </div>

          {/* 팁 카드 */}
          <div className="bg-yellow-50 p-4 rounded-2xl border-0">
            <div className="text-center">
              <div className="text-yellow-600 mb-2">💡</div>
              <p className="text-sm text-yellow-800">모든 항목을 채우지 않아도 괜찮아요. 편하게 적어보세요!</p>
            </div>
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

  // 기록 보기 화면
  if (currentScreen === "view" && viewingEntry) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCurrentScreen("main")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">기록 보기</h1>
              <p className="text-sm text-gray-500">{formatDisplayDate(viewingEntry.date)}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => {
              setSelectedDate(viewingEntry.date)
              setCurrentScreen("entry")
            }}
          >
            <Edit3 className="w-5 h-5" />
          </Button>
        </div>

        <div className="px-4 py-6 max-w-md mx-auto space-y-4">
          {/* 기분 표시 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border-0 text-center">
            <span className="text-4xl">{getMoodEmoji(viewingEntry.mood || 3)}</span>
          </div>

          {/* 감사한 일 */}
          {viewingEntry.grateful && (
            <div className="bg-white p-4 rounded-2xl shadow-sm border-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900">감사한 일</h3>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{viewingEntry.grateful}</p>
            </div>
          )}

          {/* 속상한 일 */}
          {viewingEntry.sad && (
            <div className="bg-white p-4 rounded-2xl shadow-sm border-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Frown className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900">속상한 일</h3>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{viewingEntry.sad}</p>
            </div>
          )}

          {/* 화나는 일 */}
          {viewingEntry.angry && (
            <div className="bg-white p-4 rounded-2xl shadow-sm border-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Angry className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="font-medium text-gray-900">화나는 일</h3>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{viewingEntry.angry}</p>
            </div>
          )}

          {/* 기타 메모 */}
          {viewingEntry.notes && (
            <div className="bg-white p-4 rounded-2xl shadow-sm border-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900">기타 메모</h3>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{viewingEntry.notes}</p>
            </div>
          )}

          {/* 수정/삭제 버튼 */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setSelectedDate(viewingEntry.date)
                setCurrentScreen("entry")
              }}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              수정
            </Button>
            <Button variant="destructive" className="flex-1" onClick={() => deleteEntry(viewingEntry.id)}>
              <Trash2 className="w-4 h-4 mr-2" />
              삭제
            </Button>
          </div>

          {/* 작성 시간 */}
          <div className="bg-gray-100 p-3 rounded-2xl border-0">
            <p className="text-xs text-gray-500 text-center">
              {viewingEntry.updatedAt !== viewingEntry.createdAt ? "수정됨" : "작성됨"}:{" "}
              {new Date(viewingEntry.updatedAt).toLocaleString("ko-KR")}
            </p>
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

  return null
}
