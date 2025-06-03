"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme()

  const themes = [
    { value: "light" as const, icon: Sun, label: "라이트" },
    { value: "dark" as const, icon: Moon, label: "다크" },
    { value: "system" as const, icon: Monitor, label: "시스템" },
  ]

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
      <div className="flex items-center gap-3">
        {actualTheme === "dark" ? (
          <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        ) : (
          <Sun className="w-5 h-5 text-yellow-600" />
        )}
        <span className="font-medium text-gray-900 dark:text-gray-100">테마</span>
      </div>

      <div className="flex bg-white dark:bg-gray-700 rounded-lg p-1 gap-1">
        {themes.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`
              flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all
              ${
                theme === value
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              }
            `}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
