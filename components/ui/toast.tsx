"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, XCircle } from "lucide-react"

interface ToastProps {
  message: string
  type?: "success" | "error"
  duration?: number
}

export function Toast({ message, type = "success", duration = 3000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm",
          type === "success" ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white",
        )}
      >
        {type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  )
}
