import React from 'react'
import type { ChartConfiguration } from '@/types/dashboard'

/**
 * Predefined chart themes
 */
export const CHART_THEMES = {
  default: {
    colors: {
      primary: '#3F51B5',
      secondary: '#B19ADA',
      accent: '#FF6B35',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    palette: [
      '#3F51B5', // Primary
      '#B19ADA', // Secondary
      '#FF6B35', // Accent
      '#10B981', // Success
      '#F59E0B', // Warning
      '#EF4444', // Error
      '#3B82F6', // Info
      '#8B5CF6', // Purple
    ],
  },
  dark: {
    colors: {
      primary: '#6366F1',
      secondary: '#C084FC',
      accent: '#FB7185',
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
    },
    palette: [
      '#6366F1', // Primary
      '#C084FC', // Secondary
      '#FB7185', // Accent
      '#34D399', // Success
      '#FBBF24', // Warning
      '#F87171', // Error
      '#60A5FA', // Info
      '#A78BFA', // Purple
    ],
  },
  minimal: {
    colors: {
      primary: '#374151',
      secondary: '#6B7280',
      accent: '#9CA3AF',
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
    },
    palette: [
      '#374151', // Dark gray
      '#6B7280', // Medium gray
      '#9CA3AF', // Light gray
      '#059669', // Green
      '#D97706', // Orange
      '#DC2626', // Red
      '#0891B2', // Cyan
      '#7C3AED', // Purple
    ],
  },
  vibrant: {
    colors: {
      primary: '#EC4899',
      secondary: '#8B5CF6',
      accent: '#06B6D4',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    palette: [
      '#EC4899', // Pink
      '#8B5CF6', // Purple
      '#06B6D4', // Cyan
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#EF4444', // Red
      '#3B82F6', // Blue
      '#F97316', // Orange
    ],
  },
} as const

export type ChartTheme = keyof typeof CHART_THEMES

/**
 * Chart configuration presets for different chart types
 */
export const CHART_PRESETS = {
  line: {
    legend: {
      show: true,
      position: 'bottom' as const,
      align: 'center' as const,
    },
    tooltip: {
      show: true,
    },
    axes: {
      x: { show: true },
      y: { show: true },
    },
    animations: {
      enabled: true,
      duration: 300,
      easing: 'ease-out',
    },
  },
  bar: {
    legend: {
      show: true,
      position: 'bottom' as const,
      align: 'center' as const,
    },
    tooltip: {
      show: true,
    },
    axes: {
      x: { show: true },
      y: { show: true },
    },
    animations: {
      enabled: true,
      duration: 400,
      easing: 'ease-out',
    },
  },
  pie: {
    legend: {
      show: true,
      position: 'right' as const,
      align: 'center' as const,
    },
    tooltip: {
      show: true,
    },
    animations: {
      enabled: true,
      duration: 500,
      easing: 'ease-out',
    },
  },
  heatmap: {
    legend: {
      show: true,
      position: 'bottom' as const,
      align: 'center' as const,
    },
    tooltip: {
      show: true,
    },
    animations: {
      enabled: false,
      duration: 0,
      easing: 'linear',
    },
  },
} as const

/**
 * Chart configuration builder class
 */
export class ChartConfigBuilder {
  private config: Partial<ChartConfiguration> = {}

  constructor(baseConfig?: Partial<ChartConfiguration>) {
    if (baseConfig) {
      this.config = { ...baseConfig }
    }
  }

  /**
   * Apply a theme to the chart configuration
   */
  withTheme(theme: ChartTheme): ChartConfigBuilder {
    const themeConfig = CHART_THEMES[theme]
    this.config.colors = {
      ...this.config.colors,
      ...themeConfig.colors,
    }
    return this
  }

  /**
   * Apply a preset configuration for a chart type
   */
  withPreset(chartType: keyof typeof CHART_PRESETS): ChartConfigBuilder {
    const preset = CHART_PRESETS[chartType]
    this.config = {
      ...this.config,
      ...preset,
      colors: this.config.colors, // Preserve colors
    }
    return this
  }

  /**
   * Set custom colors
   */
  withColors(colors: Partial<ChartConfiguration['colors']>): ChartConfigBuilder {
    this.config.colors = {
      ...this.config.colors,
      ...colors,
    }
    return this
  }

  /**
   * Configure legend settings
   */
  withLegend(legend: Partial<ChartConfiguration['legend']>): ChartConfigBuilder {
    this.config.legend = {
      ...this.config.legend,
      ...legend,
    }
    return this
  }

  /**
   * Configure tooltip settings
   */
  withTooltip(tooltip: Partial<ChartConfiguration['tooltip']>): ChartConfigBuilder {
    this.config.tooltip = {
      ...this.config.tooltip,
      ...tooltip,
    }
    return this
  }

  /**
   * Configure axes settings
   */
  withAxes(axes: Partial<ChartConfiguration['axes']>): ChartConfigBuilder {
    this.config.axes = {
      ...this.config.axes,
      ...axes,
    }
    return this
  }

  /**
   * Configure animation settings
   */
  withAnimations(animations: Partial<ChartConfiguration['animations']>): ChartConfigBuilder {
    this.config.animations = {
      ...this.config.animations,
      ...animations,
    }
    return this
  }

  /**
   * Set responsive breakpoint configurations
   */
  withResponsive(responsive: ChartConfiguration['responsive']): ChartConfigBuilder {
    this.config.responsive = responsive
    return this
  }

  /**
   * Build the final configuration
   */
  build(): ChartConfiguration {
    // Ensure all required properties have defaults
    return {
      colors: {
        primary: '#3F51B5',
        secondary: '#B19ADA',
        accent: '#FF6B35',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        ...this.config.colors,
      },
      legend: {
        show: true,
        position: 'bottom',
        align: 'center',
        ...this.config.legend,
      },
      tooltip: {
        show: true,
        ...this.config.tooltip,
      },
      axes: {
        x: { show: true, ...this.config.axes?.x },
        y: { show: true, ...this.config.axes?.y },
      },
      animations: {
        enabled: true,
        duration: 300,
        easing: 'ease-out',
        ...this.config.animations,
      },
      responsive: this.config.responsive,
    }
  }
}

/**
 * Utility functions for chart configuration
 */
export const ChartConfigUtils = {
  /**
   * Create a configuration builder
   */
  builder: (baseConfig?: Partial<ChartConfiguration>) => 
    new ChartConfigBuilder(baseConfig),

  /**
   * Get theme colors as an array for chart palettes
   */
  getThemePalette: (theme: ChartTheme): string[] => 
    CHART_THEMES[theme].palette,

  /**
   * Create a quick configuration for a chart type with theme
   */
  quickConfig: (
    chartType: keyof typeof CHART_PRESETS,
    theme: ChartTheme = 'default'
  ): ChartConfiguration => 
    new ChartConfigBuilder()
      .withTheme(theme)
      .withPreset(chartType)
      .build(),

  /**
   * Merge multiple configurations
   */
  merge: (...configs: Partial<ChartConfiguration>[]): ChartConfiguration => {
    const builder = new ChartConfigBuilder()
    configs.forEach(config => {
      if (config.colors) builder.withColors(config.colors)
      if (config.legend) builder.withLegend(config.legend)
      if (config.tooltip) builder.withTooltip(config.tooltip)
      if (config.axes) builder.withAxes(config.axes)
      if (config.animations) builder.withAnimations(config.animations)
      if (config.responsive) builder.withResponsive(config.responsive)
    })
    return builder.build()
  },

  /**
   * Validate configuration
   */
  validate: (config: ChartConfiguration): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (!config.colors) {
      errors.push('Colors configuration is required')
    }

    if (!config.legend) {
      errors.push('Legend configuration is required')
    }

    if (!config.tooltip) {
      errors.push('Tooltip configuration is required')
    }

    if (!config.axes) {
      errors.push('Axes configuration is required')
    }

    if (!config.animations) {
      errors.push('Animations configuration is required')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  },
}

/**
 * React hook for chart configuration
 */
export function useChartConfig(
  initialConfig?: Partial<ChartConfiguration>
): {
  config: ChartConfiguration
  updateConfig: (updates: Partial<ChartConfiguration>) => void
  resetConfig: () => void
  applyTheme: (theme: ChartTheme) => void
  applyPreset: (chartType: keyof typeof CHART_PRESETS) => void
} {
  const [config, setConfig] = React.useState<ChartConfiguration>(() => 
    ChartConfigUtils.builder(initialConfig).build()
  )

  const updateConfig = React.useCallback((updates: Partial<ChartConfiguration>) => {
    setConfig(current => ChartConfigUtils.merge(current, updates))
  }, [])

  const resetConfig = React.useCallback(() => {
    setConfig(ChartConfigUtils.builder(initialConfig).build())
  }, [initialConfig])

  const applyTheme = React.useCallback((theme: ChartTheme) => {
    setConfig(current => 
      ChartConfigUtils.builder(current).withTheme(theme).build()
    )
  }, [])

  const applyPreset = React.useCallback((chartType: keyof typeof CHART_PRESETS) => {
    setConfig(current => 
      ChartConfigUtils.builder(current).withPreset(chartType).build()
    )
  }, [])

  return {
    config,
    updateConfig,
    resetConfig,
    applyTheme,
    applyPreset,
  }
}