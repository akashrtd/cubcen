// Cubcen Notification Preferences Component
// Allows users to configure their notification preferences

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, Bell, Mail, MessageSquare, Save, TestTube } from 'lucide-react'
import { toast } from 'sonner'
import {
  NotificationEventType,
  NotificationChannelType,
  NotificationPreference
} from '../../types/notification'

interface NotificationPreferencesProps {
  userId: string
}

const eventTypeLabels: Record<NotificationEventType, string> = {
  [NotificationEventType.AGENT_DOWN]: 'Agent Down',
  [NotificationEventType.AGENT_ERROR]: 'Agent Error',
  [NotificationEventType.TASK_FAILED]: 'Task Failed',
  [NotificationEventType.TASK_COMPLETED]: 'Task Completed',
  [NotificationEventType.WORKFLOW_FAILED]: 'Workflow Failed',
  [NotificationEventType.WORKFLOW_COMPLETED]: 'Workflow Completed',
  [NotificationEventType.SYSTEM_ERROR]: 'System Error',
  [NotificationEventType.HEALTH_CHECK_FAILED]: 'Health Check Failed',
  [NotificationEventType.PLATFORM_DISCONNECTED]: 'Platform Disconnected'
}

const eventTypeDescriptions: Record<NotificationEventType, string> = {
  [NotificationEventType.AGENT_DOWN]: 'When an agent becomes unresponsive or offline',
  [NotificationEventType.AGENT_ERROR]: 'When an agent encounters an error during execution',
  [NotificationEventType.TASK_FAILED]: 'When a scheduled task fails to complete',
  [NotificationEventType.TASK_COMPLETED]: 'When a task completes successfully',
  [NotificationEventType.WORKFLOW_FAILED]: 'When a workflow execution fails',
  [NotificationEventType.WORKFLOW_COMPLETED]: 'When a workflow completes successfully',
  [NotificationEventType.SYSTEM_ERROR]: 'When system-level errors occur',
  [NotificationEventType.HEALTH_CHECK_FAILED]: 'When health checks fail',
  [NotificationEventType.PLATFORM_DISCONNECTED]: 'When a platform connection is lost'
}

const channelIcons = {
  [NotificationChannelType.EMAIL]: Mail,
  [NotificationChannelType.SLACK]: MessageSquare,
  [NotificationChannelType.IN_APP]: Bell
}

const channelLabels = {
  [NotificationChannelType.EMAIL]: 'Email',
  [NotificationChannelType.SLACK]: 'Slack',
  [NotificationChannelType.IN_APP]: 'In-App'
}

const channelColors = {
  [NotificationChannelType.EMAIL]: 'bg-blue-100 text-blue-800 border-blue-200',
  [NotificationChannelType.SLACK]: 'bg-purple-100 text-purple-800 border-purple-200',
  [NotificationChannelType.IN_APP]: 'bg-green-100 text-green-800 border-green-200'
}

export function NotificationPreferences({ userId }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<NotificationChannelType | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPreferences()
  }, [userId])

  const loadPreferences = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cubcen/v1/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load preferences')
      }

      const data = await response.json()
      setPreferences(data.data)
      setError(null)
    } catch (err) {
      setError('Failed to load notification preferences')
      console.error('Error loading preferences:', err)
    } finally {
      setLoading(false)
    }
  }

  const updatePreference = (
    eventType: NotificationEventType,
    field: keyof NotificationPreference,
    value: unknown
  ) => {
    setPreferences(prev => prev.map(pref => 
      pref.eventType === eventType 
        ? { ...pref, [field]: value }
        : pref
    ))
  }

  const toggleChannel = (eventType: NotificationEventType, channel: NotificationChannelType) => {
    setPreferences(prev => prev.map(pref => {
      if (pref.eventType === eventType) {
        const channels = pref.channels.includes(channel)
          ? pref.channels.filter(c => c !== channel)
          : [...pref.channels, channel]
        return { ...pref, channels }
      }
      return pref
    }))
  }

  const savePreferences = async () => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/cubcen/v1/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          preferences: preferences.map(pref => ({
            eventType: pref.eventType,
            channels: pref.channels,
            enabled: pref.enabled,
            escalationDelay: pref.escalationDelay
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }

      toast.success('Notification preferences saved successfully')
      setError(null)
    } catch (err) {
      setError('Failed to save preferences')
      toast.error('Failed to save notification preferences')
      console.error('Error saving preferences:', err)
    } finally {
      setSaving(false)
    }
  }

  const testNotification = async (channel: NotificationChannelType) => {
    try {
      setTesting(channel)
      
      const response = await fetch('/api/cubcen/v1/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          channel,
          message: `Test notification via ${channelLabels[channel]} from Cubcen`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send test notification')
      }

      toast.success(`Test notification sent via ${channelLabels[channel]}`)
    } catch (err) {
      toast.error(`Failed to send test notification via ${channelLabels[channel]}`)
      console.error('Error sending test notification:', err)
    } finally {
      setTesting(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading notification preferences...
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-cubcen-primary" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Configure how and when you want to receive notifications from Cubcen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Notifications Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Test Notifications</h3>
            <div className="flex gap-2">
              {Object.values(NotificationChannelType).map(channel => {
                const Icon = channelIcons[channel]
                return (
                  <Button
                    key={channel}
                    variant="outline"
                    size="sm"
                    onClick={() => testNotification(channel)}
                    disabled={testing === channel}
                    className="flex items-center gap-2"
                  >
                    {testing === channel ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    Test {channelLabels[channel]}
                  </Button>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Event Preferences */}
          <div className="space-y-6">
            {Object.values(NotificationEventType).map(eventType => {
              const preference = preferences.find(p => p.eventType === eventType)
              if (!preference) return null

              return (
                <div key={eventType} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">
                        {eventTypeLabels[eventType]}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {eventTypeDescriptions[eventType]}
                      </p>
                    </div>
                    <Switch
                      checked={preference.enabled}
                      onCheckedChange={(enabled) => 
                        updatePreference(eventType, 'enabled', enabled)
                      }
                    />
                  </div>

                  {preference.enabled && (
                    <div className="space-y-3">
                      <Label className="text-xs font-medium text-muted-foreground">
                        Notification Channels
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {Object.values(NotificationChannelType).map(channel => {
                          const Icon = channelIcons[channel]
                          const isSelected = preference.channels.includes(channel)
                          
                          return (
                            <Badge
                              key={channel}
                              variant={isSelected ? "default" : "outline"}
                              className={`cursor-pointer transition-colors ${
                                isSelected 
                                  ? 'bg-cubcen-primary hover:bg-cubcen-primary/80' 
                                  : 'hover:bg-muted'
                              }`}
                              onClick={() => toggleChannel(eventType, channel)}
                            >
                              <Icon className="h-3 w-3 mr-1" />
                              {channelLabels[channel]}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <Separator />

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={savePreferences}
              disabled={saving}
              className="bg-cubcen-primary hover:bg-cubcen-primary/80"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}