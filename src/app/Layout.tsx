import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Menu } from 'lucide-react'
import { ChatList } from '@/components/chat/ChatList'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { ChatView } from '@/components/chat/ChatView'
import { ProfilePanel } from '@/components/profile/ProfilePanel'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import { useChats } from '@/hooks/useChats'
import { useMessages } from '@/hooks/useMessages'
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages'
import { usePresenceTyping } from '@/hooks/usePresenceTyping'
import { sendMessage } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function Layout() {
  const { profile } = useAuthStore()
  const {
    chats,
    activeChatId,
    messages,
    typing,
    setActiveChat,
    appendMessage,
    updateChatLastMessage,
  } = useChatStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [infoOpen, setInfoOpen] = useState(false)

  useChats()
  useMessages(activeChatId)
  useRealtimeMessages(activeChatId)
  const { sendTyping } = usePresenceTyping(activeChatId)

  const activeChat = activeChatId ? chats.find((c) => c.id === activeChatId) ?? null : null
  const activeMessages = activeChatId ? messages[activeChatId] ?? [] : []
  const typingUsers = activeChatId ? typing[activeChatId] ?? [] : []

  const handleSendMessage = async (text: string, file?: File) => {
    if (!activeChatId || !profile) return
    const msg = await sendMessage(activeChatId, text, file)
    if (msg) {
      appendMessage(activeChatId, { ...msg, sender: profile })
      updateChatLastMessage(activeChatId, msg)
    }
  }

  const infoProfile = infoOpen && activeChat
    ? activeChat.type === 'direct'
      ? activeChat.other_member ?? null
      : null
    : null

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-dibil-bg)]">
      {/* Sidebar - chat list */}
      <div
        className={cn(
          'flex w-full flex-col border-r border-[var(--color-dibil-border)] md:w-80 md:flex-shrink-0',
          !sidebarOpen && 'hidden md:flex'
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-dibil-border)] bg-[var(--color-dibil-panel)] px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-semibold text-[var(--color-dibil-text)]">Dibil</span>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatList
            chats={chats}
            activeId={activeChatId}
            onSelect={(id) => {
              setActiveChat(id)
              setInfoOpen(false)
              setSidebarOpen(false)
            }}
          />
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          chat={activeChat}
          onBack={() => setSidebarOpen(true)}
          onOpenInfo={() => setInfoOpen((o) => !o)}
          typingUserIds={typingUsers.map((u) => u.user_id)}
        />
        <ChatView
          chatId={activeChatId}
          messages={activeMessages}
          currentUserId={profile?.id ?? ''}
          onSendMessage={handleSendMessage}
          onTyping={sendTyping}
          typingUserIds={typingUsers.map((u) => u.user_id)}
          isChannel={activeChat?.type === 'channel'}
        />
      </div>

      {/* Right panel - profile */}
      <AnimatePresence>
        {infoOpen && infoProfile && (
          <ProfilePanel profile={infoProfile} onClose={() => setInfoOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
