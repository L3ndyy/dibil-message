import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useChatStore } from '@/store/chatStore'
import type { Message } from '@/types'
import type { Profile } from '@/types'

const PAGE_SIZE = 50

export function useMessages(chatId: string | null) {
  const { setMessages } = useChatStore()

  useEffect(() => {
    if (!chatId) return

    const load = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(PAGE_SIZE)

      if (error) return
      const msgs = (data ?? []) as Message[]
      const senderIds = [...new Set(msgs.map((m) => m.sender_id))]
      const { data: profiles } = await supabase.from('profiles').select('*').in('id', senderIds)
      const profileMap = new Map<string, Profile>((profiles ?? []).map((p) => [p.id, p]))
      const withSenders = msgs.map((m) => ({ ...m, sender: profileMap.get(m.sender_id) }))
      const fileIds = withSenders.flatMap((m) => [m.id])
      if (fileIds.length > 0) {
        const { data: files } = await supabase.from('file_uploads').select('*').in('message_id', fileIds)
        const byMessage = (files ?? []).reduce((acc, f) => {
          if (f.message_id) acc.set(f.message_id, [...(acc.get(f.message_id) ?? []), f])
          return acc
        }, new Map<string, typeof files>())
        const withFiles = withSenders.map((m) => ({ ...m, file_uploads: byMessage.get(m.id) ?? [] }))
        setMessages(chatId, withFiles)
      } else {
        setMessages(chatId, withSenders)
      }
    }

    load()
  }, [chatId, setMessages])
}
