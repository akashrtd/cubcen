'use client'

import * as React from 'react'
import { useDashboardTheme } from './theme-provider'
import { DashboardTheme } from '@/types/dashboard'

interface ContrastValidatorProps {
  className?: string
  showDetails?: boolean
  autoValidate?: boolean
  onValidationComplete?: (results: ValidationResult[]) => void
}

interface ValidationResult {
  id: string
  colorPair: {
    foreground: string
    background: string
    foregroundName: string
    backgroundName: string
  }
  contrastRatio: number
  wcagLevel: 'AAA' | 'AA' | 'FAIL'
  isValid: boolean
  recommendation?: string
}

interface ContrastTestPair {
  id: string
  foreground: string
  background: string
  foregroundName: string
  backgroundName: string
  requiredRatio: number
  context: 'text' | 'ui' | 'graphical'
}

// WCAG 2.1 contrast requirements
const WCAG_REQUIREMENTS = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3.0,
  AAA_NORMAL: 7.0,
  AAA_LARGE: 4.5,
  UI_COMPONENTS: 3.0,
  GRAPHICAL: 3.0
}

function getWCAGLevel(ratio: number, isLargeText: boolean = false): 'AAA' | 'AA' | 'FAIL' {
  if (isLargeText) {
    if (ratio >= WCAG_REQUIREMENTS.AAA_LARGE) return 'AAA'
    if (ratio >= WCAG_REQUIREMENTS.AA_LARGE) return 'AA'
  } else {
    if (ratio >= WCAG_REQUIREMENTS.AAA_NORMAL) return 'AAA'
    if (ratio >= WCAG_REQUIREMENTS.AA_NORMAL) return 'AA'
  }
  return 'FAIL'
}

function generateRecommendation(result: ValidationResult): string {
  const { contrastRatio, wcagLevel } = result
  
  if (wcagLevel === 'FAIL') {
    const needed = WCAG_REQUIREMENTS.AA_NORMAL
    const improvement = ((needed / contrastRatio - 1) * 100).toFixed(0)
    return `Increase contrast by approximately ${improvement}% to meet WCAG AA standards`
  }
  
  if (wcagLevel === 'AA') {
    const needed = WCAG_REQUIREMENTS.AAA_NORMAL
    const improvement = ((needed / contrastRatio - 1) * 100).toFixed(0)
    return `Consider increasing contrast by ${improvement}% to achieve WCAG AAA level`
  }
  
  return 'Excellent contrast - meets WCAG AAA standards'
}

