// All shared TypeScript interfaces for seeper wiki

export interface Profile {
  id: string
  full_name: string | null
  display_name: string | null
  role: 'admin' | 'member'
  department: Department | null
  avatar_url: string | null
  created_at: string
  bio?: string
  skills?: string[]
  location?: string
  linkedin_url?: string
  avatar_color?: string
  notifications_prefs?: Record<string, boolean>
}

export type Department = 'creative' | 'production' | 'tech' | 'business' | 'operations'

export type WikiCategory = 'creative' | 'production' | 'tech' | 'business' | 'ai' | 'general'

export type PromptCategory = 'image-gen' | 'copy' | 'code' | 'research' | 'video' | '3d' | 'general'

export type AiTool = 'claude' | 'midjourney' | 'runway' | 'sora' | 'dalle' | 'other'

export interface WikiPage {
  id: string
  slug: string
  title: string
  content: string | null
  excerpt: string | null
  category: WikiCategory | null
  tags: string[] | null
  author_id: string | null
  last_edited_by: string | null
  views: number
  published: boolean
  created_at: string
  updated_at: string
  author?: Profile
}

export interface Prompt {
  id: string
  title: string
  content: string
  category: PromptCategory | null
  ai_tool: AiTool | null
  tags: string[] | null
  upvotes: number
  author_id: string | null
  created_at: string
  author?: Profile
}

export interface NewsletterIssue {
  id: string
  title: string
  content: string | null
  issue_number: number | null
  published: boolean
  published_at: string | null
  author_id: string | null
  created_at: string
  author?: Profile
}

export interface RawNewsItem {
  id: string
  title: string
  url: string
  source: string | null
  summary: string | null
  category: string | null
  published_at: string | null
  fetched_at: string
}

export interface DailyDigest {
  id: string
  content: string
  generated_at: string
  date: string
}

export interface ActivityLogItem {
  id: string
  user_id: string | null
  action: ActivityAction
  resource_type: string | null
  resource_id: string | null
  resource_title: string | null
  created_at: string
  user?: Profile
}

export type ActivityAction =
  | 'created_wiki'
  | 'edited_wiki'
  | 'added_prompt'
  | 'published_newsletter'

export interface NavItem {
  label: string
  href: string
  icon: string // Lucide icon name
  color: string
  adminOnly?: boolean
}

export interface NavSection {
  label: string
  divider?: boolean
  items: NavItem[]
}

export interface QuickLink {
  label: string
  href: string
  icon: string
  accent: string // Tailwind bg class e.g. 'bg-plasma'
}

export interface MockActivityItem {
  initials: string
  name: string
  action: string
  title: string
  time: string
  dept: Department
}

export interface MockWikiUpdate {
  initials: string
  title: string
  category: WikiCategory
  author: string
  time: string
}

// Tool directory
export interface Tool {
  id: string
  name: string
  category: string
  description: string | null
  url: string | null
  version: string | null
  licence_info: string | null
  upvotes: number
  copy_count: number
  added_by: string | null
  created_at: string
  updated_at: string
}

// Resource
export interface Resource {
  id: string
  title: string
  type: 'PDF' | 'DOC' | 'Link' | 'Video' | 'Image'
  category: string
  description: string | null
  url: string | null
  file_path: string | null
  upvotes: number
  added_by: string | null
  created_at: string
}

// Notification
export interface Notification {
  id: string
  user_id: string
  type: 'wiki_updated' | 'prompt_upvoted' | 'contribution_approved' | 'new_member' | 'digest_ready'
  title: string
  body: string | null
  read: boolean
  resource_type: string | null
  resource_id: string | null
  created_at: string
}

// Contribution (from Contribute Drawer)
export interface Contribution {
  id: string
  submitter_name: string
  title: string
  category: string
  description: string
  tags: string[] | null
  url: string | null
  file_path: string | null
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by: string | null
  reviewed_at: string | null
  submitted_at: string
}

// Anonymous vote
export interface AnonymousVote {
  id: string
  resource_type: 'news' | 'prompt' | 'tool' | 'resource' | 'wiki'
  resource_id: string
  browser_id: string | null
  created_at: string
}

// Search result shape
export interface SearchableItem {
  id: string
  title: string
  description?: string
  tags?: string[]
  section: string
  sectionColor: string
  href: string
  category?: string
  author?: string
  excerpt?: string
}

// News item (mock/real)
export interface NewsItem {
  id: string
  title: string
  summary: string
  category: string
  source: string
  sourceUrl: string
  imageUrl: string | null
  publishedAt: string
  tags: string[]
  upvotes: number
  featured?: boolean
}

// Digest story (structured, from Phase 2 Claude prompt)
export interface DigestStory {
  title: string
  summary: string
  sources: string[]
  category: string
  imageUrl?: string | null
}
