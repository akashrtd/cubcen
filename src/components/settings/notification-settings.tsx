'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Bell, Mail, MessageSquare, Smartphone, Save, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'
import { NotificationEventType, NotificationChannelType } from '@/types/notification'

// Notification preferences schema
const notificationPreferencesSchema = z.object({
  preferences: z.array(z.object({
    eventType: z.nativeEnum(NotificationEventType),
    enabled: z.boolean(),
    channels: z.array(z.nativeEnum(NotificationChannelType)),
    frequency: z.enum(['immediate', 'hourly', 'daily']),
    escalationDelay: z.number().min(0).max(1440).optional(), // 0-1440 minutes (24 hours)
  })),
  globalSettings: z.object({
    emailEnabled: z.boolean(),
    slackEnabled: z.boolean(),
    pushEnabled: z.boolean(),
    quietHours: z.object({
      enabled: z.boolean(),
      startTime: z.string(),
      endTime: z.string(),
    }),
  }),
})

type NotificationPreferencesFormData = z.infer<typeof notificationPreferencesSchema>

interface NotificationPreference {
  eventType: NotificationEventType
  enabled: boolean
  channels: NotificationChannelType[]
  frequency: 'immediate' | 'hourly' | 'daily'
  escalationDelay?: number
}

interface NotificationSettingsProps {
  preferences?: NotificationPreference[]
  globalSettings?: {
    emailEnabled: boolean
    slackEnabled: boolean
    pushEnabled: boolean
    quietHours: {
      enabled: boolean
      startTime: string
      endTime: string
    }
  }
  onSave?: (data: NotificationPreferencesFormData) => Promise<void>
}

// Event type configurations with display names, descriptions, and default settings
const eventTypeConfig = {
  [NotificationEventType.AGENT_DOWN]: {
    name: 'Agent Down',
    description: 'When an agent becomes unavailable or stops responding',
    icon: XCircle,
    priority: 'high' as const,
    defaultChannels: [NotificationChannelType.EMAIL, NotificationChannelType.SLACK],
    defaultFrequency: 'immediate' as const,
  },
  [NotificationEventType.AGENT_ERROR]: {
    name: 'Agent Error',
    description: 'When an agent encounters an error during execution',
    icon: AlertTriangle,
    priority: 'medium' as const,
    defaultChannels: [NotificationChannelType.EMAIL],
    defaultFrequency: 'immediate' as const,
  },
  [NotificationEventType.TASK_FAILED]: {
    name: 'Task Failed',
    description: 'When a task execution fails',
    icon: XCircle,
    priority: 'medium' as const,
    defaultChannels: [NotificationChannelType.EMAIL],
    defaultFrequency: 'immediate' as const,
  },
  [NotificationEventType.TASK_COMPLETED]: {
    name: 'Task Completed',
    description: 'When a task completes successfully',
    icon: CheckCircle,
    priority: 'low' as const,
    defaultChannels: [NotificationChannelType.IN_APP],
    defaultFrequency: 'hourly' as const,
  },
  [NotificationEventType.WORKFLOW_FAILED]: {
    name: 'Workflow Failed',
    description: 'When a workflow execution fails',
    icon: XCircle,
    priority: 'high' as const,
    defaultChannels: [NotificationChannelType.EMAIL, NotificationChannelType.SLACK],
    defaultFrequency: 'immediate' as const,
  },
  [NotificationEventType.WORKFLOW_COMPLETED]: {
    name: 'Workflow Completed',
    description: 'When a workflow completes successfully',
    icon: CheckCircle,
    priority: 'low' as const,
    defaultChannels: [NotificationChannelType.IN_APP],
    defaultFrequency: 'hourly' as const,
  },
  [NotificationEventType.SYSTEM_ERROR]: {
    name: 'System Error',
    description: 'When a system-level error occurs',
    icon: AlertTriangle,
    priority: 'high' as const,
    defaultChannels: [NotificationChannelType.EMAIL, NotificationChannelType.SLACK],
    defaultFrequency: 'immediate' as const,
  },
  [NotificationEventType.HEALTH_CHECK_FAILED]: {
    name: 'Health Check Failed',
    description: 'When a health check fails',
    icon: AlertTriangle,
    priority: 'medium' as const,
    defaultChannels: [NotificationChannelType.EMAIL],
    defaultFrequency: 'immediate' as const,
  },
  [NotificationEventType.PLATFORM_DISCONNECTED]: {
    name: 'Platform Disconnected',
    description: 'When a platform connection is lost',
    icon: XCircle,
    priority: 'high' as const,
    defaultChannels: [NotificationChannelType.EMAIL, NotificationChannelType.SLACK],
    defaultFrequency: 'immediate' as const,
  },
}

