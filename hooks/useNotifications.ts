'use client'

import { useState } from 'react'
import type { Notification } from '@/types'

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    user_id: '',
    type: 'wiki_updated',
    title: 'Chris Brown updated UE5 Pipeline Guide',
    body: null,
    read: false,
    resource_type: 'wiki',
    resource_id: null,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: '2',
    user_id: '',
    type: 'prompt_upvoted',
    title: 'Your prompt got 5 new upvotes',
    body: null,
    read: false,
    resource_type: 'prompt',
    resource_id: null,
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: '3',
    user_id: '',
    type: 'new_member',
    title: 'Asha R joined seeper — welcome!',
    body: null,
    read: true,
    resource_type: null,
    resource_id: null,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
]

export const TYPE_INITIALS: Record<string, { initials: string; color: string }> = {
  wiki_updated:          { initials: 'CB', color: '#ED693A' },
  prompt_upvoted:        { initials: 'CM', color: '#B0A9CF' },
  new_member:            { initials: 'AR', color: '#8ACB8F' },
  contribution_approved: { initials: '✓',  color: '#DCFEAD' },
  digest_ready:          { initials: '◉',  color: '#ED693A' },
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return { notifications, unreadCount, markAllRead, markRead }
}
