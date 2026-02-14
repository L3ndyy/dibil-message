import { useState, useRef } from 'react'
import { Send, Paperclip, Mic } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  onSend: (text: string, file?: File) => void
  onTyping?: () => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({ onSend, onTyping, disabled, placeholder = 'Сообщение' }: MessageInputProps) {
  const [text, setText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const { recording, start: startVoice, stop: stopVoice } = useVoiceRecorder((blob) => {
    const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type })
    onSend('', file)
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
    onTyping?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
    onTyping?.()
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onSend('', file)
      e.target.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-[var(--color-dibil-border)] bg-[var(--color-dibil-panel)] p-3">
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        onChange={handleFile}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="shrink-0 rounded-full p-2 text-[var(--color-dibil-text-muted)] hover:bg-[var(--color-dibil-surface)] hover:text-[var(--color-dibil-text)]"
        aria-label="Прикрепить файл"
      >
        <Paperclip className="h-5 w-5" />
      </button>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        disabled={disabled}
        className={cn(
          'min-h-[40px] max-h-32 flex-1 resize-none rounded-xl border border-[var(--color-dibil-border)] bg-[var(--color-dibil-surface)] px-4 py-2.5 text-[var(--color-dibil-text)] placeholder:text-[var(--color-dibil-text-muted)] focus:border-[var(--color-dibil-primary)] focus:outline-none'
        )}
      />
      {recording ? (
        <Button type="button" size="md" variant="danger" className="shrink-0 rounded-full p-2" onClick={stopVoice}>
          Стоп
        </Button>
      ) : (
        <Button type="button" size="md" variant="ghost" className="shrink-0 rounded-full p-2" onClick={startVoice} aria-label="Голосовое сообщение">
          <Mic className="h-5 w-5" />
        </Button>
      )}
      <Button type="submit" size="md" disabled={disabled || !text.trim()} className="shrink-0 rounded-full p-2">
        <Send className="h-5 w-5" />
      </Button>
    </form>
  )
}
