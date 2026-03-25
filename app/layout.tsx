import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'seeper wiki',
  description: 'internal knowledge hub for seeper studio',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-seeper-bg text-seeper-white antialiased">
        {children}
      </body>
    </html>
  )
}
