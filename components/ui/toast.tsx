"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export interface ToastProps {
  message: string
  type?: "success" | "error" | "warning" | "info"
  onClose?: () => void
  duration?: number
}

export function Toast({ message, type = "info", onClose, duration = 3000 }: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      if (onClose) {
        setTimeout(onClose, 300) // 애니메이션 후 onClose 호출
      }
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor = React.useMemo(() => {
    switch (type) {
      case "success":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      case "warning":
        return "bg-amber-500"
      case "info":
      default:
        return "bg-blue-500"
    }
  }, [type])

  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0",
      )}
    >
      <div className={cn("px-4 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-2", bgColor)}>
        <span>{message}</span>
        {onClose && (
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className="p-1 hover:bg-white/20 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = React.useState<ToastProps | null>(null)

  const showToast = React.useCallback(
    (message: string, type: "success" | "error" | "warning" | "info" = "info", duration = 3000) => {
      setToast({ message, type, duration, onClose: () => setToast(null) })
    },
    [],
  )

  const hideToast = React.useCallback(() => {
    setToast(null)
  }, [])

  return {
    toast,
    showToast,
    hideToast,
  }
}
