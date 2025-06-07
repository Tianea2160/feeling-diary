"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Settings, User, LogIn, LogOut, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getUser, logout, isLoggedIn } from "@/lib/auth"

export function SettingsMenu() {
  const router = useRouter()
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)

  // 로그인 상태 및 사용자 정보 확인
  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = isLoggedIn()
      setIsUserLoggedIn(loggedIn)

      if (loggedIn) {
        const user = getUser()
        if (user) {
          setUserName(user.name || "사용자")
        }
      }
    }

    checkLoginStatus()

    // 로컬 스토리지 변경 감지
    const handleStorageChange = () => {
      checkLoginStatus()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const handleLogin = () => {
    router.push("/login")
  }

  const handleRegister = () => {
    router.push("/register")
  }

  const handleLogout = () => {
    logout()
    setIsUserLoggedIn(false)
    setUserName(null)

    // 로컬 스토리지 이벤트 발생 (다른 탭에서도 로그아웃 상태 반영)
    window.localStorage.setItem("logout-event", Date.now().toString())

    // 메인 페이지 새로고침으로 로그아웃 상태 반영
    window.location.reload()
  }

  const handleProfile = () => {
    // TODO: 프로필 페이지 구현 후 연결
    console.log("프로필 페이지로 이동")
  }

  const handleSettings = () => {
    // TODO: 설정 페이지 구현 후 연결
    console.log("설정 페이지로 이동")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {isUserLoggedIn ? (
          <>
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-gray-900">{userName}님</p>
              <p className="text-xs text-gray-500">로그인됨</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfile}>
              <User className="w-4 h-4 mr-3" />
              프로필
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettings}>
              <Settings className="w-4 h-4 mr-3" />
              설정
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-3" />
              로그아웃
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <div className="px-3 py-2">
              <p className="text-sm text-gray-500">로그인하여 기록을 저장하세요</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogin}>
              <LogIn className="w-4 h-4 mr-3" />
              로그인
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRegister}>
              <UserPlus className="w-4 h-4 mr-3" />
              회원가입
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
