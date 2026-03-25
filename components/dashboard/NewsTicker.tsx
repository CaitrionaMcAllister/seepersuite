import { MOCK_TICKER_HEADLINES } from '@/lib/constants'

export default function NewsTicker() {
  // Duplicate headlines so the scroll loops seamlessly
  const items = [...MOCK_TICKER_HEADLINES, ...MOCK_TICKER_HEADLINES]

  return (
    <div className="h-10 bg-seeper-black border-t border-seeper-border overflow-hidden flex items-center">
      <div className="ticker-track">
        {items.map((headline, i) => (
          <span key={i} className="flex items-center gap-3 pr-8">
            <span className="text-plasma text-xs">●</span>
            <span className="font-body text-seeper-steel text-xs whitespace-nowrap">
              {headline}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
