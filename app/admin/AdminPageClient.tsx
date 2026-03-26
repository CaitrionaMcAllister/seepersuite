'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'

const ACTION_COLORS: Record<string, string> = {
  created_wiki:         '#B0A9CF',
  edited_wiki:          '#DCFEAD',
  added_prompt:         '#EDDE5C',
  published_newsletter: '#ED693A',
  contributed:          '#ED693A',
  upvoted:              '#8ACB8F',
  signed_in:            '#555555',
}

const TABS = ['Overview', 'Users', 'Content', 'Settings']

interface AdminPageClientProps {
  profile: Profile
  stats: { userCount: number; wikiCount: number; promptCount: number }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentActivity: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pendingContributions: any[]
}

export function AdminPageClient({ stats, recentActivity, pendingContributions }: AdminPageClientProps) {
  const [tab, setTab] = useState('Overview')
  const [digestLoading, setDigestLoading] = useState(false)
  const [digestMessage, setDigestMessage] = useState<string | null>(null)

  const triggerDigest = async () => {
    setDigestLoading(true)
    setDigestMessage(null)
    try {
      const res = await fetch('/api/digest?force=true')
      const data = await res.json()
      setDigestMessage(data.error ? 'Error generating digest' : `Digest generated — ${data.stories?.length ?? 0} stories`)
    } catch {
      setDigestMessage('Failed to connect to digest API')
    }
    setDigestLoading(false)
  }

  return (
    <div className="page-enter">
      <div className="mb-6">
        <h1 className="text-xl font-black text-plasma">Admin</h1>
        <p className="text-xs text-[var(--color-muted)] mt-1">seeper wiki control panel</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-seeper-border/40 pb-0">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-all duration-150 border-b-2 -mb-px',
              tab === t
                ? 'border-plasma text-plasma'
                : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total users', value: stats.userCount },
              { label: 'Wiki pages', value: stats.wikiCount },
              { label: 'Prompts', value: stats.promptCount },
            ].map(stat => (
              <div key={stat.label} className="seeper-card p-4">
                <p className="text-xs text-[var(--color-muted)] mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-plasma">{stat.value}</p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-3">Recent activity</h3>
            {recentActivity.length === 0 ? (
              <p className="text-xs text-[var(--color-muted)]">No activity yet</p>
            ) : (
              <div className="space-y-1">
                {recentActivity.slice(0, 20).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 text-xs border-b border-seeper-border/20">
                    <span className="text-[var(--color-muted)] w-32 flex-shrink-0">
                      {new Date(item.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex-shrink-0"
                      style={{ color: ACTION_COLORS[item.action] ?? '#555', background: `${ACTION_COLORS[item.action] ?? '#555'}1a` }}
                    >
                      {item.action?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[var(--color-subtext)] truncate">{item.resource_title ?? '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Users tab */}
      {tab === 'Users' && (
        <div>
          <p className="text-xs text-[var(--color-muted)] mb-4">User management requires Supabase connection. Connect your database to manage users here.</p>
          <div className="seeper-card p-6 text-center">
            <p className="text-sm text-[var(--color-subtext)]">
              {stats.userCount} registered users
            </p>
          </div>
        </div>
      )}

      {/* Content tab */}
      {tab === 'Content' && (
        <div>
          <h3 className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-3">
            Pending contributions ({pendingContributions.length})
          </h3>
          {pendingContributions.length === 0 ? (
            <div className="seeper-card p-8 text-center">
              <p className="text-sm text-[var(--color-muted)]">No pending contributions</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingContributions.map((c, i) => (
                <div key={i} className="seeper-card p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{c.title}</p>
                    <p className="text-xs text-[var(--color-muted)]">{c.category} · {c.submitter_name}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button className="px-3 py-1 rounded-full border border-fern/40 text-fern text-xs hover:bg-fern/10 transition-colors">
                      Approve
                    </button>
                    <button className="px-3 py-1 rounded-full border border-red-500/40 text-red-400 text-xs hover:bg-red-500/10 transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings tab */}
      {tab === 'Settings' && (
        <div className="space-y-4">
          <div className="seeper-card p-5">
            <h3 className="font-bold text-sm mb-1">Daily Digest</h3>
            <p className="text-xs text-[var(--color-muted)] mb-4">Force-regenerate today&apos;s digest using Claude</p>
            {digestMessage && (
              <p className="text-xs text-fern mb-3">{digestMessage}</p>
            )}
            <button
              onClick={triggerDigest}
              disabled={digestLoading}
              className="px-4 py-2 rounded-full bg-plasma/10 border border-plasma/40 text-plasma text-xs font-bold hover:bg-plasma/20 transition-all disabled:opacity-50"
            >
              {digestLoading ? 'Generating…' : 'Regenerate Digest'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
