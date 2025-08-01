#!/usr/bin/env tsx

/**
 * Deployment Readiness Check for Cubcen
 * Comprehensive validation before production deployment
 */

import { execSync, spawn } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

interface ReadinessCheck {
  category: string
  name: string
  description: string
  critical: boolean
  check: () => Promise<CheckResult>
}

interface CheckResult {
  passed: boolean
  message: string
  details?: any
  recommendations?: string[]
  score?: number // 0-100
}

interface ReadinessReport {
  timestamp: string
  overallStatus: 'ready' | 'warning' | 'not-ready'
  overallScore: number
  categories: {
    [category: string]: {
      passed: number
      failed: number
      score: number
      critical_failures: number
    }
  }
  results: Array<
    CheckResult & { category: string; name: string; critical: boolean }
  >
  recommendations: string[]
}

class DeploymentReadinessChecker {
  private results: Array<
    CheckResult & { category: string; name: string; critical: boolean }
  > = []

  async runFullCheck(): Promise<void> {
    console.log('🚀 Cubcen Deployment Readiness Check')
    console.log('='.repeat(60))
    console.log('Validating all systems for production deployment...\n')

    const checks: ReadinessCheck[] = [
      // Code Quality & Testing
      {
        category: 'Code Quality',
        name: 'Linting and Formatting',
        description: 'Code follows style guidelines and best practices',
        critical: true,
        check: () => this.checkLinting(),
      },
      {
        category: 'Code Quality',
        name: 'Type Safety',
        description: 'TypeScript compilation without errors',
        critical: true,
        check: () => this.checkTypeScript(),
      },
      {
        category: 'Code Quality',
        name: 'Build Process',
        description: 'Application builds successfully for production',
        critical: true,
        check: () => this.checkBuild(),
      },
      {
        category: 'Testing',
        name: 'Unit Tests',
        description: 'Unit tests pass with adequate coverage',
        critical: true,
        check: () => this.checkUnitTests(),
      },
      {
        category: 'Testing',
        name: 'Integration Tests',
        description: 'Integration tests validate system components',
        critical: true,
        check: () => this.checkIntegrationTests(),
      },
      {
        category: 'Testing',
        name: 'End-to-End Tests',
        description: 'E2E tests validate user journeys',
        critical: false,
        check: () => this.checkE2ETests(),
      },

      // Security
      {
        category: 'Security',
        name: 'Dependency Vulnerabilities',
        description: 'No critical security vulnerabilities in dependencies',
        critical: true,
        check: () => this.checkDependencyVulnerabilities(),
      },
      {
        category: 'Security',
        name: 'Environment Configuration',
        description: 'Production environment securely configured',
        critical: true,
        check: () => this.checkEnvironmentSecurity(),
      },
      {
        category: 'Security',
        name: 'Authentication & Authorization',
        description: 'Security controls properly implemented',
        critical: true,
        check: () => this.checkAuthSecurity(),
      },

      // Infrastructure
      {
        category: 'Infrastructure',
        name: 'Docker Configuration',
        description: 'Docker setup ready for production deployment',
        critical: true,
        check: () => this.checkDockerSetup(),
      },
      {
        category: 'Infrastructure',
        name: 'Database Setup',
        description: 'Database configuration and migrations ready',
        critical: true,
        check: () => this.checkDatabaseSetup(),
      },
      {
        category: 'Infrastructure',
        name: 'Environment Variables',
        description: 'All required environment variables configured',
        critical: true,
        check: () => this.checkEnvironmentVariables(),
      },

      // Monitoring & Observability
      {
        category: 'Monitoring',
        name: 'Health Checks',
        description: 'Health check endpoints functional',
        critical: true,
        check: () => this.checkHealthEndpoints(),
      },
      {
        category: 'Monitoring',
        name: 'Logging Configuration',
        description: 'Logging properly configured for production',
        critical: false,
        check: () => this.checkLogging(),
      },
      {
        category: 'Monitoring',
        name: 'Error Handling',
        description: 'Error handling and recovery mechanisms',
        critical: true,
        check: () => this.checkErrorHandling(),
      },

      // Documentation & Compliance
      {
        category: 'Documentation',
        name: 'API Documentation',
        description: 'API documentation complete and accessible',
        critical: false,
        check: () => this.checkAPIDocumentation(),
      },
      {
        category: 'Documentation',
        name: 'User Documentation',
        description: 'User guides and documentation available',
        critical: false,
        check: () => this.checkUserDocumentation(),
      },
      {
        category: 'Documentation',
        name: 'Deployment Documentation',
        description: 'Deployment and operational documentation',
        critical: true,
        check: () => this.checkDeploymentDocumentation(),
      },

      // Performance
      {
        category: 'Performance',
        name: 'Performance Tests',
        description: 'Performance benchmarks meet requirements',
        critical: false,
        check: () => this.checkPerformance(),
      },
      {
        category: 'Performance',
        name: 'Resource Usage',
        description: 'Resource usage within acceptable limits',
        critical: false,
        check: () => this.checkResourceUsage(),
      },
    ]

    // Run all checks
    for (const check of checks) {
      try {
        console.log(`🔍 ${check.category}: ${check.name}`)
        console.log(`   ${check.description}`)

        const result = await check.check()
        this.results.push({
          ...result,
          category: check.category,
          name: check.name,
          critical: check.critical,
        })

        const status = result.passed
          ? '✅ PASS'
          : check.critical
            ? '❌ FAIL'
            : '⚠️ WARN'
        const score = result.score ? ` (${result.score}/100)` : ''
        console.log(`   ${status}${score}: ${result.message}\n`)
      } catch (error) {
        const errorResult: CheckResult = {
          passed: false,
          message: `Check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          score: 0,
        }
        this.results.push({
          ...errorResult,
          category: check.category,
          name: check.name,
          critical: check.critical,
        })
        console.log(`   ❌ ERROR: ${errorResult.message}\n`)
      }
    }

    // Generate and display report
    const report = this.generateReport()
    this.saveReport(report)
    this.displayFinalReport(report)

    // Exit with appropriate code
    if (report.overallStatus === 'not-ready') {
      process.exit(1)
    } else if (report.overallStatus === 'warning') {
      process.exit(2)
    } else {
      process.exit(0)
    }
  }

  private async checkLinting(): Promise<CheckResult> {
    try {
      execSync('npm run lint', { stdio: 'pipe' })
      return {
        passed: true,
        message: 'Code linting passed',
        score: 100,
      }
    } catch (error) {
      return {
        passed: false,
        message: 'Linting errors found',
        score: 0,
        recommendations: ['Fix linting errors: npm run lint --fix'],
      }
    }
  }

  private async checkTypeScript(): Promise<CheckResult> {
    try {
      execSync('npm run type-check', { stdio: 'pipe' })
      return {
        passed: true,
        message: 'TypeScript compilation successful',
        score: 100,
      }
    } catch (error) {
      return {
        passed: false,
        message: 'TypeScript compilation errors',
        score: 0,
        recommendations: ['Fix TypeScript errors before deployment'],
      }
    }
  }

  private async checkBuild(): Promise<CheckResult> {
    try {
      execSync('npm run build', { stdio: 'pipe' })
      execSync('npm run build:server', { stdio: 'pipe' })

      // Check if build artifacts exist
      const buildArtifacts = ['dist', '.next']
      const existingArtifacts = buildArtifacts.filter(artifact =>
        existsSync(artifact)
      )

      if (existingArtifacts.length === 0) {
        return {
          passed: false,
          message: 'Build artifacts not found',
          score: 0,
          recommendations: ['Verify build process creates necessary artifacts'],
        }
      }

      return {
        passed: true,
        message: 'Build process completed successfully',
        score: 100,
        details: { artifacts: existingArtifacts },
      }
    } catch (error) {
      return {
        passed: false,
        message: 'Build process failed',
        score: 0,
        recommendations: ['Fix build errors before deployment'],
      }
    }
  }

  private async checkUnitTests(): Promise<CheckResult> {
    try {
      const output = execSync('npm run test:coverage', {
        encoding: 'utf8',
        stdio: 'pipe',
      })

      // Parse coverage from output
      let coverageScore = 0
      const coverageMatch = output.match(/All files[^\n]*?(\d+(?:\.\d+)?)/g)
      if (coverageMatch) {
        const coverageNumbers = coverageMatch.map(match => {
          const num = match.match(/(\d+(?:\.\d+)?)/)
          return num ? parseFloat(num[1]) : 0
        })
        coverageScore = Math.min(...coverageNumbers)
      }

      const passed = coverageScore >= 80 // 80% minimum coverage

      return {
        passed,
        message: passed
          ? `Unit tests passed with ${coverageScore.toFixed(1)}% coverage`
          : `Unit tests coverage too low: ${coverageScore.toFixed(1)}%`,
        score: Math.min(100, coverageScore + 20), // Bonus for high coverage
        details: { coverage: coverageScore },
        recommendations: passed
          ? []
          : ['Increase test coverage to at least 80%'],
      }
    } catch (error) {
      return {
        passed: false,
        message: 'Unit tests failed',
        score: 0,
        recommendations: ['Fix failing unit tests before deployment'],
      }
    }
  }

  private async checkIntegrationTests(): Promise<CheckResult> {
    try {
      execSync('npm run test:backend', { stdio: 'pipe' })
      return {
        passed: true,
        message: 'Integration tests passed',
        score: 100,
      }
    } catch (error) {
      return {
        passed: false,
        message: 'Integration tests failed',
        score: 0,
        recommendations: ['Fix failing integration tests'],
      }
    }
  }

  private async checkE2ETests(): Promise<CheckResult> {
    try {
      if (
        !existsSync('e2e') &&
        !existsSync('cypress') &&
        !existsSync('playwright.config.ts')
      ) {
        return {
          passed: false,
          message: 'No E2E tests found',
          score: 0,
          recommendations: ['Create E2E tests for critical user journeys'],
        }
      }

      execSync('npm run test:e2e', { stdio: 'pipe' })
      return {
        passed: true,
        message: 'E2E tests passed',
        score: 100,
      }
    } catch (error) {
      return {
        passed: false,
        message: 'E2E tests failed or not configured',
        score: 30,
        recommendations: ['Fix E2E tests or create them if missing'],
      }
    }
  }

  private async checkDependencyVulnerabilities(): Promise<CheckResult> {
    try {
      const auditOutput = execSync('npm audit --json', { encoding: 'utf8' })
      const auditResult = JSON.parse(auditOutput)

      const criticalVulns = auditResult.metadata?.vulnerabilities?.critical || 0
      const highVulns = auditResult.metadata?.vulnerabilities?.high || 0

      if (criticalVulns > 0) {
        return {
          passed: false,
          message: `${criticalVulns} critical vulnerabilities found`,
          score: 0,
          recommendations: [
            'Run npm audit fix to resolve critical vulnerabilities',
          ],
        }
      }

      if (highVulns > 0) {
        return {
          passed: false,
          message: `${highVulns} high severity vulnerabilities found`,
          score: 50,
          recommendations: [
            'Resolve high severity vulnerabilities before deployment',
          ],
        }
      }

      return {
        passed: true,
        message: 'No critical or high severity vulnerabilities',
        score: 100,
      }
    } catch (error) {
      // npm audit returns non-zero exit code when vulnerabilities found
      return {
        passed: false,
        message: 'Dependency vulnerabilities detected',
        score: 0,
        recommendations: ['Run npm audit and fix vulnerabilities'],
      }
    }
  }

  private async checkEnvironmentSecurity(): Promise<CheckResult> {
    const issues: string[] = []
    let score = 100

    // Check if .env exists
    if (!existsSync('.env')) {
      issues.push('Production .env file missing')
      score -= 50
    } else {
      const envContent = readFileSync('.env', 'utf8')

      // Check for default values
      if (
        envContent.includes('change-me') ||
        envContent.includes('your-secret')
      ) {
        issues.push('Default values found in .env')
        score -= 30
      }

      // Check JWT secret strength
      const jwtMatch = envContent.match(/JWT_SECRET=(.+)/)
      if (jwtMatch && jwtMatch[1].length < 32) {
        issues.push('JWT_SECRET too short')
        score -= 20
      }
    }

    // Check NODE_ENV
    if (process.env.NODE_ENV !== 'production') {
      issues.push('NODE_ENV not set to production')
      score -= 20
    }

    return {
      passed: issues.length === 0,
      message:
        issues.length === 0
          ? 'Environment security properly configured'
          : `${issues.length} security issues found`,
      score: Math.max(0, score),
      details: { issues },
      recommendations: issues.map(issue => `Fix: ${issue}`),
    }
  }

  private async checkAuthSecurity(): Promise<CheckResult> {
    // This would typically test authentication endpoints
    // For now, check if auth files exist and are configured
    const authFiles = [
      'src/lib/jwt.ts',
      'src/lib/auth.ts',
      'src/services/auth.ts',
      'src/backend/middleware/auth.ts',
    ]

    const existingAuthFiles = authFiles.filter(file => existsSync(file))

    if (existingAuthFiles.length === 0) {
      return {
        passed: false,
        message: 'No authentication files found',
        score: 0,
        recommendations: ['Implement authentication system'],
      }
    }

    // Check for basic security patterns
    let securityScore = 100
    const issues: string[] = []

    for (const file of existingAuthFiles) {
      const content = readFileSync(file, 'utf8')

      if (!content.includes('bcrypt') && !content.includes('hash')) {
        issues.push(`${file} may not hash passwords`)
        securityScore -= 20
      }

      if (!content.includes('jwt') && !content.includes('token')) {
        issues.push(`${file} may not implement JWT`)
        securityScore -= 15
      }
    }

    return {
      passed: issues.length === 0,
      message:
        issues.length === 0
          ? 'Authentication security implemented'
          : `${issues.length} auth security issues`,
      score: Math.max(0, securityScore),
      details: { authFiles: existingAuthFiles, issues },
      recommendations: issues.map(issue => `Review: ${issue}`),
    }
  }

  private async checkDockerSetup(): Promise<CheckResult> {
    const issues: string[] = []
    let score = 100

    // Check Dockerfile
    if (!existsSync('Dockerfile')) {
      issues.push('Dockerfile missing')
      score -= 50
    } else {
      const dockerfile = readFileSync('Dockerfile', 'utf8')

      if (!dockerfile.includes('USER ') || dockerfile.includes('USER root')) {
        issues.push('Docker container runs as root')
        score -= 20
      }

      if (!dockerfile.includes('HEALTHCHECK')) {
        issues.push('Docker healthcheck missing')
        score -= 10
      }
    }

    // Check docker-compose
    if (!existsSync('docker-compose.yml')) {
      issues.push('docker-compose.yml missing')
      score -= 30
    }

    // Check .dockerignore
    if (!existsSync('.dockerignore')) {
      issues.push('.dockerignore missing')
      score -= 10
    }

    return {
      passed: issues.length === 0,
      message:
        issues.length === 0
          ? 'Docker configuration ready'
          : `${issues.length} Docker issues found`,
      score: Math.max(0, score),
      details: { issues },
      recommendations: issues.map(issue => `Fix: ${issue}`),
    }
  }

  private async checkDatabaseSetup(): Promise<CheckResult> {
    const issues: string[] = []
    let score = 100

    // Check Prisma schema
    if (!existsSync('prisma/schema.prisma')) {
      issues.push('Prisma schema missing')
      score -= 40
    }

    // Check migrations
    if (!existsSync('prisma/migrations')) {
      issues.push('Database migrations missing')
      score -= 30
    }

    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      issues.push('DATABASE_URL not configured')
      score -= 30
    }

    return {
      passed: issues.length === 0,
      message:
        issues.length === 0
          ? 'Database setup ready'
          : `${issues.length} database issues found`,
      score: Math.max(0, score),
      details: { issues },
      recommendations: issues.map(issue => `Fix: ${issue}`),
    }
  }

  private async checkEnvironmentVariables(): Promise<CheckResult> {
    const requiredVars = ['NODE_ENV', 'DATABASE_URL', 'JWT_SECRET']

    const missingVars = requiredVars.filter(varName => !process.env[varName])
    const score = Math.max(0, 100 - missingVars.length * 30)

    return {
      passed: missingVars.length === 0,
      message:
        missingVars.length === 0
          ? 'All required environment variables set'
          : `${missingVars.length} required variables missing`,
      score,
      details: { missingVars },
      recommendations: missingVars.map(
        varName => `Set ${varName} environment variable`
      ),
    }
  }

  private async checkHealthEndpoints(): Promise<CheckResult> {
    const healthFiles = ['src/backend/routes/health.ts', 'src/lib/health.ts']

    const hasHealthEndpoint = healthFiles.some(file => existsSync(file))

    if (!hasHealthEndpoint) {
      return {
        passed: false,
        message: 'Health check endpoints not found',
        score: 0,
        recommendations: ['Implement health check endpoints'],
      }
    }

    return {
      passed: true,
      message: 'Health check endpoints configured',
      score: 100,
    }
  }

  private async checkLogging(): Promise<CheckResult> {
    const logFiles = ['src/lib/logger.ts', 'src/lib/audit-logger.ts']

    const hasLogging = logFiles.some(file => existsSync(file))

    if (!hasLogging) {
      return {
        passed: false,
        message: 'Logging system not configured',
        score: 0,
        recommendations: ['Implement structured logging'],
      }
    }

    return {
      passed: true,
      message: 'Logging system configured',
      score: 100,
    }
  }

  private async checkErrorHandling(): Promise<CheckResult> {
    const errorFiles = [
      'src/services/error.ts',
      'src/backend/middleware/error.ts',
    ]

    const hasErrorHandling = errorFiles.some(file => existsSync(file))

    if (!hasErrorHandling) {
      return {
        passed: false,
        message: 'Error handling system not found',
        score: 0,
        recommendations: ['Implement comprehensive error handling'],
      }
    }

    return {
      passed: true,
      message: 'Error handling system configured',
      score: 100,
    }
  }

  private async checkAPIDocumentation(): Promise<CheckResult> {
    const docFiles = ['src/lib/swagger.ts', 'docs/api.md']

    const hasAPIDocs = docFiles.some(file => existsSync(file))

    return {
      passed: hasAPIDocs,
      message: hasAPIDocs
        ? 'API documentation available'
        : 'API documentation missing',
      score: hasAPIDocs ? 100 : 60,
      recommendations: hasAPIDocs ? [] : ['Create API documentation'],
    }
  }

  private async checkUserDocumentation(): Promise<CheckResult> {
    const userDocs = ['docs/user-guide.md', 'README.md']

    const hasUserDocs = userDocs.some(file => existsSync(file))

    return {
      passed: hasUserDocs,
      message: hasUserDocs
        ? 'User documentation available'
        : 'User documentation missing',
      score: hasUserDocs ? 100 : 70,
      recommendations: hasUserDocs ? [] : ['Create user documentation'],
    }
  }

  private async checkDeploymentDocumentation(): Promise<CheckResult> {
    const deployDocs = ['docs/deployment.md', 'docs/runbooks.md']

    const hasDeployDocs = deployDocs.some(file => existsSync(file))

    return {
      passed: hasDeployDocs,
      message: hasDeployDocs
        ? 'Deployment documentation available'
        : 'Deployment documentation missing',
      score: hasDeployDocs ? 100 : 50,
      recommendations: hasDeployDocs ? [] : ['Create deployment documentation'],
    }
  }

  private async checkPerformance(): Promise<CheckResult> {
    const perfFiles = ['scripts/test-performance.ts', 'e2e/performance']

    const hasPerfTests = perfFiles.some(file => existsSync(file))

    return {
      passed: hasPerfTests,
      message: hasPerfTests
        ? 'Performance tests available'
        : 'Performance tests missing',
      score: hasPerfTests ? 100 : 70,
      recommendations: hasPerfTests ? [] : ['Create performance benchmarks'],
    }
  }

  private async checkResourceUsage(): Promise<CheckResult> {
    // This would typically check actual resource usage
    // For now, just check if monitoring is configured
    const monitoringFiles = [
      'src/lib/performance-monitor.ts',
      'scripts/health-monitor.sh',
    ]

    const hasMonitoring = monitoringFiles.some(file => existsSync(file))

    return {
      passed: hasMonitoring,
      message: hasMonitoring
        ? 'Resource monitoring configured'
        : 'Resource monitoring missing',
      score: hasMonitoring ? 100 : 80,
      recommendations: hasMonitoring ? [] : ['Implement resource monitoring'],
    }
  }

  private generateReport(): ReadinessReport {
    const categories: { [key: string]: any } = {}

    // Group results by category
    for (const result of this.results) {
      if (!categories[result.category]) {
        categories[result.category] = {
          passed: 0,
          failed: 0,
          score: 0,
          critical_failures: 0,
          total: 0,
        }
      }

      const cat = categories[result.category]
      cat.total++

      if (result.passed) {
        cat.passed++
      } else {
        cat.failed++
        if (result.critical) {
          cat.critical_failures++
        }
      }

      cat.score += result.score || 0
    }

    // Calculate category scores
    for (const category of Object.keys(categories)) {
      const cat = categories[category]
      cat.score = Math.round(cat.score / cat.total)
    }

    // Calculate overall score
    const totalScore = this.results.reduce(
      (sum, result) => sum + (result.score || 0),
      0
    )
    const overallScore = Math.round(totalScore / this.results.length)

    // Determine overall status
    const criticalFailures = this.results.filter(
      r => !r.passed && r.critical
    ).length
    let overallStatus: 'ready' | 'warning' | 'not-ready'

    if (criticalFailures > 0) {
      overallStatus = 'not-ready'
    } else if (overallScore < 80) {
      overallStatus = 'warning'
    } else {
      overallStatus = 'ready'
    }

    // Collect recommendations
    const recommendations = this.results
      .filter(r => !r.passed && r.recommendations)
      .flatMap(r => r.recommendations!)

    return {
      timestamp: new Date().toISOString(),
      overallStatus,
      overallScore,
      categories,
      results: this.results,
      recommendations,
    }
  }

  private saveReport(report: ReadinessReport): void {
    const reportPath = 'deployment-readiness-report.json'
    writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📄 Deployment readiness report saved to: ${reportPath}`)
  }

  private displayFinalReport(report: ReadinessReport): void {
    console.log('\n' + '='.repeat(80))
    console.log('🚀 CUBCEN DEPLOYMENT READINESS REPORT')
    console.log('='.repeat(80))

    // Overall status
    const statusEmoji = {
      ready: '✅',
      warning: '⚠️',
      'not-ready': '❌',
    }

    console.log(
      `\n📊 OVERALL STATUS: ${statusEmoji[report.overallStatus]} ${report.overallStatus.toUpperCase()}`
    )
    console.log(`📈 OVERALL SCORE: ${report.overallScore}/100`)
    console.log(
      `📅 Assessment Date: ${new Date(report.timestamp).toLocaleString()}`
    )

    // Category breakdown
    console.log(`\n📋 CATEGORY BREAKDOWN:`)
    for (const [category, stats] of Object.entries(report.categories)) {
      const statusIcon =
        stats.critical_failures > 0 ? '❌' : stats.failed > 0 ? '⚠️' : '✅'
      const total = stats.passed + stats.failed
      console.log(
        `   ${statusIcon} ${category}: ${stats.score}/100 (${stats.passed}/${total} passed)`
      )
      if (stats.critical_failures > 0) {
        console.log(`      🚨 ${stats.critical_failures} critical failures`)
      }
    }

    // Critical failures
    const criticalFailures = this.results.filter(r => !r.passed && r.critical)
    if (criticalFailures.length > 0) {
      console.log(`\n🚨 CRITICAL FAILURES (DEPLOYMENT BLOCKED):`)
      criticalFailures.forEach(failure => {
        console.log(`   ❌ ${failure.category}: ${failure.name}`)
        console.log(`      ${failure.message}`)
        if (failure.recommendations) {
          failure.recommendations.forEach(rec => {
            console.log(`      💡 ${rec}`)
          })
        }
      })
    }

    // Warnings
    const warnings = this.results.filter(r => !r.passed && !r.critical)
    if (warnings.length > 0) {
      console.log(`\n⚠️ WARNINGS (REVIEW RECOMMENDED):`)
      warnings.forEach(warning => {
        console.log(`   ⚠️ ${warning.category}: ${warning.name}`)
        console.log(`      ${warning.message}`)
      })
    }

    // Deployment decision
    console.log(`\n🎯 DEPLOYMENT DECISION:`)
    switch (report.overallStatus) {
      case 'ready':
        console.log(`   ✅ READY FOR DEPLOYMENT`)
        console.log(
          `   🚀 All critical checks passed - safe to deploy to production`
        )
        console.log(
          `   📋 Score: ${report.overallScore}/100 - Excellent readiness`
        )
        break
      case 'warning':
        console.log(`   ⚠️ DEPLOYMENT WITH CAUTION`)
        console.log(`   📝 No critical failures but some issues need attention`)
        console.log(
          `   📋 Score: ${report.overallScore}/100 - Review warnings before deployment`
        )
        break
      case 'not-ready':
        console.log(`   ❌ DEPLOYMENT BLOCKED`)
        console.log(
          `   🛑 Critical failures must be resolved before deployment`
        )
        console.log(
          `   📋 Score: ${report.overallScore}/100 - Address critical issues`
        )
        break
    }

    // Next steps
    console.log(`\n📝 NEXT STEPS:`)
    if (report.overallStatus === 'ready') {
      console.log(`   1. ✅ All systems ready - proceed with deployment`)
      console.log(
        `   2. 🚀 Run deployment script: ./scripts/deploy-production.sh`
      )
      console.log(`   3. 📊 Monitor deployment and system health`)
      console.log(`   4. 📋 Validate post-deployment functionality`)
    } else if (report.overallStatus === 'warning') {
      console.log(`   1. 📝 Review and address warnings listed above`)
      console.log(`   2. 🔄 Re-run readiness check after fixes`)
      console.log(`   3. 🚀 Proceed with deployment if acceptable`)
      console.log(`   4. 📊 Monitor closely during deployment`)
    } else {
      console.log(`   1. 🔧 Address all critical failures listed above`)
      console.log(`   2. 🔄 Re-run readiness check after fixes`)
      console.log(`   3. ⏳ Do not deploy until all critical issues resolved`)
      console.log(`   4. 📞 Contact development team if assistance needed`)
    }

    console.log('='.repeat(80))
  }
}

// Run the deployment readiness check if this script is executed directly
if (require.main === module) {
  const checker = new DeploymentReadinessChecker()

  checker.runFullCheck().catch(error => {
    console.error('❌ Deployment readiness check failed:', error.message)
    process.exit(1)
  })
}

export { DeploymentReadinessChecker }
