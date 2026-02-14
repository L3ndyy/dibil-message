import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { CheckCheck } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'
import { getFilePreviewType } from '@/lib/utils'
import type { Message } from '@/types'
import { supabase } from '@/lib/supabase'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar: boolean
  currentUserId: string
}

const STORAGE_BUCKET = 'uploads'

export function MessageBubble({ message, isOwn, showAvatar }: MessageBubbleProps) {
  const files = message.file_uploads ?? []
  const hasContent = message.content?.trim()
  const isDeleted = message.is_deleted

  const getFileUrl = (path: string) => {
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
    return data.publicUrl
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-2', isOwn && 'flex-row-reverse')}
    >
      {showAvatar && !isOwn && message.sender ? (
        <Avatar
          src={message.sender.avatar_url}
          fallback={message.sender.full_name ?? message.sender.username ?? ''}
          size="sm"
          className="mt-1 shrink-0"
        />
      ) : showAvatar && isOwn ? (
        <div className="w-8 shrink-0" />
      ) : null}

      <div
        className={cn(
          'group relative max-w-[75%] rounded-2xl px-4 py-2',
          isOwn
            ? 'rounded-tr-md bg-[var(--color-dibil-primary)] text-white'
            : 'rounded-tl-md bg-[var(--color-dibil-surface)] text-[var(--color-dibil-text)]'
        )}
      >
        {!isOwn && message.sender && (
          <p className="mb-0.5 text-xs font-medium text-[var(--color-dibil-accent)]">
            {message.sender.full_name ?? message.sender.username ?? 'Пользователь'}
          </p>
        )}

        {message.reply_to && !message.reply_to.is_deleted && (
          <div
            className={cn(
              'mb-1 border-l-2 pl-2 text-sm opacity-90',
              isOwn ? 'border-white/50' : 'border-[var(--color-dibil-primary)]'
            )}
          >
            <p className="font-medium">
              {message.reply_to.sender?.full_name ?? message.reply_to.sender?.username ?? 'Пользователь'}
            </p>
            <p className="truncate text-xs">{message.reply_to.content ?? 'Вложение'}</p>
          </div>
        )}

        {isDeleted ? (
          <p className="italic opacity-70">Сообщение удалено</p>
        ) : (
          <>
            {files.length > 0 && (
              <div className="mb-2 space-y-2">
                {files.map((f) => {
                  const kind = getFilePreviewType(f.mime_type)
                  const url = getFileUrl(f.path)
                  if (kind === 'image') {
                    return (
                      <a key={f.id} href={url} target="_blank" rel="noopener noreferrer" className="block">
                        <img src={url} alt={f.name} className="max-h-64 rounded-lg object-cover" />
                      </a>
                    )
                  }
                  if (kind === 'video') {
                    return (
                      <video key={f.id} src={url} controls className="max-h-64 rounded-lg" />
                    )
                  }
                  if (kind === 'audio') {
                    return (
                      <audio key={f.id} src={url} controls className="w-full max-w-xs" />
                    )
                  }
                  return (
                    <a
                      key={f.id}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded bg-black/20 px-2 py-1 text-sm"
                    >
                      📎 {f.name}
                    </a>
                  )
                })}
              </div>
            )}
            {hasContent && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
          </>
        )}

        <div
          className={cn(
            'mt-1 flex items-center justify-end gap-1 text-xs opacity-80',
            isOwn ? 'text-white/90' : 'text-[var(--color-dibil-text-muted)]'
          )}
        >
          {message.is_edited && <span>изменено</span>}
          <time>{format(new Date(message.created_at), 'HH:mm')}</time>
          {isOwn && <CheckCheck className="h-3 w-3" />}
        </div>
      </div>
    </motion.div>
  )
}
