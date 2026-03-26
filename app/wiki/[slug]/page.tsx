import AppShell from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { MOCK_WIKI_PAGES } from '@/lib/constants'
import type { Profile } from '@/types'
import Link from 'next/link'
import Avatar from '@/components/ui/Avatar'

export default async function WikiSlugPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const page = MOCK_WIKI_PAGES.find(p => p.slug === params.slug)
  if (!page) notFound()

  const related = MOCK_WIKI_PAGES
    .filter(p => p.category === page.category && p.slug !== page.slug)
    .slice(0, 3)

  return (
    <AppShell profile={profile as Profile | null}>
      <div className="max-w-4xl mx-auto page-enter">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--color-muted)] mb-6">
          <Link href="/wiki" className="hover:text-[var(--color-text)]">seeWiki</Link>
          <span>›</span>
          <span className="capitalize">{page.category}</span>
          <span>›</span>
          <span className="text-[var(--color-text)]">{page.title}</span>
        </nav>

        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black mb-4" style={{ color: 'var(--color-wiki)' }}>
              {page.title}
            </h1>
            {/* Meta row */}
            <div className="flex items-center gap-3 mb-6 text-xs text-[var(--color-muted)]">
              <Avatar name={page.author} size={24} />
              <span>{page.author}</span>
              <span>·</span>
              <span>Updated {new Date(page.updatedAt).toLocaleDateString('en-GB')}</span>
              <span>·</span>
              <span>{page.views} views</span>
            </div>
            {/* Content */}
            <div className="prose prose-sm prose-invert max-w-none">
              <p className="text-[var(--color-subtext)] leading-relaxed">{page.excerpt}</p>
              <p className="text-[var(--color-muted)] text-xs mt-8 italic">
                Full page content will be loaded from the database in a future update.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-56 flex-shrink-0 space-y-6">
            <div>
              <h4 className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-3">
                Related pages
              </h4>
              {related.map(r => (
                <Link
                  key={r.slug}
                  href={`/wiki/${r.slug}`}
                  className="block text-xs py-2 border-b border-seeper-border/40 hover:text-plasma transition-colors"
                >
                  {r.title}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <Link
                href={`/wiki/edit/${page.slug}`}
                className="text-center py-2 px-4 rounded-lg border border-seeper-border/40 text-xs hover:border-quantum/60 transition-colors"
              >
                Edit page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
