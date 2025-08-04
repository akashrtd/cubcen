import React from 'react'

interface DashboardHeaderProps {
  children?: React.ReactNode
  className?: string
}

export function DashboardHeader({ children, className }: DashboardHeaderProps) {
  return (
    <header className={className}>
      {children || <div>Dashboard Header - To be implemented in task 2</div>}
    </header>
  )
}