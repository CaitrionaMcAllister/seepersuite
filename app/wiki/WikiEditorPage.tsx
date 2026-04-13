'use client'

import { WikiEditor } from '@/components/wiki/WikiEditor'
import type { Profile, WikiCategory } from '@/types'

interface WikiEditorPageProps {
  profile: Profile | null
  initialTitle?: string
  initialContent?: string
  initialContentJson?: object | null
  initialCategory?: WikiCategory | null
  initialTags?: string[]
  slug?: string
  mode: 'create' | 'edit'
}

export function WikiEditorPage(props: WikiEditorPageProps) {
  return <WikiEditor {...props} />
}
