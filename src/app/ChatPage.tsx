import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, UserPlus, MessageCirclePlus } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import { useUIStore } from '@/store/uiStore'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { getAllProfiles, createDirectChat } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Layout } from './Layout'
import type { Profile } from '@/types'

export function ChatPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { setActiveChat, addOrUpdateChat } = useChatStore()
  const { newChatDialogOpen: searchOpen, setNewChatDialogOpen: setSearchOpen } = useUIStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [allUsers, setAllUsers] = useState<Profile[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [addingUserId, setAddingUserId] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  useEffect(() => {
    if (!searchOpen) return
    setSearchError(null)
    setLoadingUsers(true)
    getAllProfiles()
      .then(setAllUsers)
      .catch(() => {
        setSearchError('Не удалось загрузить список пользователей.')
        setAllUsers([])
      })
      .finally(() => setLoadingUsers(false))
  }, [searchOpen])

  const query = searchQuery.trim().toLowerCase()
  const searchResults = query
    ? allUsers.filter(
        (u) =>
          (u.full_name?.toLowerCase().includes(query) ?? false) ||
          (u.username?.toLowerCase().includes(query) ?? false)
      )
    : allUsers

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
      } else {
        setSearchError('Не удалось начать чат. Проверьте подключение и попробуйте снова.')
      }
    } catch {
      setSearchError('Не удалось начать чат. Попробуйте снова.')
    } finally {
      setAddingUserId(null)
    }
  }

  const [signingOut, setSigningOut] = useState(false)
  const handleSignOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    const base = `${window.location.origin}/dibil-message/`
    try {
      await supabase.auth.signOut()
      useAuthStore.getState().signOut()
    } finally {
      window.location.replace(base)
    }
  }

  const openNewChat = () => {
    setSearchError(null)
    setSearchQuery('')
    setSearchOpen(true)
  }

  return (
    <>
      <div className="relative flex h-screen flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-dibil-border)] bg-[var(--color-dibil-panel)] px-4 md:px-6">
          <span className="font-semibold text-[var(--color-dibil-text)]">Dibil</span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/profile')} title="Мой профиль">
              <Avatar src={profile?.avatar_url} fallback={profile?.full_name ?? profile?.username ?? ''} size="sm" />
            </Button>
            <Button variant="primary" size="sm" onClick={openNewChat} className="gap-1.5">
              <MessageCirclePlus className="h-4 w-4" />
              <span className="hidden sm:inline">Создать беседу</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={openNewChat} aria-label="Поиск">
              <Search className="h-5 w-5" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleSignOut} disabled={signingOut}>
              <span className="text-sm">{signingOut ? 'Выход…' : 'Выйти'}</span>
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
          <DialogDescription>
            Список всех пользователей. Введите имя или @username для фильтра.
          </DialogDescription>
          <div className="mt-2">
            <Input
              placeholder="Фильтр по имени или @username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="mt-4 flex-1 overflow-auto">
            {searchError && (
              <p className="mb-2 text-sm text-red-400">{searchError}</p>
            )}
            {loadingUsers && (
              <p className="text-sm text-[var(--color-dibil-text-muted)]">Загрузка...</p>
            )}
            {!loadingUsers && searchResults.length === 0 && (
              <p className="text-sm text-[var(--color-dibil-text-muted)]">Нет пользователей.</p>
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