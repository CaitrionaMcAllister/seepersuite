import Link from 'next/link'
import Avatar from '@/components/ui/Avatar'

const CATEGORY_COLORS: Record<string, string> = {
  tech:         '#B0A9CF',
  ai:           '#7F77DD',
  business:     '#EDDE5C',
  production:   '#DCFEAD',
  creative:     '#D4537E',
  general:      '#ED693A',
  seeNews:      '#ED693A',
  seeWiki:      '#B0A9CF',
  seeTools:     '#DCFEAD',
  seeResources: '#8ACB8F',
  seePrompts:   '#EDDE5C',
  seeInside:    '#D4537E',
}

interface WikiCardProps {
  slug: string
  title: string
  category: string
  author: string
  authorInitials: string
  excerpt: string
  views: number
  updatedAt: string
  tags: string[]
}

export function WikiCard({ slug, title, category, author, excerpt, views, updatedAt }: WikiCardProps) {
  const color = CATEGORY_COLORS[category] ?? '#ED693A'
  return (
    <Link
      href={`/wiki/${slug}`}
      className="flex items-start gap-4 py-4 px-3 rounded-xl hover:bg-[var(--color-raised)] transition-colors group border-l-2"
      style={{ borderLeftColor: `${color}60` }}
    >
      <Avatar name={author} size={32} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-sm group-hover:text-plasma transition-colors truncate">{title}</h3>
          <span
            className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex-shrink-0"
            style={{ color, background: `${color}1a` }}
          >
            {category}
          </span>
        </div>
        <p className="text-[11px] text-[var(--color-subtext)] line-clamp-2 mb-1.5">{excerpt}</p>
        <div className="flex items-center gap-2 text-[10px] text-[var(--color-muted)]">
          <span>{author}</span>
          <span>·</span>
          <span>{new Date(updatedAt).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}</span>
          <span>·</span>
          <span>{views} views</span>
        </div>
      </div>
    </Link>
  )
}
