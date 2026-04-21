'use client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home, Radio, BookOpen, Settings2, LayoutGrid, Sparkles,
  Star, Users, Shield,
  ChevronLeft, ChevronRight, LogOut, UserCircle, type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_SECTIONS } from '@/lib/constants'
import Avatar from '@/components/ui/Avatar'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import { useTheme, DEFAULT_COLORS } from '@/components/providers/ThemeProvider'

// Map icon name strings from constants to actual Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  Home, Radio, BookOpen, Settings2, LayoutGrid, Sparkles,
  Star, Users, Shield,
}

// Map nav href to CSS var — each route gets its own independently-editable color
const HREF_COLOR_VAR: Record<string, string> = {
  '/dashboard': 'var(--color-dashboard)',
  '/news':      'var(--color-news)',
  '/wiki':      'var(--color-quantum)',
  '/tools':     'var(--color-circuit)',
  '/resources': 'var(--color-fern)',
  '/prompts':   'var(--color-volt)',
  '/inside':    'var(--color-inside)',
  '/team':      'var(--color-us)',
  '/admin':     'var(--color-admin)',
}

// CSS var name (without var()) for each route — used to resolve actual hex
const HREF_COLOR_VAR_NAME: Record<string, string> = {
  '/dashboard': '--color-dashboard',
  '/news':      '--color-news',
  '/wiki':      '--color-quantum',
  '/tools':     '--color-circuit',
  '/resources': '--color-fern',
  '/prompts':   '--color-volt',
  '/inside':    '--color-inside',
  '/team':      '--color-us',
  '/admin':     '--color-admin',
}

// Compute perceived brightness (0–255) from a hex color
function perceivedBrightness(hex: string): number {
  const h = hex.replace('#', '')
  if (h.length < 6) return 128
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000
}

// Returns the best contrasting icon color (white or near-black) for a background hex
function contrastIcon(hex: string): string {
  return perceivedBrightness(hex) > 160 ? '#111111' : '#ffffff'
}

interface SidebarProps {
  profile: Profile | null
  onSignOut?: () => void
}

