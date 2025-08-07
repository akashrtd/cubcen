'use client'

import React, { useMemo } from 'react'

// Utility functions for generating ARIA labels
export const ariaLabels = {
  // Dashboard card labels
  card: {
    interactive: (title: string) => `${title} card, interactive`,
    loading: (title?: string) => `${title ? `${title} card` : 'Card'} loading`,
    error: (title?: string, error?: string) =>
      `${title ? `${title} card` : 'Card'} error${error ? `: ${error}` : ''}`,
    metric: (
      title: string,
      value: string | number,
      unit?: string,
      trend?: string
    ) => {
      let label = `${title}: ${value}`
      if (unit) label += ` ${unit}`
      if (trend) label += `, trend ${trend}`
      return label
    },
  },

  // Chart labels
  chart: {
    container: (type: string, title?: string) =>
      `${type} chart${title ? ` showing ${title}` : ''}`,
    interactive: (type: string) =>
      `Interactive ${type} chart. Use arrow keys to navigate, Enter to select`,
    loading: (type: string) => `${type} chart loading`,
    error: (type: string, error?: string) =>
      `${type} chart error${error ? `: ${error}` : ''}`,
    noData: (type: string) => `${type} chart with no data available`,
    element: (
      type: string,
      label: string,
      value: string | number,
      index: number,
      total: number
    ) => `${type} element ${index + 1} of ${total}: ${label}, value ${value}`,
    legend: (label: string, active: boolean) =>
      `Legend item: ${label}, ${active ? 'active' : 'inactive'}`,
    axis: (type: 'x' | 'y', label?: string) =>
      `${type.toUpperCase()} axis${label ? `: ${label}` : ''}`,
  },

  // Navigation labels
  navigation: {
    main: 'Main navigation',
    breadcrumb: 'Breadcrumb navigation',
    pagination: 'Pagination navigation',
    skip: (target: string) => `Skip to ${target}`,
    toggle: (expanded: boolean, target: string) =>
      `${expanded ? 'Collapse' : 'Expand'} ${target}`,
    current: (page: string) => `Current page: ${page}`,
  },

  // Form labels
  form: {
    required: (label: string) => `${label}, required`,
    optional: (label: string) => `${label}, optional`,
    invalid: (label: string, error: string) => `${label}, invalid: ${error}`,
    help: (label: string, help: string) => `${label}. ${help}`,
    search: (placeholder?: string) =>
      `Search${placeholder ? ` ${placeholder}` : ''}`,
    filter: (type: string, value?: string) =>
      `Filter by ${type}${value ? `, current value: ${value}` : ''}`,
  },

  // Table labels
  table: {
    container: (caption?: string, rowCount?: number) => {
      let label = 'Data table'
      if (caption) label += `: ${caption}`
      if (rowCount !== undefined) label += `, ${rowCount} rows`
      return label
    },
    sortable: (column: string, direction?: 'asc' | 'desc') => {
      let label = `Sort by ${column}`
      if (direction) {
        label += `, currently sorted ${direction === 'asc' ? 'ascending' : 'descending'}`
      }
      return label
    },
    row: (index: number, total: number, selected?: boolean) => {
      let label = `Row ${index + 1} of ${total}`
      if (selected) label += ', selected'
      return label
    },
    cell: (content: string, column: string, row: number) =>
      `${column}: ${content}, row ${row + 1}`,
  },

  // Status and feedback labels
  status: {
    loading: (content?: string) => `Loading${content ? ` ${content}` : ''}`,
    success: (message: string) => `Success: ${message}`,
    error: (message: string) => `Error: ${message}`,
    warning: (message: string) => `Warning: ${message}`,
    info: (message: string) => `Information: ${message}`,
    progress: (current: number, total: number, label?: string) =>
      `${label ? `${label}: ` : ''}${current} of ${total} complete`,
  },

  // Modal and dialog labels
  modal: {
    dialog: (title: string) => `${title} dialog`,
    close: (title?: string) => `Close${title ? ` ${title}` : ''} dialog`,
    confirm: (action: string) => `Confirm ${action}`,
    cancel: 'Cancel',
  },

  // Filter and search labels
  filter: {
    applied: (count: number) =>
      `${count} filter${count !== 1 ? 's' : ''} applied`,
    clear: 'Clear all filters',
    results: (count: number, total?: number) => {
      if (total !== undefined) {
        return `Showing ${count} of ${total} results`
      }
      return `${count} result${count !== 1 ? 's' : ''} found`
    },
  },
}

// Hook for generating dynamic ARIA labels
export function useAriaLabels() {
  return useMemo(() => ariaLabels, [])
}

// Component for providing ARIA descriptions
interface AriaDescriptionProps {
  id: string
  children: string
  className?: string
}

