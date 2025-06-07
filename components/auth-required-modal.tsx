"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface AuthRequiredModalProps {
  isOpen: boolean
  onClose: () => void
  action?: "save" | "view" | "general"
}

export function AuthRequiredModal({ isOpen, onClose, action = "general" }: AuthRequiredModalProps) {
  const router = useRouter()
  const [isClosing, setIsClosing] = useState(false)

  if (!isOpen) return null

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 300)
  }

  const handleLogin = () => {
    router.push("/login")
  }

  const handleRegister = () => {
    router.push("/register")
  }

  let title = "로그인이 필요합니다"
  let message = "이 기능을 사용하려면 로그인이 필요합니다."

  if (action === "save") {
    title = "기록을 저장하려면 로그인하세요"
    message = "감정 기록을 저장하고 언제든지 다시 볼 수 있도록 계정에 로그인해주세요."
  } else if (action === "view") {
    title = "기록을 보려면 로그인하세요"
    message = "저장된 감정 기록을 보려면 계정에 로그인해주세요."
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />

      {/* 모달 */}
      <div
        className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-6 transition-all duration-300 ${
          isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* 내용 */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400">{message}</p>
        </div>

        {/* 버튼 */}
        <div className="space-y-3">
          <Button onClick={handleLogin} className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl h-12">
            로그인
          </Button>
          <Button
            onClick={handleRegister}
            variant="outline"
            className="w-full border-gray-200 hover:bg-gray-50 rounded-xl h-12"
          >
            회원가입
          </Button>
        </div>
      </div>
    </div>
  )
}
