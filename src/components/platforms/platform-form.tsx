'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  TestTube,
  Save,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Platform {
  id?: string
  name: string
  type: 'n8n' | 'make' | 'zapier'
  baseUrl: string
  authConfig: {
    type: 'api_key' | 'oauth' | 'basic'
    credentials: Record<string, string>
  }
  status?: 'connected' | 'disconnected' | 'error'
}

interface ConnectionTestResult {
  success: boolean
  responseTime?: number
  version?: string
  capabilities?: string[]
  agentCount?: number
  error?: string
}

interface PlatformFormProps {
  platform?: Platform
  onSave: (platform: Platform) => Promise<void>
  onCancel: () => void
  onTestConnection?: (connectionData: { baseUrl: string; authConfig: Platform['authConfig'] }) => Promise<ConnectionTestResult>
}

const PLATFORM_TYPES = [
  { value: 'n8n', label: 'n8n', description: 'Open-source workflow automation' },
  { value: 'make', label: 'Make.com', description: 'Visual automation platform' },
  { value: 'zapier', label: 'Zapier', description: 'Connect your apps and automate workflows' }
] as const

const AUTH_TYPES = [
  { value: 'api_key', label: 'API Key', description: 'Simple API key authentication' },
  { value: 'oauth', label: 'OAuth 2.0', description: 'OAuth 2.0 authentication flow' },
  { value: 'basic', label: 'Basic Auth', description: 'Username and password authentication' }
] as const

const getCredentialFields = (authType: string, platformType: string) => {
  switch (authType) {
    case 'api_key':
      if (platformType === 'n8n') {
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your n8n API key' }
        ]
      } else if (platformType === 'make') {
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your Make.com API key' }
        ]
      } else if (platformType === 'zapier') {
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your Zapier API key' }
        ]
      }
      return [
        { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your API key' }
      ]
    
    case 'oauth':
      return [
        { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'Enter OAuth client ID' },
        { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'Enter OAuth client secret' },
        { key: 'redirectUri', label: 'Redirect URI', type: 'url', placeholder: 'Enter OAuth redirect URI' }
      ]
    
    case 'basic':
      return [
        { key: 'username', label: 'Username', type: 'text', placeholder: 'Enter username' },
        { key: 'password', label: 'Password', type: 'password', placeholder: 'Enter password' }
      ]
    
    default:
      return []
  }
}

