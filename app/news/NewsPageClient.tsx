'use client'

import { useState, useMemo } from 'react'
import { NewsCard } from '@/components/news/NewsCard'
import { NewsFilter, type SortOrder } from '@/components/news/NewsFilter'

interface Article {
  id: string
  title: string
  url: string
  source: string
  source_url: string | null
  author: string | null
  summary: string | null
  category: string | null
  tags: string[]
  image_url: string | null
  upvotes: number
  views: number
  is_featured: boolean
  published_at: string | null
}

interface NewsPageClientProps {
  articles: Article[]
  totalCount?: number
}

export function NewsPageClient({ articles, totalCount }: NewsPageClientProps) {
  const [activeFilters, setActiveFilters] = useState(['All'])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOrder>('latest')

  // Derive unique tags from real data
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    articles.forEach(a => a.tags?.forEach(t => tags.add(t)))
    return Array.from(tags).sort()
  }, [articles])

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
    return articles.filter(item => {
      const matchesFilter = activeFilters.includes('All') ||
        activeFilters.some(f => {
          if (f === 'Latest (24h)') {
            const age = Date.now() - new Date(item.published_at ?? 0).getTime()
            return age < 86_400_000
          }
          return (
            item.category?.toLowerCase() === f.toLowerCase() ||
            item.tags?.some(t => t.toLowerCase() === f.toLowerCase())
          )
        })
      const q = search.trim().toLowerCase()
      const matchesSearch = !q ||
        item.title.toLowerCase().includes(q) ||
        (item.summary ?? '').toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        item.tags?.some(t => t.toLowerCase().includes(q))
      return matchesFilter && matchesSearch
    })
  }, [articles, activeFilters, search])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    if (sort === 'top')    arr.sort((a, b) => b.upvotes - a.upvotes)
    else if (sort === 'viewed') arr.sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    else arr.sort((a, b) => new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime())
    // Featured articles always float to the top
    return [...arr.filter(i => i.is_featured), ...arr.filter(i => !i.is_featured)]
  }, [filtered, sort])

  // First featured article gets the hero (col-span-2) treatment; rest just get the badge
  const heroFeatured = sorted[0]?.is_featured ? sorted[0] : undefined
  const rest = heroFeatured ? sorted.slice(1) : sorted

  // Deduplicate images — same image_url on multiple cards looks bad
  const seenImages = new Set<string>()
  const dedupeImage = (item: Article): Article => {
    if (!item.image_url) return item
    if (seenImages.has(item.image_url)) return { ...item, image_url: null }
    seenImages.add(item.image_url)
    return item
  }

  return (
    <div className="page-enter">
      <div className="mb-6">
        <h1 className="text-xl font-black" style={{ color: 'var(--color-news)' }}>seeNews</h1>
        <p className="text-xs text-[var(--color-muted)] mt-1">
          {articles.length > 0
            ? `${totalCount ?? articles.length} stories · updated ${new Date(articles[0]?.published_at ?? '').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
            : 'Loading news…'}
        </p>
      </div>

      <NewsFilter
        active={activeFilters}
        onToggle={toggleFilter}
        sort={sort}
        onSort={setSort}
        count={sorted.length}
        search={search}
        onSearch={setSearch}
        tags={allTags}
      />

      <div className="mt-4 grid grid-cols-2 gap-4">
        {heroFeatured && <NewsCard key={heroFeatured.id} item={dedupeImage(heroFeatured)} hero />}
        {rest.map(item => <NewsCard key={item.id} item={dedupeImage(item)} featured={item.is_featured} />)}
        {filtered.length === 0 && (
          <div className="col-span-2 py-16 text-center">
            <div className="w-16 h-16 rounded-full border-2 border-seeper-border/40 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl text-[var(--color-muted)]">◉</span>
            </div>
            <p className="text-[var(--color-muted)] text-sm">No stories found</p>
          </div>
        )}
      </div>
    </div>
  )
}