export default function Sidebar({ profile, onSignOut }: SidebarProps) {
  const router = useRouter()
  const { colorOverrides } = useTheme()

  async function handleSignOut() {
    if (onSignOut) {
      onSignOut()
      return
    }
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push('/auth')
  }
  const [collapsed, setCollapsed] = useState(false)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [hoveredHref, setHoveredHref] = useState<string | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const isAdmin = profile?.role === 'admin'

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false)
      }
    }
    if (popoverOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [popoverOpen])

  return (
    <aside
      className={cn(
        'flex flex-col h-screen sticky top-0 bg-seeper-surface border-r border-seeper-border transition-all duration-300 z-40',
        collapsed ? 'w-[60px]' : 'w-[240px]'
      )}
    >
      {/* Header — logo */}
      <div className={cn(
        'flex items-center border-b border-seeper-border px-3 py-4',
        collapsed ? 'justify-center' : 'justify-between gap-2'
      )}>
        <Link href="/dashboard" className={cn('flex items-center gap-3 min-w-0', collapsed && 'justify-center')}>
          {/* Logo mark in branded circle */}
          <span className="logo-circle flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center">
            <Image src="/logo.svg" alt="seeper" width={24} height={24} priority style={{ objectFit: 'contain' }} />
          </span>
          {!collapsed && (
            <span className="font-display font-bold text-base tracking-tight text-seeper-white">seeper</span>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(c => !c)}
            className="text-seeper-muted hover:text-seeper-white transition-colors flex-shrink-0"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed(c => !c)}
            className="absolute right-0 top-[52px] -mr-3 w-6 h-6 rounded-full bg-seeper-surface border border-seeper-border flex items-center justify-center text-seeper-muted hover:text-seeper-white transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight size={12} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {NAV_SECTIONS.map((section, sectionIndex) => (
          <div key={section.label || `divider-${sectionIndex}`} className="mb-6">
            {/* Divider section */}
            {section.divider && <hr className="border-seeper-border mb-4" />}

            {/* Section label */}
            {!collapsed && section.label && (
              <p className="section-label px-2 mb-2">{section.label}</p>
            )}

            {section.items.map(item => {
              // Hide admin item for non-admins
              if (item.adminOnly && !isAdmin) return null

              const Icon = ICON_MAP[item.icon]
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              const isHovered = hoveredHref === item.href && !isActive

              // Resolve to CSS var string for inline styles
              const resolvedColor = HREF_COLOR_VAR[item.href] ?? item.color

              // Resolve actual hex for brightness computation
              const varName = HREF_COLOR_VAR_NAME[item.href]
              const actualHex = (varName && (colorOverrides[varName] ?? DEFAULT_COLORS[varName])) ?? item.color

              // Always compute contrast against the real color so white/light picks stay visible
              const iconColor = isActive ? contrastIcon(actualHex) : resolvedColor

              const iconBg = isActive
                ? resolvedColor
                : isHovered
                  ? `color-mix(in srgb, ${resolvedColor} 28%, transparent)`
                  : `color-mix(in srgb, ${resolvedColor} 16%, transparent)`

              const itemStyle = isActive ? {
                borderLeftColor: resolvedColor,
                backgroundColor: `color-mix(in srgb, ${resolvedColor} 8%, transparent)`,
              } : {}

              const textStyle = isActive ? { color: resolvedColor } : {}

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={itemStyle}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg border-l-2 border-transparent',
                    'transition-all duration-150',
                    isActive ? '' : 'hover:bg-white/5'
                  )}
                  title={collapsed ? item.label : undefined}
                  onMouseEnter={() => setHoveredHref(item.href)}
                  onMouseLeave={() => setHoveredHref(null)}
                >
                  <span
                    style={{ backgroundColor: iconBg, color: iconColor }}
                    className="w-7 h-7 flex items-center justify-center rounded-md flex-shrink-0 transition-all duration-150"
                  >
                    {Icon && <Icon size={14} style={{ color: iconColor }} />}
                  </span>
                  {!collapsed && (
                    <span
                      style={textStyle}
                      className="font-display font-medium text-sm truncate transition-all duration-150 text-seeper-steel"
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User profile + popover */}
      <div className="border-t border-seeper-border p-3 relative" ref={popoverRef}>
        {/* Popover */}
        {popoverOpen && (
          <div className="absolute bottom-full left-2 right-2 mb-2 bg-seeper-surface border border-seeper-border rounded-xl shadow-xl p-4 z-50">
            <div className="flex items-center gap-3 mb-3">
              <Avatar
                src={profile?.avatar_url}
                name={profile?.display_name ?? profile?.full_name}
                color={profile?.avatar_color}
                size={40}
              />
              <div className="min-w-0">
                <p className="font-display font-medium text-seeper-white text-sm truncate">
                  {profile?.display_name ?? profile?.full_name ?? 'Caitriona'}
                </p>
                <p className="text-seeper-muted text-xs capitalize">{profile?.job_title ?? 'Creative Technologist'}</p>
              </div>
            </div>
            <div className="space-y-1">
              <Link
                href="/profile"
                onClick={() => setPopoverOpen(false)}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-seeper-steel hover:bg-white/5 hover:text-seeper-white transition-colors"
              >
                <UserCircle size={15} />
                View profile
              </Link>
              <button
                type="button"
                onClick={() => { setPopoverOpen(false); handleSignOut() }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-seeper-steel hover:bg-white/5 hover:text-seeper-white transition-colors"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setPopoverOpen(o => !o)}
          className={cn('flex items-center gap-3 w-full rounded-lg hover:bg-white/5 transition-colors p-1', collapsed && 'justify-center')}
          aria-label="Open profile menu"
        >
          <Avatar
            src={profile?.avatar_url}
            name={profile?.display_name ?? profile?.full_name}
            color={profile?.avatar_color}
            size={36}
          />
          {!collapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="font-display font-medium text-seeper-white text-sm truncate">
                {profile?.display_name ?? profile?.full_name ?? 'Caitriona'}
              </p>
              <p className="text-seeper-muted text-xs capitalize">
                {profile?.job_title ?? profile?.department ?? 'Creative Technologist'}
              </p>
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}
