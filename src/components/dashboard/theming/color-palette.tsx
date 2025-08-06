'use client'

import * as React from 'react'
import { useDashboardTheme } from './theme-provider'
import { DashboardTheme } from '@/types/dashboard'

interface ColorPaletteProps {
  className?: string
  showLabels?: boolean
  interactive?: boolean
  onColorChange?: (colorKey: string, newColor: string) => void
}

interface ColorSwatchProps {
  color: string
  label: string
  interactive?: boolean
  onColorChange?: (newColor: string) => void
  contrastRatio?: number
}

function ColorSwatch({ color, label, interactive = false, onColorChange, contrastRatio }: ColorSwatchProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [tempColor, setTempColor] = React.useState(color)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (interactive) {
      setIsEditing(true)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempColor(e.target.value)
  }

  const handleSubmit = () => {
    if (onColorChange && tempColor !== color) {
      onColorChange(tempColor)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'Escape') {
      setTempColor(color)
      setIsEditing(false)
    }
  }

  const contrastWarning = contrastRatio && contrastRatio < 4.5

  return (
    <div className="flex flex-col items-center space-y-2">
      <div
        className={`
          relative w-16 h-16 rounded-lg border-2 border-gray-200 shadow-sm
          ${interactive ? 'cursor-pointer hover:scale-105 transition-transform' : ''}
          ${contrastWarning ? 'ring-2 ring-red-400' : ''}
        `}
        style={{ backgroundColor: color }}
        onClick={handleClick}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={interactive ? (e) => e.key === 'Enter' && handleClick() : undefined}
        aria-label={`${label} color: ${color}`}
      >
        {isEditing && (
          <input
            ref={inputRef}
            type="color"
            value={tempColor}
            onChange={handleColorChange}
            onBlur={handleSubmit}
            onKeyDown={handleKeyDown}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label={`Edit ${label} color`}
          />
        )}
        {contrastWarning && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">!</span>
          </div>
        )}
      </div>
      <div className="text-center">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
          {color.toUpperCase()}
        </div>
        {contrastRatio && (
          <div className={`text-xs ${contrastWarning ? 'text-red-600' : 'text-green-600'}`}>
            {contrastRatio.toFixed(2)}:1
          </div>
        )}
      </div>
    </div>
  )
}

