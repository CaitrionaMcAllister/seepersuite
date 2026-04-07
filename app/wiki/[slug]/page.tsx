import AppShell from '@/components/layout/AppShell'
import { createClient, createServiceClient } from '@/lib/supabase/server'
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

  // Contributions have slugs like "contribution-<uuid>"
  if (params.slug.startsWith('contribution-')) {
    const id = params.slug.replace('contribution-', '')
    const { data: contribution } = await createServiceClient()
      .from('contributions')
      .select('id, submitter_name, title, category, description, tags, url, submitted_at, status')
      .eq('id', id)
      .single()

    if (!contribution) notFound()

    const related = MOCK_WIKI_PAGES
      .filter(p => p.category === contribution.category)
      .slice(0, 3)

    return (
      <AppShell profile={profile as Profile | null}>
        <div className="max-w-4xl mx-auto page-enter">
          <nav className="flex items-center gap-2 text-xs text-[var(--color-muted)] mb-6">
            <Link href="/wiki" className="hover:text-[var(--color-text)]">seeWiki</Link>
            <span>›</span>
            <span>{contribution.category}</span>
            <span>›</span>
            <span className="text-[var(--color-text)]">{contribution.title}</span>
          </nav>

          <div className="flex gap-8">
            <div className="flex-1 min-w-0">
              <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 ${
                contribution.status === 'approved'
                  ? 'bg-fern/10 text-fern border border-fern/30'
                  : 'bg-[var(--color-raised)] text-[var(--color-muted)]'
              }`}>
                Team contribution · {contribution.status === 'approved' ? 'approved' : 'pending review'}
              </div>
              <h1 className="text-2xl font-black mb-4" style={{ color: 'var(--color-wiki)' }}>
                {contribution.title}
              </h1>
              <div className="flex items-center gap-3 mb-6 text-xs text-[var(--color-muted)]">
                <Avatar name={contribution.submitter_name} size={24} />
                <span>{contribution.submitter_name}</span>
                <span>·</span>
                <span>Submitted {new Date(contribution.submitted_at).toLocaleDateString('en-GB')}</span>
              </div>
              <div className="prose prose-sm prose-invert max-w-none">
                <p className="text-[var(--color-subtext)] leading-relaxed">{contribution.description}</p>
              </div>
              {contribution.url && (
                <a
                  href={contribution.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-6 text-xs text-plasma hover:underline"
                >
                  View link →
                </a>
              )}
              {contribution.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-6">
                  {contribution.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] border border-seeper-border/40 text-[var(--color-muted)]">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="w-56 flex-shrink-0 space-y-6">
              {profile?.role === 'admin' && (
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/wiki/edit/contribution-${contribution.id}`}
                    className="text-center py-2 px-4 rounded-lg border border-seeper-border/40 text-xs hover:border-quantum/60 transition-colors"
                  >
                    Edit page
                  </Link>
                </div>
              )}
              {related.length > 0 && (
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
              )}
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  // Regular mock wiki page
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
