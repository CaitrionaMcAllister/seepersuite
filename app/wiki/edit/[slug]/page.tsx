import AppShell from '@/components/layout/AppShell'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { MOCK_WIKI_PAGES } from '@/lib/constants'
import type { Profile, WikiCategory } from '@/types'
import { WikiEditorPage } from '../../WikiEditorPage'
import { ContributionEditorClient } from './ContributionEditorClient'

export default async function WikiEditSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/wiki')

  // Contribution edit
  if (slug.startsWith('contribution-')) {
    const id = slug.replace('contribution-', '')
    const { data: contribution } = await createServiceClient()
      .from('contributions')
      .select('id, title, category, description, tags, url, submitter_name, submitted_at, status')
      .eq('id', id)
      .single()
    if (!contribution) notFound()
    return (
      <AppShell profile={profile as Profile | null}>
        <ContributionEditorClient contribution={contribution} />
      </AppShell>
    )
  }

  // DB wiki page edit
  const { data: dbPage } = await createServiceClient()
    .from('wiki_pages')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (dbPage) {
    return (
      <AppShell profile={profile as Profile | null}>
        <WikiEditorPage
          profile={profile as Profile | null}
          mode="edit"
          slug={slug}
          initialTitle={dbPage.title}
          initialContent={dbPage.content ?? ''}
          initialContentJson={dbPage.content_json}
          initialCategory={dbPage.category as WikiCategory | null}
          initialTags={dbPage.tags ?? []}
        />
      </AppShell>
    )
  }

  // Fallback: mock wiki page edit
  const mockPage = MOCK_WIKI_PAGES.find(p => p.slug === slug)
  return (
    <AppShell profile={profile as Profile | null}>
      <WikiEditorPage
        profile={profile as Profile | null}
        mode="edit"
        slug={slug}
        initialTitle={mockPage?.title}
        initialCategory={mockPage?.category as WikiCategory | null}
        initialTags={mockPage?.tags as string[] | undefined}
      />
    </AppShell>
  )
}
