import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cn, getGreeting, formatDate, getInitials } from '@/lib/utils'

describe('cn', () => {
  it('merges class strings', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('handles conditional classes', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c')
  })

  it('deduplicates Tailwind conflicts', () => {
    // tailwind-merge keeps the last conflicting class
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
  })
})

describe('getGreeting', () => {
  it('returns Good morning before noon', () => {
    const date = new Date()
    date.setHours(9)
    expect(getGreeting('Alex', date)).toBe('Good morning, Alex')
  })

  it('returns Good afternoon between noon and 17', () => {
    const date = new Date()
    date.setHours(14)
    expect(getGreeting('Alex', date)).toBe('Good afternoon, Alex')
  })

  it('returns Good evening at 18 or later', () => {
    const date = new Date()
    date.setHours(19)
    expect(getGreeting('Alex', date)).toBe('Good evening, Alex')
  })
})

describe('getInitials', () => {
  it('returns two initials from full name', () => {
    expect(getInitials('Alex Johnson')).toBe('AJ')
  })

  it('returns single initial for single name', () => {
    expect(getInitials('Alex')).toBe('A')
  })

  it('returns ?? for empty string', () => {
    expect(getInitials('')).toBe('??')
  })

  it('uppercases initials', () => {
    expect(getInitials('john doe')).toBe('JD')
  })
})

describe('formatDate', () => {
  it('formats a date string as weekday, day month year', () => {
    const result = formatDate('2026-03-25')
    expect(result).toContain('2026')
    expect(result).toContain('March')
  })
})
