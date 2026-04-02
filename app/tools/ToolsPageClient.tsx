'use client'

import { useState, useMemo, useEffect } from 'react'
import { MOCK_TOOLS } from '@/lib/constants'
import Avatar from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'
import { UpvoteButton } from '@/components/ui/UpvoteButton'
import { LinkButton } from '@/components/ui/LinkButton'

const CATEGORIES = ['All', 'Creative', 'Production', 'Tech', 'Management', 'Communication']

const CATEGORY_COLORS: Record<string, string> = {
  tech: '#B0A9CF',
  production: '#DCFEAD',
  creative: '#D4537E',
  management: '#EDDE5C',
  communication: '#8ACB8F',
}

export function ToolsPageClient() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return MOCK_TOOLS.filter(t => {
      const matchesCat = activeCategory === 'All' || t.category.toLowerCase() === activeCategory.toLowerCase()
      const q = search.toLowerCase()
      const matchesSearch = !q || t.name.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q)
      return matchesCat && matchesSearch
    })
  }, [activeCategory, search])

  return (
    <div className="page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black" style={{ color: 'var(--color-tools)' }}>seeTools</h1>
          <p className="text-xs text-[var(--color-muted)] mt-1">The seeper toolkit — endorsed by the team</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search tools..."
          className="w-[180px] bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-plasma/60"
        />
      </div>

      <div className="flex gap-1.5 mb-6 overflow-x-auto">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-all duration-150',
              activeCategory === cat
                ? 'border-[#DCFEAD] bg-[#DCFEAD]/10 text-[#DCFEAD]'
                : 'border-seeper-border/40 text-[var(--color-subtext)] hover:border-seeper-border'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="text-xs text-[var(--color-muted)] mb-4">{filtered.length} tools</p>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map(tool => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 py-16 text-center">
            <p className="text-[var(--color-muted)] text-sm">No tools found</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ToolCard({ tool }: { tool: typeof MOCK_TOOLS[number] }) {
  const storageKey = 'seeper-tool-votes'
  const getVoted = () => {
    if (typeof window === 'undefined') return false
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as string[]
    return stored.includes(tool.id)
  }

  const [upvotes, setUpvotes] = useState(tool.upvotes)
  const [voted, setVoted] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setVoted(getVoted()) }, [])

  const handleUpvote = () => {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as string[]
    if (voted) {
      setUpvotes(p => p - 1)
      setVoted(false)
      localStorage.setItem(storageKey, JSON.stringify(stored.filter((x: string) => x !== tool.id)))
    } else {
      setUpvotes(p => p + 1)
      setVoted(true)
      localStorage.setItem(storageKey, JSON.stringify([...stored, tool.id]))
    }
  }

  const color = CATEGORY_COLORS[tool.category] ?? '#ED693A'

  return (
    <div className="seeper-card p-4 flex flex-col gap-3 transition-transform duration-150 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-sm">{tool.name}</h3>
        <span
          className="flex-shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
          style={{ color, background: `${color}1a` }}
        >
          {tool.category}
        </span>
      </div>

      <p className="text-[11px] text-[var(--color-subtext)] line-clamp-2 flex-1">{tool.description}</p>

      {/* Users */}
      <div className="flex items-center gap-1">
        {tool.users.slice(0, 4).map((initials: string) => (
          <Avatar key={initials} name={initials} size={24} />
        ))}
        {tool.users.length > 4 && (
          <span className="text-[10px] text-[var(--color-muted)]">+{tool.users.length - 4}</span>
        )}
      </div>

      <div className="text-[10px] text-[var(--color-muted)] space-y-0.5">
        <div>v{tool.version}</div>
        <div>{tool.licence}</div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-seeper-border/20">
        <UpvoteButton count={upvotes} voted={voted} onClick={handleUpvote} />
        <LinkButton url={tool.url} />
      </div>
    </div>
  )
}
