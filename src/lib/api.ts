import { supabase } from '@/lib/supabase'
import { STORAGE_BUCKET } from '@/lib/utils'
import type { Chat, Message, Profile } from '@/types'

export async function createDirectChat(otherUserId: string): Promise<Chat | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: existing } = await supabase
    .from('chat_members')
    .select('chat_id')
    .eq('user_id', user.id)

  const chatIds = (existing ?? []).map((r: { chat_id: string }) => r.chat_id)
  if (chatIds.length > 0) {
    const { data: match } = await supabase
      .from('chat_members')
      .select('chat_id')
      .in('chat_id', chatIds)
      .eq('user_id', otherUserId)
      .limit(1)
      .single()
    if (match && (match as { chat_id: string }).chat_id) {
      const { data: chat } = await supabase.from('chats').select('*').eq('id', (match as { chat_id: string }).chat_id).single()
      return chat as Chat
    }
  }

  const { data: newChat, error: chatErr } = await supabase
    .from('chats')
    .insert({ type: 'direct', created_by: user.id } as never)
    .select('*')
    .single()

  if (chatErr || !newChat) return null

  const newChatId = (newChat as { id: string }).id
  await supabase.from('chat_members').insert([
    { chat_id: newChatId, user_id: user.id, role: 'owner' },
    { chat_id: newChatId, user_id: otherUserId, role: 'member' },
  ] as never)

  return newChat as Chat
}

export async function sendMessage(
  chatId: string,
  content: string,
  file?: File,
  replyToId?: string
): Promise<Message | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let fileUploadId: string | null = null
  if (file) {
    const path = `${user.id}/${Date.now()}_${file.name}`
    const { error: uploadErr } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (!uploadErr) {
      const { data: fu } = await supabase
        .from('file_uploads')
        .insert({
          bucket: STORAGE_BUCKET,
          path,
          name: file.name,
          mime_type: file.type,
          size: file.size,
        } as never)
        .select('id')
        .single()
      fileUploadId = (fu as { id: string } | null)?.id ?? null
    }
  }

  const { data: msg, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      sender_id: user.id,
      content: content || null,
      reply_to_id: replyToId ?? null,
    } as never)
    .select('*')
    .single()

  if (error || !msg) return null

  const msgId = (msg as { id: string }).id
  if (fileUploadId) {
    await supabase.from('file_uploads').update({ message_id: msgId } as never).eq('id', fileUploadId)
  }

  return msg as Message
}

export async function searchUsers(query: string): Promise<Profile[]> {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(20)
  return (data ?? []) as Profile[]
}