const channelConfig = {
  [NotificationChannelType.EMAIL]: {
    name: 'Email',
    icon: Mail,
    description: 'Receive notifications via email',
  },
  [NotificationChannelType.SLACK]: {
    name: 'Slack',
    icon: MessageSquare,
    description: 'Receive notifications in Slack',
  },
  [NotificationChannelType.IN_APP]: {
    name: 'In-App',
    icon: Bell,
    description: 'Receive notifications in the application',
  },
}

export function NotificationSettings({ preferences = [], globalSettings, onSave }: NotificationSettingsProps) {
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<NotificationPreferencesFormData>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: {
      preferences: Array.isArray(preferences) ? preferences.map(pref => ({
        eventType: pref.eventType,
        enabled: pref.enabled,
        channels: pref.channels,
        frequency: pref.frequency,
        escalationDelay: pref.escalationDelay,
      })) : [],
      globalSettings: globalSettings || {
        emailEnabled: true,
        slackEnabled: false,
        pushEnabled: false,
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00',
        },
      },
    },
  })

  const handleSubmit = async (data: NotificationPreferencesFormData) => {
    if (!onSave) return

    setIsSaving(true)
    try {
      await onSave(data)
      toast.success('Notification preferences saved successfully')
    } catch (error) {
      toast.error('Failed to save notification preferences')
      console.error('Notification preferences save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'default'
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Global Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Global Notification Settings
              </CardTitle>
              <CardDescription>
                Configure global notification preferences and quiet hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="globalSettings.emailEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0 p-4 border rounded-lg">
                      <div className="space-y-1">
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Notifications
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Enable email notifications
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="globalSettings.slackEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0 p-4 border rounded-lg">
                      <div className="space-y-1">
                        <FormLabel className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Slack Notifications
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Enable Slack notifications
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="globalSettings.pushEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0 p-4 border rounded-lg">
                      <div className="space-y-1">
                        <FormLabel className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          Push Notifications
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Enable push notifications
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Quiet Hours */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="globalSettings.quietHours.enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-1">
                        <FormLabel>Quiet Hours</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Disable non-critical notifications during specified hours
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch('globalSettings.quietHours.enabled') && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="globalSettings.quietHours.startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <input
                              type="time"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="globalSettings.quietHours.endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <input
                              type="time"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Event-specific Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Event Notification Preferences</CardTitle>
              <CardDescription>
                Configure notification preferences for different types of events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(eventTypeConfig).map(([eventType, config], index) => {
                const Icon = config.icon
                return (
                  <div key={eventType} className="space-y-4">
                    {index > 0 && <Separator />}
                    
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <h4 className="font-medium">{config.name}</h4>
                          <Badge variant={getPriorityColor(config.priority)}>
                            {config.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {config.description}
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name={`preferences.${index}.enabled`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch(`preferences.${index}.enabled`) && (
                      <div className="ml-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`preferences.${index}.frequency`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Frequency</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="immediate">Immediate</SelectItem>
                                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                                    <SelectItem value="daily">Daily Digest</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`preferences.${index}.escalationDelay`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Escalation Delay (minutes)</FormLabel>
                                <FormControl>
                                  <Select 
                                    onValueChange={(value) => field.onChange(parseInt(value))} 
                                    defaultValue={field.value?.toString()}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select delay" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="0">No escalation</SelectItem>
                                      <SelectItem value="5">5 minutes</SelectItem>
                                      <SelectItem value="15">15 minutes</SelectItem>
                                      <SelectItem value="30">30 minutes</SelectItem>
                                      <SelectItem value="60">1 hour</SelectItem>
                                      <SelectItem value="120">2 hours</SelectItem>
                                      <SelectItem value="240">4 hours</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div>
                          <FormLabel>Notification Channels</FormLabel>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                            {Object.entries(channelConfig).map(([channelType, channelInfo]) => {
                              const ChannelIcon = channelInfo.icon
                              return (
                                <FormField
                                  key={channelType}
                                  control={form.control}
                                  name={`preferences.${index}.channels`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <label className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-accent">
                                          <input
                                            type="checkbox"
                                            checked={field.value?.includes(channelType as NotificationChannelType)}
                                            onChange={(e) => {
                                              const currentChannels = field.value || []
                                              if (e.target.checked) {
                                                field.onChange([...currentChannels, channelType])
                                              } else {
                                                field.onChange(currentChannels.filter(c => c !== channelType))
                                              }
                                            }}
                                            className="rounded"
                                          />
                                          <ChannelIcon className="h-4 w-4" />
                                          <span className="text-sm">{channelInfo.name}</span>
                                        </label>
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSaving || !form.formState.isDirty}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}