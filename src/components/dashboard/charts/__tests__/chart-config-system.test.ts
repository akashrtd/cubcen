import { renderHook, act } from '@testing-library/react'
import {
  ChartConfigBuilder,
  ChartConfigUtils,
  useChartConfig,
  CHART_THEMES,
  CHART_PRESETS,
} from '../chart-config-system'

describe('ChartConfigBuilder', () => {
  it('creates a builder with default configuration', () => {
    const builder = new ChartConfigBuilder()
    const config = builder.build()

    expect(config.colors.primary).toBe('#3F51B5')
    expect(config.legend.show).toBe(true)
    expect(config.tooltip.show).toBe(true)
    expect(config.animations.enabled).toBe(true)
  })

  it('creates a builder with base configuration', () => {
    const baseConfig = {
      colors: { primary: '#FF0000' },
      legend: { show: false },
    }

    const builder = new ChartConfigBuilder(baseConfig)
    const config = builder.build()

    expect(config.colors.primary).toBe('#FF0000')
    expect(config.legend.show).toBe(false)
  })

  it('applies theme correctly', () => {
    const builder = new ChartConfigBuilder()
    const config = builder.withTheme('dark').build()

    expect(config.colors.primary).toBe(CHART_THEMES.dark.colors.primary)
    expect(config.colors.secondary).toBe(CHART_THEMES.dark.colors.secondary)
  })

  it('applies preset correctly', () => {
    const builder = new ChartConfigBuilder()
    const config = builder.withPreset('pie').build()

    expect(config.legend.position).toBe('right')
    expect(config.animations.duration).toBe(500)
  })

  it('chains configuration methods', () => {
    const builder = new ChartConfigBuilder()
    const config = builder
      .withTheme('vibrant')
      .withPreset('bar')
      .withColors({ primary: '#CUSTOM' })
      .withLegend({ show: false })
      .withTooltip({ show: false })
      .withAxes({ x: { show: false } })
      .withAnimations({ enabled: false })
      .build()

    expect(config.colors.primary).toBe('#CUSTOM')
    expect(config.legend.show).toBe(false)
    expect(config.tooltip.show).toBe(false)
    expect(config.axes.x.show).toBe(false)
    expect(config.animations.enabled).toBe(false)
  })

  it('preserves colors when applying preset', () => {
    const builder = new ChartConfigBuilder()
    const config = builder
      .withTheme('dark')
      .withPreset('line')
      .build()

    expect(config.colors.primary).toBe(CHART_THEMES.dark.colors.primary)
    expect(config.legend.position).toBe('bottom') // From preset
  })
})

describe('ChartConfigUtils', () => {
  it('creates a builder', () => {
    const builder = ChartConfigUtils.builder()
    expect(builder).toBeInstanceOf(ChartConfigBuilder)
  })

  it('gets theme palette', () => {
    const palette = ChartConfigUtils.getThemePalette('vibrant')
    expect(palette).toEqual(CHART_THEMES.vibrant.palette)
  })

  it('creates quick configuration', () => {
    const config = ChartConfigUtils.quickConfig('pie', 'minimal')
    
    expect(config.colors.primary).toBe(CHART_THEMES.minimal.colors.primary)
    expect(config.legend.position).toBe('right') // From pie preset
    expect(config.animations.duration).toBe(500) // From pie preset
  })

  it('merges multiple configurations', () => {
    const config1 = { colors: { primary: '#FF0000' } }
    const config2 = { legend: { show: false } }
    const config3 = { tooltip: { show: false } }

    const merged = ChartConfigUtils.merge(config1, config2, config3)

    expect(merged.colors.primary).toBe('#FF0000')
    expect(merged.legend.show).toBe(false)
    expect(merged.tooltip.show).toBe(false)
  })

  it('validates configuration', () => {
    const validConfig = ChartConfigUtils.quickConfig('line')
    const validation = ChartConfigUtils.validate(validConfig)

    expect(validation.valid).toBe(true)
    expect(validation.errors).toHaveLength(0)
  })

  it('validates incomplete configuration', () => {
    const incompleteConfig = {} as any
    const validation = ChartConfigUtils.validate(incompleteConfig)

    expect(validation.valid).toBe(false)
    expect(validation.errors.length).toBeGreaterThan(0)
    expect(validation.errors).toContain('Colors configuration is required')
  })
})

