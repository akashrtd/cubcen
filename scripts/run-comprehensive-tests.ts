#!/usr/bin/env tsx

import { execSync, spawn } from 'child_process'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

/**
 * Comprehensive test execution script for Cubcen
 * Runs all test suites with proper reporting and quality gates
 */

interface TestResult {
  name: string
  success: boolean
  duration: number
  output: string
  error?: string
}

interface TestSuite {
  name: string
  command: string
  description: string
  required: boolean
  timeout: number
}

class ComprehensiveTestRunner {
  private results: TestResult[] = []
  private startTime: number = Date.now()

  private testSuites: TestSuite[] = [
    {
      name: 'Code Formatting',
      command: 'npm run format:check',
      description: 'Verify code formatting with Prettier',
      required: true,
      timeout: 30000,
    },
    {
      name: 'Linting',
      command: 'npm run lint',
      description: 'ESLint code quality checks',
      required: true,
      timeout: 60000,
    },
    {
      name: 'Type Checking',
      command: 'npm run type-check',
      description: 'TypeScript strict type validation',
      required: true,
      timeout: 120000,
    },
    {
      name: 'Security Audit',
      command: 'npm audit --audit-level moderate',
      description: 'Dependency vulnerability scanning',
      required: true,
      timeout: 60000,
    },
    {
      name: 'Unit Tests',
      command: 'npm run test:coverage',
      description: 'Unit tests with coverage reporting',
      required: true,
      timeout: 300000,
    },
    {
      name: 'Backend Integration Tests',
      command: 'npm run test:backend',
      description: 'API and database integration tests',
      required: true,
      timeout: 300000,
    },
    {
      name: 'Build Validation',
      command: 'npm run build',
      description: 'Production build verification',
      required: true,
      timeout: 180000,
    },
    {
      name: 'Server Build',
      command: 'npm run build:server',
      description: 'Server-side build verification',
      required: true,
      timeout: 120000,
    },
    {
      name: 'API Documentation',
      command: 'npm run test:api-docs',
      description: 'API documentation validation',
      required: false,
      timeout: 60000,
    },
    {
      name: 'End-to-End Tests',
      command: 'npm run test:e2e',
      description: 'Complete user journey testing',
      required: true,
      timeout: 600000,
    },
    {
      name: 'Performance Tests',
      command: 'npm run test:performance',
      description: 'Load and performance testing',
      required: false,
      timeout: 300000,
    },
  ]

  async run(): Promise<void> {
    console.log('🚀 Starting Comprehensive Test Suite for Cubcen')
    console.log('='.repeat(60))

    // Setup test environment
    await this.setupEnvironment()

    // Run all test suites
    for (const suite of this.testSuites) {
      await this.runTestSuite(suite)
    }

    // Generate final report
    await this.generateReport()

    // Exit with appropriate code
    const hasFailures = this.results.some(
      r => !r.success && this.testSuites.find(s => s.name === r.name)?.required
    )
    process.exit(hasFailures ? 1 : 0)
  }

