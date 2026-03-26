'use client'

import { useState, useCallback, useEffect } from 'react'
import { ToastContext, Toast, ToastVariant } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

const VARIANT_STYLES: Record<ToastVariant, { border: string; icon: string }> = {
  success: { border: 'border-l-green-500',  icon: '✓' },
  error:   { border: 'border-l-red-500',    icon: '✕' },
  info:    { border: 'border-l-quantum',     icon: 'ℹ' },
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 3000)
    return () => clearTimeout(timer)
  }, [onRemove])

  const { border, icon } = VARIANT_STYLES[toast.variant]

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 pr-4 rounded-xl border border-seeper-border/40 border-l-[3px]',
        'bg-[var(--color-surface)] shadow-card text-sm',
        'animate-[slideInFromBottom_0.3s_ease]',
        border
      )}
    >
      <span className="text-base leading-none mt-0.5">{icon}</span>
      <span className="flex-1 text-[var(--color-text)]">{toast.message}</span>
      <button
        onClick={onRemove}
        className="text-[var(--color-muted)] hover:text-[var(--color-text)] text-xs"
      >
        ✕
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, variant }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 w-[320px]">
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
