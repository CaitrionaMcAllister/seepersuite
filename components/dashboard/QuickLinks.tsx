import Link from 'next/link'
import {
  Newspaper, BookOpen, Sparkles, Mail, Wrench, FolderOpen, ArrowRight,
} from 'lucide-react'
import { QUICK_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  Newspaper, BookOpen, Sparkles, Mail, Wrench, FolderOpen,
}

export default function QuickLinks() {
  return (
    <div className="grid grid-cols-3 xl:grid-cols-6 gap-3">
      {QUICK_LINKS.map(link => {
        const Icon = ICON_MAP[link.icon]
        return (
          <Link
            key={link.href}
            href={link.href}
            className="seeper-card glow-on-hover p-4 flex flex-col items-center gap-3 hover:bg-seeper-raised transition-colors duration-200 group"
          >
            {/* Circular icon */}
            <div
              className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0',
                link.accent
              )}
              style={{ opacity: 0.85 }}
            >
              {Icon && <Icon size={22} className="text-seeper-black" />}
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
