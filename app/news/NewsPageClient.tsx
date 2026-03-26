'use client'

import { useState, useMemo } from 'react'
import { MOCK_NEWS } from '@/lib/constants'
import { NewsCard } from '@/components/news/NewsCard'
import { NewsFilter } from '@/components/news/NewsFilter'

export function NewsPageClient() {
  const [activeFilters, setActiveFilters] = useState(['All'])
  const [search, setSearch] = useState('')

  const toggleFilter = (f: string) => {
    if (f === 'All') { setActiveFilters(['All']); return }
    setActiveFilters(prev => {
      const next = prev.includes(f)
        ? prev.filter(x => x !== f)
        : [...prev.filter(x => x !== 'All'), f]
      return next.length === 0 ? ['All'] : next
    })
  }

  const filtered = useMemo(() => {
    return MOCK_NEWS.filter(item => {
      const matchesFilter =
        activeFilters.includes('All') ||
        activeFilters.some(f => {
          if (f === 'Latest (24h)') {
            const age = Date.now() - new Date(item.publishedAt).getTime()
            return age < 86400000
          }
          return item.category.toLowerCase() === f.toLowerCase() ||
                 item.tags.some(t => t.toLowerCase().includes(f.toLowerCase()))
        })
      const matchesSearch =
        !search.trim() ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.summary.toLowerCase().includes(search.toLowerCase()) ||
        item.source.toLowerCase().includes(search.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [activeFilters, search])

  const featured = filtered.find(i => i.featured)
  const rest = filtered.filter(i => !i.featured)

  return (
    <div className="page-enter">
      <div className="mb-6">
        <h1 className="text-xl font-black" style={{ color: 'var(--color-news)' }}>seeNews</h1>
        <p className="text-xs text-[var(--color-muted)] mt-1">AI-curated, updated daily</p>
      </div>

      <NewsFilter
        active={activeFilters}
        onToggle={toggleFilter}
        count={filtered.length}
        search={search}
        onSearch={setSearch}
      />

      <div className="mt-4 grid grid-cols-2 gap-4">
        {featured && <NewsCard key={featured.id} item={featured} featured />}
        {rest.map(item => <NewsCard key={item.id} item={item} />)}
        {filtered.length === 0 && (
          <div className="col-span-2 py-16 text-center">
            <div className="w-16 h-16 rounded-full border-2 border-seeper-border/40 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl text-[var(--color-muted)]">◉</span>
            </div>
            <p className="text-[var(--color-muted)] text-sm">Nothing here yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
