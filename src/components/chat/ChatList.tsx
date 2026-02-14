import { motion, AnimatePresence } from 'framer-motion'
import { Search, MessageCircle, Hash } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { cn } from '@/lib/utils'
import { formatMessageTime } from '@/lib/utils'
import type { ChatWithMeta } from '@/types'

interface ChatListProps {
  chats: ChatWithMeta[]
  activeId: string | null
  onSelect: (id: string) => void
}

export function ChatList({ chats, activeId, onSelect }: ChatListProps) {
  const [search, setSearch] = useState('')
  const filtered = search
    ? chats.filter(
        (c) =>
          c.title?.toLowerCase().includes(search.toLowerCase()) ||
          c.other_member?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          c.other_member?.username?.toLowerCase().includes(search.toLowerCase())
      )
    : chats

  return (
    <div className="flex h-full flex-col bg-[var(--color-dibil-panel)]">
      <div className="flex shrink-0 items-center gap-2 border-b border-[var(--color-dibil-border)] p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-dibil-text-muted)]" />
          <Input
            placeholder="Поиск чатов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((chat, i) => {
              const isActive = chat.id === activeId
              const name =
                chat.type === 'direct'
                  ? chat.other_member?.full_name || chat.other_member?.username || 'Без имени'
                  : chat.title ?? 'Чат'
              const avatar =
                chat.type === 'direct' ? chat.other_member?.avatar_url : chat.avatar_url
              const last = chat.last_message
              const lastText = last?.is_deleted ? 'Сообщение удалено' : last?.content?.slice(0, 40) ?? 'Пока нет сообщений'
              return (
                <motion.button
                  key={chat.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => onSelect(chat.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors',
                    isActive ? 'bg-[var(--color-dibil-surface)]' : 'hover:bg-[var(--color-dibil-surface)]/70'
                  )}
                >
                  <Avatar
                    src={avatar}
                    fallback={name}
                    size="md"
                    className="shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium text-[var(--color-dibil-text)]">
                        {name}
                      </span>
                      {last && (
                        <span className="shrink-0 text-xs text-[var(--color-dibil-text-muted)]">
                          {formatMessageTime(last.created_at)}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-[var(--color-dibil-text-muted)]">
                      {lastText}
                    </p>
                  </div>
                  {chat.type === 'channel' && (
                    <Hash className="h-4 w-4 shrink-0 text-[var(--color-dibil-text-muted)]" />
                  )}
                  {chat.type === 'group' && (
                    <MessageCircle className="h-4 w-4 shrink-0 text-[var(--color-dibil-text-muted)]" />
                  )}
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  )
}
