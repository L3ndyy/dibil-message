export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type ChatType = 'direct' | 'group' | 'channel'
export type MemberRole = 'member' | 'admin' | 'owner'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      chats: {
        Row: {
          id: string
          type: ChatType
          title: string | null
          description: string | null
          avatar_url: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['chats']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['chats']['Insert']>
      }
      chat_members: {
        Row: {
          id: string
          chat_id: string
          user_id: string
          role: MemberRole
          joined_at: string
          last_read_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['chat_members']['Row'], 'id' | 'joined_at'> & { id?: string; joined_at?: string }
        Update: Partial<Database['public']['Tables']['chat_members']['Insert']>
      }
      messages: {
        Row: {
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
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      message_reactions: {
        Row: {
          id: string
          message_id: string
          user_id: string
          emoji: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['message_reactions']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['message_reactions']['Insert']>
      }
      file_uploads: {
        Row: {
          id: string
          message_id: string | null
          bucket: string
          path: string
          name: string
          mime_type: string | null
          size: number | null
          metadata: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['file_uploads']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['file_uploads']['Insert']>
      }
      chat_topics: {
        Row: {
          id: string
          chat_id: string
          title: string
          icon_emoji: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['chat_topics']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['chat_topics']['Insert']>
      }
    }
  }
}
