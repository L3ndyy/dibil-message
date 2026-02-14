import { useRef, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import type { Message } from '@/types'

interface ChatViewProps {
  chatId: string | null
  messages: Message[]
  currentUserId: string
  onSendMessage: (text: string, file?: File) => void
  onTyping?: () => void
  typingUserIds?: string[]
  isChannel?: boolean
}

export function ChatView({
  messages,
  currentUserId,
  onSendMessage,
  onTyping,
  typingUserIds = [],
  isChannel = false,
}: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  return (
    <div className="flex h-full flex-col bg-[var(--color-dibil-bg)]">
      {typingUserIds.length > 0 && (
        <div className="shrink-0 border-b border-[var(--color-dibil-border)] bg-[var(--color-dibil-panel)] px-4 py-1 text-sm italic text-[var(--color-dibil-text-muted)]">
          typing...
        </div>
      )}
      <ScrollArea className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-1">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwn={msg.sender_id === currentUserId}
                showAvatar={true}
                currentUserId={currentUserId}
              />
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      {!isChannel && (
        <MessageInput
          onSend={onSendMessage}
          onTyping={onTyping}
          placeholder="Write a message..."
        />
      )}
    </div>
  )
}
