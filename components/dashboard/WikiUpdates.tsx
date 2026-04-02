import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { MOCK_WIKI_UPDATES } from '@/lib/constants'
import Avatar from '@/components/ui/Avatar'

const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  creative:     { bg: 'rgba(237,105,58,0.2)',  text: '#ED693A', label: 'Creative' },
  tech:         { bg: 'rgba(220,254,173,0.2)', text: '#DCFEAD', label: 'Tech' },
  production:   { bg: 'rgba(176,169,207,0.2)', text: '#B0A9CF', label: 'Production' },
  business:     { bg: 'rgba(237,222,92,0.2)',  text: '#EDDE5C', label: 'Business' },
  ai:           { bg: 'rgba(138,203,143,0.2)', text: '#8ACB8F', label: 'AI' },
  general:      { bg: 'rgba(98,98,98,0.2)',    text: '#C3C3C3', label: 'General' },
  seeNews:      { bg: 'rgba(237,105,58,0.2)',  text: '#ED693A', label: 'seeNews' },
  seeWiki:      { bg: 'rgba(176,169,207,0.2)', text: '#B0A9CF', label: 'seeWiki' },
  seeTools:     { bg: 'rgba(220,254,173,0.2)', text: '#DCFEAD', label: 'seeTools' },
  seeResources: { bg: 'rgba(138,203,143,0.2)', text: '#8ACB8F', label: 'seeResources' },
  seePrompts:   { bg: 'rgba(237,222,92,0.2)',  text: '#EDDE5C', label: 'seePrompts' },
  seeInside:    { bg: 'rgba(212,83,126,0.2)',  text: '#D4537E', label: 'seeInside' },
}

interface Contribution {
  id: string
  submitter_name: string
  title: string
  category: string
  submitted_at: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function initials(name: string): string {
  return name.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase()
}

export default function WikiUpdates({ contributions = [] }: { contributions?: Contribution[] }) {
  const items = contributions.length > 0
    ? contributions.slice(0, 5).map(c => ({
        id: c.id,
        initials: initials(c.submitter_name),
        name: c.submitter_name,
        title: c.title,
        category: c.category,
        time: timeAgo(c.submitted_at),
      }))
    : MOCK_WIKI_UPDATES

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
        {items.map((item, i) => {
          const style = CATEGORY_STYLES[item.category] ?? CATEGORY_STYLES.general
          const href = 'id' in item ? `/wiki/contribution-${item.id}` : '/wiki'
          return (
            <Link
              key={`${item.title}-${i}`}
              href={href}
              className="flex items-center gap-3 py-3 rounded-lg hover:bg-seeper-raised px-2 -mx-2 transition-colors"
            >
              <Avatar name={item.initials} size={32} />
              <div className="flex-1 min-w-0">
                <p className="font-display font-medium text-seeper-white text-sm truncate">{item.title}</p>
                {'name' in item && item.name && (
                  <p className="text-seeper-muted text-[11px] truncate">{item.name}</p>
                )}
              </div>
              <span
                className="pill-tag text-xs flex-shrink-0"
                style={{ background: style.bg, color: style.text }}
              >
                {style.label}
              </span>
              <span className="text-seeper-muted text-xs flex-shrink-0">{item.time}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
