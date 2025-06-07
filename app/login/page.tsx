"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toast, useToast } from "@/components/ui/toast"

// API 함수 import
import { loginApi, handleApiError } from "@/lib/api"
import { saveAuthData } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered")
  const expired = searchParams.get("expired")

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { toast, showToast } = useToast()

  useEffect(() => {
    if (registered) {
      setSuccessMessage("회원가입이 완료되었습니다. 로그인해주세요.")
    }

    if (expired) {
      setError("인증이 만료되었습니다. 다시 로그인해주세요.")
    }
  }, [registered, expired])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.email || !formData.password) {
      setError("이메일과 비밀번호를 모두 입력해주세요")
      return
    }

    setLoading(true)

    try {
      const authResponse = await loginApi(formData.email, formData.password)

      // 인증 데이터 저장
      saveAuthData(authResponse)

      showToast("로그인 성공!", "success")

      // 약간의 지연 후 메인 페이지로 이동
      setTimeout(() => {
        router.push("/")
      }, 1000)
    } catch (error) {
      setError(handleApiError(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 shadow-sm">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900">로그인</h1>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">다시 만나서 반가워요!</h2>
          <p className="text-gray-600">계정에 로그인하고 감정 기록을 이어가세요</p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">
              이메일
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              className="bg-white border border-gray-200 rounded-xl p-3 h-12"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password" className="text-gray-700">
                비밀번호
              </Label>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                비밀번호 찾기
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호 입력"
                value={formData.password}
                onChange={handleChange}
                className="bg-white border border-gray-200 rounded-xl p-3 h-12 pr-10"
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl h-12 text-base font-medium"
            disabled={loading}
          >
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            계정이 없으신가요?{" "}
            <Link href="/register" className="text-blue-600 font-medium hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </div>
      {toast && <Toast {...toast} />}
    </div>
  )
}
