'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { MOCK_WIKI_PAGES } from '@/lib/constants'
import { WikiCard } from '@/components/wiki/WikiCard'
import { WikiSearch } from '@/components/wiki/WikiSearch'
import { cn } from '@/lib/utils'

const CATEGORIES = ['All', 'Creative', 'Production', 'Tech', 'Business', 'AI', 'General']

export function WikiPageClient() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return MOCK_WIKI_PAGES.filter(page => {
      const matchesCat = activeCategory === 'All' || page.category.toLowerCase() === activeCategory.toLowerCase()
      const q = search.toLowerCase()
      const matchesSearch = !q || page.title.toLowerCase().includes(q) || page.excerpt.toLowerCase().includes(q)
      return matchesCat && matchesSearch
    })
  }, [activeCategory, search])

  const mostViewed = [...MOCK_WIKI_PAGES].sort((a, b) => b.views - a.views).slice(0, 4)
  const recentlyUpdated = [...MOCK_WIKI_PAGES].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4)

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black" style={{ color: 'var(--color-wiki)' }}>seeWiki</h1>
          <p className="text-xs text-[var(--color-muted)] mt-1">{MOCK_WIKI_PAGES.length} pages</p>
        </div>
        <Link
          href="/wiki/new"
          className="px-4 py-2 rounded-full bg-quantum/10 border border-quantum/40 text-quantum text-xs font-bold hover:bg-quantum/20 transition-all"
        >
          + New page
        </Link>
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
