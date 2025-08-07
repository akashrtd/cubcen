import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ExportDialog } from '../export-dialog'

// Mock file download
const mockCreateObjectURL = jest.fn()
const mockRevokeObjectURL = jest.fn()
const mockClick = jest.fn()

Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
})

// Mock document.createElement to return a mock anchor element
const mockAnchorElement = {
  href: '',
  download: '',
  click: mockClick,
}

jest.spyOn(document, 'createElement').mockImplementation(tagName => {
  if (tagName === 'a') {
    return mockAnchorElement as any
  }
  return document.createElement(tagName)
})

const mockAnalyticsData = {
  totalAgents: 10,
  activeAgents: 8,
  totalTasks: 100,
  completedTasks: 85,
  failedTasks: 15,
  successRate: 85,
  averageResponseTime: 150,
  tasksByStatus: [
    { status: 'COMPLETED', count: 85 },
    { status: 'FAILED', count: 15 },
  ],
  tasksByPriority: [
    { priority: 'HIGH', count: 30 },
    { priority: 'MEDIUM', count: 50 },
    { priority: 'LOW', count: 20 },
  ],
  agentPerformance: [
    {
      agentId: 'agent1',
      agentName: 'Test Agent 1',
      totalTasks: 50,
      successRate: 90,
      averageResponseTime: 120,
    },
  ],
  platformDistribution: [{ platform: 'n8n (N8N)', count: 5 }],
  dailyTaskTrends: [{ date: '2024-01-01', completed: 10, failed: 2 }],
  errorPatterns: [{ error: 'Connection timeout', count: 5 }],
}

