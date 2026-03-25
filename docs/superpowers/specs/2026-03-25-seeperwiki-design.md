# seeper wiki — Phase 1 Design Spec

**Date:** 2026-03-25
**Status:** Approved
**Project:** seeper wiki — private internal knowledge hub for seeper studio

---

## 1. Overview

seeper wiki is a production-ready internal knowledge hub, wiki, and team intelligence suite for seeper — an immersive experience design studio based in London. It is a private, internal tool only accessible to authenticated seeper team members.

**Key constraint:** The word "seeper" is always lowercase everywhere — UI, code, comments, variable names. Non-negotiable.

---

## 2. Authentication & Access Control

- **Auth provider:** Supabase Auth (magic link / email OTP)
- **All routes protected** — every page requires authentication
- **Only public route:** `/auth` (login page)
- **Middleware:** Next.js middleware at root checks session; redirects unauthenticated users to `/auth`
- **Auth callback route:** `/auth/callback/route.ts` — exchanges Supabase magic link `code` param for a session via `exchangeCodeForSession()`, then redirects to `/dashboard`. This route must be added to the Supabase dashboard as the redirect URL.
- **Middleware matcher:** Excludes `/auth`, `/auth/*`, `/auth/callback`, `/_next/*`, `/favicon.ico`, `/public/*`, and `/api/auth/*` to prevent redirect loops. The root path `/` is included (redirects authenticated users to `/dashboard`).
- **`/lib/supabase/middleware.ts`:** Helper that creates a Supabase SSR client using `createServerClient` with cookie read/write handlers for the Next.js middleware context. Called from the root `middleware.ts`.
- **Root `middleware.ts`:** Calls the Supabase middleware helper to refresh the session, then checks `supabase.auth.getUser()`. Unauthenticated requests to protected routes redirect to `/auth`.
- **`/lib/supabase/server.ts`:** Creates a Supabase SSR client using `createServerClient` with Next.js `cookies()` — used in Server Components and Route Handlers.
- **`/lib/supabase/client.ts`:** Creates a Supabase browser client using `createBrowserClient` — used in Client Components only.
- **Post-login redirect:** `/dashboard`
- **Profiles table** extends `auth.users` with role (`admin` | `member`), department, display name, avatar

---

## 3. Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 14, App Router |
| Language | TypeScript, strict mode |
| Styling | Tailwind CSS, full custom theme |
| Database | Supabase (Postgres + RLS) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| AI | Anthropic Claude API (`claude-sonnet-4-6`) |
| Rich text | TipTap |
| Icons | Lucide React |
| Fonts | DM Sans + Inter (Google Fonts) |
| Deployment | Netlify |
| Package mgr | npm |

---

## 4. Brand & Visual Identity

### Colour tokens

```
seeper-black:   #000000
seeper-bg:      #0d0d0d   ← app background
seeper-surface: #222222   ← cards, panels
seeper-raised:  #2a2a2a   ← modals, dropdowns
seeper-border:  #3a3a3a
seeper-muted:   #626262
seeper-steel:   #C3C3C3
seeper-white:   #FFFFFF

plasma-orange:  #ED693A   ← PRIMARY accent (CTAs, active states)
volt-yellow:    #EDDE5C
quantum-purple: #B0A9CF
fusion-fern:    #8ACB8F
circuit-green:  #DCFEAD
mossy-earth:    #DDDDCE
```

### Typography

- **Display / headings:** DM Sans (Google Fonts substitute for licensed Noka)
- **Body / metadata:** Inter (Google Fonts substitute for Helvetica Neue)

### Design language

- THE CIRCLE is central to seeper's identity — circular avatars, icon containers, pill tags, decorative arcs
- Cards: `border-radius: 16px` minimum
- Primary buttons: `rounded-full`
- Generous negative space; scale contrast (mix large + small elements)
- Subtle radial gradients using jewel tones on dark surfaces

---

## 5. Application Architecture

### Directory structure

