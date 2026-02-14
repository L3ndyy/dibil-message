import { useState } from 'react'
import { Search, UserPlus, MessageCirclePlus } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import { useUIStore } from '@/store/uiStore'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog'
import { searchUsers, createDirectChat } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Layout } from './Layout'
import type { Profile } from '@/types'

export function ChatPage() {
  const { profile } = useAuthStore()
  const { setActiveChat, addOrUpdateChat } = useChatStore()
  const { newChatDialogOpen: searchOpen, setNewChatDialogOpen: setSearchOpen } = useUIStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [searching, setSearching] = useState(false)
  const [addingUserId, setAddingUserId] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearchError(null)
    setSearching(true)
    try {
      const users = await searchUsers(searchQuery.trim())
      setSearchResults(users)
    } catch {
      setSearchError('Ошибка поиска. Попробуйте снова.')
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleStartChat = async (user: Profile) => {
    setSearchError(null)
    setAddingUserId(user.id)
    try {
      const chat = await createDirectChat(user.id)
      if (chat) {
        addOrUpdateChat({ ...chat, other_member: user })
        setActiveChat(chat.id)
        setSearchOpen(false)
        setSearchQuery('')
        setSearchResults([])
      } else {
        setSearchError('Не удалось начать чат. Проверьте подключение и попробуйте снова.')
      }
    } catch {
      setSearchError('Не удалось начать чат. Попробуйте снова.')
    } finally {
      setAddingUserId(null)
    }
  }

  const handleSignOut = () => {
    const base = `${window.location.origin}/dibil-message/`
    supabase.auth.signOut().finally(() => {
      useAuthStore.getState().signOut()
      window.location.replace(base)
    })
  }

  const openNewChat = () => {
    setSearchError(null)
    setSearchQuery('')
    setSearchResults([])
    setSearchOpen(true)
  }

  return (
    <>
      <div className="relative flex h-screen flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-dibil-border)] bg-[var(--color-dibil-panel)] px-4 md:px-6">
          <span className="font-semibold text-[var(--color-dibil-text)]">Dibil</span>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={openNewChat} className="gap-1.5">
              <MessageCirclePlus className="h-4 w-4" />
              <span className="hidden sm:inline">Создать беседу</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={openNewChat} aria-label="Поиск">
              <Search className="h-5 w-5" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleSignOut}>
              <span className="text-sm">Выйти</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-hidden">
          <Layout />
        </main>
      </div>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-h-[80vh] overflow-hidden flex flex-col">
          <DialogTitle>Найти пользователя</DialogTitle>
          <div className="flex gap-2">
            <Input
              placeholder="Имя или имя пользователя..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching}>
              Найти
            </Button>
          </div>
          <div className="mt-4 flex-1 overflow-auto">
            {searchError && (
              <p className="mb-2 text-sm text-red-400">{searchError}</p>
            )}
            {searchResults.length === 0 && searchQuery && !searching && (
              <p className="text-sm text-[var(--color-dibil-text-muted)]">Пользователи не найдены.</p>
            )}
            {searchResults.map((user) => {
              const isMe = user.id === profile?.id
              const isAdding = addingUserId === user.id
              return (
                <div
                  key={user.id}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl p-3',
                    isMe
                      ? 'bg-[var(--color-dibil-surface)]/50'
                      : 'hover:bg-[var(--color-dibil-surface)]'
                  )}
                >
                  <Avatar
                    src={user.avatar_url}
                    fallback={user.full_name ?? user.username ?? ''}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--color-dibil-text)]">
                      {user.full_name ?? user.username ?? 'Без имени'}
                      {isMe && (
                        <span className="ml-2 text-xs font-normal text-[var(--color-dibil-text-muted)]">(это вы)</span>
                      )}
                    </p>
                    {user.username && (
                      <p className="truncate text-sm text-[var(--color-dibil-text-muted)]">@{user.username}</p>
                    )}
                  </div>
                  {isMe ? (
                    <span className="shrink-0 text-sm text-[var(--color-dibil-text-muted)]">Нельзя начать чат с собой</span>
                  ) : (
                    <button
                      type="button"
                      disabled={!!addingUserId}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleStartChat(user)
                      }}
                      className="shrink-0 rounded-lg p-2 hover:bg-[var(--color-dibil-border)] disabled:opacity-70"
                    >
                      {isAdding ? (
                        <span className="text-sm text-[var(--color-dibil-text-muted)]">Добавление...</span>
                      ) : (
                        <UserPlus className="h-5 w-5 text-[var(--color-dibil-primary)]" />
                      )}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}