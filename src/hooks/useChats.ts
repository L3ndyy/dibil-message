import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import type { ChatWithMeta, Message } from '@/types'

export function useChats() {
  const { user } = useAuthStore()
  const { setChats, updateChatLastMessage } = useChatStore()

  useEffect(() => {
    if (!user) return

    const loadChats = async () => {
      const { data: members } = await supabase
        .from('chat_members')
        .select('chat_id')
        .eq('user_id', user.id)
      const chatIds = (members ?? []).map((m) => m.chat_id)
      if (chatIds.length === 0) {
        setChats([])
        return
      }

      const { data: chats } = await supabase
        .from('chats')
        .select('*')
        .in('id', chatIds)
        .order('updated_at', { ascending: false })

      const withMeta: ChatWithMeta[] = await Promise.all(
        (chats ?? []).map(async (chat) => {
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chat.id)
            .is('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          const { data: mems } = await supabase.from('chat_members').select('*').eq('chat_id', chat.id)

          let other_member = null
          if (chat.type === 'direct' && mems?.length) {
            const otherId = mems.find((m) => m.user_id !== user.id)?.user_id
            if (otherId) {
              const { data: prof } = await supabase.from('profiles').select('*').eq('id', otherId).single()
              other_member = prof
            }
          }

          return {
            ...chat,
            last_message: lastMsg as Message | null,
            members: mems ?? [],
            other_member: other_member ?? undefined,
          }
        })
      )

      setChats(withMeta)
    }

    loadChats()

    const channel = supabase
      .channel('chats_list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chats' }, () => loadChats())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as Message
        updateChatLastMessage(msg.chat_id, msg)
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [user?.id, setChats, updateChatLastMessage])
}
