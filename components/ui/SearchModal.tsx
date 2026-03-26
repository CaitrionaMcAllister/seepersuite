'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { SearchableItem } from '@/types'
import { MOCK_SEARCH_ITEMS } from '@/lib/constants'

const FILTER_SECTIONS = [
  'All','seeNews','seeWiki','seeTools','seeResources','seePrompts','seeInside',
  '#ai','#creative','#production','#tech',
]

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} style={{ background: 'rgba(237,105,58,0.25)', color: 'inherit' }}>{part}</mark>
      : part
  )
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<string[]>(['All'])
  const [results, setResults] = useState<SearchableItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Autofocus on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setResults([])
    }
  }, [open])

  // Debounced client-side search
  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(() => {
      const q = query.toLowerCase()
      const filtered = MOCK_SEARCH_ITEMS.filter(item => {
        const matchesQuery =
          item.title.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.tags?.some(t => t.includes(q)) ||
          item.author?.toLowerCase().includes(q)
        const matchesSection =
          activeFilters.includes('All') ||
          activeFilters.some(f => {
            if (f.startsWith('#')) return item.tags?.includes(f)
            return item.section === f
          })
        return matchesQuery && matchesSection
      })
      setResults(filtered)
    }, 200)
    return () => clearTimeout(timer)
  }, [query, activeFilters])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const toggleFilter = (f: string) => {
    if (f === 'All') { setActiveFilters(['All']); return }
    setActiveFilters(prev => {
      const next = prev.includes(f) ? prev.filter(x => x !== f) : [...prev.filter(x => x !== 'All'), f]
      return next.length === 0 ? ['All'] : next
    })
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-[1000] bg-black/60" onClick={onClose} />
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[1001] w-[560px] max-h-[70vh] flex flex-col rounded-2xl bg-[var(--color-surface)] border border-seeper-border/40 shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-seeper-border/40">
          <span className="text-[var(--color-muted)]">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search seeper wiki..."
            className="flex-1 bg-transparent text-sm outline-none text-[var(--color-text)] placeholder-[var(--color-muted)]"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="text-[var(--color-muted)] text-xs">✕</button>
          )}
          <button type="button" onClick={onClose} className="text-xs text-[var(--color-muted)] px-2 py-1 rounded border border-seeper-border/40">esc</button>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 px-4 py-2 border-b border-seeper-border/40 overflow-x-auto">
          {FILTER_SECTIONS.map(f => (
            <button
              key={f}
              type="button"
              onClick={() => toggleFilter(f)}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs whitespace-nowrap border transition-all duration-150',
                activeFilters.includes(f)
                  ? 'border-plasma bg-plasma/10 text-plasma'
                  : 'border-seeper-border/40 text-[var(--color-muted)] hover:border-seeper-border'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto py-2">
          {query && results.length === 0 && (
            <div className="px-4 py-8 text-center text-[var(--color-muted)] text-sm">
              Nothing found for &quot;{query}&quot;
              <p className="text-xs mt-1">Try contributing it instead.</p>
            </div>
          )}
          {results.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => { router.push(item.href); onClose() }}
              className="w-full text-left px-4 py-3 hover:bg-[var(--color-raised)] transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold" style={{ color: item.sectionColor }}>
                  {item.section}
                </span>
                {item.category && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[var(--color-raised)] text-[10px] text-[var(--color-muted)]">
                    {item.category}
                  </span>
                )}
                {item.author && (
                  <span className="text-[10px] text-[var(--color-muted)]">· {item.author}</span>
                )}
              </div>
              <div className="text-sm font-medium text-[var(--color-text)]">
                {highlight(item.title, query)}
              </div>
              {item.excerpt && (
                <div className="text-xs text-[var(--color-subtext)] mt-0.5 line-clamp-2">
                  {highlight(item.excerpt, query)}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-seeper-border/40 text-xs text-[var(--color-muted)]">
          {query ? `${results.length} results across seeper wiki` : 'Start typing to search…'}
        </div>
      </div>
    </>
  )
}
