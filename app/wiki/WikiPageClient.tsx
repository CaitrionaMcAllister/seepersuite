'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MOCK_WIKI_PAGES } from '@/lib/constants'
import { WikiBrowseRow } from '@/components/wiki/WikiBrowseRow'
import { WikiSearch } from '@/components/wiki/WikiSearch'

const CATEGORIES = ['All', 'Creative', 'Production', 'Tech', 'Business', 'AI', 'General']

interface Contribution {
  id: string
  submitter_name: string
  title: string
  category: string
  description: string
  tags: string[]
  submitted_at: string
}

interface WikiPage {
  id: string
  slug: string
  title: string
  category: string | null
  tags: string[]
  author_id: string | null
  views: number
  updated_at: string
  profiles: { full_name: string | null; display_name: string | null; avatar_color: string | null } | null
}

function toRow(c: Contribution) {
  return {
    slug: `contribution-${c.id}`,
    title: c.title,
    category: c.category,
    author: c.submitter_name,
    authorColor: null,
    updatedAt: c.submitted_at,
    views: 0,
    tags: c.tags ?? [],
  }
}

function wikiPageToRow(p: WikiPage) {
  const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
  return {
    slug: p.slug,
    title: p.title,
    category: p.category ?? 'general',
    author: profile?.display_name ?? profile?.full_name ?? 'Seeper',
    authorColor: profile?.avatar_color ?? null,
    updatedAt: p.updated_at,
    views: p.views ?? 0,
    tags: p.tags ?? [],
  }
}

export function WikiPageClient({ contributions = [], wikiPages = [] }: { contributions?: Contribution[]; wikiPages?: WikiPage[] }) {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  const allRows = useMemo(() => {
    const fromWikiPages = wikiPages.map(wikiPageToRow)
    const fromContributions = contributions.map(toRow)
    const fromMock = MOCK_WIKI_PAGES.map(p => ({
      slug: p.slug,
      title: p.title,
      category: p.category,
      author: p.author,
      authorColor: null,
      updatedAt: p.updatedAt,
      views: p.views,
      tags: p.tags ?? [],
    }))
    return [...fromWikiPages, ...fromContributions, ...fromMock]
  }, [contributions, wikiPages])

  const filtered = useMemo(() => {
    return allRows.filter(row => {
      const matchesCat = activeCategory === 'All' ||
        row.category.toLowerCase() === activeCategory.toLowerCase()
      const q = search.toLowerCase()
      const matchesSearch = !q ||
        row.title.toLowerCase().includes(q) ||
        row.tags.some(t => t.toLowerCase().includes(q))
      return matchesCat && matchesSearch
    })
  }, [allRows, activeCategory, search])

  const recentlyUpdated = useMemo(
    () => [...allRows].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5),
    [allRows]
  )

  const mostViewed = useMemo(
    () => [...MOCK_WIKI_PAGES].sort((a, b) => b.views - a.views).slice(0, 4),
    []
  )

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="font-display font-black" style={{ color: '#B0A9CF', fontSize: 22 }}>seeWiki</h1>
          <p className="mt-0.5" style={{ fontSize: 11, color: 'var(--seeper-muted)' }}>{allRows.length} pages</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/wiki/new')}
          className="transition-all duration-150"
          style={{
            border: '1px solid var(--seeper-border)',
            background: 'none',
            color: 'var(--color-subtext)',
            fontSize: 11,
            fontWeight: 600,
            padding: '5px 14px',
            borderRadius: 20,
            cursor: 'pointer',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#B0A9CF'
            e.currentTarget.style.color = '#B0A9CF'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--seeper-border)'
            e.currentTarget.style.color = 'var(--color-subtext)'
          }}
        >
          + New page
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <WikiSearch value={search} onChange={setSearch} />
      </div>

      {/* Category filter pills */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className="whitespace-nowrap transition-all duration-150"
            style={{
              fontSize: 10,
              fontWeight: activeCategory === cat ? 700 : 600,
              padding: '4px 12px',
              borderRadius: 20,
              border: activeCategory === cat ? '1px solid #B0A9CF' : '1px solid var(--seeper-border)',
              background: activeCategory === cat ? 'rgba(176,169,207,0.15)' : 'none',
              color: activeCategory === cat ? '#B0A9CF' : 'var(--color-subtext)',
              cursor: 'pointer',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6">
        {/* Main list */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p style={{ color: 'var(--seeper-muted)', fontSize: 13 }}>No pages found</p>
              <button
                type="button"
                onClick={() => { setSearch(''); setActiveCategory('All') }}
                className="mt-3 text-xs underline"
                style={{ color: '#B0A9CF', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div>
              {filtered.map(row => (
                <WikiBrowseRow key={row.slug} {...row} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-56 flex-shrink-0 space-y-3">
          {/* Most viewed card */}
          <div
            style={{
              background: 'var(--seeper-surface)',
              border: '1px solid var(--seeper-border)',
              borderTop: '2px solid #B0A9CF',
              borderRadius: 12,
              padding: 14,
            }}
          >
            <p
              className="uppercase tracking-wider font-bold mb-2.5"
              style={{ fontSize: 9, letterSpacing: '1.5px', color: 'var(--seeper-muted)' }}
            >
              Most viewed
            </p>
            <div>
              {mostViewed.map(p => (
                <Link
                  key={p.slug}
                  href={`/wiki/${p.slug}`}
                  className="block transition-colors duration-150"
                  style={{
                    fontSize: 11,
                    color: 'var(--color-subtext)',
                    padding: '4px 0',
                    borderBottom: '1px solid var(--seeper-raised)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#B0A9CF')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-subtext)')}
                >
                  {p.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Recently updated card */}
          <div
            style={{
              background: 'var(--seeper-surface)',
              border: '1px solid var(--seeper-border)',
              borderTop: '2px solid #B0A9CF',
              borderRadius: 12,
              padding: 14,
            }}
          >
            <p
              className="uppercase tracking-wider font-bold mb-2.5"
              style={{ fontSize: 9, letterSpacing: '1.5px', color: 'var(--seeper-muted)' }}
            >
              Recently updated
            </p>
            <div>
              {recentlyUpdated.map(p => (
                <Link
                  key={p.slug}
                  href={`/wiki/${p.slug}`}
                  className="block transition-colors duration-150"
                  style={{
                    fontSize: 11,
                    color: 'var(--color-subtext)',
                    padding: '4px 0',
                    borderBottom: '1px solid var(--seeper-raised)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#B0A9CF')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-subtext)')}
                >
                  {p.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
