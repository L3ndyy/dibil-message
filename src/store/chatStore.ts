import { create } from 'zustand'
import type { ChatWithMeta, Message, TypingIndicator } from '@/types'

interface ChatState {
  chats: ChatWithMeta[]
  activeChatId: string | null
  messages: Record<string, Message[]>
  typing: Record<string, TypingIndicator[]>
  setChats: (chats: ChatWithMeta[]) => void
  setActiveChat: (id: string | null) => void
  setMessages: (chatId: string, messages: Message[]) => void
  appendMessage: (chatId: string, message: Message) => void
  updateMessage: (chatId: string, messageId: string, upd: Partial<Message>) => void
  removeMessage: (chatId: string, messageId: string) => void
  setTyping: (chatId: string, users: TypingIndicator[]) => void
  addTyping: (chatId: string, user: TypingIndicator) => void
  removeTyping: (chatId: string, userId: string) => void
  updateChatLastMessage: (chatId: string, message: Message | null) => void
  addOrUpdateChat: (chat: ChatWithMeta) => void
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  activeChatId: null,
  messages: {},
  typing: {},
  setChats: (chats) => set({ chats }),
  setActiveChat: (activeChatId) => set({ activeChatId }),
  setMessages: (chatId, list) =>
    set((s) => ({ messages: { ...s.messages, [chatId]: list } })),
  appendMessage: (chatId, message) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [chatId]: [...(s.messages[chatId] ?? []), message],
      },
    })),
  updateMessage: (chatId, messageId, upd) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [chatId]: (s.messages[chatId] ?? []).map((m) =>
          m.id === messageId ? { ...m, ...upd } : m
        ),
      },
    })),
  removeMessage: (chatId, messageId) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [chatId]: (s.messages[chatId] ?? []).filter((m) => m.id !== messageId),
      },
    })),
  setTyping: (chatId, users) =>
    set((s) => ({ typing: { ...s.typing, [chatId]: users } })),
  addTyping: (chatId, user) =>
    set((s) => {
      const list = s.typing[chatId] ?? []
      if (list.some((u) => u.user_id === user.user_id)) return s
      return { typing: { ...s.typing, [chatId]: [...list, user] } }
    }),
  removeTyping: (chatId, userId) =>
    set((s) => ({
      typing: {
        ...s.typing,
        [chatId]: (s.typing[chatId] ?? []).filter((u) => u.user_id !== userId),
      },
    })),
  updateChatLastMessage: (chatId, message) =>
    set((s) => ({
      chats: s.chats.map((c) =>
        c.id === chatId ? { ...c, last_message: message } : c
      ),
    })),
  addOrUpdateChat: (chat) =>
    set((s) => {
      const idx = s.chats.findIndex((c) => c.id === chat.id)
      const next = [...s.chats]
      if (idx >= 0) next[idx] = chat
      else next.unshift(chat)
      return { chats: next }
    }),
}))