export function ContrastValidator({
  className = '',
  showDetails = true,
  autoValidate = true,
  onValidationComplete
}: ContrastValidatorProps) {
  const { dashboardTheme, getContrastRatio } = useDashboardTheme()
  const [validationResults, setValidationResults] = React.useState<ValidationResult[]>([])
  const [isValidating, setIsValidating] = React.useState(false)

  // Generate test pairs based on current theme
  const generateTestPairs = React.useCallback((): ContrastTestPair[] => {
    const { colors } = dashboardTheme
    const pairs: ContrastTestPair[] = []

    // Text colors against backgrounds
    Object.entries(colors.text).forEach(([textKey, textColor]) => {
      pairs.push({
        id: `text-${textKey}-bg`,
        foreground: textColor,
        background: colors.background,
        foregroundName: `Text ${textKey}`,
        backgroundName: 'Background',
        requiredRatio: WCAG_REQUIREMENTS.AA_NORMAL,
        context: 'text'
      })

      pairs.push({
        id: `text-${textKey}-surface`,
        foreground: textColor,
        background: colors.surface,
        foregroundName: `Text ${textKey}`,
        backgroundName: 'Surface',
        requiredRatio: WCAG_REQUIREMENTS.AA_NORMAL,
        context: 'text'
      })
    })

    // Status colors against backgrounds
    Object.entries(colors.status).forEach(([statusKey, statusColor]) => {
      pairs.push({
        id: `status-${statusKey}-bg`,
        foreground: statusColor,
        background: colors.background,
        foregroundName: `Status ${statusKey}`,
        backgroundName: 'Background',
        requiredRatio: WCAG_REQUIREMENTS.UI_COMPONENTS,
        context: 'ui'
      })
    })

    // Primary colors against backgrounds
    pairs.push({
      id: 'primary-bg',
      foreground: colors.primary,
      background: colors.background,
      foregroundName: 'Primary',
      backgroundName: 'Background',
      requiredRatio: WCAG_REQUIREMENTS.UI_COMPONENTS,
      context: 'ui'
    })

    pairs.push({
      id: 'secondary-bg',
      foreground: colors.secondary,
      background: colors.background,
      foregroundName: 'Secondary',
      backgroundName: 'Background',
      requiredRatio: WCAG_REQUIREMENTS.UI_COMPONENTS,
      context: 'ui'
    })

    pairs.push({
      id: 'accent-bg',
      foreground: colors.accent,
      background: colors.background,
      foregroundName: 'Accent',
      backgroundName: 'Background',
      requiredRatio: WCAG_REQUIREMENTS.UI_COMPONENTS,
      context: 'ui'
    })

    return pairs
  }, [dashboardTheme])

  // Validate contrast ratios
  const validateContrast = React.useCallback(async () => {
    setIsValidating(true)
    const testPairs = generateTestPairs()
    const results: ValidationResult[] = []

    for (const pair of testPairs) {
      const ratio = getContrastRatio(pair.foreground, pair.background)
      const wcagLevel = getWCAGLevel(ratio, false) // Assuming normal text size
      const isValid = ratio >= pair.requiredRatio

      const result: ValidationResult = {
        id: pair.id,
        colorPair: {
          foreground: pair.foreground,
          background: pair.background,
          foregroundName: pair.foregroundName,
          backgroundName: pair.backgroundName
        },
        contrastRatio: ratio,
        wcagLevel,
        isValid,
        recommendation: generateRecommendation({
          id: pair.id,
          colorPair: {
            foreground: pair.foreground,
            background: pair.background,
            foregroundName: pair.foregroundName,
            backgroundName: pair.backgroundName
          },
          contrastRatio: ratio,
          wcagLevel,
          isValid
        })
      }

      results.push(result)
    }

    setValidationResults(results)
    setIsValidating(false)

    if (onValidationComplete) {
      onValidationComplete(results)
    }
  }, [generateTestPairs, getContrastRatio, onValidationComplete])

  // Auto-validate when theme changes
  React.useEffect(() => {
    if (autoValidate) {
      validateContrast()
    }
  }, [autoValidate, validateContrast])

  const failedTests = validationResults.filter(result => !result.isValid)
  const passedTests = validationResults.filter(result => result.isValid)
  const aaaTests = validationResults.filter(result => result.wcagLevel === 'AAA')

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Contrast Validation
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            WCAG 2.1 accessibility compliance check
          </p>
        </div>
        <button
          onClick={validateContrast}
          disabled={isValidating}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isValidating ? 'Validating...' : 'Validate'}
        </button>
      </div>

      {/* Summary */}
      {validationResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {passedTests.length}
            </div>
            <div className="text-sm text-green-800 dark:text-green-200">
              Passed Tests
            </div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {failedTests.length}
            </div>
            <div className="text-sm text-red-800 dark:text-red-200">
              Failed Tests
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {aaaTests.length}
            </div>
            <div className="text-sm text-purple-800 dark:text-purple-200">
              AAA Level
            </div>
          </div>
        </div>
      )}

      {/* Detailed Results */}
      {showDetails && validationResults.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">
            Detailed Results
          </h4>
          
          {/* Failed Tests First */}
          {failedTests.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-red-600 dark:text-red-400">
                Failed Tests ({failedTests.length})
              </h5>
              {failedTests.map((result) => (
                <div
                  key={result.id}
                  className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: result.colorPair.foreground }}
                        />
                        <span className="text-sm font-medium">
                          {result.colorPair.foregroundName}
                        </span>
                        <span className="text-xs text-gray-500">on</span>
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: result.colorPair.background }}
                        />
                        <span className="text-sm font-medium">
                          {result.colorPair.backgroundName}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono text-red-600 dark:text-red-400">
                        {result.contrastRatio.toFixed(2)}:1
                      </div>
                      <div className="text-xs text-red-500">
                        {result.wcagLevel}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-red-700 dark:text-red-300">
                    {result.recommendation}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Passed Tests */}
          {passedTests.length > 0 && (
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-green-600 dark:text-green-400">
                Passed Tests ({passedTests.length})
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {passedTests.map((result) => (
                  <div
                    key={result.id}
                    className="border border-green-200 dark:border-green-800 rounded-lg p-3 bg-green-50 dark:bg-green-900/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded border"
                          style={{ backgroundColor: result.colorPair.foreground }}
                        />
                        <span className="text-xs">
                          {result.colorPair.foregroundName} / {result.colorPair.backgroundName}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono text-green-600 dark:text-green-400">
                          {result.contrastRatio.toFixed(2)}:1
                        </div>
                        <div className="text-xs text-green-500">
                          {result.wcagLevel}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* WCAG Guidelines */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">
          WCAG 2.1 Contrast Requirements
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
          <div>
            <div className="font-medium mb-1">Normal Text</div>
            <div>AA: 4.5:1 minimum</div>
            <div>AAA: 7:1 minimum</div>
          </div>
          <div>
            <div className="font-medium mb-1">Large Text (18pt+)</div>
            <div>AA: 3:1 minimum</div>
            <div>AAA: 4.5:1 minimum</div>
          </div>
          <div>
            <div className="font-medium mb-1">UI Components</div>
            <div>AA: 3:1 minimum</div>
          </div>
          <div>
            <div className="font-medium mb-1">Graphical Objects</div>
            <div>AA: 3:1 minimum</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContrastValidator