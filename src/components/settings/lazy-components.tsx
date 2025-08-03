'use client'

import { lazy, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { User, Bell, Shield } from 'lucide-react'

// Lazy load settings components
const LazyProfileSettings = lazy(() => 
  import('./profile-settings').then(module => ({ default: module.ProfileSettings }))
)

const LazyNotificationSettings = lazy(() => 
  import('./notification-settings').then(module => ({ default: module.NotificationSettings }))
)

const LazySecuritySettings = lazy(() => 
  import('./security-settings').then(module => ({ default: module.SecuritySettings }))
)

// Loading skeletons
const ProfileSettingsLoading = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <User className="h-5 w-5" />
        <Skeleton className="h-6 w-48" />
      </div>
      <Skeleton className="h-4 w-80" />
    </div>
    
    <div className="grid gap-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-20 w-20 rounded-full" />
      </div>
    </div>
    
    <div className="flex justify-end">
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
)

const NotificationSettingsLoading = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5" />
        <Skeleton className="h-6 w-48" />
      </div>
      <Skeleton className="h-4 w-80" />
    </div>
    
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-6 w-12" />
        </div>
      ))}
    </div>
    
    <div className="flex justify-end">
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
)

const SecuritySettingsLoading = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5" />
        <Skeleton className="h-6 w-48" />
      </div>
      <Skeleton className="h-4 w-80" />
    </div>
    
    <div className="space-y-4">
      <div className="p-4 border rounded">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-6 w-12" />
        </div>
        <Skeleton className="h-3 w-64" />
      </div>
      
      <div className="p-4 border rounded">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

// Lazy component wrappers with suspense
export const LazyProfileSettingsWithSuspense = (props: any) => (
  <Suspense fallback={<ProfileSettingsLoading />}>
    <LazyProfileSettings {...props} />
  </Suspense>
)

export const LazyNotificationSettingsWithSuspense = (props: any) => (
  <Suspense fallback={<NotificationSettingsLoading />}>
    <LazyNotificationSettings {...props} />
  </Suspense>
)

export const LazySecuritySettingsWithSuspense = (props: any) => (
  <Suspense fallback={<SecuritySettingsLoading />}>
    <LazySecuritySettings {...props} />
  </Suspense>
)