export function ColorPalette({ 
  className = '', 
  showLabels = true, 
  interactive = false,
  onColorChange 
}: ColorPaletteProps) {
  const { dashboardTheme, setDashboardTheme, getContrastRatio } = useDashboardTheme()

  const handleColorChange = (colorPath: string, newColor: string) => {
    if (!onColorChange) return

    const pathParts = colorPath.split('.')
    const updatedTheme: Partial<DashboardTheme> = { ...dashboardTheme }
    
    // Navigate to the nested property and update it
    let current: any = updatedTheme
    for (let i = 0; i < pathParts.length - 1; i++) {
      if (!current[pathParts[i]]) {
        current[pathParts[i]] = {}
      }
      current = current[pathParts[i]]
    }
    current[pathParts[pathParts.length - 1]] = newColor

    setDashboardTheme(updatedTheme)
    onColorChange(colorPath, newColor)
  }

  const getContrastForColor = (color: string): number => {
    return getContrastRatio(color, dashboardTheme.colors.background)
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Primary Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Primary Colors
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <ColorSwatch
            color={dashboardTheme.colors.primary}
            label="Primary"
            interactive={interactive}
            onColorChange={(color) => handleColorChange('colors.primary', color)}
            contrastRatio={getContrastForColor(dashboardTheme.colors.primary)}
          />
          <ColorSwatch
            color={dashboardTheme.colors.secondary}
            label="Secondary"
            interactive={interactive}
            onColorChange={(color) => handleColorChange('colors.secondary', color)}
            contrastRatio={getContrastForColor(dashboardTheme.colors.secondary)}
          />
          <ColorSwatch
            color={dashboardTheme.colors.accent}
            label="Accent"
            interactive={interactive}
            onColorChange={(color) => handleColorChange('colors.accent', color)}
            contrastRatio={getContrastForColor(dashboardTheme.colors.accent)}
          />
        </div>
      </div>

      {/* Background Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Background Colors
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <ColorSwatch
            color={dashboardTheme.colors.background}
            label="Background"
            interactive={interactive}
            onColorChange={(color) => handleColorChange('colors.background', color)}
          />
          <ColorSwatch
            color={dashboardTheme.colors.surface}
            label="Surface"
            interactive={interactive}
            onColorChange={(color) => handleColorChange('colors.surface', color)}
          />
        </div>
      </div>

      {/* Text Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Text Colors
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <ColorSwatch
            color={dashboardTheme.colors.text.primary}
            label="Primary Text"
            interactive={interactive}
            onColorChange={(color) => handleColorChange('colors.text.primary', color)}
            contrastRatio={getContrastForColor(dashboardTheme.colors.text.primary)}
          />
          <ColorSwatch
            color={dashboardTheme.colors.text.secondary}
            label="Secondary Text"
            interactive={interactive}
            onColorChange={(color) => handleColorChange('colors.text.secondary', color)}
            contrastRatio={getContrastForColor(dashboardTheme.colors.text.secondary)}
          />
          <ColorSwatch
            color={dashboardTheme.colors.text.disabled}
            label="Disabled Text"
            interactive={interactive}
            onColorChange={(color) => handleColorChange('colors.text.disabled', color)}
            contrastRatio={getContrastForColor(dashboardTheme.colors.text.disabled)}
          />
        </div>
      </div>

      {/* Status Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Status Colors
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <ColorSwatch
            color={dashboardTheme.colors.status.success}
            label="Success"
            interactive={interactive}
            onColorChange={(color) => handleColorChange('colors.status.success', color)}
            contrastRatio={getContrastForColor(dashboardTheme.colors.status.success)}
          />
          <ColorSwatch
            color={dashboardTheme.colors.status.warning}
            label="Warning"
            interactive={interactive}
            onColorChange={(color) => handleColorChange('colors.status.warning', color)}
            contrastRatio={getContrastForColor(dashboardTheme.colors.status.warning)}
          />
          <ColorSwatch
            color={dashboardTheme.colors.status.error}
            label="Error"
            interactive={interactive}
            onColorChange={(color) => handleColorChange('colors.status.error', color)}
            contrastRatio={getContrastForColor(dashboardTheme.colors.status.error)}
          />
          <ColorSwatch
            color={dashboardTheme.colors.status.info}
            label="Info"
            interactive={interactive}
            onColorChange={(color) => handleColorChange('colors.status.info', color)}
            contrastRatio={getContrastForColor(dashboardTheme.colors.status.info)}
          />
        </div>
      </div>

      {/* Chart Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Chart Palette
        </h3>
        <div className="grid grid-cols-5 gap-4">
          {dashboardTheme.colors.chart.palette.slice(0, 10).map((color, index) => (
            <ColorSwatch
              key={index}
              color={color}
              label={`Chart ${index + 1}`}
              interactive={interactive}
              onColorChange={(newColor) => {
                const newPalette = [...dashboardTheme.colors.chart.palette]
                newPalette[index] = newColor
                handleColorChange('colors.chart.palette', newPalette as any)
              }}
              contrastRatio={getContrastForColor(color)}
            />
          ))}
        </div>
      </div>

      {/* Accessibility Information */}
      {showLabels && (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-md font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Accessibility Information
          </h4>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>• Colors with contrast ratios ≥4.5:1 meet WCAG AA standards</p>
            <p>• Colors with contrast ratios ≥7:1 meet WCAG AAA standards</p>
            <p>• Red warning indicators show colors that don't meet AA standards</p>
            {interactive && (
              <p>• Click on any color swatch to edit it</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ColorPalette