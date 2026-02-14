import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useChatStore } from '@/store/chatStore'
import type { Message } from '@/types'

export function useRealtimeMessages(chatId: string | null) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const { appendMessage, updateMessage, removeMessage } = useChatStore()

  useEffect(() => {
    if (!chatId) return

    const channel = supabase
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          const newRow = payload.new as Message
          appendMessage(chatId, { ...newRow, is_edited: false, is_deleted: false })
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          const updated = payload.new as Message
          updateMessage(chatId, updated.id, updated)
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          const old = payload.old as { id: string }
          removeMessage(chatId, old.id)
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [chatId, appendMessage, updateMessage, removeMessage])
}
