import Link from 'next/link'
import Avatar from '@/components/ui/Avatar'
import { ChevronRight } from 'lucide-react'

const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  creative:   { bg: '#ED693A1f', text: '#ED693A' },
  tech:       { bg: '#DCFEAD1f', text: '#4a7a00' },
  production: { bg: '#B0A9CF1f', text: '#B0A9CF' },
  business:   { bg: '#EDDE5C1f', text: '#5a4200' },
  ai:         { bg: '#8ACB8F1f', text: '#0a4a20' },
  general:    { bg: '#8888881f', text: '#888888' },
}

interface WikiBrowseRowProps {
  slug: string
  title: string
  category: string
  author: string
  authorColor?: string | null
  updatedAt: string
  views: number
  tags: string[]
}

export function WikiBrowseRow({ slug, title, category, author, authorColor, updatedAt, views }: WikiBrowseRowProps) {
  const cat = CAT_COLORS[category.toLowerCase()] ?? CAT_COLORS.general
  return (
    <Link
      href={`/wiki/${slug}`}
      className="group flex items-center gap-3 py-3 cursor-pointer transition-opacity hover:opacity-70"
      style={{ borderBottom: '1px solid var(--seeper-raised)' }}
    >
      <Avatar name={author} size={30} color={authorColor} />
      <div className="flex-1 min-w-0">
        <p
          className="font-semibold truncate"
          style={{ color: 'var(--color-text)', fontSize: 12 }}
        >
          {title}
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--seeper-muted)' }}>
          {author}
          {' · '}
          {new Date(updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          {' · '}
          {views} views
        </p>
      </div>
      <span
        className="flex-shrink-0 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
        style={{ fontSize: 8, background: cat.bg, color: cat.text }}
      >
        {category}
      </span>
      <ChevronRight
        size={12}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: 'var(--seeper-muted)' }}
      />
    </Link>
  )
}
