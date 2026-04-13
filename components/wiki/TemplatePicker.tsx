'use client'

import { useState } from 'react'

export type TemplateName = 'blank' | 'guide' | 'reference' | 'brief' | 'research' | 'meeting'

interface Template {
  name: TemplateName
  icon: string
  label: string
  html: string
}

export const TEMPLATES: Template[] = [
  { name: 'blank', icon: '◻', label: 'Blank page', html: '' },
  {
    name: 'guide',
    icon: '◈',
    label: 'Guide',
    html: `<h1>Overview</h1><p>Briefly describe what this guide covers and who it's for.</p><h2>Prerequisites</h2><p>What does someone need to know or have before following this guide?</p><h2>Step-by-step</h2><p>Walk through the process clearly...</p><h2>Tips and gotchas</h2><p>Anything that commonly goes wrong or useful shortcuts...</p>`,
  },
  {
    name: 'reference',
    icon: '⊞',
    label: 'Reference',
    html: `<h1>Summary</h1><p>One paragraph overview of what's being compared or referenced.</p><h2>Option A</h2><p>Description, pros, cons...</p><h2>Option B</h2><p>Description, pros, cons...</p><h2>Decision matrix</h2><p>When to choose which option and why...</p><h2>seeper recommendation</h2><p>What seeper uses and recommends for different scenarios...</p>`,
  },
  {
    name: 'brief',
    icon: '◎',
    label: 'Brief template',
    html: `<h1>Project overview</h1><p>Client name, project type, venue/location.</p><h2>Objectives</h2><p>What does the client want to achieve?</p><h2>Technical requirements</h2><p>Key technical constraints and requirements...</p><h2>Visitor journey</h2><p>How visitors move through the experience...</p><h2>Budget and timeline</h2><p>Budget range, key milestones, delivery date.</p><h2>KPIs and success metrics</h2><p>How will success be measured?</p>`,
  },
  {
    name: 'research',
    icon: '⊙',
    label: 'Research',
    html: `<h1>Research question</h1><p>What are you trying to find out?</p><h2>Methodology</h2><p>How did you research this?</p><h2>Key findings</h2><p>Main things you discovered...</p><h2>Implications for seeper</h2><p>What does this mean for our work?</p><h2>Sources</h2><p>Links and references...</p>`,
  },
  {
    name: 'meeting',
    icon: '●',
    label: 'Meeting notes',
    html: `<h1>Meeting summary</h1><p>Date, attendees, purpose.</p><h2>Key decisions</h2><p>What was decided...</p><h2>Action items</h2><p>Who is doing what by when...</p><h2>Next steps</h2><p>Follow-up required...</p>`,
  },
]

interface TemplatePickerProps {
  selected: TemplateName
  onSelect: (template: Template, confirmed: boolean) => void
  hasContent: boolean
}

export function TemplatePicker({ selected, onSelect, hasContent }: TemplatePickerProps) {
  const [pendingTemplate, setPendingTemplate] = useState<Template | null>(null)

  const handleClick = (template: Template) => {
    if (template.name === 'blank' || !hasContent || template.name === selected) {
      onSelect(template, true)
      return
    }
    setPendingTemplate(template)
  }

  const confirmReplace = () => {
    if (pendingTemplate) {
      onSelect(pendingTemplate, true)
      setPendingTemplate(null)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span
          className="uppercase tracking-wider mr-1"
          style={{ fontSize: 10, color: 'var(--seeper-muted)', fontWeight: 700 }}
        >
          Start from
        </span>
        {TEMPLATES.map(t => (
          <button
            key={t.name}
            type="button"
            onClick={() => handleClick(t)}
            className="flex items-center gap-1.5 transition-all duration-150"
            style={{
              border: selected === t.name ? '1px solid #B0A9CF' : '1px solid var(--seeper-border)',
              background: selected === t.name ? 'rgba(176,169,207,0.1)' : 'var(--seeper-raised)',
              borderRadius: 8,
              padding: '5px 10px',
              fontSize: 10,
              fontWeight: 600,
              color: selected === t.name ? '#B0A9CF' : 'var(--color-subtext)',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              if (selected !== t.name) {
                e.currentTarget.style.borderColor = '#B0A9CF'
                e.currentTarget.style.color = '#B0A9CF'
              }
            }}
            onMouseLeave={e => {
              if (selected !== t.name) {
                e.currentTarget.style.borderColor = 'var(--seeper-border)'
                e.currentTarget.style.color = 'var(--color-subtext)'
              }
            }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {pendingTemplate && (
        <div
          className="mb-4 flex items-center gap-3 px-3 py-2 rounded-lg"
          style={{
            background: 'var(--seeper-raised)',
            border: '1px solid var(--seeper-border)',
            fontSize: 11,
          }}
        >
          <span style={{ color: 'var(--color-subtext)' }}>
            Replace current content with the &quot;{pendingTemplate.label}&quot; template?
          </span>
          <button
            type="button"
            onClick={confirmReplace}
            style={{ color: '#B0A9CF', fontWeight: 700, cursor: 'pointer', background: 'none', border: 'none', fontSize: 11 }}
          >
            Yes, replace
          </button>
          <button
            type="button"
            onClick={() => setPendingTemplate(null)}
            style={{ color: 'var(--seeper-muted)', cursor: 'pointer', background: 'none', border: 'none', fontSize: 11 }}
          >
            Cancel
          </button>
        </div>
      )}
    </>
  )
}
