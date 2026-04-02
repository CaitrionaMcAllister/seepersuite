'use client'

import { cn } from '@/lib/utils'

const CATEGORY_FILTERS = ['All', 'AI & ML', 'Immersive', 'Tools', 'Spatial', 'Creative Tech', 'Industry', 'Events', 'Audio', 'Latest (24h)']

export type SortOrder = 'latest' | 'top' | 'viewed'

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'latest', label: '↓ Latest' },
  { value: 'top',    label: '↑ Top Voted' },
  { value: 'viewed', label: '◉ Most Viewed' },
]

interface NewsFilterProps {
  active: string[]
  onToggle: (f: string) => void
  sort: SortOrder
  onSort: (s: SortOrder) => void
  count: number
  search: string
  onSearch: (v: string) => void
  tags?: string[]
}

export function NewsFilter({ active, onToggle, sort, onSort, count, search, onSearch, tags = [] }: NewsFilterProps) {
  return (
    <div className="sticky top-0 z-10 bg-[var(--color-bg)] border-b border-seeper-border/40 pb-3 pt-3 space-y-2">
      {/* Sort + search row */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1 p-0.5 rounded-full bg-[var(--color-raised)] border border-seeper-border/40 flex-shrink-0">
          {SORT_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => onSort(o.value)}
              className={cn(
                'px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all duration-150',
                sort === o.value
                  ? 'bg-plasma text-white font-bold'
                  : 'text-[var(--color-subtext)] hover:text-[var(--color-text)]'
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto flex-1">
          {CATEGORY_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => onToggle(f)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-all duration-150',
                active.includes(f)
                  ? 'border-plasma bg-plasma/10 text-plasma'
                  : 'border-seeper-border/40 text-[var(--color-subtext)] hover:border-seeper-border'
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search news..."
          className="w-[160px] bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-plasma/60 flex-shrink-0"
        />
      </div>

      {/* Hashtag filters */}
      {tags.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => onToggle(tag)}
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] whitespace-nowrap border transition-all duration-150',
                active.includes(tag)
                  ? 'border-plasma bg-plasma/10 text-plasma'
                  : 'border-seeper-border/30 text-[var(--color-muted)] hover:border-seeper-border'
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-[var(--color-muted)]">{count} stories</p>
    </div>
  )
}
