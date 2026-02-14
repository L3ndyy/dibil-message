import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { STORAGE_BUCKET } from '@/lib/utils'

export function ProfilePage() {
  const { profile, loadProfile } = useAuthStore()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [username, setUsername] = useState(profile?.username ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [status, setStatus] = useState(profile?.status ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '')
      setUsername(profile.username ?? '')
      setBio(profile.bio ?? '')
      setStatus(profile.status ?? '')
    }
  }, [profile?.id, profile?.full_name, profile?.username, profile?.bio, profile?.status])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.id) return
    setError(null)
    setMessage(null)
    setSaving(true)
    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim() || null,
          username: username.trim() || null,
          bio: bio.trim() || null,
          status: status.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
      if (err) throw err
      await loadProfile(profile.id)
      setMessage('Изменения сохранены.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile?.id) return
    e.target.value = ''
    setError(null)
    const path = `avatars/${profile.id}/${Date.now()}_${file.name}`
    const { error: uploadErr } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { upsert: true })
    if (uploadErr) {
      setError('Не удалось загрузить фото')
      return
    }
    const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
    const { error: updateErr } = await supabase.from('profiles').update({ avatar_url: urlData.publicUrl, updated_at: new Date().toISOString() }).eq('id', profile.id)
    if (updateErr) {
      setError('Не удалось обновить профиль')
      return
    }
    await loadProfile(profile.id)
    setMessage('Фото обновлено.')
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-[var(--color-dibil-bg)]">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-[var(--color-dibil-border)] bg-[var(--color-dibil-panel)] px-4">
        <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/chat')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-[var(--color-dibil-text)]">Мой профиль</h1>
      </header>

      <main className="mx-auto max-w-md p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative rounded-full ring-2 ring-[var(--color-dibil-primary)] ring-offset-2 ring-offset-[var(--color-dibil-bg)]"
            >
              <Avatar
                src={profile.avatar_url}
                fallback={profile.full_name ?? profile.username ?? ''}
                size="lg"
                className="h-24 w-24"
              />
              <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-dibil-primary)] text-white">
                <Camera className="h-4 w-4" />
              </span>
            </button>
            <span className="text-sm text-[var(--color-dibil-text-muted)]">Нажмите, чтобы сменить фото</span>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-green-500">{message}</p>}

          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-dibil-text-muted)]">Имя</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ваше имя" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-dibil-text-muted)]">Имя пользователя (без @)</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-dibil-text-muted)]">Статус</label>
            <Input value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Короткий статус" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--color-dibil-text-muted)]">О себе</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Расскажите о себе"
              rows={3}
              className="w-full resize-none rounded-xl border border-[var(--color-dibil-border)] bg-[var(--color-dibil-surface)] px-4 py-2.5 text-[var(--color-dibil-text)] placeholder:text-[var(--color-dibil-text-muted)] focus:border-[var(--color-dibil-primary)] focus:outline-none"
            />
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? 'Сохранение…' : 'Сохранить'}
          </Button>
        </form>
      </main>
    </div>
  )
}
