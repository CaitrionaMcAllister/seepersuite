'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { ContributeDrawer } from './ContributeDrawer'

const PATH_TO_SECTION: Record<string, string> = {
  '/news':      'seeNews',
  '/wiki':      'seeWiki',
  '/tools':     'seeTools',
  '/resources': 'seeResources',
  '/prompts':   'seePrompts',
  '/inside':    'seeInside',
}

export function FAB({ authorName = '' }: { authorName?: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Hide entirely on all /wiki routes — wiki has its own "+ New page" flow
  if (pathname?.startsWith('/wiki')) return null

  // Match on first path segment so sub-pages like /wiki/slug still resolve
  const segment = '/' + (pathname?.split('/')[1] ?? '')
  const detectedSection = PATH_TO_SECTION[segment] ?? null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-plasma text-white flex items-center justify-center text-2xl font-light shadow-[0_4px_16px_rgba(237,105,58,0.35)] hover:scale-[1.08] hover:shadow-[0_6px_20px_rgba(237,105,58,0.5)] transition-all duration-150 active:scale-[0.97]"
        aria-label="Contribute"
      >
        +
      </button>
      <ContributeDrawer
        open={open}
        onClose={() => setOpen(false)}
        authorName={authorName}
        defaultSection={detectedSection}
      />
    </>
  )
}
