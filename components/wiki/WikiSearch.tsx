'use client'

interface WikiSearchProps {
  value: string
  onChange: (v: string) => void
}

export function WikiSearch({ value, onChange }: WikiSearchProps) {
  return (
    <div className="relative w-full">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-sm">🔍</span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search wiki pages..."
        className="w-full bg-[var(--color-raised)] border border-seeper-border/40 rounded-xl pl-8 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-quantum/60 transition-all"
      />
    </div>
  )
}
