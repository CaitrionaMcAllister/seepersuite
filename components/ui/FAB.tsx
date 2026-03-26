'use client'

import { useState } from 'react'
import { ContributeDrawer } from './ContributeDrawer'

export function FAB() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="absolute bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-plasma text-white flex items-center justify-center text-2xl font-light shadow-[0_4px_16px_rgba(237,105,58,0.35)] hover:scale-[1.08] hover:shadow-[0_6px_20px_rgba(237,105,58,0.5)] transition-all duration-150 active:scale-[0.97]"
        aria-label="Contribute to seeper wiki"
      >
        +
      </button>
      <ContributeDrawer open={open} onClose={() => setOpen(false)} />
    </>
  )
}
