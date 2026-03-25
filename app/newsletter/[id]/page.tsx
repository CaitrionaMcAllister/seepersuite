import AppShell from '@/components/layout/AppShell'
import PlaceholderPage from '@/components/ui/PlaceholderPage'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function NewsletterIdPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <AppShell profile={profile as Profile | null}>
      <PlaceholderPage
        sectionName="seeNewsletter"
        title="Newsletter Issue"
        description="Read a full newsletter issue."
      />
    </AppShell>
  )
}
