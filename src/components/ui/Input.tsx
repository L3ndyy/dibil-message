import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Input = forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-xl border border-[var(--color-dibil-border)] bg-[var(--color-dibil-surface)] px-4 py-2.5 text-[var(--color-dibil-text)] placeholder:text-[var(--color-dibil-text-muted)] focus:border-[var(--color-dibil-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-dibil-primary)] transition-colors',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'
