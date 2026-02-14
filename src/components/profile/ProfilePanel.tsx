import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'

interface ProfilePanelProps {
  profile: Profile | null
  onClose: () => void
  className?: string
}

export function ProfilePanel({ profile, onClose, className }: ProfilePanelProps) {
  if (!profile) return null

  const name = profile.full_name ?? profile.username ?? 'Unknown'
  const bio = profile.bio ?? profile.status ?? ''

  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 320, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      className={cn('flex shrink-0 flex-col border-l border-[var(--color-dibil-border)] bg-[var(--color-dibil-panel)]', className)}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-dibil-border)] px-4">
        <span className="font-medium">Profile</span>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar src={profile.avatar_url} fallback={name} size="lg" className="mb-4" />
          <h2 className="text-xl font-semibold text-[var(--color-dibil-text)]">{name}</h2>
          {profile.username && (
            <p className="text-sm text-[var(--color-dibil-primary)]">@{profile.username}</p>
          )}
          {bio && <p className="mt-2 text-sm text-[var(--color-dibil-text-muted)]">{bio}</p>}
          <div className="mt-4 flex flex-col gap-2 text-left text-sm text-[var(--color-dibil-text-muted)]">
            {profile.is_online ? (
              <span className="text-green-500">Online</span>
            ) : profile.last_seen ? (
              <span>Last seen {format(new Date(profile.last_seen), 'PPp')}</span>
            ) : null}
          </div>
        </div>
      </ScrollArea>
    </motion.aside>
  )
}
