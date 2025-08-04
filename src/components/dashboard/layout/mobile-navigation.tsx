import React from 'react'

interface MobileNavigationProps {
  children?: React.ReactNode
  className?: string
}

export function MobileNavigation({ children, className }: MobileNavigationProps) {
  return (
    <nav className={className}>
      {children || <div>Mobile Navigation - To be implemented in task 2</div>}
    </nav>
  )
}