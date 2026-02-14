import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types'

interface AuthState {
  user: User | null
  profile: Profile | null
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  loadProfile: (userId: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      loadProfile: async (userId: string) => {
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
        set({ profile: data ?? null })
      },
      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, profile: null })
      },
    }),
    { name: 'dibil-auth', partialize: (s) => ({ user: s.user, profile: s.profile }) }
  )
)
