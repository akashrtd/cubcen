'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, UserPlus, Mail, Shield, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

// Simplified form validation schema
const userFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['ADMIN', 'OPERATOR', 'VIEWER']),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  sendInvitation: z.boolean().default(true),
})

type UserFormData = z.infer<typeof userFormSchema>

interface UserFormProps {
  user?: {
    id: string
    name: string
    email: string
    role: 'ADMIN' | 'OPERATOR' | 'VIEWER'
    status: 'active' | 'inactive' | 'suspended'
    preferences?: {
      theme: 'light' | 'dark' | 'system'
      notifications: {
        email: boolean
        push: boolean
        slack: boolean
      }
      dashboard: {
        defaultView: 'grid' | 'list' | 'kanban'
        refreshInterval: number
      }
    }
  }
  mode: 'create' | 'edit' | 'invite'
  onSubmit: (data: UserFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  className?: string
}

export function UserForm({
  user,
  mode,
  onSubmit,
  onCancel,
  loading = false,
  className,
}: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'VIEWER',
      status: user?.status || 'active',
      password: '',
      confirmPassword: '',
      sendInvitation: mode === 'invite' || mode === 'create',
    },
  })

  const handleSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Full access to all features and user management'
      case 'OPERATOR':
        return 'Can manage agents, tasks, and workflows'
      case 'VIEWER':
        return 'Read-only access to dashboards and reports'
      default:
        return ''
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive'
      case 'OPERATOR':
        return 'default'
      case 'VIEWER':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const sendInvitation = form.watch('sendInvitation')
  const isPasswordRequired = mode === 'create' && !sendInvitation

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {mode === 'create' || mode === 'invite' ? (
            <>
              <UserPlus className="h-5 w-5" />
              {mode === 'invite' ? 'Invite User' : 'Create User'}
            </>
          ) : (
            <>
              <User className="h-5 w-5" />
              Edit User
            </>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input 
                          placeholder="Enter email address" 
                          className="pl-10"
                          disabled={mode === 'edit'}
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    {mode === 'edit' && (
                      <FormDescription>
                        Email address cannot be changed after account creation
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Role and Permissions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role and Permissions
              </h3>
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ADMIN">
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive">ADMIN</Badge>
                            <span>Administrator</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="OPERATOR">
                          <div className="flex items-center gap-2">
                            <Badge variant="default">OPERATOR</Badge>
                            <span>Operator</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="VIEWER">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">VIEWER</Badge>
                            <span>Viewer</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {getRoleDescription(field.value)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {mode === 'edit' && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <Separator />

            {/* Form Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting || loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="gap-2"
              >
                {(isSubmitting || loading) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {mode === 'invite' ? 'Send Invitation' : mode === 'create' ? 'Create User' : 'Update User'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}