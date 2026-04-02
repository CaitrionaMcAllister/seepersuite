import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely, resolving conflicts */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Compute Easter Sunday for a given year (Anonymous Gregorian algorithm) */
function getEasterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month, day)
}

/** Return a UK-aware greeting for the given name, checking holidays first */
export function getGreeting(name: string, date: Date = new Date()): string {
  const month = date.getMonth()   // 0-indexed
  const day   = date.getDate()
  const hour  = date.getHours()
  const year  = date.getFullYear()

  const easter       = getEasterSunday(year)
  const easterMonth  = easter.getMonth()
  const easterDay    = easter.getDate()

  // Good Friday (Easter - 2 days)
  const goodFriday = new Date(easter); goodFriday.setDate(easter.getDate() - 2)
  // Easter Monday (Easter + 1 day)
  const easterMonday = new Date(easter); easterMonday.setDate(easter.getDate() + 1)

  const is = (m: number, d: number) => month === m && day === d

  // UK national holidays & special days
  if (is(0, 1))  return `Happy New Year, ${name}!`
  if (is(1, 14)) return `Happy Valentine's Day, ${name} 💌`
  if (is(2, 17)) return `Happy St Patrick's Day, ${name}`
  if (month === goodFriday.getMonth()    && day === goodFriday.getDate())    return `Good Friday, ${name} — enjoy the long weekend`
  if (month === easterMonth              && day === easterDay)               return `Happy Easter, ${name} 🐣`
  if (month === easterMonday.getMonth()  && day === easterMonday.getDate())  return `Happy Easter Monday, ${name}`
  if (is(3, 1))  return `April Fools' Day — watch your back, ${name} 👀`
  if (is(3, 23)) return `Happy St George's Day, ${name}`
  if (is(10, 31)) return `Happy Halloween, ${name} 🎃`
  if (is(11, 5))  return `Remember remember, ${name}`
  if (is(11, 11)) return `Remembrance Day — lest we forget, ${name}`
  if (is(11, 24)) return `Happy Christmas Eve, ${name} 🎄`
  if (is(11, 25)) return `Merry Christmas, ${name} 🎄`
  if (is(11, 26)) return `Happy Boxing Day, ${name}`
  if (is(11, 31)) return `Happy New Year's Eve, ${name} 🥂`

  // Time-of-day fallback
  if (hour < 12) return `Good morning, ${name}`
  if (hour < 17) return `Good afternoon, ${name}`
  return `Good evening, ${name}`
}

/** Format a date as "Wednesday, 25 March 2026" */
export function formatDate(dateInput: string | Date = new Date()): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Get initials from a full name (up to 2 characters) */
export function getInitials(name: string): string {
  if (!name.trim()) return '??'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Return a human-readable relative time string from an ISO date string */
export function relativeTime(isoString: string): string {
  const ts = new Date(isoString).getTime()
  if (isNaN(ts)) return '—'
  const diff = Date.now() - ts
  if (diff < 0) return 'just now'
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1)  return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24)   return `${hours}h ago`
  return `${days}d ago`
}
