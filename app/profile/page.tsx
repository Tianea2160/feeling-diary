"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Mail, Shield, Key, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Toast, useToast } from "@/components/ui/toast"
import { fetchApi, API_ENDPOINTS, handleApiError } from "@/lib/api"
import { getUser, logout, isLoggedIn } from "@/lib/auth"
import { useEmotionRecords } from "@/hooks/use-emotion-records"

export default function ProfilePage() {
  const router = useRouter()
  const { toast, showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const { records } = useEmotionRecords()

  useEffect(() => {
    // 로그인 상태 확인
    if (!isLoggedIn()) {
      router.push("/login?redirect=profile")
      return
    }

    // 사용자 정보 가져오기
    const fetchUserData = async () => {
      setLoading(true)
      try {
        // 먼저 로컬 스토리지에서 기본 정보 가져오기
        const localUser = getUser()
        if (localUser) {
          setUser(localUser)
        }

        // API에서 최신 정보 가져오기
        const response = await fetchApi(API_ENDPOINTS.USER_ME, { method: "GET" }, true)
        if (response) {
          setUser(response)
        }
      } catch (error) {
        console.error("사용자 정보 조회 실패:", error)
        showToast(handleApiError(error), "error")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router, showToast])

  const handleLogout = () => {
    logout()
    showToast("로그아웃 되었습니다", "success")
    setTimeout(() => {
      router.push("/")
    }, 1000)
  }

  const handleChangePassword = () => {
    // 비밀번호 변경 페이지로 이동 (미구현)
    showToast("비밀번호 변경 기능은 준비 중입니다", "info")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">프로필</h1>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 프로필 카드 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name || "사용자"}</h2>
              <p className="text-gray-500">{user?.role === "USER" ? "일반 사용자" : "관리자"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-700">
              <Mail className="w-5 h-5 text-gray-500" />
              <span>{user?.email || "이메일 정보 없음"}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Shield className="w-5 h-5 text-gray-500" />
              <span>계정 유형: {user?.role === "USER" ? "일반 사용자" : "관리자"}</span>
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">나의 기록 통계</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-600 mb-1">총 기록 수</p>
              <p className="text-2xl font-bold text-gray-900">{records.length}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-sm text-green-600 mb-1">이번 달 기록</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  records.filter(
                    (record) =>
                      new Date(record.date).getMonth() === new Date().getMonth() &&
                      new Date(record.date).getFullYear() === new Date().getFullYear(),
                  ).length
                }
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-sm text-purple-600 mb-1">연속 기록</p>
              <p className="text-2xl font-bold text-gray-900">3일</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-sm text-amber-600 mb-1">평균 기분</p>
              <p className="text-2xl font-bold text-gray-900">😊</p>
            </div>
          </div>
        </div>

        {/* 계정 관리 */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">계정 관리</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-3 h-12" onClick={handleChangePassword}>
              <Key className="w-5 h-5 text-gray-500" />
              <span>비밀번호 변경</span>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12 text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span>로그아웃</span>
            </Button>
          </div>
        </div>
      </div>

      {toast && <Toast {...toast} />}
    </div>
  )
}
