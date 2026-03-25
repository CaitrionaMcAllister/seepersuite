import Link from 'next/link'
import { MOCK_NEWSLETTER } from '@/lib/constants'

export default function NewsletterPreview() {
  return (
    <div className="seeper-card p-6 flex flex-col gap-4">
      <span className="section-label">from seeNewsletter</span>

      <div className="flex items-start gap-3">
        <span
          className="pill-tag flex-shrink-0"
          style={{ background: 'rgba(237,105,58,1)', color: '#fff' }}
        >
          Issue {MOCK_NEWSLETTER.issueNumber}
        </span>
        <h3 className="heading-display text-base leading-snug">
          {MOCK_NEWSLETTER.title}
        </h3>
      </div>

      <p className="font-body text-seeper-steel text-sm leading-relaxed line-clamp-2">
        {MOCK_NEWSLETTER.excerpt}
      </p>

      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-seeper-muted text-xs font-body">
          {MOCK_NEWSLETTER.publishedAt}
        </span>
        <Link
          href="/newsletter"
          className="text-plasma text-xs font-display font-medium border border-plasma rounded-full px-4 py-1.5 hover:bg-plasma/10 transition-colors"
        >
          Read full issue →
        </Link>
      </div>
    </div>
  )
}
