import AppShell from '@/components/layout/AppShell'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { MOCK_WIKI_PAGES } from '@/lib/constants'
import type { Profile, WikiPage } from '@/types'
import Link from 'next/link'
import Avatar from '@/components/ui/Avatar'
import { WikiPageView } from '@/components/wiki/WikiPageView'

export default async function WikiSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const svc = createServiceClient()

  // Contribution pages
  if (slug.startsWith('contribution-')) {
    const id = slug.replace('contribution-', '')
    const { data: contribution } = await svc
      .from('contributions')
      .select('id, submitter_name, title, category, description, tags, url, submitted_at, status')
      .eq('id', id)
      .single()
    if (!contribution) notFound()

    const related = MOCK_WIKI_PAGES.filter(p => p.category === contribution.category).slice(0, 3)

    return (
      <AppShell profile={profile as Profile | null}>
        <div className="max-w-4xl mx-auto page-enter">
          <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: 'var(--seeper-muted)' }}>
            <Link href="/wiki" className="hover:text-[var(--color-text)]">seeWiki</Link>
            <span>›</span>
            <span>{contribution.category}</span>
            <span>›</span>
            <span style={{ color: 'var(--color-text)' }}>{contribution.title}</span>
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
              <div className="flex items-center gap-3 mb-6 text-xs" style={{ color: 'var(--seeper-muted)' }}>
                <Avatar name={contribution.submitter_name} size={24} />
                <span>{contribution.submitter_name}</span>
                <span>·</span>
                <span>Submitted {new Date(contribution.submitted_at).toLocaleDateString('en-GB')}</span>
              </div>
              <p style={{ color: 'var(--color-subtext)', lineHeight: 1.8, fontSize: 13 }}>{contribution.description}</p>
              {contribution.url && (
                <a href={contribution.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-6 text-xs text-plasma hover:underline">
                  View link →
                </a>
              )}
              {contribution.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-6">
                  {contribution.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] border border-seeper-border/40"
                      style={{ color: 'var(--seeper-muted)' }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="w-56 flex-shrink-0 space-y-6">
              {profile?.role === 'admin' && (
                <Link href={`/wiki/edit/contribution-${contribution.id}`}
                  className="block text-center py-2 px-4 rounded-lg border border-seeper-border/40 text-xs hover:border-quantum/60 transition-colors">
                  Edit page
                </Link>
              )}
              {related.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--seeper-muted)' }}>
                    Related pages
                  </h4>
                  {related.map(r => (
                    <Link key={r.slug} href={`/wiki/${r.slug}`}
                      className="block text-xs py-2 border-b border-seeper-border/40 hover:text-plasma transition-colors">
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

  // DB wiki page
  const { data: dbPage } = await svc
    .from('wiki_pages')
    .select('*, profiles!wiki_pages_author_id_fkey(full_name, display_name, avatar_color, role)')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (dbPage) {
    // Increment view count (fire and forget)
    svc.from('wiki_pages').update({ views: (dbPage.views ?? 0) + 1 }).eq('slug', slug).then(() => {})

    const { data: relatedData } = await svc
      .from('wiki_pages')
      .select('slug, title, updated_at, profiles!wiki_pages_author_id_fkey(full_name, display_name)')
      .eq('category', dbPage.category)
      .eq('published', true)
      .neq('slug', slug)
      .limit(3)

    const relatedPages = (relatedData ?? []).map((r: Record<string, unknown>) => {
      const prof = r.profiles as { display_name?: string; full_name?: string } | null
      return {
        slug: r.slug as string,
        title: r.title as string,
        author: prof?.display_name ?? prof?.full_name ?? 'Unknown',
        updatedAt: r.updated_at as string,
      }
    })

    const pageWithAuthor = {
      ...dbPage,
      author: dbPage.profiles as Profile | undefined,
    } as WikiPage & { author?: Profile }

    return (
      <AppShell profile={profile as Profile | null}>
        <WikiPageView
          page={pageWithAuthor}
          currentProfile={profile as Profile | null}
          relatedPages={relatedPages}
        />
      </AppShell>
    )
  }

  // Mock wiki page fallback
  const mockPage = MOCK_WIKI_PAGES.find(p => p.slug === slug)
  if (!mockPage) notFound()

  const related = MOCK_WIKI_PAGES.filter(p => p.category === mockPage.category && p.slug !== mockPage.slug).slice(0, 3)

  return (
    <AppShell profile={profile as Profile | null}>
      <div className="max-w-4xl mx-auto page-enter">
        <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: 'var(--seeper-muted)' }}>
          <Link href="/wiki" className="hover:text-[var(--color-text)]">seeWiki</Link>
          <span>›</span>
          <span className="capitalize">{mockPage.category}</span>
          <span>›</span>
          <span style={{ color: 'var(--color-text)' }}>{mockPage.title}</span>
        </nav>
        <div className="flex gap-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black mb-4" style={{ color: 'var(--color-wiki)' }}>{mockPage.title}</h1>
            <div className="flex items-center gap-3 mb-6 text-xs" style={{ color: 'var(--seeper-muted)' }}>
              <Avatar name={mockPage.author} size={24} />
              <span>{mockPage.author}</span>
              <span>·</span>
              <span>Updated {new Date(mockPage.updatedAt).toLocaleDateString('en-GB')}</span>
              <span>·</span>
              <span>{mockPage.views} views</span>
            </div>
            <p style={{ color: 'var(--color-subtext)', lineHeight: 1.8, fontSize: 13 }}>{mockPage.excerpt}</p>
          </div>
          <div className="w-56 flex-shrink-0 space-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--seeper-muted)' }}>Related pages</h4>
              {related.map(r => (
                <Link key={r.slug} href={`/wiki/${r.slug}`}
                  className="block text-xs py-2 border-b border-seeper-border/40 hover:text-plasma transition-colors">
                  {r.title}
                </Link>
              ))}
            </div>
            {profile?.role === 'admin' && (
              <Link href={`/wiki/edit/${mockPage.slug}`}
                className="block text-center py-2 px-4 rounded-lg border border-seeper-border/40 text-xs hover:border-quantum/60 transition-colors">
                Edit page
              </Link>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