export function PlatformForm({ platform, onSave, onCancel, onTestConnection }: PlatformFormProps) {
  const [formData, setFormData] = useState<Platform>({
    name: '',
    type: 'n8n',
    baseUrl: '',
    authConfig: {
      type: 'api_key',
      credentials: {}
    },
    ...platform
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null)
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({})

  const isEditing = !!platform?.id

  useEffect(() => {
    // Reset credentials when auth type or platform type changes
    setFormData(prev => ({
      ...prev,
      authConfig: {
        ...prev.authConfig,
        credentials: {}
      }
    }))
    setTestResult(null)
    setErrors({})
  }, [formData.authConfig.type, formData.type])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Platform name is required'
    }

    if (!formData.baseUrl.trim()) {
      newErrors.baseUrl = 'Base URL is required'
    } else {
      try {
        new URL(formData.baseUrl)
      } catch {
        newErrors.baseUrl = 'Please enter a valid URL'
      }
    }

    const credentialFields = getCredentialFields(formData.authConfig.type, formData.type)
    credentialFields.forEach(field => {
      if (!formData.authConfig.credentials[field.key]?.trim()) {
        newErrors[`credentials.${field.key}`] = `${field.label} is required`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleAuthTypeChange = (authType: 'api_key' | 'oauth' | 'basic') => {
    setFormData(prev => ({
      ...prev,
      authConfig: {
        type: authType,
        credentials: {}
      }
    }))
  }

  const handleCredentialChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      authConfig: {
        ...prev.authConfig,
        credentials: {
          ...prev.authConfig.credentials,
          [key]: value
        }
      }
    }))

    // Clear error when user starts typing
    const errorKey = `credentials.${key}`
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }))
    }
  }

  const handleTestConnection = async () => {
    if (!onTestConnection) return

    // Validate required fields for connection test
    if (!formData.baseUrl.trim()) {
      setErrors(prev => ({ ...prev, baseUrl: 'Base URL is required for connection test' }))
      return
    }

    const credentialFields = getCredentialFields(formData.authConfig.type, formData.type)
    const missingCredentials = credentialFields.filter(
      field => !formData.authConfig.credentials[field.key]?.trim()
    )

    if (missingCredentials.length > 0) {
      const newErrors: Record<string, string> = {}
      missingCredentials.forEach(field => {
        newErrors[`credentials.${field.key}`] = `${field.label} is required for connection test`
      })
      setErrors(prev => ({ ...prev, ...newErrors }))
      return
    }

    setIsTesting(true)
    setTestResult(null)

    try {
      const result = await onTestConnection({
        baseUrl: formData.baseUrl,
        authConfig: formData.authConfig
      })
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onSave(formData)
    } catch (error) {
      // Error handling is done by parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleCredentialVisibility = (key: string) => {
    setShowCredentials(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const credentialFields = getCredentialFields(formData.authConfig.type, formData.type)

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? 'Edit Platform' : 'Add New Platform'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Platform Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter a descriptive name for this platform"
                className={cn(errors.name && 'border-red-500')}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Platform Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: 'n8n' | 'make' | 'zapier') => handleInputChange('type', value)}
              >
                <SelectTrigger aria-label="Platform Type">
                  <SelectValue placeholder="Select platform type" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORM_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span>{type.label}</span>
                        <span className="text-xs text-gray-500">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseUrl">Base URL</Label>
              <Input
                id="baseUrl"
                type="url"
                value={formData.baseUrl}
                onChange={(e) => handleInputChange('baseUrl', e.target.value)}
                placeholder="https://your-platform.example.com"
                className={cn(errors.baseUrl && 'border-red-500')}
              />
              {errors.baseUrl && (
                <p className="text-sm text-red-600">{errors.baseUrl}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Authentication Configuration */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Authentication Type</Label>
              <Select 
                value={formData.authConfig.type} 
                onValueChange={handleAuthTypeChange}
              >
                <SelectTrigger aria-label="Authentication Type">
                  <SelectValue placeholder="Select authentication type" />
                </SelectTrigger>
                <SelectContent>
                  {AUTH_TYPES.map((auth) => (
                    <SelectItem key={auth.value} value={auth.value}>
                      <div className="flex flex-col">
                        <span>{auth.label}</span>
                        <span className="text-xs text-gray-500">{auth.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic Credential Fields */}
            {credentialFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <div className="relative">
                  <Input
                    id={field.key}
                    type={field.type === 'password' && !showCredentials[field.key] ? 'password' : 'text'}
                    value={formData.authConfig.credentials[field.key] || ''}
                    onChange={(e) => handleCredentialChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className={cn(
                      errors[`credentials.${field.key}`] && 'border-red-500',
                      field.type === 'password' && 'pr-10'
                    )}
                  />
                  {field.type === 'password' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => toggleCredentialVisibility(field.key)}
                      aria-label={showCredentials[field.key] ? 'Hide password' : 'Show password'}
                    >
                      {showCredentials[field.key] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                {errors[`credentials.${field.key}`] && (
                  <p className="text-sm text-red-600">{errors[`credentials.${field.key}`]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Connection Test */}
          {onTestConnection && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">Connection Test</h3>
                    <p className="text-xs text-gray-500">
                      Test the connection to verify your configuration
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                  >
                    {isTesting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4 mr-2" />
                    )}
                    {isTesting ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>

                {testResult && (
                  <Alert variant={testResult.success ? 'default' : 'destructive'}>
                    {testResult.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      {testResult.success ? (
                        <div className="space-y-2">
                          <p className="font-medium">Connection successful!</p>
                          <div className="flex flex-wrap gap-2 text-sm">
                            {testResult.responseTime && (
                              <Badge variant="outline">
                                Response: {testResult.responseTime}ms
                              </Badge>
                            )}
                            {testResult.version && (
                              <Badge variant="outline">
                                Version: {testResult.version}
                              </Badge>
                            )}
                            {testResult.agentCount !== undefined && (
                              <Badge variant="outline">
                                Agents: {testResult.agentCount}
                              </Badge>
                            )}
                          </div>
                          {testResult.capabilities && testResult.capabilities.length > 0 && (
                            <div className="text-sm">
                              <p className="font-medium">Capabilities:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {testResult.capabilities.map((capability) => (
                                  <Badge key={capability} variant="secondary" className="text-xs">
                                    {capability}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium">Connection failed</p>
                          <p className="text-sm mt-1">{testResult.error}</p>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Platform' : 'Add Platform')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}