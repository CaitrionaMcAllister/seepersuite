'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import type { Profile, NotificationPrefKey } from '@/types'

const AVATAR_COLORS = [
  { label: 'Plasma',  value: '#ED693A' },
  { label: 'Quantum', value: '#B0A9CF' },
  { label: 'Fern',    value: '#8ACB8F' },
  { label: 'Volt',    value: '#EDDE5C' },
  { label: 'Circuit', value: '#DCFEAD' },
  { label: 'Pink',    value: '#D4537E' },
]

const DEPARTMENTS = ['Creative','Production','Technology','Business','Operations','Leadership']

const SKILL_SUGGESTIONS = [
  'UE5','Projection Mapping','TouchDesigner','Show Control',
  'After Effects','3D','AR/VR','Motion Design','Audio Design','Creative Direction',
]

const NOTIFICATION_LABELS: Record<NotificationPrefKey, string> = {
  wiki_updated: 'Wiki page updated',
  prompt_upvoted: 'Your prompt was upvoted',
  contribution_approved: 'Contribution approved',
  new_member: 'New team member joined',
  digest_ready: 'Daily digest ready',
}

function getInitialsFromName(name: string | null | undefined): string {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

interface ProfilePageClientProps {
  profile: Profile | null
  email: string
}

export function ProfilePageClient({ profile, email }: ProfilePageClientProps) {
  const { toast } = useToast()
  const supabase = createClient()
  const [tab, setTab] = useState<'overview' | 'edit' | 'notifications'>('overview')

  // Edit tab state
  const [fullName, setFullName]         = useState(profile?.full_name ?? '')
  const [displayName, setDisplayName]   = useState(profile?.display_name ?? '')
  const [jobTitle, setJobTitle]         = useState(profile?.role ?? '')
  const [department, setDepartment]     = useState(profile?.department ?? '')
  const [bio, setBio]                   = useState(profile?.bio ?? '')
  const [skills, setSkills]             = useState<string[]>(profile?.skills ?? [])
  const [skillInput, setSkillInput]     = useState('')
  const [location, setLocation]         = useState(profile?.location ?? '')
  const [linkedinUrl, setLinkedinUrl]   = useState(profile?.linkedin_url ?? '')
  const [avatarColor, setAvatarColor]   = useState(profile?.avatar_color ?? '#ED693A')
  const [saving, setSaving]             = useState(false)

  // Notifications tab state
  const [notifPrefs, setNotifPrefs] = useState<Partial<Record<NotificationPrefKey, boolean>>>(
    profile?.notifications_prefs ?? {}
  )

  const initials = getInitialsFromName(profile?.full_name)
  const color = avatarColor

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({
      id: profile?.id,
      full_name: fullName,
      display_name: displayName,
      role: jobTitle,
      department: department.toLowerCase() || null,
      bio,
      skills,
      location,
      linkedin_url: linkedinUrl,
      avatar_color: avatarColor,
    })
    setSaving(false)
    if (error) toast('Failed to save profile.', 'error')
    else toast('Profile saved!', 'success')
  }

  const handleSaveNotifications = async () => {
    const { error } = await supabase.from('profiles').update({
      notifications_prefs: notifPrefs,
    }).eq('id', profile?.id ?? '')
    if (error) toast('Failed to save preferences.', 'error')
    else toast('Notification preferences saved!', 'success')
  }

  const addSkill = (skill: string) => {
    if (skill.trim() && !skills.includes(skill.trim())) {
      setSkills(prev => [...prev, skill.trim()])
    }
    setSkillInput('')
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {initials}
        </div>
        <div>
          <h1 className="text-xl font-bold">{profile?.full_name ?? 'Your Profile'}</h1>
          <p className="text-sm text-[var(--color-subtext)]">{profile?.role ?? ''}</p>
          <p className="text-xs text-[var(--color-muted)]">{email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-seeper-border/40">
        {(['overview', 'edit', 'notifications'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm capitalize border-b-2 transition-colors -mb-px',
              tab === t
                ? 'border-plasma text-plasma'
                : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[var(--color-muted)] mb-1">Department</p>
              <p className="text-sm capitalize">{profile?.department ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-muted)] mb-1">Location</p>
              <p className="text-sm">{profile?.location ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-muted)] mb-1">Member since</p>
              <p className="text-sm">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-muted)] mb-1">Role</p>
              <p className="text-sm">{profile?.role ?? '—'}</p>
            </div>
          </div>
          {profile?.bio && (
            <div>
              <p className="text-xs text-[var(--color-muted)] mb-1">Bio</p>
              <p className="text-sm">{profile.bio}</p>
            </div>
          )}
          {profile?.skills && profile.skills.length > 0 && (
            <div>
              <p className="text-xs text-[var(--color-muted)] mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(s => (
                  <span key={s} className="px-2.5 py-1 rounded-full bg-[var(--color-raised)] text-xs border border-seeper-border/40">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {profile?.linkedin_url && (
            <div>
              <p className="text-xs text-[var(--color-muted)] mb-1">LinkedIn</p>
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-plasma hover:underline">
                {profile.linkedin_url}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Edit tab */}
      {tab === 'edit' && (
        <div className="space-y-5">
          {/* Avatar color */}
          <div>
            <label className="text-xs text-[var(--color-subtext)] mb-2 block">Avatar colour</label>
            <div className="flex gap-2">
              {AVATAR_COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setAvatarColor(c.value)}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all',
                    avatarColor === c.value ? 'border-white scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Full name */}
          <div>
            <label className="text-xs text-[var(--color-subtext)] mb-1 block">Full name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              className="w-full bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-plasma/60" />
          </div>

          {/* Display name */}
          <div>
            <label className="text-xs text-[var(--color-subtext)] mb-1 block">Display name</label>
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
              className="w-full bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-plasma/60" />
          </div>

          {/* Job title */}
          <div>
            <label className="text-xs text-[var(--color-subtext)] mb-1 block">Job title / Role</label>
            <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)}
              className="w-full bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-plasma/60" />
          </div>

          {/* Department */}
          <div>
            <label className="text-xs text-[var(--color-subtext)] mb-2 block">Department</label>
            <div className="grid grid-cols-3 gap-2">
              {DEPARTMENTS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDepartment(d)}
                  className={cn(
                    'py-2 rounded-lg border text-xs font-medium transition-all',
                    department === d
                      ? 'border-plasma bg-plasma/10 text-plasma'
                      : 'border-seeper-border/40 text-[var(--color-subtext)] hover:border-seeper-border'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="text-xs text-[var(--color-subtext)] mb-1 block">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 300))} rows={3}
              className="w-full bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-plasma/60 resize-none" />
          </div>

          {/* Skills */}
          <div>
            <label className="text-xs text-[var(--color-subtext)] mb-2 block">Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map(s => (
                <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-plasma/10 text-plasma text-xs border border-plasma/30">
                  {s}
                  <button type="button" onClick={() => setSkills(prev => prev.filter(x => x !== s))} className="text-plasma/60 hover:text-plasma">✕</button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SKILL_SUGGESTIONS.filter(s => !skills.includes(s)).map(s => (
                <button key={s} type="button" onClick={() => addSkill(s)}
                  className="px-2 py-0.5 rounded-full text-xs border border-seeper-border/40 text-[var(--color-muted)] hover:border-seeper-border transition-all">
                  + {s}
                </button>
              ))}
            </div>
            <input type="text" value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput) } }}
              placeholder="Add custom skill..."
              className="w-full bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-plasma/60" />
          </div>

          {/* Location */}
          <div>
            <label className="text-xs text-[var(--color-subtext)] mb-1 block">Location</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)}
              className="w-full bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-plasma/60" />
          </div>

          {/* LinkedIn */}
          <div>
            <label className="text-xs text-[var(--color-subtext)] mb-1 block">LinkedIn URL</label>
            <input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full bg-[var(--color-raised)] border border-seeper-border/40 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-plasma/60" />
          </div>

          <button type="button" onClick={handleSave} disabled={saving}
            className={cn(
              'w-full py-3 rounded-full text-sm font-bold text-white transition-all',
              saving ? 'bg-plasma/40 cursor-not-allowed' : 'bg-plasma hover:bg-plasma/90 active:scale-[0.97]'
            )}>
            {saving ? 'Saving...' : 'Save profile →'}
          </button>
        </div>
      )}

      {/* Notifications tab */}
      {tab === 'notifications' && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-subtext)]">Choose which events send you in-app notifications.</p>
          {(Object.entries(NOTIFICATION_LABELS) as [NotificationPrefKey, string][]).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-seeper-border/20">
              <span className="text-sm">{label}</span>
              <button
                type="button"
                onClick={() => setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }))}
                className={cn(
                  'w-10 h-6 rounded-full transition-all relative',
                  notifPrefs[key] ? 'bg-plasma' : 'bg-[var(--color-raised)] border border-seeper-border/40'
                )}
                role="switch"
                aria-checked={notifPrefs[key] ?? false}
              >
                <span className={cn(
                  'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',
                  notifPrefs[key] ? 'right-0.5' : 'left-0.5'
                )} />
              </button>
            </div>
          ))}
          <button type="button" onClick={handleSaveNotifications}
            className="w-full py-3 rounded-full text-sm font-bold text-white bg-plasma hover:bg-plasma/90 active:scale-[0.97] transition-all mt-4">
            Save preferences →
          </button>
        </div>
      )}
    </div>
  )
}
