'use client'

import { useState, useMemo } from 'react'
import { MOCK_PROMPTS } from '@/lib/constants'
import { PromptCard } from '@/components/prompts/PromptCard'
import { cn } from '@/lib/utils'

const AI_FILTERS = ['All', 'Claude', 'Midjourney', 'Runway', 'Sora', 'ChatGPT', 'Other']
const CAT_FILTERS = ['All', 'Concept', 'Production', 'Audio', 'Copy', 'Research', '3D', 'Code']
const SORTS = ['Most upvoted', 'Newest', 'Most used']

export function PromptsPageClient() {
  const [aiFilter, setAiFilter] = useState('All')
  const [catFilter, setCatFilter] = useState('All')
  const [sort, setSort] = useState('Most upvoted')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let items = MOCK_PROMPTS.filter(p => {
      const matchesAi = aiFilter === 'All' || p.aiTool.toLowerCase() === aiFilter.toLowerCase()
      const matchesCat = catFilter === 'All' || p.category.toLowerCase() === catFilter.toLowerCase()
      const q = search.toLowerCase()
      const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q)
      return matchesAi && matchesCat && matchesSearch
    })
    if (sort === 'Most upvoted') items = [...items].sort((a, b) => b.upvotes - a.upvotes)
    if (sort === 'Newest') items = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (sort === 'Most used') items = [...items].sort((a, b) => b.copies - a.copies)
    return items
  }, [aiFilter, catFilter, sort, search])

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black" style={{ color: 'var(--color-prompts)' }}>seePrompts</h1>
          <p className="text-xs text-[var(--color-muted)] mt-1">AI prompts that work — curated by the seeper team</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search prompts..."
          className="w-[180px] bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-plasma/60"
        />
      </div>

      {/* AI tool filter */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto">
        {AI_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setAiFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-all duration-150',
              aiFilter === f
                ? 'border-volt bg-volt/10 text-volt'
                : 'border-seeper-border/40 text-[var(--color-subtext)] hover:border-seeper-border'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Category + sort row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1.5 overflow-x-auto">
          {CAT_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setCatFilter(f)}
              className={cn(
                'px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap border transition-all duration-150',
                catFilter === f
                  ? 'border-plasma bg-plasma/10 text-plasma'
                  : 'border-seeper-border/30 text-[var(--color-muted)] hover:border-seeper-border/60'
              )}
            >
              {f}
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

      <p className="text-xs text-[var(--color-muted)] mb-4">{filtered.length} prompts</p>

      <div className="space-y-4">
        {filtered.map(p => <PromptCard key={p.id} {...p} />)}
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-[var(--color-muted)] text-sm">No prompts found</p>
          </div>
        )}
      </div>
    </div>
  )
}
