import AppShell from '@/components/layout/AppShell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MOCK_WIKI_PAGES } from '@/lib/constants'
import type { Profile } from '@/types'
import { WikiEditorPage } from '../../WikiEditorPage'

export default async function WikiEditSlugPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const existingPage = MOCK_WIKI_PAGES.find(p => p.slug === params.slug)

  return (
    <AppShell profile={profile as Profile | null}>
      <WikiEditorPage
        userId={user.id}
        initialTitle={existingPage?.title}
        initialCategory={existingPage?.category}
        initialExcerpt={existingPage?.excerpt}
        initialTags={existingPage?.tags}
        editSlug={params.slug}
      />
    </AppShell>
  )
}
