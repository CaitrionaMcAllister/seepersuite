import CircleDecor from '@/components/ui/CircleDecor'

interface PlaceholderPageProps {
  sectionName: string   // e.g. "seeWiki"
  title: string         // e.g. "Wiki"
  description: string
}

export default function PlaceholderPage({ sectionName, title, description }: PlaceholderPageProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] p-8 overflow-hidden">
      {/* Background decorative circles */}
      <CircleDecor size={400} color="stroke-plasma" opacity={0.04} className="absolute -top-20 -right-20" />
      <CircleDecor size={300} color="stroke-quantum" opacity={0.06} className="absolute -bottom-10 -left-10" />

      {/* Section name — large background label */}
      <div
        className="font-display font-bold text-8xl md:text-9xl select-none mb-8 text-center"
        style={{ color: 'rgba(237,105,58,0.07)' }}
        aria-hidden="true"
      >
        {sectionName}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-lg">
        <h1 className="heading-display text-3xl mb-3">{title}</h1>
        <p className="font-body text-seeper-muted leading-relaxed">{description}</p>
        <div className="mt-6 flex justify-center">
          <span
            className="pill-tag text-sm"
            style={{ background: 'rgba(237,105,58,0.1)', color: '#ED693A' }}
          >
            Coming in Phase 2
          </span>
        </div>
      </div>
    </div>
  )
}
