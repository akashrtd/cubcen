import React from 'react'

interface DashboardSidebarProps {
  children?: React.ReactNode
  className?: string
  collapsed?: boolean
}

export function DashboardSidebar({ children, className, collapsed }: DashboardSidebarProps) {
  return (
    <aside className={className}>
      {children || <div>Dashboard Sidebar - To be implemented in task 2</div>}
    </aside>
  )
}