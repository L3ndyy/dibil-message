export type ChatType = 'direct' | 'group' | 'channel'
export type MemberRole = 'member' | 'admin' | 'owner'

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  status: string | null
  last_seen: string | null
  is_online: boolean
  created_at: string
  updated_at: string
}

export interface Chat {
  id: string
  type: ChatType
  title: string | null
  description: string | null
  avatar_url: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ChatTopic {
  id: string
  chat_id: string
  title: string
  icon_emoji: string | null
  created_at: string
}

export interface ChatMember {
  id: string
  chat_id: string
  user_id: string
  role: MemberRole
  joined_at: string
  last_read_at: string | null
  profile?: Profile
}

export interface Message {
  id: string
  chat_id: string
  topic_id: string | null
  sender_id: string
  reply_to_id: string | null
  forwarded_from_id: string | null
  content: string | null
  created_at: string
  updated_at: string
  is_edited: boolean
  is_deleted: boolean
  sender?: Profile
  reply_to?: Message
  reactions?: MessageReaction[]
  file_uploads?: FileUpload[]
}

export interface MessageReaction {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
}

export interface FileUpload {
  id: string
  message_id: string | null
  bucket: string
  path: string
  name: string
  mime_type: string | null
  size: number | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface TypingIndicator {
  chat_id: string
  user_id: string
  updated_at: string
  profile?: Profile
}

export interface ChatWithMeta extends Chat {
  last_message?: Message | null
  unread_count?: number
  members?: ChatMember[]
  other_member?: Profile
}
