'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type Theme = 'dark' | 'light'

export const DEFAULT_COLORS: Record<string, string> = {
  // Accent & hero — independently editable
  '--color-cta':       '#ED693A',
  '--color-dashboard': '#ED693A',
  '--color-news':      '#ED693A',
  '--color-admin':     '#ED693A',
  // Section palette
  '--color-quantum':   '#B0A9CF',
  '--color-circuit':   '#DCFEAD',
  '--color-fern':      '#8ACB8F',
  '--color-volt':      '#EDDE5C',
  '--color-inside':    '#D4537E',
  '--color-us':        '#1D9E75',
}

const STORAGE_KEY = 'seeperwiki-colors'

function applyColors(overrides: Record<string, string>) {
  const root = document.documentElement
  // Reset all to defaults first
  Object.entries(DEFAULT_COLORS).forEach(([k, v]) => root.style.setProperty(k, v))
  // Apply overrides
  Object.entries(overrides).forEach(([k, v]) => root.style.setProperty(k, v))
}

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  colorOverrides: Record<string, string>
  setColor: (varName: string, hex: string) => void
  resetColors: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
  colorOverrides: {},
  setColor: () => {},
  resetColors: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [colorOverrides, setColorOverrides] = useState<Record<string, string>>({})

  useEffect(() => {
    // Dark/light mode
    const storedTheme = localStorage.getItem('seeper-theme') as Theme | null
    const initial = storedTheme ?? 'dark'
    setTheme(initial)
    document.documentElement.classList.toggle('light', initial === 'light')

    // Section color overrides
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const overrides: Record<string, string> = stored ? JSON.parse(stored) : {}
      setColorOverrides(overrides)
      applyColors(overrides)
    } catch {
      applyColors({})
    }
  }, [])

  function toggleTheme() {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('seeper-theme', next)
      document.documentElement.classList.toggle('light', next === 'light')
      return next
    })
  }

  const setColor = useCallback((varName: string, hex: string) => {
    setColorOverrides(prev => {
      const next = { ...prev, [varName]: hex }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      applyColors(next)
      return next
    })
  }, [])

  const resetColors = useCallback(() => {
    setColorOverrides({})
    localStorage.removeItem(STORAGE_KEY)
    applyColors({})
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colorOverrides, setColor, resetColors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
