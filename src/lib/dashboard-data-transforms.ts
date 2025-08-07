/**
 * Data transformation utilities for backward compatibility with existing chart data formats
 * Converts legacy analytics data to new modular dashboard component format
 */

import { AnalyticsData } from '@/services/analytics'
import { ChartData, ChartDataset, ChartDataPoint } from '@/types/dashboard'

export interface LegacyChartData {
  // Legacy format from existing analytics components
  [key: string]: any
}

/**
 * Transform analytics data to chart data format for new ChartWrapper components
 */
export class DashboardDataTransforms {
  /**
   * Transform daily task trends data for area chart
   */
  static transformDailyTaskTrends(
    data: AnalyticsData['dailyTaskTrends']
  ): ChartData {
    return {
      datasets: [
        {
          label: 'Completed Tasks',
          data: data.map(item => ({
            x: item.date,
            y: item.completed,
            label: new Date(item.date).toLocaleDateString(),
            metadata: { type: 'completed' },
          })),
          type: 'area',
        },
        {
          label: 'Failed Tasks',
          data: data.map(item => ({
            x: item.date,
            y: item.failed,
            label: new Date(item.date).toLocaleDateString(),
            metadata: { type: 'failed' },
          })),
          type: 'area',
        },
      ],
      labels: data.map(item => new Date(item.date).toLocaleDateString()),
      metadata: { chartType: 'area', stacked: true },
    }
  }

  /**
   * Transform task status data for pie chart
   */
  static transformTasksByStatus(
    data: AnalyticsData['tasksByStatus']
  ): ChartData {
    return {
      datasets: [
        {
          label: 'Task Status Distribution',
          data: data.map(item => ({
            label: item.status,
            value: item.count,
            metadata: { status: item.status },
          })),
        },
      ],
      labels: data.map(item => item.status),
      metadata: { chartType: 'pie' },
    }
  }
  /**
   * Transform task priority data for bar chart
   */
  static transformTasksByPriority(
    data: AnalyticsData['tasksByPriority']
  ): ChartData {
    return {
      datasets: [
        {
          label: 'Task Priority Distribution',
          data: data.map(item => ({
            x: item.priority,
            y: item.count,
            label: item.priority,
            metadata: { priority: item.priority },
          })),
        },
      ],
      labels: data.map(item => item.priority),
      metadata: { chartType: 'bar' },
    }
  }

  /**
   * Transform platform distribution data for horizontal bar chart
   */
  static transformPlatformDistribution(
    data: AnalyticsData['platformDistribution']
  ): ChartData {
    return {
      datasets: [
        {
          label: 'Platform Distribution',
          data: data.map(item => ({
            x: item.platform,
            y: item.count,
            label: item.platform,
            metadata: { platform: item.platform },
          })),
        },
      ],
      labels: data.map(item => item.platform),
      metadata: { chartType: 'bar', orientation: 'horizontal' },
    }
  }

  /**
   * Transform error patterns data for bar chart
   */
  static transformErrorPatterns(
    data: AnalyticsData['errorPatterns']
  ): ChartData {
    return {
      datasets: [
        {
          label: 'Error Patterns',
          data: data.map(item => ({
            x:
              item.error.substring(0, 30) +
              (item.error.length > 30 ? '...' : ''),
            y: item.count,
            label: item.error,
            metadata: { fullError: item.error },
          })),
        },
      ],
      labels: data.map(
        item =>
          item.error.substring(0, 30) + (item.error.length > 30 ? '...' : '')
      ),
      metadata: { chartType: 'bar' },
    }
  }

  /**
   * Transform legacy Recharts data format to new format
   */
  static transformLegacyRechartsData(
    legacyData: LegacyChartData[],
    chartType: string
  ): ChartData {
    if (!Array.isArray(legacyData) || legacyData.length === 0) {
      return { datasets: [], labels: [], metadata: { chartType } }
    }

    const firstItem = legacyData[0]
    const keys = Object.keys(firstItem).filter(
      key => typeof firstItem[key] === 'number'
    )

    return {
      datasets: keys.map(key => ({
        label: key.charAt(0).toUpperCase() + key.slice(1),
        data: legacyData.map((item, index) => ({
          x: item.name || item.label || index.toString(),
          y: item[key],
          label: item.name || item.label || index.toString(),
          metadata: { originalData: item },
        })),
      })),
      labels: legacyData.map(item => item.name || item.label || ''),
      metadata: { chartType, legacy: true },
    }
  }
}
