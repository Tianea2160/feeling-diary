"use client"

import { useState, useCallback } from "react"
import { isLoggedIn } from "@/lib/auth"

export function useAuthGuard() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalAction, setAuthModalAction] = useState<"save" | "view" | "general">("general")

  const checkAuth = useCallback((action: "save" | "view" | "general" = "general"): boolean => {
    const authenticated = isLoggedIn()

    if (!authenticated) {
      setAuthModalAction(action)
      setShowAuthModal(true)
      return false
    }

    return true
  }, [])

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false)
  }, [])

  return {
    showAuthModal,
    authModalAction,
    checkAuth,
    closeAuthModal,
    isAuthenticated: isLoggedIn(),
  }
}