describe('ExportDialog', () => {
  const mockOnOpenChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateObjectURL.mockReturnValue('blob:mock-url')
  })

  it('renders when open is true', () => {
    render(
      <ExportDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockAnalyticsData}
      />
    )

    expect(screen.getByText('Export Analytics Data')).toBeInTheDocument()
    expect(
      screen.getByText('Choose what data to export and in which format.')
    ).toBeInTheDocument()
  })

  it('does not render when open is false', () => {
    render(
      <ExportDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        data={mockAnalyticsData}
      />
    )

    expect(screen.queryByText('Export Analytics Data')).not.toBeInTheDocument()
  })

  it('displays all data type options', () => {
    render(
      <ExportDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockAnalyticsData}
      />
    )

    expect(screen.getByText('Overview & KPIs')).toBeInTheDocument()
    expect(screen.getByText('Agent Performance')).toBeInTheDocument()
    expect(screen.getByText('Task Analytics')).toBeInTheDocument()
    expect(screen.getByText('Trend Data')).toBeInTheDocument()
    expect(screen.getByText('Error Patterns')).toBeInTheDocument()
  })

  it('displays format options', () => {
    render(
      <ExportDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockAnalyticsData}
      />
    )

    expect(screen.getByText('CSV')).toBeInTheDocument()
    expect(screen.getByText('JSON')).toBeInTheDocument()
  })

  it('allows selecting data types', async () => {
    render(
      <ExportDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockAnalyticsData}
      />
    )

    const overviewCheckbox = screen.getByRole('checkbox', { name: /overview/i })
    fireEvent.click(overviewCheckbox)

    expect(overviewCheckbox).toBeChecked()
  })

  it('allows selecting export format', async () => {
    render(
      <ExportDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockAnalyticsData}
      />
    )

    const jsonRadio = screen.getByRole('radio', { name: /json/i })
    fireEvent.click(jsonRadio)

    expect(jsonRadio).toBeChecked()
  })

  it('exports CSV data when export button is clicked', async () => {
    render(
      <ExportDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockAnalyticsData}
      />
    )

    // Select overview data type
    const overviewCheckbox = screen.getByRole('checkbox', { name: /overview/i })
    fireEvent.click(overviewCheckbox)

    // Select CSV format (should be default)
    const csvRadio = screen.getByRole('radio', { name: /csv/i })
    expect(csvRadio).toBeChecked()

    // Click export button
    const exportButton = screen.getByRole('button', { name: /export data/i })
    fireEvent.click(exportButton)

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
    })
  })

  it('exports JSON data when JSON format is selected', async () => {
    render(
      <ExportDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockAnalyticsData}
      />
    )

    // Select overview data type
    const overviewCheckbox = screen.getByRole('checkbox', { name: /overview/i })
    fireEvent.click(overviewCheckbox)

    // Select JSON format
    const jsonRadio = screen.getByRole('radio', { name: /json/i })
    fireEvent.click(jsonRadio)

    // Click export button
    const exportButton = screen.getByRole('button', { name: /export data/i })
    fireEvent.click(exportButton)

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
    })
  })

  it('disables export button when no data types are selected', () => {
    render(
      <ExportDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockAnalyticsData}
      />
    )

    const exportButton = screen.getByRole('button', { name: /export data/i })
    expect(exportButton).toBeDisabled()
  })

  it('enables export button when at least one data type is selected', async () => {
    render(
      <ExportDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockAnalyticsData}
      />
    )

    const overviewCheckbox = screen.getByRole('checkbox', { name: /overview/i })
    fireEvent.click(overviewCheckbox)

    const exportButton = screen.getByRole('button', { name: /export data/i })
    expect(exportButton).not.toBeDisabled()
  })

  it('closes dialog when cancel button is clicked', () => {
    render(
      <ExportDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockAnalyticsData}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('closes dialog when close button is clicked', () => {
    render(
      <ExportDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockAnalyticsData}
      />
    )

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it('handles multiple data type selections', async () => {
    render(
      <ExportDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockAnalyticsData}
      />
    )

    // Select multiple data types
    const overviewCheckbox = screen.getByRole('checkbox', { name: /overview/i })
    const agentsCheckbox = screen.getByRole('checkbox', {
      name: /agent performance/i,
    })

    fireEvent.click(overviewCheckbox)
    fireEvent.click(agentsCheckbox)

    expect(overviewCheckbox).toBeChecked()
    expect(agentsCheckbox).toBeChecked()

    // Export should work with multiple selections
    const exportButton = screen.getByRole('button', { name: /export data/i })
    fireEvent.click(exportButton)

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled()
    })
  })

  it('generates correct filename for CSV export', async () => {
    render(
      <ExportDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockAnalyticsData}
      />
    )

    const overviewCheckbox = screen.getByRole('checkbox', { name: /overview/i })
    fireEvent.click(overviewCheckbox)

    const exportButton = screen.getByRole('button', { name: /export data/i })
    fireEvent.click(exportButton)

    await waitFor(() => {
      expect(mockAnchorElement.download).toMatch(/analytics-export-.*\.csv/)
    })
  })

  it('generates correct filename for JSON export', async () => {
    render(
      <ExportDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockAnalyticsData}
      />
    )

    const overviewCheckbox = screen.getByRole('checkbox', { name: /overview/i })
    fireEvent.click(overviewCheckbox)

    const jsonRadio = screen.getByRole('radio', { name: /json/i })
    fireEvent.click(jsonRadio)

    const exportButton = screen.getByRole('button', { name: /export data/i })
    fireEvent.click(exportButton)

    await waitFor(() => {
      expect(mockAnchorElement.download).toMatch(/analytics-export-.*\.json/)
    })
  })

  it('handles export errors gracefully', async () => {
    mockCreateObjectURL.mockImplementation(() => {
      throw new Error('Export failed')
    })

    render(
      <ExportDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockAnalyticsData}
      />
    )

    const overviewCheckbox = screen.getByRole('checkbox', { name: /overview/i })
    fireEvent.click(overviewCheckbox)

    const exportButton = screen.getByRole('button', { name: /export data/i })
    fireEvent.click(exportButton)

    // Should not crash the component
    expect(screen.getByText('Export Analytics Data')).toBeInTheDocument()
  })

  it('cleans up blob URL after download', async () => {
    render(
      <ExportDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        data={mockAnalyticsData}
      />
    )

    const overviewCheckbox = screen.getByRole('checkbox', { name: /overview/i })
    fireEvent.click(overviewCheckbox)

    const exportButton = screen.getByRole('button', { name: /export data/i })
    fireEvent.click(exportButton)

    await waitFor(() => {
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })
  })
})
