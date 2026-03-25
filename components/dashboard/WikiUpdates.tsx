import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MOCK_WIKI_UPDATES } from '@/lib/constants'
import Avatar from '@/components/ui/Avatar'

// CSS colour values for each category — cannot be derived from Tailwind class strings at runtime
const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  creative:   { bg: 'rgba(237,105,58,0.2)',  text: '#ED693A', label: 'Creative' },
  tech:       { bg: 'rgba(220,254,173,0.2)', text: '#DCFEAD', label: 'Tech' },
  production: { bg: 'rgba(176,169,207,0.2)', text: '#B0A9CF', label: 'Production' },
  business:   { bg: 'rgba(237,222,92,0.2)',  text: '#EDDE5C', label: 'Business' },
  ai:         { bg: 'rgba(138,203,143,0.2)', text: '#8ACB8F', label: 'AI' },
  general:    { bg: 'rgba(98,98,98,0.2)',    text: '#C3C3C3', label: 'General' },
}

export default function WikiUpdates() {
  return (
    <div className="seeper-card p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="section-label">latest from seeWiki</span>
        <Link
          href="/wiki"
          className="text-plasma text-xs font-display font-medium hover:underline flex items-center gap-1"
        >
          view all <ArrowRight size={12} />
        </Link>
      </div>

      <div className="flex flex-col divide-y divide-seeper-border">
        {MOCK_WIKI_UPDATES.map((item, i) => {
          const style = CATEGORY_STYLES[item.category] ?? CATEGORY_STYLES.general
          return (
            <div
              key={i}
              className="flex items-center gap-3 py-3 rounded-lg hover:bg-seeper-raised px-2 -mx-2 transition-colors cursor-pointer"
            >
              <Avatar name={item.initials} size={32} />
              <span className="font-display font-medium text-seeper-white text-sm flex-1 min-w-0 truncate">
                {item.title}
              </span>
              <span
                className="pill-tag text-xs flex-shrink-0"
                style={{ background: style.bg, color: style.text }}
              >
                {style.label}
              </span>
              <span className="text-seeper-muted text-xs flex-shrink-0">{item.time}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
