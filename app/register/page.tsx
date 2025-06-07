"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toast, useToast } from "@/components/ui/toast"
import { DevInfo } from "@/components/dev-info"

// API 함수 import
import { registerApi } from "@/lib/api"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const { toast, showToast } = useToast()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다"
    }

    if (!formData.name) {
      newErrors.name = "이름을 입력해주세요"
    }

    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요"
    } else if (formData.password.length < 8) {
      newErrors.password = "비밀번호는 8자 이상이어야 합니다"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    if (!validateForm()) return

    setLoading(true)

    try {
      // 개선된 API 호출
      await registerApi(formData.email, formData.name, formData.password)

      showToast("회원가입이 완료되었습니다!", "success")

      setTimeout(() => {
        router.push("/login?registered=true")
      }, 1000)
    } catch (error) {
      console.error("회원가입 오류:", error)
      setApiError(error instanceof Error ? error.message : "회원가입 중 오류가 발생했습니다")
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
        <h1 className="text-lg font-semibold text-gray-900">회원가입</h1>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">환영합니다!</h2>
          <p className="text-gray-600">계정을 생성하고 감정 기록을 시작하세요</p>
        </div>

        {/* 개발 모드 안내 - 개발 환경에서만 표시 */}
        <DevInfo type="register" className="mb-6" />

        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{apiError}</div>
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
              className={`bg-white border ${errors.email ? "border-red-500" : "border-gray-200"} rounded-xl p-3 h-12`}
              disabled={loading}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700">
              이름
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="홍길동"
              value={formData.name}
              onChange={handleChange}
              className={`bg-white border ${errors.name ? "border-red-500" : "border-gray-200"} rounded-xl p-3 h-12`}
              disabled={loading}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">
              비밀번호
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="8자 이상 입력"
                value={formData.password}
                onChange={handleChange}
                className={`bg-white border ${errors.password ? "border-red-500" : "border-gray-200"} rounded-xl p-3 h-12 pr-10`}
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
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-700">
              비밀번호 확인
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호 재입력"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`bg-white border ${errors.confirmPassword ? "border-red-500" : "border-gray-200"} rounded-xl p-3 h-12`}
              disabled={loading}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl h-12 text-base font-medium"
            disabled={loading}
          >
            {loading ? "처리 중..." : "회원가입"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
      {toast && <Toast {...toast} />}
    </div>
  )
}
