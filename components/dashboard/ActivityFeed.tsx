import { MOCK_ACTIVITY } from '@/lib/constants'
import Avatar from '@/components/ui/Avatar'

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

export default function ActivityFeed({ contributions = [] }: { contributions?: Contribution[] }) {
  const items = contributions.length > 0
    ? contributions.map(c => ({
        initials: initials(c.submitter_name),
        name: c.submitter_name,
        action: 'submitted a contribution to',
        title: c.title,
        time: timeAgo(c.submitted_at),
      }))
    : MOCK_ACTIVITY

  return (
    <div className="seeper-card p-6 h-full">
      <span className="section-label mb-4 block">team activity</span>

      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div
            key={`${item.name}-${i}`}
            className={`flex items-start gap-3 pl-3 border-l-2 ${i === 0 ? 'border-plasma' : 'border-seeper-border'}`}
          >
            <Avatar name={item.initials} size={28} className="flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="font-body text-seeper-steel text-xs leading-snug">
                <span className="text-seeper-white font-medium">{item.name}</span>
                {' '}{item.action}{' '}
                <span className="text-seeper-white font-medium">{item.title}</span>
              </p>
              <p className="text-seeper-muted text-xs mt-0.5">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
