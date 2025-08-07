'use client'

import * as React from 'react'
import { useDashboardTheme } from './theme-provider'
import { ColorPalette } from './color-palette'
import { TypographyScale } from './typography-scale'
import { ContrastValidator } from './contrast-validator'
import { DashboardTheme } from '@/types/dashboard'

interface ThemeCustomizerProps {
  className?: string
  defaultTab?: 'colors' | 'typography' | 'validation'
  onThemeChange?: (theme: Partial<DashboardTheme>) => void
  onExport?: (theme: DashboardTheme) => void
  onImport?: (theme: Partial<DashboardTheme>) => void
}

interface TabProps {
  id: string
  label: string
  icon: React.ReactNode
  content: React.ReactNode
}

export function ThemeCustomizer({
  className = '',
  defaultTab = 'colors',
  onThemeChange,
  onExport,
  onImport,
}: ThemeCustomizerProps) {
  const { theme, setTheme, dashboardTheme, setDashboardTheme } =
    useDashboardTheme()
  const [activeTab, setActiveTab] = React.useState<string>(defaultTab)
  const [validationResults, setValidationResults] = React.useState<any[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleThemeChange = React.useCallback(
    (newTheme: Partial<DashboardTheme>) => {
      setDashboardTheme(newTheme)
      if (onThemeChange) {
        onThemeChange(newTheme)
      }
    },
    [setDashboardTheme, onThemeChange]
  )

  const handleExportTheme = () => {
    const themeData = {
      ...dashboardTheme,
      metadata: {
        name: 'Custom Dashboard Theme',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        description: 'Exported from Dashboard Theme Customizer',
      },
    }

    const blob = new Blob([JSON.stringify(themeData, null, 2)], {
      type: 'application/json',
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dashboard-theme.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    if (onExport) {
      onExport(dashboardTheme)
    }
  }

  const handleImportTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = e => {
      try {
        const importedTheme = JSON.parse(e.target?.result as string)

        // Validate that it's a valid theme object
        if (importedTheme.colors && importedTheme.typography) {
          setDashboardTheme(importedTheme)
          if (onImport) {
            onImport(importedTheme)
          }
        } else {
          alert('Invalid theme file format')
        }
      } catch (error) {
        alert('Error parsing theme file')
      }
    }
    reader.readAsText(file)
  }

  const resetToDefaults = () => {
    if (
      confirm(
        'Are you sure you want to reset all theme customizations? This cannot be undone.'
      )
    ) {
      // Reset to default theme by reloading
      window.location.reload()
    }
  }

  const tabs: TabProps[] = [
    {
      id: 'colors',
      label: 'Colors',
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
          />
        </svg>
      ),
      content: (
        <ColorPalette
          interactive={true}
          onColorChange={(colorPath, newColor) => {
            console.log(`Color changed: ${colorPath} = ${newColor}`)
          }}
        />
      ),
    },
    {
      id: 'typography',
      label: 'Typography',
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      content: (
        <TypographyScale
          interactive={true}
          onTypographyChange={(key, value) => {
            console.log(`Typography changed: ${key} = ${value}`)
          }}
        />
      ),
    },
    {
      id: 'validation',
      label: 'Validation',
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      content: (
        <ContrastValidator onValidationComplete={setValidationResults} />
      ),
    },
  ]

  const failedValidations = validationResults.filter(
    result => !result.isValid
  ).length
  const hasValidationIssues = failedValidations > 0

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Theme Customizer
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Customize colors, typography, and validate accessibility
              compliance
            </p>
          </div>

          {/* Theme Mode Toggle */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              Theme:
            </label>
            <select
              value={theme}
              onChange={e =>
                setTheme(e.target.value as 'light' | 'dark' | 'system')
              }
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 mt-4">
          <button
            onClick={handleExportTheme}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Export Theme
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
          >
            Import Theme
          </button>

          <button
            onClick={resetToDefaults}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
          >
            Reset to Defaults
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportTheme}
            className="hidden"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.id === 'validation' && hasValidationIssues && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  {failedValidations}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span>Current Theme: {theme}</span>
            {validationResults.length > 0 && (
              <span>
                Accessibility: {validationResults.length - failedValidations}/
                {validationResults.length} passed
              </span>
            )}
          </div>
          <div className="text-xs">Changes are applied automatically</div>
        </div>
      </div>
    </div>
  )
}

export default ThemeCustomizer
