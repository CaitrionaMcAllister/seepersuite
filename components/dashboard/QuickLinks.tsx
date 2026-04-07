import Link from 'next/link'
import {
  Radio, BookOpen, Sparkles, Settings2, LayoutGrid, Users, Star, ArrowRight,
} from 'lucide-react'
import { QUICK_LINKS } from '@/lib/constants'
import type { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  Radio, BookOpen, Sparkles, Settings2, LayoutGrid, Users, Star,
}

// Map each section href to its CSS var so theme editor changes propagate here
const HREF_COLOR_VAR: Record<string, string> = {
  '/news':      'var(--color-news)',
  '/wiki':      'var(--color-quantum)',
  '/prompts':   'var(--color-volt)',
  '/tools':     'var(--color-circuit)',
  '/resources': 'var(--color-fern)',
  '/team':      'var(--color-us)',
  '/inside':    'var(--color-inside)',
}

// Routes whose default colors are light-background — need dark icons
// (circuit=#DCFEAD, volt=#EDDE5C, fern=#8ACB8F)
const LIGHT_HREFS = new Set(['/tools', '/prompts', '/resources'])

export default function QuickLinks() {
  return (
    <div className="grid grid-cols-4 xl:grid-cols-7 gap-3">
      {QUICK_LINKS.map(link => {
        const Icon = ICON_MAP[link.icon]
        const colorVar = HREF_COLOR_VAR[link.href] ?? `var(--color-cta)`
        const iconColor = LIGHT_HREFS.has(link.href) ? '#111111' : '#ffffff'
        return (
          <Link
            key={link.href}
            href={link.href}
            className="seeper-card glow-on-hover p-4 flex flex-col items-center gap-3 hover:bg-seeper-raised transition-colors duration-200 group"
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: colorVar, opacity: 0.9 }}
            >
              {Icon && <Icon size={22} style={{ color: iconColor }} />}
            </div>
            <span className="font-display font-semibold text-seeper-white text-sm text-center leading-tight">
              {link.label}
            </span>
            <ArrowRight
              size={14}
              className="text-seeper-muted group-hover:text-plasma transition-colors mt-auto"
            />
          </Link>
        )
      })}
    </div>
  )
}
