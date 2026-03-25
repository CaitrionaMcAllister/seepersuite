// Server Supabase client — use in Server Components and Route Handlers.
//
// IMPORTANT: In Next.js 14 App Router, `cookies().set()` throws inside Server
// Components during a render (read-only). The catch block is intentional —
// it means session cookie refresh only takes effect in middleware and Route
// Handlers, not during Server Component renders. This is expected behaviour
// with @supabase/ssr. Middleware handles token refresh for all page requests.
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Expected in Server Components — middleware handles refresh
          }
        },
      },
    }
  )
}

/**
 * Service-role client — bypasses RLS. Use ONLY in server-side API routes
 * for writes to news_cache and daily_digest (which have no authenticated
 * write policies). Never use this in Server Components or client code.
 */
export function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  )
}