```
/app
  layout.tsx                  ← root layout (fonts, providers)
  page.tsx                    ← redirect to /dashboard
  /dashboard/page.tsx         ← FULLY BUILT (Phase 1)
  /news/page.tsx + loading.tsx
  /wiki/page.tsx + /[slug] + /new + /edit/[slug]
  /prompts/page.tsx
  /newsletter/page.tsx + /[id] + /new
  /tools/page.tsx
  /resources/page.tsx
  /team/page.tsx              ← seeUs (team directory)
  /admin/page.tsx
  /labs/page.tsx              ← seeLabs, scaffolded placeholder (Phase 1)
  /auth/page.tsx              ← FULLY BUILT (Phase 1)
  /auth/callback/route.ts     ← Supabase magic link exchange route (FULLY BUILT)
  /api/digest/route.ts
  /api/summarise/route.ts
  /api/tag/route.ts

/components
  /layout: Sidebar, Header, AppShell
  /ui: Button, Card, Badge, Avatar, Input, Textarea, Modal,
       Ticker, CircleDecor, LoadingSpinner
  /dashboard: DailyDigest, QuickLinks, WikiUpdates,
              NewsletterPreview, ActivityFeed, NewsTicker
  /wiki: WikiCard, WikiEditor, WikiSearch
  /news: NewsCard, NewsFilter
  /prompts: PromptCard, PromptForm

/lib
  /supabase: client.ts, server.ts, middleware.ts
  claude.ts, rss.ts, utils.ts, constants.ts

/types/index.ts
/supabase/migrations/001_initial.sql
tailwind.config.ts, next.config.ts, netlify.toml
.env.local.example, middleware.ts
```

---

## 6. Database Schema

Seven tables with RLS enabled. Full DDL in `/supabase/migrations/001_initial.sql`.

| Table | Key columns |
|---|---|
| `profiles` | `id (UUID, FK auth.users)`, `full_name`, `display_name`, `role (admin\|member)`, `department`, `avatar_url`, `created_at` |
| `wiki_pages` | `id`, `slug (unique)`, `title`, `content (TipTap JSON)`, `excerpt`, `category`, `tags[]`, `author_id`, `last_edited_by`, `views`, `published`, `created_at`, `updated_at` |
| `prompts` | `id`, `title`, `content`, `category`, `ai_tool`, `tags[]`, `upvotes`, `author_id`, `created_at` |
| `newsletter_issues` | `id`, `title`, `content (TipTap JSON)`, `issue_number`, `published`, `published_at`, `author_id`, `created_at` |
| `news_cache` | `id`, `title`, `url (unique)`, `source`, `summary (AI-generated)`, `category`, `published_at`, `fetched_at` |
| `daily_digest` | `id`, `content`, `generated_at`, `date (unique, default CURRENT_DATE)` |
| `activity_log` | `id`, `user_id`, `action`, `resource_type`, `resource_id`, `resource_title`, `created_at` |

RLS is enabled on all tables. Policy rules:
- **Read:** All authenticated users can read all rows on all tables.
- **Insert/Update/Delete on `wiki_pages`, `prompts`, `newsletter_issues`:** Any authenticated user can insert; update/delete restricted to the row owner (`author_id = auth.uid()`) or admin role.
- **`news_cache`, `daily_digest`:** Read-only for authenticated users; writes via service role only (from API routes using `SUPABASE_SERVICE_ROLE_KEY`).
- **`activity_log`:** Insert for authenticated users (own actions); read for all authenticated users.
- **`profiles`:** Each user can read all profiles; update restricted to own row.
- **Admin role check:** Use a `SECURITY DEFINER` helper function `is_admin()` that reads `profiles.role` to avoid infinite recursion in RLS policies.

Key relationships:
- `profiles` extends `auth.users`
- `wiki_pages`, `prompts`, `newsletter_issues`, `activity_log` all reference `profiles(id)`

---

## 7. Dashboard (Phase 1 — fully built)

Five sections rendered in a grid layout:

1. **Header bar** — seeper wordmark + sphere dot, date, personalised greeting, circular avatar
2. **Daily Digest hero card** — full-width, plasma-orange left border, AI-generated summary (TODO: Claude API), source pills, "Powered by Claude" badge
3. **Quick Links row** — 6 tiles (seeNews, seeWiki, seePrompts, seeNewsletter, seeTools, seeResources), each with circular coloured icon container
4. **Two-column grid:**
   - Left (65%): latest seeWiki entries (**mock data in Phase 1**) + newsletter preview card (**mock data in Phase 1**)
   - Right (35%): team activity feed (**mock data in Phase 1**)