export function AriaDescription({
  id,
  children,
  className,
}: AriaDescriptionProps) {
  return (
    <div id={id} className={`sr-only ${className || ''}`} role="text">
      {children}
    </div>
  )
}

// Component for live regions
interface LiveRegionProps {
  children: React.ReactNode
  priority?: 'polite' | 'assertive'
  atomic?: boolean
  relevant?: 'additions' | 'removals' | 'text' | 'all'
  className?: string
}

export function LiveRegion({
  children,
  priority = 'polite',
  atomic = true,
  relevant = 'all',
  className,
}: LiveRegionProps) {
  return (
    <div
      className={`sr-only ${className || ''}`}
      aria-live={priority}
      aria-atomic={atomic}
      aria-relevant={relevant}
      role={priority === 'assertive' ? 'alert' : 'status'}
    >
      {children}
    </div>
  )
}

// Component for providing accessible names and descriptions
interface AccessibleElementProps {
  children: React.ReactElement
  label?: string
  description?: string
  labelledBy?: string
  describedBy?: string
  role?: string
  expanded?: boolean
  selected?: boolean
  disabled?: boolean
  required?: boolean
  invalid?: boolean
  current?: boolean | 'page' | 'step' | 'location' | 'date' | 'time'
}

export function AccessibleElement({
  children,
  label,
  description,
  labelledBy,
  describedBy,
  role,
  expanded,
  selected,
  disabled,
  required,
  invalid,
  current,
}: AccessibleElementProps) {
  const descriptionId = description
    ? `${(children.props as any).id || 'element'}-description`
    : undefined

  return (
    <>
      {React.cloneElement(children, {
        ...(children.props as any),
        'aria-label': label || (children.props as any)['aria-label'],
        'aria-labelledby':
          labelledBy || (children.props as any)['aria-labelledby'],
        'aria-describedby':
          describedBy ||
          descriptionId ||
          (children.props as any)['aria-describedby'],
        role: role || (children.props as any).role,
        'aria-expanded':
          expanded !== undefined
            ? expanded
            : (children.props as any)['aria-expanded'],
        'aria-selected':
          selected !== undefined
            ? selected
            : (children.props as any)['aria-selected'],
        'aria-disabled':
          disabled !== undefined
            ? disabled
            : (children.props as any)['aria-disabled'],
        'aria-required':
          required !== undefined
            ? required
            : (children.props as any)['aria-required'],
        'aria-invalid':
          invalid !== undefined
            ? invalid
            : (children.props as any)['aria-invalid'],
        'aria-current':
          current !== undefined
            ? current
            : (children.props as any)['aria-current'],
      })}
      {description && descriptionId && (
        <AriaDescription id={descriptionId}>{description}</AriaDescription>
      )}
    </>
  )
}

// Utility for generating chart element ARIA labels
export function generateChartAriaLabel(
  element: any,
  index: number,
  total: number,
  chartType: string
): string {
  const { label, value, x, y, data } = element

  let ariaLabel = `${chartType} element ${index + 1} of ${total}`

  if (label) {
    ariaLabel += `: ${label}`
  }

  if (value !== undefined) {
    ariaLabel += `, value ${value}`
  } else if (y !== undefined) {
    ariaLabel += `, y value ${y}`
    if (x !== undefined) {
      ariaLabel += `, x value ${x}`
    }
  } else if (data !== undefined) {
    ariaLabel += `, data ${data}`
  }

  return ariaLabel
}

// Utility for generating table cell ARIA labels
export function generateTableCellAriaLabel(
  content: string,
  columnHeader: string,
  rowIndex: number,
  columnIndex: number
): string {
  return `${columnHeader}: ${content}, row ${rowIndex + 1}, column ${columnIndex + 1}`
}

// Utility for generating form field ARIA labels
export function generateFormFieldAriaLabel(
  label: string,
  required?: boolean,
  invalid?: boolean,
  errorMessage?: string,
  helpText?: string
): string {
  let ariaLabel = label

  if (required) {
    ariaLabel += ', required'
  }

  if (invalid && errorMessage) {
    ariaLabel += `, invalid: ${errorMessage}`
  }

  if (helpText) {
    ariaLabel += `. ${helpText}`
  }

  return ariaLabel
}

// Utility for generating navigation ARIA labels
export function generateNavigationAriaLabel(
  currentPage: string,
  totalPages?: number,
  pageIndex?: number
): string {
  let ariaLabel = `Current page: ${currentPage}`

  if (totalPages && pageIndex !== undefined) {
    ariaLabel += `, page ${pageIndex + 1} of ${totalPages}`
  }

  return ariaLabel
}
