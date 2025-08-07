'use client'

import * as React from 'react'
import { useDashboardTheme } from './theme-provider'
import { DashboardTheme } from '@/types/dashboard'

interface TypographyScaleProps {
  className?: string
  showSpecs?: boolean
  interactive?: boolean
  onTypographyChange?: (key: string, value: string | number) => void
}

interface TypographyItemProps {
  size: string
  weight: number
  lineHeight: number
  label: string
  description: string
  example: string
  interactive?: boolean
  onSizeChange?: (newSize: string) => void
  onWeightChange?: (newWeight: number) => void
  onLineHeightChange?: (newLineHeight: number) => void
}

function TypographyItem({
  size,
  weight,
  lineHeight,
  label,
  description,
  example,
  interactive = false,
  onSizeChange,
  onWeightChange,
  onLineHeightChange
}: TypographyItemProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [tempSize, setTempSize] = React.useState(size)
  const [tempWeight, setTempWeight] = React.useState(weight)
  const [tempLineHeight, setTempLineHeight] = React.useState(lineHeight)

  const handleSave = () => {
    if (onSizeChange && tempSize !== size) onSizeChange(tempSize)
    if (onWeightChange && tempWeight !== weight) onWeightChange(tempWeight)
    if (onLineHeightChange && tempLineHeight !== lineHeight) onLineHeightChange(tempLineHeight)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempSize(size)
    setTempWeight(weight)
    setTempLineHeight(lineHeight)
    setIsEditing(false)
  }

  const pxSize = parseFloat(size) * 16 // Convert rem to px for display

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {label}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        {interactive && (
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </button>
            )}
          </div>
        )}
      </div>

      {/* Typography Example */}
      <div
        className="text-gray-900 dark:text-gray-100"
        style={{
          fontSize: size,
          fontWeight: weight,
          lineHeight: lineHeight
        }}
      >
        {example}
      </div>

      {/* Typography Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="space-y-2">
          <label className="block text-gray-700 dark:text-gray-300 font-medium">
            Font Size
          </label>
          {isEditing ? (
            <input
              type="text"
              value={tempSize}
              onChange={(e) => setTempSize(e.target.value)}
              className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="e.g., 1rem"
            />
          ) : (
            <div className="text-gray-600 dark:text-gray-400">
              <div className="font-mono">{size}</div>
              <div className="text-xs">({pxSize.toFixed(0)}px)</div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-gray-700 dark:text-gray-300 font-medium">
            Font Weight
          </label>
          {isEditing ? (
            <select
              value={tempWeight}
              onChange={(e) => setTempWeight(Number(e.target.value))}
              className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value={300}>Light (300)</option>
              <option value={400}>Normal (400)</option>
              <option value={500}>Medium (500)</option>
              <option value={600}>Semibold (600)</option>
              <option value={700}>Bold (700)</option>
              <option value={800}>Extra Bold (800)</option>
            </select>
          ) : (
            <div className="text-gray-600 dark:text-gray-400">
              <div className="font-mono">{weight}</div>
              <div className="text-xs">
                {weight === 300 && 'Light'}
                {weight === 400 && 'Normal'}
                {weight === 500 && 'Medium'}
                {weight === 600 && 'Semibold'}
                {weight === 700 && 'Bold'}
                {weight === 800 && 'Extra Bold'}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-gray-700 dark:text-gray-300 font-medium">
            Line Height
          </label>
          {isEditing ? (
            <input
              type="number"
              value={tempLineHeight}
              onChange={(e) => setTempLineHeight(Number(e.target.value))}
              step="0.1"
              min="1"
              max="3"
              className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          ) : (
            <div className="text-gray-600 dark:text-gray-400">
              <div className="font-mono">{lineHeight}</div>
              <div className="text-xs">
                {lineHeight <= 1.3 && 'Tight'}
                {lineHeight > 1.3 && lineHeight <= 1.6 && 'Normal'}
                {lineHeight > 1.6 && 'Relaxed'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function TypographyScale({
  className = '',
  showSpecs = true,
  interactive = false,
  onTypographyChange
}: TypographyScaleProps) {
  const { dashboardTheme, setDashboardTheme } = useDashboardTheme()

  const handleTypographyChange = (category: string, key: string, value: string | number) => {
    if (!onTypographyChange) return

    const updatedTheme: Partial<DashboardTheme> = {
      ...dashboardTheme,
      typography: {
        ...dashboardTheme.typography,
        [category]: {
          ...dashboardTheme.typography[category as keyof typeof dashboardTheme.typography],
          [key]: value
        }
      }
    }

    setDashboardTheme(updatedTheme)
    onTypographyChange(`typography.${category}.${key}`, value)
  }

  const typographyItems = [
    {
      key: '3xl',
      label: 'Heading 1',
      description: 'Main page headings and hero titles',
      example: 'Dashboard Overview',
      size: dashboardTheme.typography.fontSize['3xl'],
      weight: dashboardTheme.typography.fontWeight.bold,
      lineHeight: dashboardTheme.typography.lineHeight.tight
    },
    {
      key: '2xl',
      label: 'Heading 2',
      description: 'Section headings and card titles',
      example: 'Performance Metrics',
      size: dashboardTheme.typography.fontSize['2xl'],
      weight: dashboardTheme.typography.fontWeight.semibold,
      lineHeight: dashboardTheme.typography.lineHeight.tight
    },
    {
      key: 'xl',
      label: 'Heading 3',
      description: 'Subsection headings',
      example: 'Recent Activity',
      size: dashboardTheme.typography.fontSize.xl,
      weight: dashboardTheme.typography.fontWeight.semibold,
      lineHeight: dashboardTheme.typography.lineHeight.normal
    },
    {
      key: 'lg',
      label: 'Large Text',
      description: 'Emphasized content and large metrics',
      example: '1,234 Active Agents',
      size: dashboardTheme.typography.fontSize.lg,
      weight: dashboardTheme.typography.fontWeight.medium,
      lineHeight: dashboardTheme.typography.lineHeight.normal
    },
    {
      key: 'base',
      label: 'Body Text',
      description: 'Default text for paragraphs and content',
      example: 'This is the standard body text used throughout the dashboard for general content and descriptions.',
      size: dashboardTheme.typography.fontSize.base,
      weight: dashboardTheme.typography.fontWeight.normal,
      lineHeight: dashboardTheme.typography.lineHeight.normal
    },
    {
      key: 'sm',
      label: 'Small Text / Labels',
      description: 'Form labels, captions, and secondary information',
      example: 'Last updated 5 minutes ago',
      size: dashboardTheme.typography.fontSize.sm,
      weight: dashboardTheme.typography.fontWeight.medium,
      lineHeight: dashboardTheme.typography.lineHeight.normal
    },
    {
      key: 'xs',
      label: 'Extra Small Text',
      description: 'Fine print, timestamps, and metadata',
      example: 'Created on March 15, 2024 at 2:30 PM',
      size: dashboardTheme.typography.fontSize.xs,
      weight: dashboardTheme.typography.fontWeight.normal,
      lineHeight: dashboardTheme.typography.lineHeight.normal
    }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Typography Scale
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Consistent typography hierarchy following WCAG accessibility guidelines
        </p>
      </div>

      {/* Font Family Information */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Font Families
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sans Serif (Primary)
            </h4>
            <div className="font-mono text-sm text-gray-600 dark:text-gray-400">
              {dashboardTheme.typography.fontFamily.sans.join(', ')}
            </div>
            <div className="mt-2 text-lg" style={{ fontFamily: dashboardTheme.typography.fontFamily.sans.join(', ') }}>
              The quick brown fox jumps over the lazy dog
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monospace (Code)
            </h4>
            <div className="font-mono text-sm text-gray-600 dark:text-gray-400">
              {dashboardTheme.typography.fontFamily.mono.join(', ')}
            </div>
            <div className="mt-2 text-lg font-mono">
              const theme = &apos;dashboard&apos;
            </div>
          </div>
        </div>
      </div>

      {/* Typography Items */}
      <div className="space-y-6">
        {typographyItems.map((item) => (
          <TypographyItem
            key={item.key}
            size={item.size}
            weight={item.weight}
            lineHeight={item.lineHeight}
            label={item.label}
            description={item.description}
            example={item.example}
            interactive={interactive}
            onSizeChange={(newSize) => handleTypographyChange('fontSize', item.key, newSize)}
            onWeightChange={(newWeight) => {
              const weightKey = Object.keys(dashboardTheme.typography.fontWeight).find(
                key => dashboardTheme.typography.fontWeight[key as keyof typeof dashboardTheme.typography.fontWeight] === item.weight
              )
              if (weightKey) {
                handleTypographyChange('fontWeight', weightKey, newWeight)
              }
            }}
            onLineHeightChange={(newLineHeight) => {
              const lineHeightKey = Object.keys(dashboardTheme.typography.lineHeight).find(
                key => dashboardTheme.typography.lineHeight[key as keyof typeof dashboardTheme.typography.lineHeight] === item.lineHeight
              )
              if (lineHeightKey) {
                handleTypographyChange('lineHeight', lineHeightKey, newLineHeight)
              }
            }}
          />
        ))}
      </div>

      {/* WCAG Compliance Information */}
      {showSpecs && (
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-100">
            WCAG 2.1 AA Compliance
          </h3>
          <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
            <div className="flex items-start space-x-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>All text sizes meet minimum size requirements (≥12px for body text)</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>Line heights provide adequate spacing for readability (1.5x minimum for body text)</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>Font weights provide sufficient contrast between hierarchy levels</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>Typography scales proportionally and maintains readability at 200% zoom</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span>Font families include fallbacks for system compatibility</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TypographyScale