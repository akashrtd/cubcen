'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  LazyProfileSettingsWithSuspense,
  LazyNotificationSettingsWithSuspense,
  LazySecuritySettingsWithSuspense
} from '@/components/settings/lazy-components'
import { ErrorBoundary } from '@/components/error-boundary'
import { SettingsErrorFallback } from '@/components/error-boundary/page-error-fallbacks'
import { toast } from 'sonner'
import { 
  User, 
  Bell, 
  Shield, 
  Settings as SettingsIcon 
} from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
}

interface NotificationPreferences {
  email: boolean
  push: boolean
  slack: boolean
  frequency: 'immediate' | 'hourly' | 'daily'
  types: {
    agentAlerts: boolean
    taskUpdates: boolean
    systemNotifications: boolean
    securityAlerts: boolean
  }
}

interface ActiveSession {
  id: string
  deviceName: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser: string
  location: string
  ipAddress: string
  lastActive: Date
  current: boolean
}

interface SecurityAuditLog {
  id: string
  event: string
  description: string
  ipAddress: string
  location: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high'
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences | null>(null)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([])

  useEffect(() => {
    loadSettingsData()
  }, [])

  const loadSettingsData = async () => {
    try {
      setIsLoading(true)
      
      // Load user profile
      const profileResponse = await fetch('/api/cubcen/v1/users/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setUserProfile(profileData.data)
      }

      // Load notification preferences
      const notificationResponse = await fetch('/api/cubcen/v1/users/preferences/notifications')
      if (notificationResponse.ok) {
        const notificationData = await notificationResponse.json()
        setNotificationPreferences(notificationData.data)
      } else {
        // Set default preferences if none exist
        setNotificationPreferences({
          email: true,
          push: true,
          slack: false,
          frequency: 'immediate',
          types: {
            agentAlerts: true,
            taskUpdates: true,
            systemNotifications: true,
            securityAlerts: true,
          }
        })
      }

      // Load security settings
      const securityResponse = await fetch('/api/cubcen/v1/users/security')
      if (securityResponse.ok) {
        const securityData = await securityResponse.json()
        setTwoFactorEnabled(securityData.data.twoFactorEnabled || false)
        setActiveSessions(securityData.data.activeSessions || [])
        setAuditLogs(securityData.data.auditLogs || [])
      } else {
        // Set default security data
        setActiveSessions([
          {
            id: '1',
            deviceName: 'Current Device',
            deviceType: 'desktop',
            browser: 'Chrome',
            location: 'Unknown',
            ipAddress: '127.0.0.1',
            lastActive: new Date(),
            current: true,
          }
        ])
        setAuditLogs([])
      }
    } catch (error) {
      console.error('Failed to load settings data:', error)
      toast.error('Failed to load settings data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdate = async (profileData: Partial<UserProfile>) => {
    try {
      const response = await fetch('/api/cubcen/v1/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setUserProfile(updatedProfile.data)
        toast.success('Profile updated successfully')
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile')
      throw error
    }
  }

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await fetch('/api/cubcen/v1/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (response.ok) {
        toast.success('Password changed successfully')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Password change error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to change password')
      throw error
    }
  }

  const handleNotificationUpdate = async (preferences: NotificationPreferences) => {
    try {
      const response = await fetch('/api/cubcen/v1/users/preferences/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      })

      if (response.ok) {
        const updatedPreferences = await response.json()
        setNotificationPreferences(updatedPreferences.data)
        toast.success('Notification preferences updated successfully')
      } else {
        throw new Error('Failed to update notification preferences')
      }
    } catch (error) {
      console.error('Notification update error:', error)
      toast.error('Failed to update notification preferences')
      throw error
    }
  }

  const handleTwoFactorToggle = async (enabled: boolean) => {
    try {
      const response = await fetch('/api/cubcen/v1/users/security/two-factor', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      })

      if (response.ok) {
        const result = await response.json()
        setTwoFactorEnabled(enabled)
        return result.data
      } else {
        throw new Error('Failed to toggle two-factor authentication')
      }
    } catch (error) {
      console.error('Two-factor toggle error:', error)
      throw error
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/cubcen/v1/users/security/sessions/${sessionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setActiveSessions(sessions => sessions.filter(session => session.id !== sessionId))
      } else {
        throw new Error('Failed to terminate session')
      }
    } catch (error) {
      console.error('Session termination error:', error)
      throw error
    }
  }

  const handleTerminateAllSessions = async () => {
    try {
      const response = await fetch('/api/cubcen/v1/users/security/sessions', {
        method: 'DELETE',
      })

      if (response.ok) {
        setActiveSessions(sessions => sessions.filter(session => session.current))
      } else {
        throw new Error('Failed to terminate sessions')
      }
    } catch (error) {
      console.error('Session termination error:', error)
      throw error
    }
  }

  const handleDownloadBackupCodes = async () => {
    try {
      const response = await fetch('/api/cubcen/v1/users/security/backup-codes')
      
      if (response.ok) {
        const result = await response.json()
        return result.data.codes
      } else {
        throw new Error('Failed to download backup codes')
      }
    } catch (error) {
      console.error('Backup codes error:', error)
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-10 bg-muted animate-pulse rounded" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary 
      fallback={SettingsErrorFallback}
      pageName="Settings"
      showDetails={false}
    >
      <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your personal information and account details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userProfile && (
                  <LazyProfileSettingsWithSuspense
                    profile={userProfile}
                    onProfileUpdate={handleProfileUpdate}
                    onPasswordChange={handlePasswordChange}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notificationPreferences && (
                  <LazyNotificationSettingsWithSuspense
                    preferences={notificationPreferences}
                    onPreferencesUpdate={handleNotificationUpdate}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LazySecuritySettingsWithSuspense
                  twoFactorEnabled={twoFactorEnabled}
                  activeSessions={activeSessions}
                  auditLogs={auditLogs}
                  onToggleTwoFactor={handleTwoFactorToggle}
                  onTerminateSession={handleTerminateSession}
                  onTerminateAllSessions={handleTerminateAllSessions}
                  onDownloadBackupCodes={handleDownloadBackupCodes}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  )
}