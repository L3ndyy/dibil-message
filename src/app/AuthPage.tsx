import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, MessageCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type Mode = 'login' | 'register'

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess('')
    setLoading(true)
    try {
      if (mode === 'register') {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        })
        if (err) throw err
        setSuccess('Проверьте почту: на неё отправлена ссылка для подтверждения.')
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-dibil-bg)] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-[var(--color-dibil-border)] bg-[var(--color-dibil-panel)] p-8 shadow-xl"
      >
        <div className="mb-8 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-dibil-primary)]">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="mb-1 text-center text-2xl font-bold text-[var(--color-dibil-text)]">Dibil</h1>
        <p className="mb-6 text-center text-sm text-[var(--color-dibil-text-muted)]">
          {mode === 'login' ? 'Войдите, чтобы продолжить' : 'Создайте аккаунт'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-dibil-text-muted)]" />
              <Input
                placeholder="Имя"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-9"
                required={mode === 'register'}
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-dibil-text-muted)]" />
            <Input
              type="email"
              placeholder="Электронная почта"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-dibil-text-muted)]" />
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9"
              required
              minLength={6}
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && <p className="text-sm text-green-400">{success}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Подождите...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-[var(--color-dibil-border)]" />
          <span className="text-xs text-[var(--color-dibil-text-muted)]">или</span>
          <div className="h-px flex-1 bg-[var(--color-dibil-border)]" />
        </div>

        <Button type="button" variant="secondary" className="w-full" onClick={handleGoogle}>
          Войти через Google
        </Button>

        <p className="mt-6 text-center text-sm text-[var(--color-dibil-text-muted)]">
          {mode === 'login' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          <button
            type="button"
            className="text-[var(--color-dibil-primary)] hover:underline"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
