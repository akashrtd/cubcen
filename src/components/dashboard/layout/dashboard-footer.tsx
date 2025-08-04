import React from 'react'

interface DashboardFooterProps {
  children?: React.ReactNode
  className?: string
}

export function DashboardFooter({ children, className }: DashboardFooterProps) {
  return (
    <footer className={className}>
      {children || <div>Dashboard Footer - To be implemented in task 2</div>}
    </footer>
  )
}