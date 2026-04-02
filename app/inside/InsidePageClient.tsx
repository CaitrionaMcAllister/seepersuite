'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const JOURNEY_STEPS = [
  { id:'1', step: 1, icon: '👋', title: 'Meet the team',       desc: 'Explore the seeUs directory and say hello.',         href: '/team',      color: '#1D9E75' },
  { id:'2', step: 2, icon: '🎨', title: 'Read brand guide',    desc: 'Get up to speed on the seeper design language.',     href: '/resources', color: '#D4537E' },
  { id:'3', step: 3, icon: '🛠', title: 'Explore the toolkit', desc: 'See what tools the studio endorses and uses.',       href: '/tools',     color: '#DCFEAD' },
  { id:'4', step: 4, icon: '💬', title: 'Browse prompts',      desc: 'Try some AI prompts from the library.',              href: '/prompts',   color: '#EDDE5C' },
  { id:'5', step: 5, icon: '📖', title: 'Read the wiki',       desc: 'Deep dive into how seeper works.',                   href: '/wiki',      color: '#B0A9CF' },
  { id:'6', step: 6, icon: '✏️', title: 'Complete your profile', desc: 'Add your skills and a photo.',                    href: '/profile',   color: '#ED693A' },
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

  const progress = checked.length / JOURNEY_STEPS.length

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
              {checked.length}/{JOURNEY_STEPS.length}
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

      {/* Journey steps grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {JOURNEY_STEPS.map(step => {
          const isChecked = checked.includes(step.id)
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => toggleItem(step.id)}
              className={cn(
                'seeper-card p-4 text-left w-full transition-all duration-150 relative',
                isChecked && 'border-l-4'
              )}
              style={isChecked ? { borderLeftColor: step.color } : undefined}
            >
              {/* Top row: icon + checkbox */}
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{step.icon}</span>
                {/* Checkbox circle */}
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150',
                  isChecked
                    ? 'bg-fern border-fern'
                    : 'border-seeper-border/60'
                )}>
                  {isChecked && <span className="text-seeper-black text-[10px]">✓</span>}
                </div>
              </div>

              {/* Step label */}
              <span className="text-[10px] text-[var(--color-muted)] font-medium block mb-0.5">Step {step.step}</span>

              {/* Title */}
              <span className="font-bold text-sm block">{step.title}</span>

              {/* Description */}
              <span className="text-xs text-[var(--color-subtext)] mt-1 block">{step.desc}</span>

              {/* Arrow link */}
              <div className="mt-3 flex justify-end">
                <Link
                  href={step.href}
                  onClick={e => e.stopPropagation()}
                  className="text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  →
                </Link>
              </div>
            </button>
          )
        })}
      </div>

      {/* Key documents */}
      <div>
        <h3 className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-3">Key documents</h3>
        <div className="grid grid-cols-3 gap-3">
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
  )
}
