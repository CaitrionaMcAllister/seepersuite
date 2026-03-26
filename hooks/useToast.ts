'use client'

import { createContext, useContext } from 'react'

export type ToastVariant = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (message: string, variant?: ToastVariant) => void
  removeToast: (id: string) => void
}

export const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
})

export function useToast() {
  const ctx = useContext(ToastContext)
  return {
    toast: (message: string, variant: ToastVariant = 'success') =>
      ctx.addToast(message, variant),
    toasts: ctx.toasts,
    removeToast: ctx.removeToast,
  }
}