describe('useChartConfig', () => {
  it('initializes with default configuration', () => {
    const { result } = renderHook(() => useChartConfig())

    expect(result.current.config.colors.primary).toBe('#3F51B5')
    expect(result.current.config.legend.show).toBe(true)
  })

  it('initializes with custom configuration', () => {
    const initialConfig = {
      colors: { primary: '#FF0000' },
      legend: { show: false },
    }

    const { result } = renderHook(() => useChartConfig(initialConfig))

    expect(result.current.config.colors.primary).toBe('#FF0000')
    expect(result.current.config.legend.show).toBe(false)
  })

  it('updates configuration', () => {
    const { result } = renderHook(() => useChartConfig())

    act(() => {
      result.current.updateConfig({
        colors: { primary: '#00FF00' },
        legend: { show: false },
      })
    })

    expect(result.current.config.colors.primary).toBe('#00FF00')
    expect(result.current.config.legend.show).toBe(false)
  })

  it('resets configuration', () => {
    const initialConfig = {
      colors: { primary: '#FF0000' },
    }

    const { result } = renderHook(() => useChartConfig(initialConfig))

    act(() => {
      result.current.updateConfig({
        colors: { primary: '#00FF00' },
      })
    })

    expect(result.current.config.colors.primary).toBe('#00FF00')

    act(() => {
      result.current.resetConfig()
    })

    expect(result.current.config.colors.primary).toBe('#FF0000')
  })

  it('applies theme', () => {
    const { result } = renderHook(() => useChartConfig())

    act(() => {
      result.current.applyTheme('dark')
    })

    expect(result.current.config.colors.primary).toBe(CHART_THEMES.dark.colors.primary)
  })

  it('applies preset', () => {
    const { result } = renderHook(() => useChartConfig())

    act(() => {
      result.current.applyPreset('pie')
    })

    expect(result.current.config.legend.position).toBe('right')
    expect(result.current.config.animations.duration).toBe(500)
  })

  it('preserves custom colors when applying preset', () => {
    const { result } = renderHook(() => useChartConfig())

    act(() => {
      result.current.updateConfig({
        colors: { primary: '#CUSTOM' },
      })
    })

    act(() => {
      result.current.applyPreset('bar')
    })

    expect(result.current.config.colors.primary).toBe('#CUSTOM')
    expect(result.current.config.animations.duration).toBe(400) // From bar preset
  })
})

describe('CHART_THEMES', () => {
  it('contains all required themes', () => {
    expect(CHART_THEMES.default).toBeDefined()
    expect(CHART_THEMES.dark).toBeDefined()
    expect(CHART_THEMES.minimal).toBeDefined()
    expect(CHART_THEMES.vibrant).toBeDefined()
  })

  it('has consistent structure for all themes', () => {
    Object.values(CHART_THEMES).forEach(theme => {
      expect(theme.colors).toBeDefined()
      expect(theme.palette).toBeDefined()
      expect(Array.isArray(theme.palette)).toBe(true)
      expect(theme.palette.length).toBeGreaterThan(0)
    })
  })
})

describe('CHART_PRESETS', () => {
  it('contains all required presets', () => {
    expect(CHART_PRESETS.line).toBeDefined()
    expect(CHART_PRESETS.bar).toBeDefined()
    expect(CHART_PRESETS.pie).toBeDefined()
    expect(CHART_PRESETS.heatmap).toBeDefined()
  })

  it('has consistent structure for all presets', () => {
    Object.values(CHART_PRESETS).forEach(preset => {
      expect(preset.legend).toBeDefined()
      expect(preset.animations).toBeDefined()
      expect(typeof preset.legend.show).toBe('boolean')
      expect(typeof preset.animations.enabled).toBe('boolean')
    })
  })

  it('has different configurations for different chart types', () => {
    expect(CHART_PRESETS.pie.legend.position).toBe('right')
    expect(CHART_PRESETS.line.legend.position).toBe('bottom')
    expect(CHART_PRESETS.heatmap.animations.enabled).toBe(false)
    expect(CHART_PRESETS.bar.animations.enabled).toBe(true)
  })
})