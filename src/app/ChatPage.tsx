import { useState } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog'
import { searchUsers, createDirectChat } from '@/lib/api'
import { Layout } from './Layout'
import type { Profile } from '@/types'

export function ChatPage() {
  const { profile } = useAuthStore()
  const { setActiveChat, addOrUpdateChat } = useChatStore()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [searching, setSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    const users = await searchUsers(searchQuery.trim())
    setSearchResults(users.filter((u) => u.id !== profile?.id))
    setSearching(false)
  }

  const handleStartChat = async (user: Profile) => {
    const chat = await createDirectChat(user.id)
    if (chat) {
      addOrUpdateChat({ ...chat, other_member: user })
      setActiveChat(chat.id)
      setSearchOpen(false)
      setSearchQuery('')
      setSearchResults([])
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    useAuthStore.getState().signOut()
    navigate('/')
  }

  return (
    <>
      <div className="relative flex h-screen flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-dibil-border)] bg-[var(--color-dibil-panel)] px-4 md:px-6">
          <span className="font-semibold text-[var(--color-dibil-text)]">Dibil</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
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
            {searchResults.length === 0 && searchQuery && !searching && (
              <p className="text-sm text-[var(--color-dibil-text-muted)]">Пользователи не найдены.</p>
            )}
            {searchResults.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleStartChat(user)}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-[var(--color-dibil-surface)]"
              >
                <Avatar
                  src={user.avatar_url}
                  fallback={user.full_name ?? user.username ?? ''}
                  size="md"
                />
                <div>
                  <p className="font-medium text-[var(--color-dibil-text)]">
                    {user.full_name ?? user.username ?? 'Без имени'}
                  </p>
                  {user.username && (
                    <p className="text-sm text-[var(--color-dibil-text-muted)]">@{user.username}</p>
                  )}
                </div>
                <UserPlus className="ml-auto h-5 w-5 text-[var(--color-dibil-primary)]" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}