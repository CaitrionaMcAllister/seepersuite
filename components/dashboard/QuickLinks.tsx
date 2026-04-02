import Link from 'next/link'
import {
  Radio, BookOpen, Sparkles, Settings2, LayoutGrid, Users, Star, ArrowRight,
} from 'lucide-react'
import { QUICK_LINKS } from '@/lib/constants'
import type { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  Radio, BookOpen, Sparkles, Settings2, LayoutGrid, Users, Star,
}

// Light-background accents need a dark icon; dark backgrounds use white
const LIGHT_ACCENTS = new Set(['#DCFEAD', '#EDDE5C', '#8ACB8F'])

export default function QuickLinks() {
  return (
    <div className="grid grid-cols-4 xl:grid-cols-7 gap-3">
      {QUICK_LINKS.map(link => {
        const Icon = ICON_MAP[link.icon]
        const iconColor = LIGHT_ACCENTS.has(link.accent) ? '#111111' : '#ffffff'
        return (
          <Link
            key={link.href}
            href={link.href}
            className="seeper-card glow-on-hover p-4 flex flex-col items-center gap-3 hover:bg-seeper-raised transition-colors duration-200 group"
          >
            {/* Circular icon */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: link.accent, opacity: 0.9 }}
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
