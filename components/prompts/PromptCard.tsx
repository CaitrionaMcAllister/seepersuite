'use client'

import { useState, useEffect } from 'react'
import Avatar from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

interface PromptCardProps {
  id: string
  title: string
  content: string
  category: string
  aiTool: string
  tags: string[]
  upvotes: number
  copies: number
  authorName: string
  authorInitials: string
  createdAt: string
}

const AI_TOOL_COLORS: Record<string, string> = {
  Claude: '#B0A9CF',
  Midjourney: '#ED693A',
  Runway: '#8ACB8F',
  Sora: '#7F77DD',
  Dalle: '#EDDE5C',
  Other: '#555555',
}

export function PromptCard({
  id, title, content, category, aiTool, tags,
  upvotes: initialUpvotes, copies: initialCopies,
  authorName,
}: PromptCardProps) {
  const voteKey = 'seeper-prompt-votes'
  const getVoted = () => {
    if (typeof window === 'undefined') return false
    const stored = JSON.parse(localStorage.getItem(voteKey) ?? '[]') as string[]
    return stored.includes(id)
  }

  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [voted, setVoted] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setVoted(getVoted()) }, [])
  const [copies, setCopies] = useState(initialCopies)
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [popping, setPopping] = useState(false)

  const handleUpvote = () => {
    const stored = JSON.parse(localStorage.getItem(voteKey) ?? '[]') as string[]
    if (voted) {
      setUpvotes(p => p - 1)
      setVoted(false)
      localStorage.setItem(voteKey, JSON.stringify(stored.filter((x: string) => x !== id)))
    } else {
      setUpvotes(p => p + 1)
      setVoted(true)
      setPopping(true)
      setTimeout(() => setPopping(false), 300)
      localStorage.setItem(voteKey, JSON.stringify([...stored, id]))
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setCopies(p => p + 1)
    setTimeout(() => setCopied(false), 2000)
  }

  const toolColor = AI_TOOL_COLORS[aiTool] ?? '#555555'
  const isLong = content.length > 280
  const displayContent = expanded ? content : content.slice(0, 280)

  return (
    <div className="seeper-card p-5 space-y-3 transition-transform duration-150 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-sm">{title}</h3>
        <span
          className="flex-shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
          style={{ color: toolColor, background: `${toolColor}1a` }}
        >
          {aiTool}
        </span>
      </div>

      {/* Prompt content */}
      <div className="bg-[var(--color-raised)] rounded-lg p-3">
        <p className="text-[11px] font-mono leading-relaxed text-[var(--color-subtext)] whitespace-pre-wrap">
          {displayContent}{isLong && !expanded && '...'}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(p => !p)}
            className="text-[10px] text-plasma mt-1 hover:underline"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        <span
          className="px-1.5 py-0.5 rounded-full text-[9px] border"
          style={{ borderColor: `${toolColor}40`, color: toolColor }}
        >
          {category}
        </span>
        {tags.map(tag => (
          <span key={tag} className="px-1.5 py-0.5 rounded-full text-[9px] bg-[var(--color-raised)] text-[var(--color-muted)]">
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={handleUpvote}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-all duration-150',
              voted
                ? 'border-plasma text-plasma bg-plasma/10'
                : 'border-seeper-border/40 text-[var(--color-muted)] hover:border-plasma/60'
            )}
          >
            ▲ <span className={cn(popping && 'upvote-pop')}>{upvotes}</span>
          </button>
          <span className="text-[10px] text-[var(--color-muted)] px-1.5 py-0.5 rounded-full border border-seeper-border/40">anon ok</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Avatar name={authorName} size={20} />
            <span className="text-[10px] text-[var(--color-muted)]">{authorName}</span>
          </div>
          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-all duration-150',
              copied
                ? 'border-green-500 text-green-500 bg-green-500/10'
                : 'border-seeper-border/40 text-[var(--color-muted)] hover:border-plasma/60 hover:text-plasma'
            )}
          >
            {copied ? 'Copied ✓' : `Copy (${copies})`}
          </button>
        </div>
      </div>
    </div>
  )
}
