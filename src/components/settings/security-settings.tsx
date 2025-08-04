'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  Shield, 
  Smartphone, 
  Key, 
  Monitor, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  X,
  Copy,
  Download,
  Trash2
} from 'lucide-react'

// Two-factor authentication setup schema
const twoFactorSchema = z.object({
  enabled: z.boolean(),
  backupCodes: z.array(z.string()).optional(),
})

type TwoFactorFormData = z.infer<typeof twoFactorSchema>

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

interface SecuritySettingsProps {
  twoFactorEnabled: boolean
  activeSessions: ActiveSession[]
  auditLogs: SecurityAuditLog[]
  onToggleTwoFactor?: (enabled: boolean) => Promise<{ qrCode?: string; backupCodes?: string[] }>
  onTerminateSession?: (sessionId: string) => Promise<void>
  onTerminateAllSessions?: () => Promise<void>
  onDownloadBackupCodes?: () => Promise<string[]>
}

export function SecuritySettings({
  twoFactorEnabled,
  activeSessions,
  auditLogs,
  onToggleTwoFactor,
  onTerminateSession,
  onTerminateAllSessions,
  onDownloadBackupCodes,
}: SecuritySettingsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showQrCode, setShowQrCode] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>()
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)

  const form = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      enabled: twoFactorEnabled,
    },
  })

  const handleTwoFactorToggle = async (enabled: boolean) => {
    if (!onToggleTwoFactor) return

    setIsUpdating(true)
    try {
      const result = await onToggleTwoFactor(enabled)
      
      if (enabled && result.qrCode) {
        setQrCodeUrl(result.qrCode)
        setShowQrCode(true)
      }
      
      if (result.backupCodes) {
        setBackupCodes(result.backupCodes)
        setShowBackupCodes(true)
      }

      form.setValue('enabled', enabled)
      toast.success(
        enabled 
          ? 'Two-factor authentication enabled successfully' 
          : 'Two-factor authentication disabled successfully'
      )
    } catch (error) {
      toast.error('Failed to update two-factor authentication')
      console.error('Two-factor authentication error:', error)
      // Reset the form value on error
      form.setValue('enabled', !enabled)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    if (!onTerminateSession) return

    try {
      await onTerminateSession(sessionId)
      toast.success('Session terminated successfully')
    } catch (error) {
      toast.error('Failed to terminate session')
      console.error('Session termination error:', error)
    }
  }

  const handleTerminateAllSessions = async () => {
    if (!onTerminateAllSessions) return

    try {
      await onTerminateAllSessions()
      toast.success('All sessions terminated successfully')
    } catch (error) {
      toast.error('Failed to terminate sessions')
      console.error('Session termination error:', error)
    }
  }

  const handleDownloadBackupCodes = async () => {
    if (!onDownloadBackupCodes) return

    try {
      const codes = await onDownloadBackupCodes()
      setBackupCodes(codes)
      setShowBackupCodes(true)
    } catch (error) {
      toast.error('Failed to download backup codes')
      console.error('Backup codes error:', error)
    }
  }

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n')
    navigator.clipboard.writeText(codesText)
    toast.success('Backup codes copied to clipboard')
  }

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n')
    const blob = new Blob([codesText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cubcen-backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Backup codes downloaded')
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return Smartphone
      case 'tablet':
        return Smartphone
      default:
        return Monitor
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account with two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div className="space-y-1">
                    <FormLabel className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Enable Two-Factor Authentication
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Use an authenticator app to generate verification codes
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={handleTwoFactorToggle}
                      disabled={isUpdating}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </Form>

          {twoFactorEnabled && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" />
                Two-factor authentication is enabled
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadBackupCodes}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Backup Codes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage your active sessions across different devices
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTerminateAllSessions}
              disabled={activeSessions.length <= 1}
            >
              <X className="h-4 w-4 mr-2" />
              Terminate All Others
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSessions.map((session) => {
              const DeviceIcon = getDeviceIcon(session.deviceType)
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{session.deviceName}</span>
                        {session.current && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {session.browser} • {session.location}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {session.ipAddress}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last active {formatDate(session.lastActive)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTerminateSession(session.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Terminate
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Security Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Security Audit Log
          </CardTitle>
          <CardDescription>
            Recent security events and login history for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{log.event}</div>
                      <div className="text-sm text-muted-foreground">
                        {log.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div>{log.location}</div>
                      <div className="text-sm text-muted-foreground">
                        {log.ipAddress}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(log.timestamp)}</TableCell>
                  <TableCell>
                    <Badge variant={getSeverityColor(log.severity)}>
                      {log.severity}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4">
            {qrCodeUrl && (
              <div className="p-4 bg-white rounded-lg">
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowQrCode(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Backup Codes</DialogTitle>
            <DialogDescription>
              Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="p-2 bg-background rounded">
                  {code}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={copyBackupCodes}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Codes
              </Button>
              <Button variant="outline" onClick={downloadBackupCodes}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowBackupCodes(false)}>
              I&apos;ve Saved These Codes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}