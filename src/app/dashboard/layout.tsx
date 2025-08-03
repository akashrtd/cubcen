'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SkipNav, SkipNavTarget } from '@/components/ui/skip-nav'
import { ErrorBoundary } from '@/components/error-boundary'
import { DashboardErrorFallback } from '@/components/error-boundary/page-error-fallbacks'
import { useAuth } from '@/hooks/use-auth'
import { UserRole } from '@/types/auth'
import {
  LayoutDashboard,
  Bot,
  CheckSquare,
  BarChart3,
  Settings,
  Users,
  Bell,
  Menu,
  LogOut,
  User,
  Zap,
  Loader2,
  AlertTriangle,
} from 'lucide-react'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  requiredRoles?: UserRole[]
  requiredResource?: string
}

const navigation: NavigationItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard 
  },
  { 
    name: 'Agents', 
    href: '/dashboard/agents', 
    icon: Bot,
    requiredResource: 'agents'
  },
  { 
    name: 'Tasks', 
    href: '/dashboard/tasks', 
    icon: CheckSquare,
    requiredResource: 'tasks'
  },
  { 
    name: 'Analytics', 
    href: '/dashboard/analytics', 
    icon: BarChart3,
    requiredResource: 'analytics'
  },
  { 
    name: 'Errors', 
    href: '/dashboard/errors', 
    icon: AlertTriangle,
    requiredResource: 'errors'
  },
  { 
    name: 'Platforms', 
    href: '/dashboard/platforms', 
    icon: Zap,
    requiredResource: 'platforms'
  },
  { 
    name: 'Users', 
    href: '/dashboard/users', 
    icon: Users,
    requiredRoles: [UserRole.ADMIN],
    requiredResource: 'users'
  },
  { 
    name: 'Settings', 
    href: '/dashboard/settings', 
    icon: Settings,
    requiredResource: 'settings'
  },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading, hasAnyRole, canAccessResource, logout } = useAuth()

  // Reset navigation state when route changes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  // Filter navigation items based on user permissions
  const getVisibleNavigation = (): NavigationItem[] => {
    if (!user) return []

    return navigation.filter(item => {
      // Check role-based access
      if (item.requiredRoles && !hasAnyRole(item.requiredRoles)) {
        return false
      }

      // Check resource-based access
      if (item.requiredResource && !canAccessResource(item.requiredResource)) {
        return false
      }

      return true
    })
  }

  const visibleNavigation = getVisibleNavigation()

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => {
    if (isLoading) {
      return (
        <nav className="space-y-1" aria-label="Loading navigation">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </nav>
      )
    }

    return (
      <nav className="space-y-1" aria-label={mobile ? "Mobile navigation" : "Main navigation"}>
        {visibleNavigation.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                ${
                  isActive
                    ? 'bg-cubcen-primary text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }
                ${isNavigating ? 'pointer-events-none opacity-50' : ''}
              `}
              onClick={() => {
                mobile && setSidebarOpen(false);
                setIsNavigating(true); // Set navigating true on click
              }}
              aria-current={isActive ? 'page' : undefined}
              aria-label={`Navigate to ${item.name}`}
            >
              <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
              {item.name}
              {isNavigating && pathname !== item.href ? (
                <Loader2 className="ml-auto h-4 w-4 animate-spin" aria-hidden="true" />
              ) : null}
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <ErrorBoundary 
      fallback={DashboardErrorFallback}
      pageName="Dashboard Layout"
      showDetails={false}
    >
      <div className="min-h-screen bg-background">
      <SkipNav />
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full flex-col">
            {/* Mobile Logo */}
            <div className="flex h-16 items-center px-6 border-b">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-cubcen-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="text-xl font-bold">Cubcen</span>
                <Badge
                  variant="secondary"
                  className="bg-cubcen-secondary text-white text-xs"
                >
                  MVP
                </Badge>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 px-4 py-6">
              <NavItems mobile />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside 
        className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col"
        role="navigation"
        aria-label="Main navigation sidebar"
      >
        <div className="flex flex-col flex-grow bg-card border-r border-border">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-border">
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 bg-cubcen-primary rounded-lg flex items-center justify-center"
                role="img"
                aria-label="Cubcen logo"
              >
                <span className="text-white font-bold text-lg" aria-hidden="true">C</span>
              </div>
              <span className="text-xl font-bold">Cubcen</span>
              <Badge
                variant="secondary"
                className="bg-cubcen-secondary text-white text-xs"
                aria-label="MVP version"
              >
                MVP
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6">
            <NavItems />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-border bg-card px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open sidebar</span>
              </Button>
            </SheetTrigger>
          </Sheet>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>

            {/* Right side items */}
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-cubcen-secondary rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">3</span>
                </span>
                <span className="sr-only">View notifications</span>
              </Button>

              {/* Theme toggle */}
              <ThemeToggle />

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/01.png" alt="User" />
                      <AvatarFallback className="bg-cubcen-primary text-white">
                        {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                      <Badge variant="secondary" className="w-fit text-xs">
                        {user?.role}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  {canAccessResource('settings') && (
                    <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main 
          className="py-6"
          role="main"
          aria-label="Main content area"
        >
          <SkipNavTarget />
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}
