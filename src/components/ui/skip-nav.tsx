import * as React from 'react'
import { cn } from '@/lib/utils'

interface SkipNavProps {
  href?: string
  children?: React.ReactNode
  className?: string
}

export function SkipNav({ 
  href = '#main-content', 
  children = 'Skip to main content',
  className 
}: SkipNavProps) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50',
        'bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'transition-all duration-200',
        className
      )}
    >
      {children}
    </a>
  )
}

export function SkipNavTarget({ 
  id = 'main-content',
  className 
}: { 
  id?: string
  className?: string 
}) {
  return (
    <div
      id={id}
      tabIndex={-1}
      className={cn('sr-only', className)}
      aria-label="Main content start"
    />
  )
}