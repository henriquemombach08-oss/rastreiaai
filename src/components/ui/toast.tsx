"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export interface ToastProps {
  message: string
  type?: "success" | "error" | "info"
  onClose: () => void
}

export function Toast({ message, type = "info", onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-medium animate-in slide-in-from-bottom-4",
        {
          "bg-green-600 text-white": type === "success",
          "bg-red-600 text-white": type === "error",
          "bg-neutral-800 text-white": type === "info",
        }
      )}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = React.useState<Omit<ToastProps, "onClose"> | null>(null)

  const showToast = React.useCallback((props: Omit<ToastProps, "onClose">) => {
    setToast(props)
  }, [])

  const hideToast = React.useCallback(() => setToast(null), [])

  const ToastComponent = toast ? (
    <Toast {...toast} onClose={hideToast} />
  ) : null

  return { showToast, ToastComponent }
}
