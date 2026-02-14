import { clsx } from 'clsx'

export function cn(...inputs: (string | undefined | false | null)[]) {
  return clsx(inputs)
}

export function formatMessageTime(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return 'now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diff < 86400000 * 7) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' })
}

export function getFilePreviewType(mime: string | null): 'image' | 'video' | 'audio' | 'doc' {
  if (!mime) return 'doc'
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  return 'doc'
}

export const STORAGE_BUCKET = 'uploads'
