'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface SidebarItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  children?: SidebarItem[]
  disabled?: boolean
}

interface DashboardSidebarProps {
  children?: React.ReactNode
  className?: string
  collapsed?: boolean
  items?: SidebarItem[]
  onItemClick?: (item: SidebarItem) => void
}

const defaultSidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
        />
      </svg>
    ),
  },
  {
    id: 'agents',
    label: 'Agents',
    href: '/dashboard/agents',
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    id: 'tasks',
    label: 'Tasks',
    href: '/dashboard/tasks',
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
    ),
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    id: 'platforms',
    label: 'Platforms',
    href: '/dashboard/platforms',
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
  },
  {
    id: 'errors',
    label: 'Error Monitoring',
    href: '/dashboard/errors',
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
  },
  {
    id: 'users',
    label: 'User Management',
    href: '/dashboard/users',
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
        />
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/dashboard/settings',
    icon: ({ className }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
]

export function DashboardSidebar({
  children,
  className,
  collapsed = false,
  items = defaultSidebarItems,
  onItemClick,
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // Auto-expand parent items based on current path
  useEffect(() => {
    const newExpanded = new Set<string>()
    items.forEach(item => {
      if (item.children?.some(child => pathname.startsWith(child.href))) {
        newExpanded.add(item.id)
      }
    })
    setExpandedItems(newExpanded)
  }, [pathname, items])

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const Icon = item.icon
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.id)
    const active = isActive(item.href)

    return (
      <div key={item.id} className="sidebar-item-container">
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.id)}
            disabled={item.disabled}
            className={cn(
              'sidebar-item',
              'w-full',
              'flex',
              'items-center',
              'justify-between',
              'px-3',
              'py-2',
              'rounded-lg',
              'text-left',
              'transition-all',
              'duration-200',
              'group',
              level > 0 && 'ml-4',
              active && [
                'bg-dashboard-primary',
                'text-dashboard-text-inverse',
                'shadow-sm',
              ],
              !active && [
                'text-dashboard-text-secondary',
                'hover:text-dashboard-text-primary',
                'hover:bg-dashboard-background',
              ],
              item.disabled && [
                'opacity-50',
                'cursor-not-allowed',
                'hover:bg-transparent',
              ],
              'focus:outline-none',
              'focus:ring-2',
              'focus:ring-dashboard-primary',
              'focus:ring-offset-2'
            )}
            aria-expanded={isExpanded}
            aria-label={`${item.label} menu`}
          >
            <div className="flex items-center space-x-3">
              <Icon
                className={cn(
                  'w-5 h-5',
                  'transition-transform',
                  'duration-200',
                  collapsed && 'mx-auto'
                )}
              />
              {!collapsed && (
                <span className="font-medium truncate">{item.label}</span>
              )}
            </div>

            {!collapsed && (
              <svg
                className={cn(
                  'w-4 h-4',
                  'transition-transform',
                  'duration-200',
                  isExpanded && 'rotate-90'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </button>
        ) : (
          <Link
            href={item.href}
            onClick={() => onItemClick?.(item)}
            className={cn(
              'sidebar-item',
              'flex',
              'items-center',
              'space-x-3',
              'px-3',
              'py-2',
              'rounded-lg',
              'transition-all',
              'duration-200',
              'group',
              'relative',
              level > 0 && 'ml-4',
              active && [
                'bg-dashboard-primary',
                'text-dashboard-text-inverse',
                'shadow-sm',
              ],
              !active && [
                'text-dashboard-text-secondary',
                'hover:text-dashboard-text-primary',
                'hover:bg-dashboard-background',
              ],
              item.disabled && [
                'opacity-50',
                'cursor-not-allowed',
                'hover:bg-transparent',
                'pointer-events-none',
              ],
              'focus:outline-none',
              'focus:ring-2',
              'focus:ring-dashboard-primary',
              'focus:ring-offset-2'
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon
              className={cn(
                'w-5 h-5',
                'transition-transform',
                'duration-200',
                'group-hover:scale-110',
                collapsed && 'mx-auto'
              )}
            />

            {!collapsed && (
              <>
                <span className="font-medium truncate flex-1">
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    className={cn(
                      'px-2',
                      'py-1',
                      'text-xs',
                      'font-medium',
                      'rounded-full',
                      'bg-dashboard-error',
                      'text-white',
                      'min-w-5',
                      'text-center'
                    )}
                    aria-label={`${item.badge} notifications`}
                  >
                    {typeof item.badge === 'number' && item.badge > 99
                      ? '99+'
                      : item.badge}
                  </span>
                )}
              </>
            )}
          </Link>
        )}

        {/* Render children */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (children) {
    return <aside className={className}>{children}</aside>
  }

  return (
    <aside className={className}>
      <nav
        className="space-y-1"
        role="navigation"
        aria-label="Sidebar navigation"
      >
        {items.map(item => renderSidebarItem(item))}
      </nav>
    </aside>
  )
}
