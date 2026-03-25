'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Radio, BookOpen, Settings2, LayoutGrid, Sparkles,
  Star, Users, FlaskConical, Shield,
  ChevronLeft, ChevronRight, LogOut, type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_SECTIONS } from '@/lib/constants'
import Avatar from '@/components/ui/Avatar'
import type { Profile } from '@/types'

// Map icon name strings from constants to actual Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  Home, Radio, BookOpen, Settings2, LayoutGrid, Sparkles,
  Star, Users, FlaskConical, Shield,
}

interface SidebarProps {
  profile: Profile | null
  onSignOut: () => void
}

export default function Sidebar({ profile, onSignOut }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const isAdmin = profile?.role === 'admin'

  return (
    <aside
      className={cn(
        'flex flex-col h-screen sticky top-0 bg-seeper-surface border-r border-seeper-border transition-all duration-300 z-40',
        collapsed ? 'w-[60px]' : 'w-[240px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-seeper-border">
        {!collapsed && (
          <div>
            <span className="font-display font-light text-seeper-white text-xl">
              seeper<span className="text-plasma">●</span>
            </span>
            <div className="text-quantum text-xs font-display">wiki</div>
          </div>
        )}
        {collapsed && (
          <span className="font-display font-light text-plasma text-xl mx-auto">●</span>
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

              const itemStyle = isActive ? {
                borderLeftColor: item.color,
                backgroundColor: `${item.color}14`,
              } : {}
              const iconStyle = isActive ? { backgroundColor: item.color } : {}
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
                >
                  <span
                    style={iconStyle}
                    className={cn(
                      'w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150 flex-shrink-0',
                      !isActive && 'bg-white/5'
                    )}
                  >
                    {Icon && (
                      <Icon
                        size={14}
                        className={isActive ? 'text-seeper-dark' : 'text-seeper-steel'}
                      />
                    )}
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

      {/* User profile + sign out */}
      <div className="border-t border-seeper-border p-3">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar
            src={profile?.avatar_url}
            name={profile?.display_name ?? profile?.full_name}
            size={36}
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="font-display font-medium text-seeper-white text-sm truncate">
                {profile?.display_name ?? profile?.full_name ?? 'seeper team'}
              </p>
              {profile?.department && (
                <p className="text-seeper-muted text-xs capitalize">{profile.department}</p>
              )}
            </div>
          )}
          {!collapsed && (
            <button
              onClick={onSignOut}
              className="text-seeper-muted hover:text-seeper-white transition-colors"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
