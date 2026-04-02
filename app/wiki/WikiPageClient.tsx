'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { MOCK_WIKI_PAGES } from '@/lib/constants'
import { WikiCard } from '@/components/wiki/WikiCard'
import { WikiSearch } from '@/components/wiki/WikiSearch'
import { cn } from '@/lib/utils'

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

function nameInitials(name: string): string {
  return name.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase()
}

function toWikiPage(c: Contribution) {
  return {
    slug: `contribution-${c.id}`,
    title: c.title,
    category: c.category,
    author: c.submitter_name,
    authorInitials: nameInitials(c.submitter_name),
    excerpt: c.description,
    views: 0,
    updatedAt: c.submitted_at,
    tags: c.tags ?? [],
  }
}

export function WikiPageClient({ contributions = [] }: { contributions?: Contribution[] }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  const allPages = useMemo(() => {
    const fromContributions = contributions.map(toWikiPage)
    // Merge: contributions first (most recent), then mock pages
    return [...fromContributions, ...MOCK_WIKI_PAGES]
  }, [contributions])

  const filtered = useMemo(() => {
    return allPages.filter(page => {
      const matchesCat = activeCategory === 'All' || page.category.toLowerCase() === activeCategory.toLowerCase()
      const q = search.toLowerCase()
      const matchesSearch = !q || page.title.toLowerCase().includes(q) || page.excerpt.toLowerCase().includes(q)
      return matchesCat && matchesSearch
    })
  }, [allPages, activeCategory, search])

  const recentlyUpdated = useMemo(
    () => [...allPages].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5),
    [allPages]
  )

  const mostViewed = useMemo(
    () => [...MOCK_WIKI_PAGES].sort((a, b) => b.views - a.views).slice(0, 4),
    []
  )

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-black" style={{ color: 'var(--color-wiki)' }}>seeWiki</h1>
        <p className="text-xs text-[var(--color-muted)] mt-1">{allPages.length} pages</p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <WikiSearch value={search} onChange={setSearch} />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-all duration-150',
              activeCategory === cat
                ? 'border-quantum bg-quantum/10 text-quantum'
                : 'border-seeper-border/40 text-[var(--color-subtext)] hover:border-seeper-border'
            )}
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
              <p className="text-[var(--color-muted)] text-sm">No pages found</p>
            </div>
          ) : (
            <div className="divide-y divide-seeper-border/20">
              {filtered.map(page => (
                <WikiCard key={page.slug} {...page} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-56 flex-shrink-0 space-y-6">
          <div>
            <h4 className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-3">Most viewed</h4>
            <div className="space-y-2">
              {mostViewed.map(p => (
                <Link key={p.slug} href={`/wiki/${p.slug}`} className="block text-xs py-1.5 hover:text-quantum transition-colors truncate">
                  {p.title}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-3">Recently updated</h4>
            <div className="space-y-2">
              {recentlyUpdated.map(p => (
                <Link key={p.slug} href={`/wiki/${p.slug}`} className="block text-xs py-1.5 hover:text-quantum transition-colors truncate">
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
