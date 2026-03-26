'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const CHECKLIST = [
  { id:'1', group:'Getting Started', text:'Read the seeper brand guidelines' },
  { id:'2', group:'Getting Started', text:'Set up your seeper email' },
  { id:'3', group:'Getting Started', text:'Join the team Slack workspace' },
  { id:'4', group:'Getting Started', text:'Complete your seeUs profile' },
  { id:'5', group:'Getting Started', text:'Get access to Asana and join your first project' },
  { id:'6', group:'Getting Started', text:'Meet your buddy (ask your manager)' },
  { id:'7', group:'Tools & Access',  text:'Install Unreal Engine 5' },
  { id:'8', group:'Tools & Access',  text:'Get Adobe Creative Cloud licence' },
  { id:'9', group:'Tools & Access',  text:'Set up TouchDesigner trial' },
  { id:'10', group:'Tools & Access', text:'Access the shared Google Drive' },
  { id:'11', group:'Culture & Process', text:'Read "How seeper Works" (wiki)' },
  { id:'12', group:'Culture & Process', text:'Attend your first Monday all-hands' },
  { id:'13', group:'Culture & Process', text:'Add yourself to seeUs directory' },
]

const KEY_DOCS = [
  { icon: '🎨', title: 'Brand Guidelines', desc: 'Colours, type, logo usage', href: '/resources' },
  { icon: '📖', title: 'How seeper Works', desc: 'Process and culture guide', href: '/wiki/ue5-pipeline-guide' },
  { icon: '🛠', title: 'Tool Directory', desc: 'Software we use and why', href: '/tools' },
  { icon: '💬', title: 'AI Prompt Library', desc: 'Prompts for concept work', href: '/prompts' },
  { icon: '📚', title: 'seeWiki', desc: 'All studio knowledge', href: '/wiki' },
  { icon: '👥', title: 'seeUs Directory', desc: 'Meet the team', href: '/team' },
]

const STORAGE_KEY = 'seeper-inside-checklist'

export function InsidePageClient() {
  const [checked, setChecked] = useState<string[]>([])

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[]
    setChecked(stored)
  }, [])

  const toggleItem = (id: string) => {
    setChecked(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const groups = Array.from(new Set(CHECKLIST.map(i => i.group)))
  const progress = checked.length / CHECKLIST.length

  return (
    <div className="page-enter">
      {/* Welcome banner */}
      <div className="seeper-card p-6 mb-6" style={{ borderLeft: '4px solid var(--color-inside)' }}>
        <h1 className="text-xl font-black mb-1" style={{ color: 'var(--color-inside)' }}>seeInside</h1>
        <p className="text-sm text-[var(--color-subtext)]">
          Welcome to seeper. This is your guide to getting started — everything you need to hit the ground running.
        </p>
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[var(--color-muted)]">Onboarding progress</span>
            <span className="text-xs font-bold" style={{ color: 'var(--color-inside)' }}>
              {checked.length}/{CHECKLIST.length}
            </span>
          </div>
          <div className="h-2 bg-[var(--color-raised)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress * 100}%`, background: 'var(--color-inside)' }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Checklist */}
        <div className="flex-1 min-w-0 space-y-6">
          {groups.map(group => (
            <div key={group}>
              <h3 className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-3">{group}</h3>
              <div className="space-y-2">
                {CHECKLIST.filter(i => i.group === group).map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className="w-full flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-[var(--color-raised)] transition-colors text-left group"
                  >
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150',
                      checked.includes(item.id)
                        ? 'bg-fern border-fern'
                        : 'border-seeper-border/60 group-hover:border-fern/60'
                    )}>
                      {checked.includes(item.id) && <span className="text-seeper-black text-[10px]">✓</span>}
                    </div>
                    <span className={cn(
                      'text-sm transition-all duration-150',
                      checked.includes(item.id)
                        ? 'line-through text-[var(--color-muted)]'
                        : 'text-[var(--color-text)]'
                    )}>
                      {item.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Key documents */}
        <div className="w-64 flex-shrink-0">
          <h3 className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-3">Key documents</h3>
          <div className="grid grid-cols-2 gap-2">
            {KEY_DOCS.map(doc => (
              <Link
                key={doc.href}
                href={doc.href}
                className="seeper-card p-3 flex flex-col gap-1.5 hover:border-[var(--color-inside)]/40 transition-all"
              >
                <span className="text-xl">{doc.icon}</span>
                <span className="text-xs font-bold">{doc.title}</span>
                <span className="text-[10px] text-[var(--color-muted)]">{doc.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
