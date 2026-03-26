'use client'

import { useState, useMemo, useEffect } from 'react'
import { MOCK_RESOURCES } from '@/lib/constants'
import Avatar from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

const CATEGORIES = ['All', 'Documents', 'Links', 'Templates', 'Brand Assets', 'Research']
const SORTS = ['Date (newest)', 'Category', 'Most upvoted']

const FILE_ICONS: Record<string, string> = {
  PDF: '📄', DOC: '📝', Link: '🔗', Video: '🎬', Image: '🖼'
}

export function ResourcesPageClient() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [sort, setSort] = useState('Date (newest)')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let items = MOCK_RESOURCES.filter(r => {
      const matchesCat = activeCategory === 'All' || r.category.toLowerCase().includes(activeCategory.toLowerCase())
      const q = search.toLowerCase()
      const matchesSearch = !q || r.title.toLowerCase().includes(q) || (r.description ?? '').toLowerCase().includes(q)
      return matchesCat && matchesSearch
    })
    if (sort === 'Date (newest)') items = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    if (sort === 'Category') items = [...items].sort((a, b) => a.category.localeCompare(b.category))
    if (sort === 'Most upvoted') items = [...items].sort((a, b) => b.upvotes - a.upvotes)
    return items
  }, [activeCategory, sort, search])

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black" style={{ color: 'var(--color-resources)' }}>seeResources</h1>
          <p className="text-xs text-[var(--color-muted)] mt-1">Documents, links, and assets — all in one place</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search resources..."
          className="w-[180px] bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-plasma/60"
        />
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1.5 overflow-x-auto">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-all duration-150',
                activeCategory === cat
                  ? 'border-fern bg-fern/10 text-fern'
                  : 'border-seeper-border/40 text-[var(--color-subtext)] hover:border-seeper-border'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-2 py-1 text-xs text-[var(--color-subtext)] outline-none ml-3 flex-shrink-0"
        >
          {SORTS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <p className="text-xs text-[var(--color-muted)] mb-4">{filtered.length} resources</p>

      <div className="space-y-1">
        {filtered.map(r => (
          <ResourceRow key={r.id} resource={r} />
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-[var(--color-muted)] text-sm">No resources found</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ResourceRow({ resource }: { resource: typeof MOCK_RESOURCES[number] }) {
  const storageKey = 'seeper-resource-votes'
  const getVoted = () => {
    if (typeof window === 'undefined') return false
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as string[]
    return stored.includes(resource.id)
  }

  const [upvotes, setUpvotes] = useState(resource.upvotes)
  const [voted, setVoted] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setVoted(getVoted()) }, [])

  const handleUpvote = () => {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as string[]
    if (voted) {
      setUpvotes(p => p - 1)
      setVoted(false)
      localStorage.setItem(storageKey, JSON.stringify(stored.filter((x: string) => x !== resource.id)))
    } else {
      setUpvotes(p => p + 1)
      setVoted(true)
      localStorage.setItem(storageKey, JSON.stringify([...stored, resource.id]))
    }
  }

  return (
    <div className="flex items-center gap-4 py-3 px-3 rounded-xl hover:bg-[var(--color-raised)] transition-colors group border-b border-seeper-border/20">
      <span className="text-xl flex-shrink-0">{FILE_ICONS[resource.type] ?? '📎'}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-bold text-sm truncate">{resource.title}</h3>
          <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-[var(--color-raised)] text-[var(--color-muted)] flex-shrink-0">{resource.category}</span>
        </div>
        <p className="text-[11px] text-[var(--color-subtext)] truncate">{resource.description}</p>
        <div className="flex items-center gap-2 mt-1 text-[10px] text-[var(--color-muted)]">
          <Avatar name={resource.addedBy} size={16} />
          <span>{resource.addedBy}</span>
          <span>·</span>
          <span>{new Date(resource.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'2-digit' })}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleUpvote}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-all duration-150',
            voted
              ? 'border-plasma text-plasma bg-plasma/10'
              : 'border-seeper-border/40 text-[var(--color-muted)] hover:border-plasma/60'
          )}
        >
          ▲ {upvotes}
        </button>
        {resource.url && resource.url !== '#' ? (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] px-2.5 py-1 rounded-full border border-seeper-border/40 text-[var(--color-muted)] hover:border-fern/60 hover:text-fern transition-all"
          >
            Open ↗
          </a>
        ) : (
          <span className="text-[10px] px-2.5 py-1 rounded-full border border-seeper-border/40 text-[var(--color-muted)] opacity-40">
            Open ↗
          </span>
        )}
      </div>
    </div>
  )
}