5. **News ticker** — full-width bottom strip, CSS scroll animation, mock headlines

---

## 8. Sidebar Navigation (Phase 1 — fully built)

- 240px expanded / 60px collapsed (icon-only)
- Sections: MAIN (Dashboard, seeNews, seeWiki), STUDIO (seePrompts, seeNewsletter, seeTools, seeResources), TEAM (seeUs, seeLabs), Admin (admin role only)
- Active: plasma-orange icon bg + left border + label
- Bottom: user profile + sign out

---

## 9. Auth Page (Phase 1 — fully built)

- Full-screen dark bg, centred card (440px max)
- seeper wordmark + tagline
- Email input + "Send magic link" button (plasma-orange, rounded-full)
- Success confirmation state with checkmark animation
- Decorative blurred circles (plasma-orange + quantum-purple) in background corners

---

## 10. Placeholder Pages (Phase 1 — scaffolded)

All routes except Dashboard and Auth render:
- AppShell with sidebar
- Section title + description
- CircleDecor decorative element
- see[X] name in plasma-orange/10 background
- "Coming soon" messaging in seeper brand style

---

## 11. Claude API Functions

Four server-side helpers in `/lib/claude.ts`:
1. `generateDailyDigest(headlines)` → 3-sentence digest
2. `summariseArticle(title, content)` → one-sentence summary
3. `tagContent(title, excerpt)` → category tag array
4. `generateNewsletterIntro(items)` → newsletter opener

All called from `/app/api/*` routes only (API key never exposed to client).

**`/api/digest/route.ts` trigger:** The Dashboard server component calls `generateDailyDigest()` from `/lib/claude.ts` **directly** (not via an internal fetch to its own API route). It checks the `daily_digest` table first; if today's digest exists, it returns cached content. If not, it calls the Claude helper, writes to `daily_digest`, and returns the result. The "Regenerate" button in the UI is a Client Component that POSTs to `/api/digest` which repeats the same logic server-side.

**RSS / news feed (Phase 2):** `/lib/rss.ts` and `news_cache` are scaffolded in Phase 1 but feed URLs and fetch scheduling are deferred to Phase 2. Phase 1 uses mock data for the news ticker and seeNews placeholder.

**`activity_log` writes (Phase 1):** The Activity Feed uses mock data only in Phase 1. The `activity_log` table schema is created in the migration so the structure is ready, but actual event logging is a Phase 2 concern.

**Supabase Storage (Phase 2):** In the stack for future use (avatar uploads, resource file attachments). Not used in Phase 1.

---

## 12. seeper Division Naming

| Route | Name | Description |
|---|---|---|
| /news | seeNews | AI-curated news feed |
| /wiki | seeWiki | Internal knowledge base |
| /prompts | seePrompts | AI prompt library |
| /newsletter | seeNewsletter | Team newsletter |
| /tools | seeTools | Tools & stack directory |
| /resources | seeResources | Files, links, documents |
| /team | seeUs | Team directory |
| /labs | seeLabs | R&D / experimental |

---

## 13. Phase 1 Build Order

1. Project scaffolding (all files/folders)
2. `tailwind.config.ts` — full custom theme
3. `globals.css` — utility classes + Google Fonts
4. `/types/index.ts` — all shared interfaces
5. `/lib/constants.ts` — categories, departments, nav config
6. `/lib/claude.ts` — API helpers with TODOs
7. `/lib/supabase/client.ts` + `server.ts`
8. AppShell, Sidebar, Header components
9. All reusable UI components
10. `/app/auth/page.tsx` — fully built
11. `/app/dashboard/page.tsx` — fully built
12. All other page routes — scaffolded placeholders
13. `/supabase/migrations/001_initial.sql`
14. `.env.local.example`
15. `netlify.toml`
16. `next.config.ts`

---

## 14. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY       # Service role key (server-side only, for news_cache/daily_digest writes)
ANTHROPIC_API_KEY               # Claude API key (server-side only)
NEXT_PUBLIC_APP_URL             # Full URL of the app (e.g. http://localhost:3000) — used as Supabase magic link redirect base URL
```

**Routing note:** `/team` maps to the `seeUs` section (team directory). The sidebar nav label reads "seeUs" and links to `/team`. No redirect or alias needed — the route path and the display name are intentionally different.
