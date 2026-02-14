import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { user, profile, setUser, setProfile, loadProfile } = useAuthStore()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await loadProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    void supabase.auth.getSession().then(({ data: { session: s } }) => {
      setUser(s?.user ?? null)
      if (s?.user) loadProfile(s.user.id)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setProfile, loadProfile])

  return { user, profile, isAuthenticated: !!user }
}
