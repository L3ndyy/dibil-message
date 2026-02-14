import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-dibil-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-dibil-bg)] disabled:opacity-50 disabled:pointer-events-none',
          variant === 'primary' &&
            'bg-[var(--color-dibil-primary)] text-white hover:bg-[var(--color-dibil-primary-hover)]',
          variant === 'secondary' &&
            'bg-[var(--color-dibil-surface)] text-[var(--color-dibil-text)] border border-[var(--color-dibil-border)] hover:bg-[var(--color-dibil-border)]',
          variant === 'ghost' && 'text-[var(--color-dibil-text)] hover:bg-[var(--color-dibil-surface)]',
          variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'md' && 'px-4 py-2 text-sm',
          size === 'lg' && 'px-6 py-3 text-base',
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
