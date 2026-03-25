import { MOCK_ACTIVITY } from '@/lib/constants'
import Avatar from '@/components/ui/Avatar'

export default function ActivityFeed() {
  return (
    <div className="seeper-card p-6 h-full">
      <span className="section-label mb-4 block">team activity</span>

      <div className="flex flex-col gap-3">
        {MOCK_ACTIVITY.map((item, i) => (
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
