'use client'

import { useEffect, useRef } from 'react'
import { useNotifications, TYPE_INITIALS } from '@/hooks/useNotifications'
import { cn, relativeTime } from '@/lib/utils'

interface NotificationPanelProps {
  open: boolean
  onClose: () => void
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    setTimeout(() => document.addEventListener('mousedown', handler), 0)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-[300px] max-h-[420px] flex flex-col rounded-2xl bg-[var(--color-surface)] border border-seeper-border/40 shadow-2xl z-[500] animate-[slideInFromBottom_0.2s_ease]"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-seeper-border/40">
        <span className="text-sm font-bold">Notifications</span>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs text-plasma hover:underline">
            Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-xs text-[var(--color-muted)]">
            No notifications yet
          </div>
        ) : (
          notifications.map(n => {
            const { initials, color } = TYPE_INITIALS[n.type] ?? { initials: '?', color: '#ED693A' }
            return (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={cn(
                  'w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-[var(--color-raised)] transition-colors border-b border-seeper-border/20',
                  !n.read && 'bg-plasma/5'
                )}
              >
                <div style={{ backgroundColor: color, borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '11px', fontWeight: 'bold', color: '#0d0d0d' }}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs leading-snug', !n.read && 'font-semibold text-[var(--color-text)]', n.read && 'text-[var(--color-subtext)]')}>
                    {n.title}
                  </p>
                  <p className="text-[10px] text-[var(--color-muted)] mt-0.5">
                    {relativeTime(n.created_at)}
                  </p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-plasma flex-shrink-0 mt-1" />
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
