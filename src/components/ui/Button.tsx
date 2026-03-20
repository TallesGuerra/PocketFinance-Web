import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
        variant === 'primary' && 'bg-emerald-500 text-white hover:bg-emerald-600',
        variant === 'secondary' && 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        variant === 'danger' && 'bg-red-500 text-white hover:bg-red-600',
        variant === 'ghost' && 'text-gray-600 hover:bg-gray-100',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2.5 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
