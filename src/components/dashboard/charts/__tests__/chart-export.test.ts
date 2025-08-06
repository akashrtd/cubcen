import { ChartExporter, useChartExport } from '../chart-export'
import { renderHook, act } from '@testing-library/react'
import React from 'react'

// Setup test environment
const originalDocument = global.document
const originalWindow = global.window

beforeAll(() => {
  // Mock document and window for React testing
  Object.defineProperty(global, 'document', {
    value: {
      ...originalDocument,
      createElement: jest.fn((tagName) => {
        if (tagName === 'a') {
          return mockLink
        }
        return {
          querySelector: jest.fn(),
          innerHTML: '',
        }
      }),
      body: {
        appendChild: jest.fn(),
        removeChild: jest.fn(),
      },
    },
    writable: true,
  })
})

// Mock html2canvas
jest.mock('html2canvas', () => {
  return jest.fn(() => Promise.resolve({
    toDataURL: jest.fn(() => 'data:image/png;base64,mock-image-data'),
    width: 800,
    height: 600,
  }))
})

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    addImage: jest.fn(),
    save: jest.fn(),
  }))
})

// Mock DOM methods
Object.defineProperty(global, 'XMLSerializer', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    serializeToString: jest.fn(() => '<svg>mock svg content</svg>'),
  })),
})

Object.defineProperty(global, 'URL', {
  writable: true,
  value: {
    createObjectURL: jest.fn(() => 'blob:mock-url'),
    revokeObjectURL: jest.fn(),
  },
})

Object.defineProperty(global, 'Blob', {
  writable: true,
  value: jest.fn().mockImplementation((content, options) => ({
    content,
    options,
  })),
})

// Mock document methods
const mockLink = {
  click: jest.fn(),
  download: '',
  href: '',
}

Object.defineProperty(document, 'createElement', {
  writable: true,
  value: jest.fn((tagName) => {
    if (tagName === 'a') {
      return mockLink
    }
    return {}
  }),
})

Object.defineProperty(document.body, 'appendChild', {
  writable: true,
  value: jest.fn(),
})

Object.defineProperty(document.body, 'removeChild', {
  writable: true,
  value: jest.fn(),
})

describe('ChartExporter', () => {
  let mockElement: HTMLElement

  beforeEach(() => {
    // Create a proper mock element with querySelector
    mockElement = {
      querySelector: jest.fn((selector) => {
        if (selector === 'svg') {
          return {
            cloneNode: jest.fn(() => ({
              setAttribute: jest.fn(),
              getAttribute: jest.fn(() => null),
            })),
          }
        }
        return null
      }),
    } as any
    
    // Reset mocks
    jest.clearAllMocks()
  })

  describe('isExportSupported', () => {
    it('returns true when export is supported', () => {
      expect(ChartExporter.isExportSupported()).toBe(true)
    })
  })

  describe('getAvailableFormats', () => {
    it('returns available export formats', () => {
      const formats = ChartExporter.getAvailableFormats()
      expect(formats).toContain('png')
      expect(formats).toContain('svg')
      expect(formats).toContain('pdf')
    })
  })

  describe('exportChart', () => {
    it('exports chart as PNG', async () => {
      await ChartExporter.exportChart(mockElement, {
        format: 'png',
        filename: 'test-chart',
      })

      expect(mockLink.download).toBe('test-chart.png')
      expect(mockLink.href).toBe('data:image/png;base64,mock-image-data')
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('exports chart as SVG', async () => {
      await ChartExporter.exportChart(mockElement, {
        format: 'svg',
        filename: 'test-chart',
      })

      expect(mockLink.download).toBe('test-chart.svg')
      expect(mockLink.click).toHaveBeenCalled()
      expect(global.URL.createObjectURL).toHaveBeenCalled()
      expect(global.URL.revokeObjectURL).toHaveBeenCalled()
    })

    it('exports chart as PDF', async () => {
      const jsPDF = require('jspdf')

      await ChartExporter.exportChart(mockElement, {
        format: 'pdf',
        filename: 'test-chart',
      })

      expect(jsPDF).toHaveBeenCalled()
      
      // Get the mock instance
      const mockPdfInstance = jsPDF.mock.results[0].value
      expect(mockPdfInstance.addImage).toHaveBeenCalled()
      expect(mockPdfInstance.save).toHaveBeenCalledWith('test-chart.pdf')
    })

    it('throws error for unsupported format', async () => {
      await expect(
        ChartExporter.exportChart(mockElement, {
          format: 'unsupported' as any,
          filename: 'test-chart',
        })
      ).rejects.toThrow('Failed to export chart as UNSUPPORTED')
    })

    it('throws error when SVG element not found', async () => {
      const elementWithoutSvg = {
        querySelector: jest.fn(() => null),
      } as any

      await expect(
        ChartExporter.exportChart(elementWithoutSvg, {
          format: 'svg',
          filename: 'test-chart',
        })
      ).rejects.toThrow('No SVG element found in chart')
    })

    it('applies custom quality for PNG export', async () => {
      const html2canvas = require('html2canvas')

      await ChartExporter.exportChart(mockElement, {
        format: 'png',
        filename: 'test-chart',
        quality: 2.0,
      })

      expect(html2canvas).toHaveBeenCalledWith(mockElement, expect.objectContaining({
        scale: 2.0,
      }))
    })

    it('applies custom background color', async () => {
      const html2canvas = require('html2canvas')

      await ChartExporter.exportChart(mockElement, {
        format: 'png',
        filename: 'test-chart',
        backgroundColor: '#ff0000',
      })

      expect(html2canvas).toHaveBeenCalledWith(mockElement, expect.objectContaining({
        backgroundColor: '#ff0000',
      }))
    })
  })
})

describe('useChartExport', () => {
  it('provides export functionality', () => {
    const { result } = renderHook(() => useChartExport())

    expect(result.current.isSupported).toBe(true)
    expect(result.current.availableFormats).toContain('png')
    expect(result.current.availableFormats).toContain('svg')
    expect(result.current.availableFormats).toContain('pdf')
    expect(typeof result.current.exportChart).toBe('function')
  })

  it('exports chart using ref', async () => {
    const { result } = renderHook(() => useChartExport())
    const mockRef = { current: mockElement }

    await act(async () => {
      await result.current.exportChart(mockRef, {
        format: 'png',
        filename: 'hook-test',
      })
    })

    expect(mockLink.download).toBe('hook-test.png')
    expect(mockLink.click).toHaveBeenCalled()
  })

  it('throws error when element ref is null', async () => {
    const { result } = renderHook(() => useChartExport())
    const mockRef = { current: null }

    await expect(
      result.current.exportChart(mockRef, {
        format: 'png',
        filename: 'test',
      })
    ).rejects.toThrow('Chart element not found')
  })
})