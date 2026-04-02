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

const TABS = ['Overview', 'Users', 'Content', 'Sources', 'Settings']

interface NewsSource {
  id: string
  name: string
  feed_url: string
  site_url: string
  active: boolean
  created_at: string
}

interface NewsArticle {
  id: string
  title: string
  url: string
  source: string
  category: string | null
  published_at: string | null
  is_featured: boolean
}

interface AdminPageClientProps {
  profile: Profile
  stats: { userCount: number; wikiCount: number; promptCount: number }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentActivity: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pendingContributions: any[]
  newsSources: NewsSource[]
  newsArticles: NewsArticle[]
}

export function AdminPageClient({ stats, recentActivity, pendingContributions, newsSources: initialSources, newsArticles: initialArticles }: AdminPageClientProps) {
  const [tab, setTab] = useState('Overview')
  const [digestLoading, setDigestLoading] = useState(false)
  const [digestMessage, setDigestMessage] = useState<string | null>(null)
  const [newsLoading, setNewsLoading] = useState(false)
  const [newsMessage, setNewsMessage] = useState<string | null>(null)

  // Sources tab
  const [sources, setSources] = useState<NewsSource[]>(initialSources)
  const [newName, setNewName] = useState('')
  const [newFeedUrl, setNewFeedUrl] = useState('')
  const [newSiteUrl, setNewSiteUrl] = useState('')
  const [sourceError, setSourceError] = useState<string | null>(null)
  const [sourceAdding, setSourceAdding] = useState(false)
  const [sourceRemoving, setSourceRemoving] = useState<string | null>(null)
  const [sourceRefreshLoading, setSourceRefreshLoading] = useState(false)
  const [sourceRefreshMessage, setSourceRefreshMessage] = useState<string | null>(null)

  const handleSourceRefresh = async () => {
    setSourceRefreshLoading(true)
    setSourceRefreshMessage(null)
    try {
      const res = await fetch('/api/news/ingest', { method: 'POST' })
      const data = await res.json()
      setSourceRefreshMessage(data.error ? `Error: ${data.error}` : `Done — ${data.inserted} new articles fetched from ${sources.filter(s => s.active).length} sources`)
    } catch {
      setSourceRefreshMessage('Failed to connect')
    }
    setSourceRefreshLoading(false)
  }

  const handleAddSource = async () => {
    setSourceError(null)
    if (!newName.trim() || !newFeedUrl.trim()) { setSourceError('Name and feed URL are required'); return }
    setSourceAdding(true)
    try {
      const res = await fetch('/api/admin/news-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, feed_url: newFeedUrl, site_url: newSiteUrl }),
      })
      const data = await res.json()
      if (!res.ok) { setSourceError(data.error ?? 'Failed to add source'); return }
      setSources(prev => [...prev, data.source])
      setNewName(''); setNewFeedUrl(''); setNewSiteUrl('')
      // Auto-fetch articles from the new source
      setSourceRefreshMessage('Source added — fetching articles now…')
      handleSourceRefresh()
    } catch { setSourceError('Request failed') }
    finally { setSourceAdding(false) }
  }

  const handleToggleSource = async (id: string, active: boolean) => {
    setSources(prev => prev.map(s => s.id === id ? { ...s, active } : s))
    await fetch('/api/admin/news-sources', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active }),
    })
  }

  const handleRemoveSource = async (id: string) => {
    setSourceRemoving(id)
    try {
      const res = await fetch('/api/admin/news-sources', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) setSources(prev => prev.filter(s => s.id !== id))
    } finally { setSourceRemoving(null) }
  }

  const triggerNewsIngest = async () => {
    setNewsLoading(true)
    setNewsMessage(null)
    try {
      const res = await fetch('/api/news/ingest', { method: 'POST' })
      const data = await res.json()
      setNewsMessage(data.error ? `Error: ${data.error}` : `Done — ${data.inserted} articles ingested`)
    } catch {
      setNewsMessage('Failed to connect to ingest API')
    }
    setNewsLoading(false)
  }
  const [contributions, setContributions] = useState(pendingContributions)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // News article management
  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles)
  const [deletingArticle, setDeletingArticle] = useState<string | null>(null)
  const [featuringArticle, setFeaturingArticle] = useState<string | null>(null)

  const handleDeleteArticle = async (id: string) => {
    setDeletingArticle(id)
    try {
      const res = await fetch('/api/admin/news', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) setArticles(prev => prev.filter(a => a.id !== id))
    } finally { setDeletingArticle(null) }
  }

  const handleFeatureArticle = async (id: string, is_featured: boolean) => {
    setFeaturingArticle(id)
    // Optimistic update
    setArticles(prev => prev.map(a => a.id === id ? { ...a, is_featured } : a))
    try {
      await fetch('/api/admin/news', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_featured }),
      })
    } catch {
      // Revert on failure
      setArticles(prev => prev.map(a => a.id === id ? { ...a, is_featured: !is_featured } : a))
    } finally { setFeaturingArticle(null) }
  }

  const handleContributionAction = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(id)
    try {
      const res = await fetch('/api/admin/contributions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (res.ok) {
        setContributions(prev => prev.filter(c => c.id !== id))
      }
    } finally {
      setActionLoading(null)
    }
  }

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
        <div className="space-y-8">
          <div>
          <h3 className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-3">
            Pending contributions ({contributions.length})
          </h3>
          {contributions.length === 0 ? (
            <div className="seeper-card p-8 text-center">
              <p className="text-sm text-[var(--color-muted)]">No pending contributions</p>
            </div>
          ) : (
            <div className="space-y-2">
              {contributions.map((c) => (
                <div key={c.id} className="seeper-card p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{c.title}</p>
                    <p className="text-xs text-[var(--color-muted)] mb-1">{c.category} · {c.submitter_name}</p>
                    {c.description && (
                      <p className="text-xs text-[var(--color-subtext)] line-clamp-2">{c.description}</p>
                    )}
                    {c.url && (
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-xs text-plasma hover:underline mt-0.5 block truncate">{c.url}</a>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleContributionAction(c.id, 'approved')}
                      disabled={actionLoading === c.id}
                      className="px-3 py-1 rounded-full border border-fern/40 text-fern text-xs hover:bg-fern/10 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === c.id ? '…' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleContributionAction(c.id, 'rejected')}
                      disabled={actionLoading === c.id}
                      className="px-3 py-1 rounded-full border border-red-500/40 text-red-400 text-xs hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>

          {/* News articles */}
          <div>
            <h3 className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-3">
              seeNews articles ({articles.length})
            </h3>
            {articles.length === 0 ? (
              <div className="seeper-card p-8 text-center">
                <p className="text-sm text-[var(--color-muted)]">No articles in cache</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {[...articles].sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)).map(a => (
                  <div key={a.id} className={`flex items-center gap-3 py-2 px-3 rounded-lg group transition-colors ${a.is_featured ? 'bg-[var(--color-raised)]' : 'hover:bg-[var(--color-raised)]'}`}>
                    {/* Star / feature toggle */}
                    <button
                      onClick={() => handleFeatureArticle(a.id, !a.is_featured)}
                      disabled={featuringArticle === a.id}
                      title={a.is_featured ? 'Remove from featured' : 'Feature this article'}
                      className="flex-shrink-0 text-sm leading-none disabled:opacity-40 transition-opacity"
                    >
                      {featuringArticle === a.id ? (
                        <span className="text-[var(--color-muted)]">…</span>
                      ) : a.is_featured ? (
                        <span style={{ color: '#EDDE5C' }}>★</span>
                      ) : (
                        <span className="opacity-30 group-hover:opacity-60 text-[var(--color-muted)]">☆</span>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-medium truncate">{a.title}</p>
                        {a.is_featured && (
                          <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ background: '#ED693A' }}>Featured</span>
                        )}
                      </div>
                      <p className="text-[10px] text-[var(--color-muted)]">
                        {a.source}{a.category ? ` · ${a.category}` : ''}{a.published_at ? ` · ${new Date(a.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteArticle(a.id)}
                      disabled={deletingArticle === a.id}
                      className="opacity-0 group-hover:opacity-100 px-2.5 py-1 rounded-full border border-red-500/30 text-red-400 text-[10px] hover:bg-red-500/10 transition-all disabled:opacity-50 flex-shrink-0"
                    >
                      {deletingArticle === a.id ? '…' : 'Delete'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sources tab */}
      {tab === 'Sources' && (
        <div className="space-y-6">
          {/* Add new source */}
          <div className="seeper-card p-5">
            <h3 className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-4">Add news source</h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-xs text-[var(--color-subtext)] mb-1 block">Source name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Creative Applications"
                  className="w-full bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-plasma/60"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--color-subtext)] mb-1 block">RSS feed URL <span className="text-red-400">*</span></label>
                <input
                  type="url"
                  value={newFeedUrl}
                  onChange={e => setNewFeedUrl(e.target.value)}
                  placeholder="https://example.com/feed.xml"
                  className="w-full bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-plasma/60"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--color-subtext)] mb-1 block">Site URL</label>
                <input
                  type="url"
                  value={newSiteUrl}
                  onChange={e => setNewSiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-plasma/60"
                />
              </div>
            </div>
            {sourceError && <p className="text-red-400 text-xs mb-3">{sourceError}</p>}
            <button
              onClick={handleAddSource}
              disabled={sourceAdding}
              className="px-4 py-2 rounded-full bg-plasma/10 border border-plasma/40 text-plasma text-xs font-bold hover:bg-plasma/20 transition-all disabled:opacity-50"
            >
              {sourceAdding ? 'Adding…' : '+ Add source'}
            </button>
          </div>

          {/* Existing sources */}
          <div>
            <h3 className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-3">
              Active sources ({sources.filter(s => s.active).length} / {sources.length})
            </h3>
            <div className="space-y-2">
              {sources.map(source => (
                <div key={source.id} className="seeper-card p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-sm">{source.name}</p>
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${source.active ? 'bg-fern/10 text-fern' : 'bg-[var(--color-raised)] text-[var(--color-muted)]'}`}>
                        {source.active ? 'active' : 'paused'}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-muted)] truncate">{source.feed_url}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleSource(source.id, !source.active)}
                      className="px-3 py-1 rounded-full border border-seeper-border/40 text-xs hover:border-seeper-border transition-colors text-[var(--color-subtext)]"
                    >
                      {source.active ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      onClick={() => handleRemoveSource(source.id)}
                      disabled={sourceRemoving === source.id}
                      className="px-3 py-1 rounded-full border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      {sourceRemoving === source.id ? '…' : 'Remove'}
                    </button>
                  </div>
                </div>
              ))}
              {sources.length === 0 && (
                <p className="text-xs text-[var(--color-muted)] py-4">No sources yet. Add one above.</p>
              )}
            </div>
          </div>

          {/* Refresh from all active sources */}
          <div className="seeper-card p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-sm">Fetch latest articles</p>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">
                Pull fresh articles from all {sources.filter(s => s.active).length} active sources now
              </p>
              {sourceRefreshMessage && (
                <p className="text-xs text-fern mt-2">{sourceRefreshMessage}</p>
              )}
            </div>
            <button
              onClick={handleSourceRefresh}
              disabled={sourceRefreshLoading}
              className="px-4 py-2 rounded-full bg-plasma/10 border border-plasma/40 text-plasma text-xs font-bold hover:bg-plasma/20 transition-all disabled:opacity-50 flex-shrink-0"
            >
              {sourceRefreshLoading ? 'Fetching…' : 'Refresh Now'}
            </button>
          </div>
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
          <div className="seeper-card p-5">
            <h3 className="font-bold text-sm mb-1">News Feed</h3>
            <p className="text-xs text-[var(--color-muted)] mb-4">Force-fetch latest articles from all RSS feeds into seeNews</p>
            {newsMessage && (
              <p className="text-xs text-fern mb-3">{newsMessage}</p>
            )}
            <button
              onClick={triggerNewsIngest}
              disabled={newsLoading}
              className="px-4 py-2 rounded-full bg-plasma/10 border border-plasma/40 text-plasma text-xs font-bold hover:bg-plasma/20 transition-all disabled:opacity-50"
            >
              {newsLoading ? 'Fetching…' : 'Refresh News Feed'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
