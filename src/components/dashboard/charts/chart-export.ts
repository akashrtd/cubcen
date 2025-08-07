import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export type ExportFormat = 'png' | 'svg' | 'pdf'

export interface ExportOptions {
  filename?: string
  format: ExportFormat
  quality?: number
  width?: number
  height?: number
  backgroundColor?: string
}

export class ChartExporter {
  /**
   * Export a chart element to the specified format
   */
  static async exportChart(
    element: HTMLElement,
    options: ExportOptions
  ): Promise<void> {
    const {
      filename = 'chart',
      format,
      quality = 1.0,
      width,
      height,
      backgroundColor = '#ffffff',
    } = options

    try {
      switch (format) {
        case 'png':
          await this.exportToPNG(element, filename, quality, backgroundColor)
          break
        case 'svg':
          await this.exportToSVG(element, filename)
          break
        case 'pdf':
          await this.exportToPDF(
            element,
            filename,
            width,
            height,
            backgroundColor
          )
          break
        default:
          throw new Error(`Unsupported export format: ${format}`)
      }
    } catch (error) {
      console.error('Chart export failed:', error)
      throw new Error(`Failed to export chart as ${format.toUpperCase()}`)
    }
  }

  /**
   * Export chart as PNG using html2canvas
   */
  private static async exportToPNG(
    element: HTMLElement,
    filename: string,
    quality: number,
    backgroundColor: string
  ): Promise<void> {
    const canvas = await html2canvas(element, {
      background: backgroundColor,
      useCORS: true,
      allowTaint: true,
      logging: false,
    })

    // Create download link
    const link = document.createElement('a')
    link.download = `${filename}.png`
    link.href = canvas.toDataURL('image/png')

    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  /**
   * Export chart as SVG
   */
  private static async exportToSVG(
    element: HTMLElement,
    filename: string
  ): Promise<void> {
    // Find SVG element within the chart
    const svgElement = element.querySelector('svg')
    if (!svgElement) {
      throw new Error('No SVG element found in chart')
    }

    // Clone the SVG to avoid modifying the original
    const clonedSvg = svgElement.cloneNode(true) as SVGElement

    // Add XML namespace if not present
    if (!clonedSvg.getAttribute('xmlns')) {
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    }

    // Convert to string
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(clonedSvg)

    // Create blob and download
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.download = `${filename}.svg`
    link.href = url

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  /**
   * Export chart as PDF using jsPDF
   */
  private static async exportToPDF(
    element: HTMLElement,
    filename: string,
    width?: number,
    height?: number,
    backgroundColor?: string
  ): Promise<void> {
    const canvas = await html2canvas(element, {
      background: backgroundColor,
      useCORS: true,
      allowTaint: true,
      logging: false,
    })

    const imgData = canvas.toDataURL('image/png')

    // Calculate dimensions
    const imgWidth = width || canvas.width
    const imgHeight = height || canvas.height
    const ratio = imgHeight / imgWidth

    // Create PDF with appropriate size
    const pdfWidth = Math.min(imgWidth, 210) // A4 width in mm
    const pdfHeight = pdfWidth * ratio

    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
      unit: 'mm',
      format: [pdfWidth, pdfHeight],
    })

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${filename}.pdf`)
  }

  /**
   * Check if export is supported in the current environment
   */
  static isExportSupported(): boolean {
    return (
      typeof document !== 'undefined' &&
      typeof HTMLCanvasElement !== 'undefined' &&
      'toDataURL' in HTMLCanvasElement.prototype
    )
  }

  /**
   * Get available export formats
   */
  static getAvailableFormats(): ExportFormat[] {
    if (!this.isExportSupported()) {
      return []
    }

    const formats: ExportFormat[] = ['png', 'svg']

    // Check if PDF export is available (requires jsPDF)
    try {
      // This will throw if jsPDF is not available
      new jsPDF()
      formats.push('pdf')
    } catch {
      // PDF export not available
    }

    return formats
  }
}

/**
 * Hook for using chart export functionality
 */
export function useChartExport() {
  const exportChart = async (
    elementRef: React.RefObject<HTMLElement>,
    options: ExportOptions
  ): Promise<void> => {
    if (!elementRef.current) {
      throw new Error('Chart element not found')
    }

    if (!ChartExporter.isExportSupported()) {
      throw new Error('Chart export is not supported in this environment')
    }

    await ChartExporter.exportChart(elementRef.current, options)
  }

  const isSupported = ChartExporter.isExportSupported()
  const availableFormats = ChartExporter.getAvailableFormats()

  return {
    exportChart,
    isSupported,
    availableFormats,
  }
}