  private async setupEnvironment(): Promise<void> {
    console.log('🔧 Setting up test environment...')

    try {
      // Create necessary directories
      const dirs = ['coverage', 'e2e/temp', 'test-results']
      dirs.forEach(dir => {
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true })
        }
      })

      // Generate Prisma client
      console.log('📦 Generating Prisma client...')
      execSync('npx prisma generate', { stdio: 'inherit' })

      // Setup test database
      console.log('🗄️ Setting up test database...')
      process.env.DATABASE_URL = 'file:./e2e/temp/test.db'
      ;(process.env as any).NODE_ENV = 'test'
      process.env.JWT_SECRET = 'test-jwt-secret-for-comprehensive-testing'

      execSync('npx prisma migrate deploy', {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: 'file:./e2e/temp/test.db' },
      })

      console.log('✅ Test environment setup complete\n')
    } catch (error) {
      console.error('❌ Failed to setup test environment:', error)
      process.exit(1)
    }
  }

  private async runTestSuite(suite: TestSuite): Promise<void> {
    console.log(`🧪 Running ${suite.name}...`)
    console.log(`   ${suite.description}`)

    const startTime = Date.now()
    let success = false
    let output = ''
    let error = ''

    try {
      output = execSync(suite.command, {
        encoding: 'utf8',
        timeout: suite.timeout,
        env: { ...process.env },
      })
      success = true
      console.log(`✅ ${suite.name} passed`)
    } catch (err: any) {
      success = false
      error = err.message
      output = err.stdout || ''
      const errorOutput = err.stderr || err.message

      if (suite.required) {
        console.log(`❌ ${suite.name} failed (REQUIRED)`)
        console.log(`   Error: ${errorOutput}`)
      } else {
        console.log(`⚠️  ${suite.name} failed (OPTIONAL)`)
        console.log(`   Error: ${errorOutput}`)
      }
    }

    const duration = Date.now() - startTime

    this.results.push({
      name: suite.name,
      success,
      duration,
      output,
      error,
    })

    console.log(`   Duration: ${(duration / 1000).toFixed(2)}s\n`)
  }

  private async generateReport(): Promise<void> {
    const totalDuration = Date.now() - this.startTime
    const passedTests = this.results.filter(r => r.success)
    const failedTests = this.results.filter(r => !r.success)
    const requiredFailures = failedTests.filter(
      r => this.testSuites.find(s => s.name === r.name)?.required
    )

    console.log('📊 Test Results Summary')
    console.log('='.repeat(60))
    console.log(`Total Tests: ${this.results.length}`)
    console.log(`Passed: ${passedTests.length}`)
    console.log(`Failed: ${failedTests.length}`)
    console.log(`Required Failures: ${requiredFailures.length}`)
    console.log(`Total Duration: ${(totalDuration / 1000).toFixed(2)}s`)
    console.log('')

    // Detailed results
    console.log('📋 Detailed Results:')
    this.results.forEach(result => {
      const suite = this.testSuites.find(s => s.name === result.name)
      const status = result.success ? '✅' : suite?.required ? '❌' : '⚠️'
      const duration = (result.duration / 1000).toFixed(2)
      console.log(`${status} ${result.name} (${duration}s)`)
    })

    // Generate JSON report
    const report = {
      timestamp: new Date().toISOString(),
      totalDuration,
      summary: {
        total: this.results.length,
        passed: passedTests.length,
        failed: failedTests.length,
        requiredFailures: requiredFailures.length,
      },
      results: this.results.map(r => ({
        name: r.name,
        success: r.success,
        duration: r.duration,
        required:
          this.testSuites.find(s => s.name === r.name)?.required || false,
        error: r.error || null,
      })),
    }

    writeFileSync(
      'test-results/comprehensive-test-report.json',
      JSON.stringify(report, null, 2)
    )

    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(report)
    writeFileSync('test-results/comprehensive-test-report.md', markdownReport)

    console.log('\n📄 Reports generated:')
    console.log('   - test-results/comprehensive-test-report.json')
    console.log('   - test-results/comprehensive-test-report.md')

    // Final status
    if (requiredFailures.length === 0) {
      console.log(
        '\n🎉 All required tests passed! Cubcen is ready for deployment.'
      )
    } else {
      console.log(
        '\n💥 Required tests failed! Please fix issues before deployment.'
      )
      console.log('\nFailed required tests:')
      requiredFailures.forEach(failure => {
        console.log(`   - ${failure.name}: ${failure.error}`)
      })
    }
  }

  private generateMarkdownReport(report: any): string {
    const timestamp = new Date(report.timestamp).toLocaleString()

    let markdown = `# Cubcen Comprehensive Test Report

Generated: ${timestamp}
Total Duration: ${(report.totalDuration / 1000).toFixed(2)} seconds

## Summary

| Metric | Count |
|--------|-------|
| Total Tests | ${report.summary.total} |
| Passed | ${report.summary.passed} |
| Failed | ${report.summary.failed} |
| Required Failures | ${report.summary.requiredFailures} |

## Test Results

| Test Suite | Status | Duration | Required |
|------------|--------|----------|----------|
`

    report.results.forEach((result: any) => {
      const status = result.success ? '✅ Pass' : '❌ Fail'
      const duration = (result.duration / 1000).toFixed(2) + 's'
      const required = result.required ? 'Yes' : 'No'
      markdown += `| ${result.name} | ${status} | ${duration} | ${required} |\n`
    })

    if (report.summary.requiredFailures > 0) {
      markdown += `\n## Failed Required Tests\n\n`
      report.results
        .filter((r: any) => !r.success && r.required)
        .forEach((result: any) => {
          markdown += `### ${result.name}\n\n`
          markdown += `**Error:** ${result.error || 'Unknown error'}\n\n`
        })
    }

    markdown += `\n## Quality Gates Status\n\n`
    if (report.summary.requiredFailures === 0) {
      markdown += `🎉 **ALL QUALITY GATES PASSED** - Ready for deployment!\n\n`
      markdown += `- ✅ Code formatting and linting\n`
      markdown += `- ✅ Type safety validation\n`
      markdown += `- ✅ Security audit passed\n`
      markdown += `- ✅ Unit and integration tests\n`
      markdown += `- ✅ Build verification\n`
      markdown += `- ✅ End-to-end testing\n`
    } else {
      markdown += `❌ **QUALITY GATES FAILED** - Deployment blocked!\n\n`
      markdown += `Please fix the failed required tests before proceeding.\n`
    }

    return markdown
  }
}

// Run the comprehensive test suite
if (require.main === module) {
  const runner = new ComprehensiveTestRunner()
  runner.run().catch(error => {
    console.error('💥 Test runner failed:', error)
    process.exit(1)
  })
}

export { ComprehensiveTestRunner }
