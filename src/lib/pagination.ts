/**
 * Cubcen Pagination and Lazy Loading Utilities
 * Provides efficient pagination and lazy loading for large datasets
 */

import { logger } from './logger'

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, unknown>
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  meta?: {
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    search?: string
    filters?: Record<string, unknown>
  }
}

export interface CursorPaginationParams {
  cursor?: string
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, unknown>
}

export interface CursorPaginatedResult<T> {
  data: T[]
  pagination: {
    nextCursor?: string
    prevCursor?: string
    hasNext: boolean
    hasPrev: boolean
    limit: number
  }
  meta?: {
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    search?: string
    filters?: Record<string, unknown>
  }
}

export class PaginationHelper {
  /**
   * Validate and normalize pagination parameters
   */
  static validateParams(
    params: PaginationParams
  ): Required<Pick<PaginationParams, 'page' | 'limit'>> &
    Omit<PaginationParams, 'page' | 'limit'> {
    const page = Math.max(1, params.page || 1)
    const limit = Math.min(Math.max(1, params.limit || 20), 100) // Max 100 items per page

    return {
      page,
      limit,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder || 'desc',
      search: params.search,
      filters: params.filters,
    }
  }

  /**
   * Calculate offset for database queries
   */
  static calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit
  }

  /**
   * Create paginated result
   */
  static createResult<T>(
    data: T[],
    total: number,
    params: Required<Pick<PaginationParams, 'page' | 'limit'>> &
      Omit<PaginationParams, 'page' | 'limit'>
  ): PaginatedResult<T> {
    const totalPages = Math.ceil(total / params.limit)
    const hasNext = params.page < totalPages
    const hasPrev = params.page > 1

    return {
      data,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
      meta: {
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        search: params.search,
        filters: params.filters,
      },
    }
  }

  /**
   * Create cursor-based pagination result
   */
  static createCursorResult<T>(
    data: T[],
    params: CursorPaginationParams,
    getCursor: (item: T) => string
  ): CursorPaginatedResult<T> {
    const hasNext = data.length === params.limit
    const hasPrev = !!params.cursor

    let nextCursor: string | undefined
    let prevCursor: string | undefined

    if (hasNext && data.length > 0) {
      nextCursor = getCursor(data[data.length - 1])
    }

    if (hasPrev && data.length > 0) {
      prevCursor = getCursor(data[0])
    }

    return {
      data,
      pagination: {
        nextCursor,
        prevCursor,
        hasNext,
        hasPrev,
        limit: params.limit || 20,
      },
      meta: {
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        search: params.search,
        filters: params.filters,
      },
    }
  }
}

// Lazy loading utilities for frontend
export interface LazyLoadOptions {
  threshold?: number // Distance from bottom to trigger load (in pixels)
  debounceMs?: number // Debounce time for scroll events
  initialLoad?: boolean // Whether to load initial data
}

export class LazyLoader<T> {
  private data: T[] = []
  private loading = false
  private hasMore = true
  private page = 1
  private readonly limit: number
  private readonly fetcher: (
    page: number,
    limit: number
  ) => Promise<PaginatedResult<T>>
  private readonly options: Required<LazyLoadOptions>

  constructor(
    fetcher: (page: number, limit: number) => Promise<PaginatedResult<T>>,
    limit = 20,
    options: LazyLoadOptions = {}
  ) {
    this.fetcher = fetcher
    this.limit = limit
    this.options = {
      threshold: options.threshold || 200,
      debounceMs: options.debounceMs || 100,
      initialLoad: options.initialLoad !== false,
    }

    if (this.options.initialLoad) {
      this.loadMore()
    }
  }

  /**
   * Load more data
   */
  async loadMore(): Promise<void> {
    if (this.loading || !this.hasMore) {
      return
    }

    this.loading = true

    try {
      const result = await this.fetcher(this.page, this.limit)

      this.data = [...this.data, ...result.data]
      this.hasMore = result.pagination.hasNext
      this.page++

      logger.debug('Lazy loader: loaded more data', {
        page: this.page - 1,
        loaded: result.data.length,
        total: this.data.length,
        hasMore: this.hasMore,
      })
    } catch (error) {
      logger.error('Lazy loader: failed to load more data', error instanceof Error ? error : undefined)
      throw error
    } finally {
      this.loading = false
    }
  }

  /**
   * Reset and reload from beginning
   */
  async reset(): Promise<void> {
    this.data = []
    this.page = 1
    this.hasMore = true
    this.loading = false

    if (this.options.initialLoad) {
      await this.loadMore()
    }
  }

  /**
   * Get current data
   */
  getData(): T[] {
    return this.data
  }

  /**
   * Check if loading
   */
  isLoading(): boolean {
    return this.loading
  }

  /**
   * Check if has more data
   */
  getHasMore(): boolean {
    return this.hasMore
  }

  /**
   * Get current page
   */
  getCurrentPage(): number {
    return this.page
  }

  /**
   * Create scroll handler for infinite scrolling
   */
  createScrollHandler(): (event: Event) => void {
    let timeoutId: NodeJS.Timeout | null = null

    return (event: Event) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        const target = event.target as Element
        const scrollTop = target.scrollTop
        const scrollHeight = target.scrollHeight
        const clientHeight = target.clientHeight

        const distanceFromBottom = scrollHeight - scrollTop - clientHeight

        if (
          distanceFromBottom <= this.options.threshold &&
          !this.loading &&
          this.hasMore
        ) {
          this.loadMore().catch(error => {
            logger.error('Lazy loader: scroll handler error', error instanceof Error ? error : undefined)
          })
        }
      }, this.options.debounceMs)
    }
  }
}

// Virtual scrolling for very large datasets
export interface VirtualScrollOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number // Number of items to render outside visible area
}

export class VirtualScroller<T> {
  private readonly itemHeight: number
  private readonly containerHeight: number
  private readonly overscan: number
  private scrollTop = 0

  constructor(options: VirtualScrollOptions) {
    this.itemHeight = options.itemHeight
    this.containerHeight = options.containerHeight
    this.overscan = options.overscan || 5
  }

  /**
   * Calculate visible range of items
   */
  getVisibleRange(totalItems: number): {
    start: number
    end: number
    visibleItems: number
  } {
    const visibleItems = Math.ceil(this.containerHeight / this.itemHeight)
    const start = Math.max(
      0,
      Math.floor(this.scrollTop / this.itemHeight) - this.overscan
    )
    const end = Math.min(totalItems, start + visibleItems + this.overscan * 2)

    return { start, end, visibleItems }
  }

  /**
   * Get items to render based on scroll position
   */
  getItemsToRender<T>(
    items: T[],
    scrollTop: number
  ): {
    items: Array<{ item: T; index: number }>
    totalHeight: number
    offsetY: number
  } {
    this.scrollTop = scrollTop
    const { start, end } = this.getVisibleRange(items.length)

    const visibleItems = items.slice(start, end).map((item, i) => ({
      item,
      index: start + i,
    }))

    return {
      items: visibleItems,
      totalHeight: items.length * this.itemHeight,
      offsetY: start * this.itemHeight,
    }
  }

  /**
   * Update scroll position
   */
  updateScrollTop(scrollTop: number): void {
    this.scrollTop = scrollTop
  }
}

// Search and filter utilities
export interface SearchOptions {
  fields: string[]
  caseSensitive?: boolean
  exactMatch?: boolean
  minLength?: number
}

export class SearchFilter {
  /**
   * Filter items based on search term
   */
  static filter<T>(
    items: T[],
    searchTerm: string,
    options: SearchOptions
  ): T[] {
    if (!searchTerm || searchTerm.length < (options.minLength || 1)) {
      return items
    }

    const term = options.caseSensitive ? searchTerm : searchTerm.toLowerCase()

    return items.filter(item => {
      return options.fields.some(field => {
        const value = this.getNestedValue(item, field)
        if (value == null) return false

        const stringValue = options.caseSensitive
          ? String(value)
          : String(value).toLowerCase()

        return options.exactMatch
          ? stringValue === term
          : stringValue.includes(term)
      })
    })
  }

  /**
   * Get nested object value by dot notation
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  /**
   * Apply multiple filters to items
   */
  static applyFilters<T>(items: T[], filters: Record<string, unknown>): T[] {
    return items.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value == null || value === '') return true

        const itemValue = this.getNestedValue(item, key)

        if (Array.isArray(value)) {
          return value.includes(itemValue)
        }

        if (typeof value === 'object' && value !== null) {
          // Handle range filters
          const range = value as { min?: number; max?: number }
          const numValue = Number(itemValue)

          if (range.min != null && numValue < range.min) return false
          if (range.max != null && numValue > range.max) return false

          return true
        }

        return itemValue === value
      })
    })
  }
}

// Export utility functions
export const paginationUtils = {
  validateParams: PaginationHelper.validateParams,
  calculateOffset: PaginationHelper.calculateOffset,
  createResult: PaginationHelper.createResult,
  createCursorResult: PaginationHelper.createCursorResult,
}
