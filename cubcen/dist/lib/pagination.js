"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationUtils = exports.SearchFilter = exports.VirtualScroller = exports.LazyLoader = exports.PaginationHelper = void 0;
const logger_1 = require("./logger");
class PaginationHelper {
    static validateParams(params) {
        const page = Math.max(1, params.page || 1);
        const limit = Math.min(Math.max(1, params.limit || 20), 100);
        return {
            page,
            limit,
            sortBy: params.sortBy,
            sortOrder: params.sortOrder || 'desc',
            search: params.search,
            filters: params.filters,
        };
    }
    static calculateOffset(page, limit) {
        return (page - 1) * limit;
    }
    static createResult(data, total, params) {
        const totalPages = Math.ceil(total / params.limit);
        const hasNext = params.page < totalPages;
        const hasPrev = params.page > 1;
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
        };
    }
    static createCursorResult(data, params, getCursor) {
        const hasNext = data.length === params.limit;
        const hasPrev = !!params.cursor;
        let nextCursor;
        let prevCursor;
        if (hasNext && data.length > 0) {
            nextCursor = getCursor(data[data.length - 1]);
        }
        if (hasPrev && data.length > 0) {
            prevCursor = getCursor(data[0]);
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
        };
    }
}
exports.PaginationHelper = PaginationHelper;
class LazyLoader {
    constructor(fetcher, limit = 20, options = {}) {
        this.data = [];
        this.loading = false;
        this.hasMore = true;
        this.page = 1;
        this.fetcher = fetcher;
        this.limit = limit;
        this.options = {
            threshold: options.threshold || 200,
            debounceMs: options.debounceMs || 100,
            initialLoad: options.initialLoad !== false,
        };
        if (this.options.initialLoad) {
            this.loadMore();
        }
    }
    async loadMore() {
        if (this.loading || !this.hasMore) {
            return;
        }
        this.loading = true;
        try {
            const result = await this.fetcher(this.page, this.limit);
            this.data = [...this.data, ...result.data];
            this.hasMore = result.pagination.hasNext;
            this.page++;
            logger_1.logger.debug('Lazy loader: loaded more data', {
                page: this.page - 1,
                loaded: result.data.length,
                total: this.data.length,
                hasMore: this.hasMore,
            });
        }
        catch (error) {
            logger_1.logger.error('Lazy loader: failed to load more data', error);
            throw error;
        }
        finally {
            this.loading = false;
        }
    }
    async reset() {
        this.data = [];
        this.page = 1;
        this.hasMore = true;
        this.loading = false;
        if (this.options.initialLoad) {
            await this.loadMore();
        }
    }
    getData() {
        return this.data;
    }
    isLoading() {
        return this.loading;
    }
    getHasMore() {
        return this.hasMore;
    }
    getCurrentPage() {
        return this.page;
    }
    createScrollHandler() {
        let timeoutId = null;
        return (event) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                const target = event.target;
                const scrollTop = target.scrollTop;
                const scrollHeight = target.scrollHeight;
                const clientHeight = target.clientHeight;
                const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
                if (distanceFromBottom <= this.options.threshold && !this.loading && this.hasMore) {
                    this.loadMore().catch(error => {
                        logger_1.logger.error('Lazy loader: scroll handler error', error);
                    });
                }
            }, this.options.debounceMs);
        };
    }
}
exports.LazyLoader = LazyLoader;
class VirtualScroller {
    constructor(options) {
        this.scrollTop = 0;
        this.itemHeight = options.itemHeight;
        this.containerHeight = options.containerHeight;
        this.overscan = options.overscan || 5;
    }
    getVisibleRange(totalItems) {
        const visibleItems = Math.ceil(this.containerHeight / this.itemHeight);
        const start = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - this.overscan);
        const end = Math.min(totalItems, start + visibleItems + this.overscan * 2);
        return { start, end, visibleItems };
    }
    getItemsToRender(items, scrollTop) {
        this.scrollTop = scrollTop;
        const { start, end } = this.getVisibleRange(items.length);
        const visibleItems = items.slice(start, end).map((item, i) => ({
            item,
            index: start + i,
        }));
        return {
            items: visibleItems,
            totalHeight: items.length * this.itemHeight,
            offsetY: start * this.itemHeight,
        };
    }
    updateScrollTop(scrollTop) {
        this.scrollTop = scrollTop;
    }
}
exports.VirtualScroller = VirtualScroller;
class SearchFilter {
    static filter(items, searchTerm, options) {
        if (!searchTerm || searchTerm.length < (options.minLength || 1)) {
            return items;
        }
        const term = options.caseSensitive ? searchTerm : searchTerm.toLowerCase();
        return items.filter(item => {
            return options.fields.some(field => {
                const value = this.getNestedValue(item, field);
                if (value == null)
                    return false;
                const stringValue = options.caseSensitive
                    ? String(value)
                    : String(value).toLowerCase();
                return options.exactMatch
                    ? stringValue === term
                    : stringValue.includes(term);
            });
        });
    }
    static getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    static applyFilters(items, filters) {
        return items.filter(item => {
            return Object.entries(filters).every(([key, value]) => {
                if (value == null || value === '')
                    return true;
                const itemValue = this.getNestedValue(item, key);
                if (Array.isArray(value)) {
                    return value.includes(itemValue);
                }
                if (typeof value === 'object' && value !== null) {
                    const range = value;
                    const numValue = Number(itemValue);
                    if (range.min != null && numValue < range.min)
                        return false;
                    if (range.max != null && numValue > range.max)
                        return false;
                    return true;
                }
                return itemValue === value;
            });
        });
    }
}
exports.SearchFilter = SearchFilter;
exports.paginationUtils = {
    validateParams: PaginationHelper.validateParams,
    calculateOffset: PaginationHelper.calculateOffset,
    createResult: PaginationHelper.createResult,
    createCursorResult: PaginationHelper.createCursorResult,
};
//# sourceMappingURL=pagination.js.map