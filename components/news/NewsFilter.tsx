'use client'

import { cn } from '@/lib/utils'

const FILTERS = ['All','AI & ML','Immersive','Tools','Spatial','Industry','Creative Tech','Events','Latest (24h)']

interface NewsFilterProps {
  active: string[]
  onToggle: (f: string) => void
  count: number
  search: string
  onSearch: (v: string) => void
}

export function NewsFilter({ active, onToggle, count, search, onSearch }: NewsFilterProps) {
  return (
    <div className="sticky top-0 z-10 bg-[var(--color-bg)] border-b border-seeper-border/40 pb-3 pt-3">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex gap-1.5 overflow-x-auto flex-1">
          {FILTERS.map(f => (
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
          className="w-[180px] bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-plasma/60"
        />
      </div>
      <p className="text-xs text-[var(--color-muted)]">{count} stories</p>
    </div>
  )
}
