"use client"

import { shouldShowDevInfo, CONFIG } from "@/lib/config"

interface DevInfoProps {
  type?: "login" | "register" | "api-status"
  className?: string
}

export function DevInfo({ type = "login", className = "" }: DevInfoProps) {
  // 개발 정보를 표시할지 확인
  if (!shouldShowDevInfo()) {
    return null
  }

  const renderContent = () => {
    switch (type) {
      case "login":
        return (
          <>
            <p className="font-medium mb-1">🔧 개발 모드</p>
            <p>
              테스트 계정: {CONFIG.dev.testEmail} / {CONFIG.dev.testPassword}
            </p>
            <p className="text-xs mt-1 opacity-75">API 모드: {CONFIG.apiMode}</p>
          </>
        )

      case "register":
        return (
          <>
            <p className="font-medium mb-1">🔧 개발 모드</p>
            <p>목업 데이터로 회원가입이 시뮬레이션됩니다</p>
            <p className="text-xs mt-1 opacity-75">API 모드: {CONFIG.apiMode}</p>
          </>
        )

      case "api-status":
        return (
          <>
            <p className="font-medium mb-1">🔧 API 상태</p>
            <p>모드: {CONFIG.apiMode === "mock" ? "목업" : "실제"}</p>
            <p className="text-xs mt-1 opacity-75">환경: {CONFIG.isDevelopment ? "개발" : "프로덕션"}</p>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className={`p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm ${className}`}>
      {renderContent()}
    </div>
  )
}
