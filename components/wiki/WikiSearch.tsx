'use client'

import { Search } from 'lucide-react'

interface WikiSearchProps {
  value: string
  onChange: (v: string) => void
}

export function WikiSearch({ value, onChange }: WikiSearchProps) {
  return (
    <div className="relative" style={{ maxWidth: 600 }}>
      <Search
        size={13}
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'var(--seeper-muted)' }}
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search wiki pages..."
        className="w-full pl-8 pr-4 py-2.5 text-sm outline-none transition-all"
        style={{
          background: 'var(--seeper-raised)',
          border: '1px solid var(--seeper-border)',
          borderRadius: 10,
          color: 'var(--color-text)',
        }}
        onFocus={e => (e.currentTarget.style.borderColor = '#B0A9CF')}
        onBlur={e => (e.currentTarget.style.borderColor = 'var(--seeper-border)')}
      />
    </div>
  )
}
