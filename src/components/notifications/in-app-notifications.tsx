// Cubcen In-App Notifications Component
// Displays and manages in-app notifications with toast messages

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent } from '../ui/card'
import { ScrollArea } from '../ui/scroll-area'
import { Separator } from '../ui/separator'
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck, 
  X, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover'

interface InAppNotification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  actionUrl?: string
  actionText?: string
  createdAt: string
  expiresAt?: string
}

interface InAppNotificationsProps {
  userId: string
  className?: string
}

const notificationIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle
}

const notificationColors = {
  info: 'text-blue-600 bg-blue-50 border-blue-200',
  success: 'text-green-600 bg-green-50 border-green-200',
  warning: 'text-orange-600 bg-orange-50 border-orange-200',
  error: 'text-red-600 bg-red-50 border-red-200'
}

export function InAppNotifications({ userId, className }: InAppNotificationsProps) {
  const [notifications, setNotifications] = useState<InAppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    loadNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [userId])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cubcen/v1/notifications/in-app', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load notifications')
      }

      const data = await response.json()
      setNotifications(data.data)
      setUnreadCount(data.unreadCount)
    } catch (error) {
      console.error('Error loading notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/cubcen/v1/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to mark as read')
      }

      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read)
      
      await Promise.all(
        unreadNotifications.map(n => markAsRead(n.id))
      )

      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Failed to mark all notifications as read')
    }
  }

  const handleNotificationClick = (notification: InAppNotification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }

    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank')
    }
  }

  const NotificationItem = ({ notification }: { notification: InAppNotification }) => {
    const Icon = notificationIcons[notification.type]
    const isExpired = notification.expiresAt && new Date(notification.expiresAt) < new Date()

    return (
      <Card 
        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
          !notification.read ? 'border-l-4 border-l-cubcen-primary' : ''
        } ${isExpired ? 'opacity-50' : ''}`}
        onClick={() => handleNotificationClick(notification)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-full ${notificationColors[notification.type]}`}>
              <Icon className="h-4 w-4" />
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{notification.title}</h4>
                <div className="flex items-center gap-2">
                  {!notification.read && (
                    <Badge variant="secondary" className="bg-cubcen-secondary text-white">
                      New
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {notification.message}
              </p>
              
              {notification.actionUrl && notification.actionText && (
                <div className="flex items-center gap-1 text-xs text-cubcen-primary">
                  <ExternalLink className="h-3 w-3" />
                  {notification.actionText}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative ${className}`}
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5 text-cubcen-primary" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-96">
          <div className="p-2 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cubcen-primary"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mb-2" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              notifications.map(notification => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                />
              ))
            )}
          </div>
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  setOpen(false)
                  // Navigate to full notifications page
                  window.location.href = '/dashboard/notifications'
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

// Toast notification component for real-time notifications
export function useNotificationToasts(userId: string) {
  useEffect(() => {
    // This would typically connect to WebSocket for real-time notifications
    // For now, we'll use polling as a fallback
    
    const checkForNewNotifications = async () => {
      try {
        const response = await fetch('/api/cubcen/v1/notifications/in-app?unreadOnly=true&limit=5', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          const newNotifications = data.data.filter((n: InAppNotification) => 
            new Date(n.createdAt) > new Date(Date.now() - 60000) // Last minute
          )

          newNotifications.forEach((notification: InAppNotification) => {
            const Icon = notificationIcons[notification.type]
            
            toast(notification.title, {
              description: notification.message,
              icon: <Icon className="h-4 w-4" />,
              action: notification.actionUrl ? {
                label: notification.actionText || 'View',
                onClick: () => window.open(notification.actionUrl, '_blank')
              } : undefined,
              duration: notification.type === 'error' ? 10000 : 5000
            })
          })
        }
      } catch (error) {
        console.error('Error checking for new notifications:', error)
      }
    }

    // Check immediately and then every minute
    checkForNewNotifications()
    const interval = setInterval(checkForNewNotifications, 60000)
    
    return () => clearInterval(interval)
  }, [userId])
}