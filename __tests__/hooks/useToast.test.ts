import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ToastContext } from '@/hooks/useToast'
import { useToast } from '@/hooks/useToast'
import React from 'react'

describe('useToast', () => {
  it('returns toast function', () => {
    const { result } = renderHook(() => useToast(), {
      wrapper: ({ children }) =>
        React.createElement(ToastContext.Provider, {
          value: { toasts: [], addToast: () => {}, removeToast: () => {} },
          children,
        }),
    })
    expect(typeof result.current.toast).toBe('function')
  })
})
