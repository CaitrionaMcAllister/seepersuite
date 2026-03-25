import { redirect } from 'next/navigation'

// Root route — redirect to dashboard (middleware handles auth guard)
export default function RootPage() {
  redirect('/dashboard')
}
