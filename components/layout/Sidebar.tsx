'use client'
import { useState, useRef, useEffect } from 'react'
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

// Map icon name strings from constants to actual Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  Home, Radio, BookOpen, Settings2, LayoutGrid, Sparkles,
  Star, Users, Shield,
}

// Change 1 — NAV ICON COLOUR SYSTEM
const LIGHT_COLORS = new Set(['#DCFEAD', '#EDDE5C', '#8ACB8F'])
const DARK_SHADES: Record<string, string> = {
  '#DCFEAD': '#4a7a00',
  '#EDDE5C': '#5a4200',
  '#8ACB8F': '#0a4a20',
}

interface SidebarProps {
  profile: Profile | null
  onSignOut?: () => void
}

export default function Sidebar({ profile, onSignOut }: SidebarProps) {
  const router = useRouter()

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
      {/* Header — Change 8: new logo SVG + link wrapper */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-seeper-border">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#ED693A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.2"/>
                <path d="M5 4.5C5 4.5 11 4.5 11 8C11 11.5 5 11.5 5 11.5V4.5Z" fill="white"/>
                <circle cx="8" cy="8" r="2.2" fill="#ED693A"/>
              </svg>
            </div>
            <div className="min-w-0">
              <div className="font-display font-light text-seeper-white" style={{ fontSize: 15 }}>seeper</div>
              <div className="text-quantum font-display" style={{ fontSize: 9 }}>wiki</div>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#ED693A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="white" strokeWidth="1.2"/>
                <path d="M5 4.5C5 4.5 11 4.5 11 8C11 11.5 5 11.5 5 11.5V4.5Z" fill="white"/>
                <circle cx="8" cy="8" r="2.2" fill="#ED693A"/>
              </svg>
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className={cn(
            'text-seeper-muted hover:text-seeper-white transition-colors ml-auto',
            collapsed && 'mx-auto'
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
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

              // Change 1 — icon colour logic
              const isLight = LIGHT_COLORS.has(item.color)
              const iconColor = isActive
                ? (isLight ? DARK_SHADES[item.color] : '#ffffff')
                : item.color

              const iconBg = isActive
                ? item.color
                : isHovered
                  ? `color-mix(in srgb, ${item.color} 28%, transparent)`
                  : `color-mix(in srgb, ${item.color} 16%, transparent)`

              const itemStyle = isActive ? {
                borderLeftColor: item.color,
                backgroundColor: `${item.color}14`,
              } : {}

              const textStyle = isActive ? { color: item.color } : {}

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
