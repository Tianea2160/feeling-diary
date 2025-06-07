"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
  className?: string
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
  className?: string
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
  className?: string
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}

const DropdownMenuContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {},
})

export function DropdownMenu({ children, className }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (open) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("click", handleClickOutside)
    }

    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [open])

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className={cn("relative", className)}>{children}</div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuTrigger({ children, className }: DropdownMenuTriggerProps) {
  const { open, setOpen } = React.useContext(DropdownMenuContext)

  return (
    <button
      className={cn("outline-none", className)}
      onClick={(e) => {
        e.stopPropagation()
        setOpen(!open)
      }}
    >
      {children}
    </button>
  )
}

export function DropdownMenuContent({ children, align = "end", className }: DropdownMenuContentProps) {
  const { open } = React.useContext(DropdownMenuContext)

  if (!open) return null

  return (
    <div
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-xl border border-gray-200 bg-white p-1 shadow-lg",
        align === "end" && "right-0",
        align === "start" && "left-0",
        align === "center" && "left-1/2 transform -translate-x-1/2",
        "top-full mt-2",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  )
}

export function DropdownMenuItem({ children, onClick, className, disabled }: DropdownMenuItemProps) {
  const { setOpen } = React.useContext(DropdownMenuContext)

  return (
    <button
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors",
        "hover:bg-gray-100 focus:bg-gray-100",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      onClick={() => {
        if (!disabled && onClick) {
          onClick()
          setOpen(false)
        }
      }}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("my-1 h-px bg-gray-200", className)} />
}
