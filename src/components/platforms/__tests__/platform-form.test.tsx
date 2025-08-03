import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PlatformForm } from '../platform-form'

const mockPlatform = {
  id: 'platform_1',
  name: 'Test Platform',
  type: 'n8n' as const,
  baseUrl: 'https://n8n.example.com',
  authConfig: {
    type: 'api_key' as const,
    credentials: {
      apiKey: 'test-api-key'
    }
  },
  status: 'connected' as const
}

const mockConnectionTestResult = {
  success: true,
  responseTime: 200,
  version: '1.0.0',
  capabilities: ['workflows', 'executions'],
  agentCount: 5
}

describe('PlatformForm', () => {
  const mockOnSave = jest.fn()
  const mockOnCancel = jest.fn()
  const mockOnTestConnection = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form for new platform', () => {
    render(
      <PlatformForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onTestConnection={mockOnTestConnection}
      />
    )

    expect(screen.getByText('Add New Platform')).toBeInTheDocument()
    expect(screen.getByLabelText('Platform Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Platform Type')).toBeInTheDocument()
    expect(screen.getByLabelText('Base URL')).toBeInTheDocument()
    expect(screen.getByText('Authentication Type')).toBeInTheDocument()
  })

  it('renders form for editing existing platform', () => {
    render(
      <PlatformForm
        platform={mockPlatform}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onTestConnection={mockOnTestConnection}
      />
    )

    expect(screen.getByText('Edit Platform')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Platform')).toBeInTheDocument()
    expect(screen.getByDisplayValue('https://n8n.example.com')).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(
      <PlatformForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    const submitButton = screen.getByRole('button', { name: /add platform/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Platform name is required')).toBeInTheDocument()
      expect(screen.getByText('Base URL is required')).toBeInTheDocument()
      expect(screen.getByText('API Key is required')).toBeInTheDocument()
    })

    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('validates URL format', async () => {
    render(
      <PlatformForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    const nameInput = screen.getByLabelText('Platform Name')
    const urlInput = screen.getByLabelText('Base URL')
    const apiKeyInput = screen.getByLabelText('API Key')
    const submitButton = screen.getByRole('button', { name: /add platform/i })

    fireEvent.change(nameInput, { target: { value: 'Test Platform' } })
    fireEvent.change(urlInput, { target: { value: 'invalid-url' } })
    fireEvent.change(apiKeyInput, { target: { value: 'test-key' } })
    fireEvent.click(submitButton)

    // Just check that the form doesn't submit with invalid URL
    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled()
    })
  })

  it('handles form submission with valid data', async () => {
    render(
      <PlatformForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    const nameInput = screen.getByLabelText('Platform Name')
    const urlInput = screen.getByLabelText('Base URL')
    const apiKeyInput = screen.getByLabelText('API Key')
    const submitButton = screen.getByRole('button', { name: /add platform/i })

    fireEvent.change(nameInput, { target: { value: 'Test Platform' } })
    fireEvent.change(urlInput, { target: { value: 'https://test.example.com' } })
    fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        name: 'Test Platform',
        type: 'n8n',
        baseUrl: 'https://test.example.com',
        authConfig: {
          type: 'api_key',
          credentials: {
            apiKey: 'test-api-key'
          }
        }
      })
    })
  })

  it('handles platform type change', async () => {
    render(
      <PlatformForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    // Open platform type dropdown
    const typeSelect = screen.getByLabelText('Platform Type')
    fireEvent.click(typeSelect)

    // Select Make.com
    const makeOption = screen.getByText('Make.com')
    fireEvent.click(makeOption)

    // Verify the selection
    expect(screen.getByText('Make.com')).toBeInTheDocument()
  })

  it('handles authentication type change', async () => {
    render(
      <PlatformForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    // Open auth type dropdown
    const authSelect = screen.getByLabelText('Authentication Type')
    fireEvent.click(authSelect)

    // Select OAuth
    const oauthOption = screen.getByText('OAuth 2.0')
    fireEvent.click(oauthOption)

    // Verify OAuth fields appear
    await waitFor(() => {
      expect(screen.getByLabelText('Client ID')).toBeInTheDocument()
      expect(screen.getByLabelText('Client Secret')).toBeInTheDocument()
      expect(screen.getByLabelText('Redirect URI')).toBeInTheDocument()
    })
  })

  it('toggles password visibility', () => {
    render(
      <PlatformForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    const apiKeyInput = screen.getByLabelText('API Key')
    const toggleButton = screen.getByLabelText('Show password')

    // Initially should be password type
    expect(apiKeyInput).toHaveAttribute('type', 'password')

    // Click to show password
    fireEvent.click(toggleButton)
    expect(apiKeyInput).toHaveAttribute('type', 'text')

    // Click to hide password
    const hideButton = screen.getByLabelText('Hide password')
    fireEvent.click(hideButton)
    expect(apiKeyInput).toHaveAttribute('type', 'password')
  })

  it('handles connection test success', async () => {
    mockOnTestConnection.mockResolvedValue(mockConnectionTestResult)

    render(
      <PlatformForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onTestConnection={mockOnTestConnection}
      />
    )

    // Fill required fields
    const nameInput = screen.getByLabelText('Platform Name')
    const urlInput = screen.getByLabelText('Base URL')
    const apiKeyInput = screen.getByLabelText('API Key')

    fireEvent.change(nameInput, { target: { value: 'Test Platform' } })
    fireEvent.change(urlInput, { target: { value: 'https://test.example.com' } })
    fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } })

    // Click test connection
    const testButton = screen.getByRole('button', { name: /test connection/i })
    fireEvent.click(testButton)

    // Verify loading state
    expect(screen.getByText('Testing...')).toBeInTheDocument()

    // Wait for success result
    await waitFor(() => {
      expect(screen.getByText('Connection successful!')).toBeInTheDocument()
      expect(screen.getByText('Response: 200ms')).toBeInTheDocument()
      expect(screen.getByText('Version: 1.0.0')).toBeInTheDocument()
      expect(screen.getByText('Agents: 5')).toBeInTheDocument()
      expect(screen.getByText('workflows')).toBeInTheDocument()
      expect(screen.getByText('executions')).toBeInTheDocument()
    })

    expect(mockOnTestConnection).toHaveBeenCalledWith({
      baseUrl: 'https://test.example.com',
      authConfig: {
        type: 'api_key',
        credentials: {
          apiKey: 'test-api-key'
        }
      }
    })
  })

  it('handles connection test failure', async () => {
    const errorResult = {
      success: false,
      error: 'Invalid API key'
    }
    mockOnTestConnection.mockResolvedValue(errorResult)

    render(
      <PlatformForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onTestConnection={mockOnTestConnection}
      />
    )

    // Fill required fields
    const nameInput = screen.getByLabelText('Platform Name')
    const urlInput = screen.getByLabelText('Base URL')
    const apiKeyInput = screen.getByLabelText('API Key')

    fireEvent.change(nameInput, { target: { value: 'Test Platform' } })
    fireEvent.change(urlInput, { target: { value: 'https://test.example.com' } })
    fireEvent.change(apiKeyInput, { target: { value: 'invalid-key' } })

    // Click test connection
    const testButton = screen.getByRole('button', { name: /test connection/i })
    fireEvent.click(testButton)

    // Wait for error result
    await waitFor(() => {
      expect(screen.getByText('Connection failed')).toBeInTheDocument()
      expect(screen.getByText('Invalid API key')).toBeInTheDocument()
    })
  })

  it('prevents connection test without required fields', async () => {
    render(
      <PlatformForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onTestConnection={mockOnTestConnection}
      />
    )

    // Click test connection without filling fields
    const testButton = screen.getByRole('button', { name: /test connection/i })
    fireEvent.click(testButton)

    // Should not call the connection test function
    await waitFor(() => {
      expect(mockOnTestConnection).not.toHaveBeenCalled()
    })
  })

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <PlatformForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('clears credentials when auth type changes', async () => {
    render(
      <PlatformForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    // Fill API key
    const apiKeyInput = screen.getByLabelText('API Key')
    fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } })

    // Change auth type to OAuth
    const authSelect = screen.getByLabelText('Authentication Type')
    fireEvent.click(authSelect)
    
    const oauthOption = screen.getByText('OAuth 2.0')
    fireEvent.click(oauthOption)

    // Verify OAuth fields are empty
    await waitFor(() => {
      const clientIdInput = screen.getByLabelText('Client ID')
      const clientSecretInput = screen.getByLabelText('Client Secret')
      expect(clientIdInput).toHaveValue('')
      expect(clientSecretInput).toHaveValue('')
    })
  })

  it('shows different credential fields for different auth types', async () => {
    render(
      <PlatformForm
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    )

    // Test Basic Auth
    const authSelect = screen.getByLabelText('Authentication Type')
    fireEvent.click(authSelect)
    
    const basicOption = screen.getByText('Basic Auth')
    fireEvent.click(basicOption)

    await waitFor(() => {
      expect(screen.getByLabelText('Username')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })
  })
})