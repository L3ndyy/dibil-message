import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'

const TYPING_TIMEOUT_MS = 5000

export function usePresenceTyping(chatId: string | null) {
  const { user, profile } = useAuthStore()
  const { setTyping } = useChatStore()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const sendTyping = useCallback(() => {
    const ch = channelRef.current
    if (!ch || !user) return
    ch.track({ typing_at: Date.now(), user_id: user.id, profile })
  }, [user, profile])

  useEffect(() => {
    if (!chatId || !user) return

    const channel = supabase.channel(`typing:${chatId}`, {
      config: { presence: { key: user.id } },
    })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const others = Object.entries(state)
          .filter(([id]) => id !== user.id)
          .map(([id, presences]) => {
            const p = (presences as { typing_at?: number }[])[0]
            const typingAt = p?.typing_at ?? 0
            if (Date.now() - typingAt > TYPING_TIMEOUT_MS) return null
            return { user_id: id, updated_at: new Date(typingAt).toISOString(), chat_id: chatId }
          })
          .filter(Boolean) as { user_id: string; updated_at: string; chat_id: string }[]
        setTyping(chatId, others)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && user) {
          await channel.track({ typing_at: Date.now(), user_id: user.id, profile })
        }
      })

    channelRef.current = channel

    return () => {
      channel.untrack()
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [chatId, user?.id, profile, setTyping])

  return { sendTyping }
}
