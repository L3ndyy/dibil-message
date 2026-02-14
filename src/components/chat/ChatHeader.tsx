import { ArrowLeft, Info, Hash, MessageCircle } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { ChatWithMeta } from '@/types'

interface ChatHeaderProps {
  chat: ChatWithMeta | null
  onBack?: () => void
  onOpenInfo?: () => void
  typingUserIds?: string[]
  className?: string
}

export function ChatHeader({ chat, onBack, onOpenInfo, typingUserIds = [], className }: ChatHeaderProps) {
  if (!chat) {
    return (
      <header className={cn('flex h-14 shrink-0 items-center border-b border-[var(--color-dibil-border)] bg-[var(--color-dibil-panel)] px-4', className)}>
        <span className="text-[var(--color-dibil-text-muted)]">Select a chat</span>
      </header>
    )
  }

  const name =
    chat.type === 'direct'
      ? chat.other_member?.full_name || chat.other_member?.username || 'Unknown'
      : chat.title ?? 'Chat'
  const avatar = chat.type === 'direct' ? chat.other_member?.avatar_url : chat.avatar_url
  const subtitle = typingUserIds.length > 0 ? 'typing...' : chat.other_member?.status ?? null

  return (
    <header
      className={cn(
        'flex h-14 shrink-0 items-center gap-3 border-b border-[var(--color-dibil-border)] bg-[var(--color-dibil-panel)] px-4',
        className
      )}
    >
      {onBack && (
        <Button variant="ghost" size="sm" onClick={onBack} className="lg:hidden">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
      <Avatar src={avatar} fallback={name} size="md" />
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-semibold text-[var(--color-dibil-text)]">{name}</h1>
        <p className="truncate text-xs text-[var(--color-dibil-text-muted)]">
          {subtitle ?? (chat.type === 'channel' ? 'Channel' : chat.type === 'group' ? 'Group' : '')}
        </p>
      </div>
      {chat.type === 'channel' && <Hash className="h-5 w-5 text-[var(--color-dibil-text-muted)]" />}
      {chat.type === 'group' && <MessageCircle className="h-5 w-5 text-[var(--color-dibil-text-muted)]" />}
      {onOpenInfo && (
        <Button variant="ghost" size="sm" onClick={onOpenInfo}>
          <Info className="h-5 w-5" />
        </Button>
      )}
    </header>
  )
}
