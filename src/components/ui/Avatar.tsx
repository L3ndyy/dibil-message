import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '@/lib/utils'

export function Avatar({
  className,
  src,
  alt,
  fallback,
  size = 'md',
}: {
  className?: string
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const initial = fallback?.slice(0, 2).toUpperCase() ?? '?'
  return (
    <AvatarPrimitive.Root
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-[var(--color-dibil-accent)] text-white font-medium',
        size === 'sm' && 'h-8 w-8 text-xs',
        size === 'md' && 'h-10 w-10 text-sm',
        size === 'lg' && 'h-14 w-14 text-lg',
        className
      )}
    >
      <AvatarPrimitive.Image src={src ?? undefined} alt={alt} className="h-full w-full object-cover" />
      <AvatarPrimitive.Fallback delayMs={300} className="flex items-center justify-center">
        {initial}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}
