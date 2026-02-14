import { create } from 'zustand'

interface UIState {
  newChatDialogOpen: boolean
  setNewChatDialogOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  newChatDialogOpen: false,
  setNewChatDialogOpen: (open) => set({ newChatDialogOpen: open }),
}))
