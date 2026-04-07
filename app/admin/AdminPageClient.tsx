'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'
import { useTheme, DEFAULT_COLORS } from '@/components/providers/ThemeProvider'


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
  is_blocked: boolean
}

interface WikiPost {
  id: string
  title: string
  category: string
  submitter_name: string
  submitted_at: string
  is_featured: boolean
  is_blocked: boolean
}

interface RecentContribution {
  id: string
  title: string
  category: string
  submitter_name: string
  submitted_at: string
  status: string
  description: string | null
}

interface AdminPageClientProps {
  profile: Profile
  stats: { userCount: number; wikiCount: number; promptCount: number; newsCount: number; toolCount: number; resourceCount: number }
  recentContributions: RecentContribution[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pendingContributions: any[]
  approvedContributions: WikiPost[]
  newsSources: NewsSource[]
  newsArticles: NewsArticle[]
}

export function AdminPageClient({ stats, recentContributions, pendingContributions, approvedContributions: initialWikiPosts, newsSources: initialSources, newsArticles: initialArticles }: AdminPageClientProps) {
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
  const [blockingArticle, setBlockingArticle] = useState<string | null>(null)

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
    setArticles(prev => prev.map(a => a.id === id ? { ...a, is_featured } : a))
    try {
      await fetch('/api/admin/news', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_featured }),
      })
    } catch {
      setArticles(prev => prev.map(a => a.id === id ? { ...a, is_featured: !is_featured } : a))
    } finally { setFeaturingArticle(null) }
  }

  const handleBlockArticle = async (id: string, is_blocked: boolean) => {
    setBlockingArticle(id)
    setArticles(prev => prev.map(a => a.id === id ? { ...a, is_blocked, is_featured: is_blocked ? false : a.is_featured } : a))
    try {
      await fetch('/api/admin/news', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_blocked, ...(is_blocked ? { is_featured: false } : {}) }),
      })
    } catch {
      setArticles(prev => prev.map(a => a.id === id ? { ...a, is_blocked: !is_blocked } : a))
    } finally { setBlockingArticle(null) }
  }

  // seeWiki post management
  const [wikiPosts, setWikiPosts] = useState<WikiPost[]>(initialWikiPosts)
  const [featuringWiki, setFeaturingWiki] = useState<string | null>(null)
  const [blockingWiki, setBlockingWiki] = useState<string | null>(null)
  const [deletingWiki, setDeletingWiki] = useState<string | null>(null)

  const handleFeatureWiki = async (id: string, is_featured: boolean) => {
    setFeaturingWiki(id)
    setWikiPosts(prev => prev.map(p => p.id === id ? { ...p, is_featured } : p))
    try {
      await fetch('/api/admin/contributions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_featured }),
      })
    } catch {
      setWikiPosts(prev => prev.map(p => p.id === id ? { ...p, is_featured: !is_featured } : p))
    } finally { setFeaturingWiki(null) }
  }

  const handleBlockWiki = async (id: string, is_blocked: boolean) => {
    setBlockingWiki(id)
    setWikiPosts(prev => prev.map(p => p.id === id ? { ...p, is_blocked, is_featured: is_blocked ? false : p.is_featured } : p))
    try {
      await fetch('/api/admin/contributions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_blocked, ...(is_blocked ? { is_featured: false } : {}) }),
      })
    } catch {
      setWikiPosts(prev => prev.map(p => p.id === id ? { ...p, is_blocked: !is_blocked } : p))
    } finally { setBlockingWiki(null) }
  }

  const handleDeleteWiki = async (id: string) => {
    setDeletingWiki(id)
    try {
      const res = await fetch('/api/admin/contributions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) setWikiPosts(prev => prev.filter(p => p.id !== id))
    } finally { setDeletingWiki(null) }
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

  const { colorOverrides, setColor, resetColors } = useTheme()

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
        <h1 className="text-xl font-black" style={{ color: 'var(--color-admin)' }}>Admin</h1>
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
                ? 'border-[var(--color-admin)] text-[var(--color-admin)]'
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
              { label: 'seeWiki pages', value: stats.wikiCount },
              { label: 'seePrompts', value: stats.promptCount },
              { label: 'seeNews articles', value: stats.newsCount },
              { label: 'seeTools', value: stats.toolCount },
              { label: 'seeResources', value: stats.resourceCount },
            ].map(stat => (
              <div key={stat.label} className="seeper-card p-4">
                <p className="text-xs text-[var(--color-muted)] mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-plasma">{stat.value}</p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-3">
              Recent contributions {recentContributions.filter(c => c.status === 'pending').length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-plasma/20 text-plasma">
                  {recentContributions.filter(c => c.status === 'pending').length} pending
                </span>
              )}
            </h3>
            {recentContributions.length === 0 ? (
              <p className="text-xs text-[var(--color-muted)]">No contributions yet</p>
            ) : (
              <div className="space-y-2">
                {recentContributions.map((c) => (
                  <div key={c.id} className="seeper-card p-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex-shrink-0"
                          style={{
                            color: c.status === 'pending' ? '#ED693A' : c.status === 'approved' ? '#8ACB8F' : '#555',
                            background: c.status === 'pending' ? 'rgba(237,105,58,0.15)' : c.status === 'approved' ? 'rgba(138,203,143,0.15)' : 'rgba(85,85,85,0.15)',
                          }}
                        >
                          {c.status}
                        </span>
                        <span className="text-[10px] text-[var(--color-muted)]">
                          {new Date(c.submitted_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="font-bold text-sm truncate">{c.title}</p>
                      <p className="text-xs text-[var(--color-muted)]">{c.category} · {c.submitter_name}</p>
                      {c.description && (
                        <p className="text-xs text-[var(--color-subtext)] line-clamp-2 mt-0.5">{c.description}</p>
                      )}
                    </div>
                    {c.status === 'pending' && (
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
                          Delete
                        </button>
                      </div>
                    )}
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

          {/* seeWiki posts */}
          <div>
            <h3 className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-3">
              seeWiki posts ({wikiPosts.filter(p => !p.is_blocked).length} visible
              {wikiPosts.filter(p => p.is_blocked).length > 0 && `, ${wikiPosts.filter(p => p.is_blocked).length} blocked`})
            </h3>
            {wikiPosts.length === 0 ? (
              <div className="seeper-card p-8 text-center">
                <p className="text-sm text-[var(--color-muted)]">No approved posts yet</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {[...wikiPosts]
                  .sort((a, b) => {
                    if (a.is_blocked !== b.is_blocked) return a.is_blocked ? 1 : -1
                    if (a.is_featured !== b.is_featured) return b.is_featured ? 1 : -1
                    return 0
                  })
                  .map(p => (
                  <div
                    key={p.id}
                    className={cn(
                      'flex items-center gap-3 py-2 px-3 rounded-lg group transition-colors',
                      p.is_blocked
                        ? 'opacity-40 hover:opacity-60'
                        : p.is_featured
                          ? 'bg-[var(--color-raised)]'
                          : 'hover:bg-[var(--color-raised)]'
                    )}
                  >
                    {/* Star / feature toggle */}
                    <button
                      onClick={() => !p.is_blocked && handleFeatureWiki(p.id, !p.is_featured)}
                      disabled={featuringWiki === p.id || p.is_blocked}
                      title={p.is_blocked ? 'Unblock to feature' : p.is_featured ? 'Remove from featured' : 'Feature this post'}
                      className="flex-shrink-0 text-sm leading-none disabled:opacity-30 transition-opacity"
                    >
                      {featuringWiki === p.id ? (
                        <span className="text-[var(--color-muted)]">…</span>
                      ) : p.is_featured ? (
                        <span style={{ color: '#EDDE5C' }}>★</span>
                      ) : (
                        <span className="opacity-30 group-hover:opacity-60 text-[var(--color-muted)]">☆</span>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className={cn('text-xs font-medium truncate', p.is_blocked && 'line-through')}>{p.title}</p>
                        {p.is_featured && !p.is_blocked && (
                          <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ background: '#ED693A' }}>Featured</span>
                        )}
                        {p.is_blocked && (
                          <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[var(--color-raised)] text-[var(--color-muted)]">Blocked</span>
                        )}
                      </div>
                      <p className="text-[10px] text-[var(--color-muted)]">
                        {p.submitter_name}{p.category ? ` · ${p.category}` : ''}{p.submitted_at ? ` · ${new Date(p.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleBlockWiki(p.id, !p.is_blocked)}
                        disabled={blockingWiki === p.id}
                        title={p.is_blocked ? 'Unblock — show in seeWiki' : 'Block — hide from seeWiki'}
                        className={cn(
                          'px-2.5 py-1 rounded-full border text-[10px] transition-all disabled:opacity-50',
                          p.is_blocked
                            ? 'border-fern/40 text-fern hover:bg-fern/10'
                            : 'opacity-0 group-hover:opacity-100 border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                        )}
                      >
                        {blockingWiki === p.id ? '…' : p.is_blocked ? 'Unblock' : 'Block'}
                      </button>
                      <button
                        onClick={() => handleDeleteWiki(p.id)}
                        disabled={deletingWiki === p.id}
                        className="opacity-0 group-hover:opacity-100 px-2.5 py-1 rounded-full border border-red-500/30 text-red-400 text-[10px] hover:bg-red-500/10 transition-all disabled:opacity-50"
                      >
                        {deletingWiki === p.id ? '…' : 'Delete'}
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
              seeNews articles ({articles.filter(a => !a.is_blocked).length} visible
              {articles.filter(a => a.is_blocked).length > 0 && `, ${articles.filter(a => a.is_blocked).length} blocked`})
            </h3>
            {articles.length === 0 ? (
              <div className="seeper-card p-8 text-center">
                <p className="text-sm text-[var(--color-muted)]">No articles in cache</p>
              </div>
            ) : (
              <div className="space-y-1 max-h-[600px] overflow-y-auto">
                {[...articles]
                  .sort((a, b) => {
                    // featured first, then normal, then blocked last
                    if (a.is_blocked !== b.is_blocked) return a.is_blocked ? 1 : -1
                    if (a.is_featured !== b.is_featured) return b.is_featured ? 1 : -1
                    return 0
                  })
                  .map(a => (
                  <div
                    key={a.id}
                    className={cn(
                      'flex items-center gap-3 py-2 px-3 rounded-lg group transition-colors',
                      a.is_blocked
                        ? 'opacity-40 hover:opacity-60'
                        : a.is_featured
                          ? 'bg-[var(--color-raised)]'
                          : 'hover:bg-[var(--color-raised)]'
                    )}
                  >
                    {/* Star / feature toggle — disabled when blocked */}
                    <button
                      onClick={() => !a.is_blocked && handleFeatureArticle(a.id, !a.is_featured)}
                      disabled={featuringArticle === a.id || a.is_blocked}
                      title={a.is_blocked ? 'Unblock to feature' : a.is_featured ? 'Remove from featured' : 'Feature this article'}
                      className="flex-shrink-0 text-sm leading-none disabled:opacity-30 transition-opacity"
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
                        <p className={cn('text-xs font-medium truncate', a.is_blocked && 'line-through')}>{a.title}</p>
                        {a.is_featured && !a.is_blocked && (
                          <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ background: '#ED693A' }}>Featured</span>
                        )}
                        {a.is_blocked && (
                          <span className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[var(--color-raised)] text-[var(--color-muted)]">Blocked</span>
                        )}
                      </div>
                      <p className="text-[10px] text-[var(--color-muted)]">
                        {a.source}{a.category ? ` · ${a.category}` : ''}{a.published_at ? ` · ${new Date(a.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleBlockArticle(a.id, !a.is_blocked)}
                        disabled={blockingArticle === a.id}
                        title={a.is_blocked ? 'Unblock — show in seeNews' : 'Block — hide from seeNews'}
                        className={cn(
                          'px-2.5 py-1 rounded-full border text-[10px] transition-all disabled:opacity-50',
                          a.is_blocked
                            ? 'border-fern/40 text-fern hover:bg-fern/10'
                            : 'opacity-0 group-hover:opacity-100 border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                        )}
                      >
                        {blockingArticle === a.id ? '…' : a.is_blocked ? 'Unblock' : 'Block'}
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(a.id)}
                        disabled={deletingArticle === a.id}
                        className="opacity-0 group-hover:opacity-100 px-2.5 py-1 rounded-full border border-red-500/30 text-red-400 text-[10px] hover:bg-red-500/10 transition-all disabled:opacity-50"
                      >
                        {deletingArticle === a.id ? '…' : 'Delete'}
                      </button>
                    </div>
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

          {/* Theme / Colour Editor */}
          <div className="seeper-card p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-sm">Theme colours</h3>
              <button
                onClick={resetColors}
                className="text-[10px] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors px-2 py-1 rounded border border-seeper-border/40 hover:border-seeper-border"
              >
                Reset to defaults
              </button>
            </div>
            <p className="text-xs text-[var(--color-muted)] mb-5">Changes apply instantly and persist across sessions. Sidebar icons, section headers, and badges all update.</p>

            {/* Accent & hero */}
            <p className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-wider mb-3">Accent &amp; hero</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'CTAs & buttons',  var: '--color-cta'       },
                { label: 'seeNews',         var: '--color-news'      },
                { label: 'Dashboard',       var: '--color-dashboard' },
                { label: 'Admin',           var: '--color-admin'     },
              ].map(({ label, var: varName }) => {
                const current = colorOverrides[varName] ?? DEFAULT_COLORS[varName]
                return (
                  <label key={varName} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-8 h-8 rounded-lg border-2 border-seeper-border/60 group-hover:border-seeper-border transition-colors"
                        style={{ background: current }}
                      />
                      <input
                        type="color"
                        value={current}
                        onChange={e => setColor(varName, e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[var(--color-text)] truncate">{label}</p>
                      <p className="text-[10px] text-[var(--color-muted)] font-mono">{current}</p>
                    </div>
                  </label>
                )
              })}
            </div>

            {/* Section colours */}
            <p className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-wider mb-3">Section colours</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'seeWiki',      var: '--color-quantum' },
                { label: 'seeTools',     var: '--color-circuit' },
                { label: 'seeResources', var: '--color-fern'    },
                { label: 'seePrompts',   var: '--color-volt'    },
                { label: 'seeInside',    var: '--color-inside'  },
                { label: 'seeUs (team)', var: '--color-us'      },
              ].map(({ label, var: varName }) => {
                const current = colorOverrides[varName] ?? DEFAULT_COLORS[varName]
                return (
                  <label key={varName} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-8 h-8 rounded-lg border-2 border-seeper-border/60 group-hover:border-seeper-border transition-colors"
                        style={{ background: current }}
                      />
                      <input
                        type="color"
                        value={current}
                        onChange={e => setColor(varName, e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[var(--color-text)] truncate">{label}</p>
                      <p className="text-[10px] text-[var(--color-muted)] font-mono">{current}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Daily Digest */}
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

          {/* News Feed */}
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
