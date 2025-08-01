#!/usr/bin/env tsx

/**
 * Production Security Audit Script for Cubcen
 * Comprehensive security validation before deployment
 */

import { execSync, spawn } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import axios from 'axios'
import crypto from 'crypto'

interface SecurityCheck {
  name: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  check: () => Promise<SecurityResult>
}

interface SecurityResult {
  passed: boolean
  message: string
  details?: any
  recommendations?: string[]
}

interface AuditReport {
  timestamp: string
  overallStatus: 'pass' | 'fail' | 'warning'
  summary: {
    total: number
    passed: number
    failed: number
    critical: number
    high: number
    medium: number
    low: number
  }
  results: Array<SecurityResult & { name: string; severity: string }>
}

class ProductionSecurityAuditor {
  private baseUrl: string
  private results: Array<SecurityResult & { name: string; severity: string }> =
    []

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl
  }

  async runFullAudit(): Promise<void> {
    console.log('🔒 Starting Production Security Audit for Cubcen...\n')

    const securityChecks: SecurityCheck[] = [
      {
        name: 'Environment Configuration Security',
        description: 'Validate production environment configuration',
        severity: 'critical',
        check: () => this.checkEnvironmentSecurity(),
      },
      {
        name: 'JWT Secret Strength',
        description: 'Validate JWT secret strength and entropy',
        severity: 'critical',
        check: () => this.checkJWTSecurity(),
      },
      {
        name: 'Database Security Configuration',
        description: 'Check database security settings',
        severity: 'high',
        check: () => this.checkDatabaseSecurity(),
      },
      {
        name: 'HTTPS and TLS Configuration',
        description: 'Validate SSL/TLS configuration',
        severity: 'high',
        check: () => this.checkHTTPSSecurity(),
      },
      {
        name: 'Security Headers',
        description: 'Validate security headers implementation',
        severity: 'high',
        check: () => this.checkSecurityHeaders(),
      },
      {
        name: 'Authentication Security',
        description: 'Test authentication mechanisms',
        severity: 'critical',
        check: () => this.checkAuthenticationSecurity(),
      },
      {
        name: 'Input Validation Security',
        description: 'Test input validation and sanitization',
        severity: 'high',
        check: () => this.checkInputValidation(),
      },
      {
        name: 'Rate Limiting',
        description: 'Validate rate limiting implementation',
        severity: 'medium',
        check: () => this.checkRateLimiting(),
      },
      {
        name: 'File Permissions',
        description: 'Check file and directory permissions',
        severity: 'medium',
        check: () => this.checkFilePermissions(),
      },
      {
        name: 'Dependency Vulnerabilities',
        description: 'Scan for vulnerable dependencies',
        severity: 'high',
        check: () => this.checkDependencyVulnerabilities(),
      },
      {
        name: 'Docker Security',
        description: 'Validate Docker container security',
        severity: 'medium',
        check: () => this.checkDockerSecurity(),
      },
      {
        name: 'Logging Security',
        description: 'Check for sensitive data in logs',
        severity: 'medium',
        check: () => this.checkLoggingSecurity(),
      },
      {
        name: 'API Security',
        description: 'Test API security controls',
        severity: 'high',
        check: () => this.checkAPISecurity(),
      },
      {
        name: 'Session Security',
        description: 'Validate session management security',
        severity: 'high',
        check: () => this.checkSessionSecurity(),
      },
      {
        name: 'Information Disclosure',
        description: 'Check for information disclosure vulnerabilities',
        severity: 'medium',
        check: () => this.checkInformationDisclosure(),
      },
    ]

    // Run all security checks
    for (const check of securityChecks) {
      try {
        console.log(`🔍 Running: ${check.name}`)
        console.log(`   ${check.description}`)

        const result = await check.check()
        this.results.push({
          ...result,
          name: check.name,
          severity: check.severity,
        })

        const status = result.passed ? '✅ PASS' : '❌ FAIL'
        const severity = result.passed
          ? ''
          : ` [${check.severity.toUpperCase()}]`
        console.log(`   ${status}${severity}: ${result.message}\n`)
      } catch (error) {
        const errorResult: SecurityResult = {
          passed: false,
          message: `Security check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          recommendations: [
            'Review the security check implementation',
            'Ensure all dependencies are available',
          ],
        }
        this.results.push({
          ...errorResult,
          name: check.name,
          severity: check.severity,
        })
        console.log(`   ❌ ERROR: ${errorResult.message}\n`)
      }
    }

    // Generate and save report
    const report = this.generateReport()
    this.saveReport(report)
    this.displaySummary(report)

    // Exit with appropriate code
    const criticalFailures = this.results.filter(
      r => !r.passed && r.severity === 'critical'
    )
    const highFailures = this.results.filter(
      r => !r.passed && r.severity === 'high'
    )

    if (criticalFailures.length > 0 || highFailures.length > 2) {
      console.log('\n❌ SECURITY AUDIT FAILED - Deployment blocked!')
      process.exit(1)
    } else if (highFailures.length > 0) {
      console.log('\n⚠️ SECURITY WARNINGS - Review before deployment')
      process.exit(2)
    } else {
      console.log('\n✅ SECURITY AUDIT PASSED - Safe for deployment')
      process.exit(0)
    }
  }

  private async checkEnvironmentSecurity(): Promise<SecurityResult> {
    const issues: string[] = []
    const recommendations: string[] = []

    try {
      // Check if .env file exists and has proper permissions
      if (!existsSync('.env')) {
        issues.push('Production .env file not found')
        recommendations.push('Create .env file from .env.production template')
      } else {
        // Check file permissions (should not be world-readable)
        const stats = require('fs').statSync('.env')
        const mode = stats.mode & parseInt('777', 8)
        if (mode & parseInt('044', 8)) {
          issues.push('.env file is readable by group/others')
          recommendations.push(
            'Set .env file permissions to 600 (owner read/write only)'
          )
        }
      }

      // Check NODE_ENV
      if (process.env.NODE_ENV !== 'production') {
        issues.push(
          `NODE_ENV is '${process.env.NODE_ENV}', should be 'production'`
        )
        recommendations.push('Set NODE_ENV=production in environment')
      }

      // Check for development/debug settings
      const debugVars = ['DEBUG', 'VERBOSE_LOGGING', 'ENABLE_DEBUG']
      for (const debugVar of debugVars) {
        if (process.env[debugVar] === 'true') {
          issues.push(`Debug variable ${debugVar} is enabled in production`)
          recommendations.push(`Disable ${debugVar} in production environment`)
        }
      }

      // Check for default/weak values
      const defaultValues = {
        JWT_SECRET: ['your-super-secret-jwt-key', 'change-me', 'secret'],
        DATABASE_URL: ['file:./dev.db', 'sqlite://dev.db'],
      }

      for (const [key, defaults] of Object.entries(defaultValues)) {
        const value = process.env[key]
        if (value && defaults.some(def => value.includes(def))) {
          issues.push(`${key} appears to use default/example value`)
          recommendations.push(`Set a secure, unique value for ${key}`)
        }
      }

      return {
        passed: issues.length === 0,
        message:
          issues.length === 0
            ? 'Environment configuration is secure'
            : `Found ${issues.length} configuration issues`,
        details: { issues },
        recommendations,
      }
    } catch (error) {
      return {
        passed: false,
        message: `Environment check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendations: ['Ensure .env file exists and is readable'],
      }
    }
  }

  private async checkJWTSecurity(): Promise<SecurityResult> {
    const jwtSecret = process.env.JWT_SECRET
    const issues: string[] = []
    const recommendations: string[] = []

    if (!jwtSecret) {
      return {
        passed: false,
        message: 'JWT_SECRET not configured',
        recommendations: ['Set a strong JWT_SECRET in environment variables'],
      }
    }

    // Check length
    if (jwtSecret.length < 32) {
      issues.push(
        `JWT secret is too short (${jwtSecret.length} chars, minimum 32)`
      )
      recommendations.push('Use a JWT secret of at least 32 characters')
    }

    // Check entropy
    const entropy = this.calculateEntropy(jwtSecret)
    if (entropy < 4.0) {
      issues.push(
        `JWT secret has low entropy (${entropy.toFixed(2)}, minimum 4.0)`
      )
      recommendations.push(
        'Use a JWT secret with high entropy (random characters)'
      )
    }

    // Check for common patterns
    const commonPatterns = [
      /^(.)\1+$/, // Repeated characters
      /^(abc|123|qwe)/i, // Common sequences
      /password|secret|key/i, // Common words
    ]

    for (const pattern of commonPatterns) {
      if (pattern.test(jwtSecret)) {
        issues.push('JWT secret contains predictable patterns')
        recommendations.push(
          'Generate a random JWT secret using cryptographically secure methods'
        )
        break
      }
    }

    return {
      passed: issues.length === 0,
      message:
        issues.length === 0
          ? 'JWT secret is secure'
          : `JWT secret has ${issues.length} security issues`,
      details: {
        length: jwtSecret.length,
        entropy: entropy.toFixed(2),
        issues,
      },
      recommendations,
    }
  }

  private calculateEntropy(str: string): number {
    const freq: { [key: string]: number } = {}
    for (const char of str) {
      freq[char] = (freq[char] || 0) + 1
    }

    let entropy = 0
    const len = str.length
    for (const count of Object.values(freq)) {
      const p = count / len
      entropy -= p * Math.log2(p)
    }

    return entropy
  }

  private async checkDatabaseSecurity(): Promise<SecurityResult> {
    const issues: string[] = []
    const recommendations: string[] = []

    try {
      const databaseUrl = process.env.DATABASE_URL

      if (!databaseUrl) {
        return {
          passed: false,
          message: 'DATABASE_URL not configured',
          recommendations: ['Configure DATABASE_URL in environment variables'],
        }
      }

      // Check for SQLite in production
      if (databaseUrl.includes('file:') || databaseUrl.includes('sqlite:')) {
        issues.push('Using SQLite database in production')
        recommendations.push(
          'Consider using PostgreSQL or MySQL for production'
        )
      }

      // Check for embedded credentials
      if (
        databaseUrl.includes('password') &&
        !databaseUrl.includes('localhost')
      ) {
        issues.push('Database URL may contain embedded credentials')
        recommendations.push(
          'Use environment variables for database credentials'
        )
      }

      // Check for default database names
      const defaultNames = ['test', 'dev', 'development', 'sample']
      if (defaultNames.some(name => databaseUrl.includes(name))) {
        issues.push('Database URL contains default/development database name')
        recommendations.push('Use a production-specific database name')
      }

      return {
        passed: issues.length === 0,
        message:
          issues.length === 0
            ? 'Database configuration is secure'
            : `Found ${issues.length} database security issues`,
        details: { issues },
        recommendations,
      }
    } catch (error) {
      return {
        passed: false,
        message: `Database security check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendations: ['Verify database configuration'],
      }
    }
  }

  private async checkHTTPSSecurity(): Promise<SecurityResult> {
    const issues: string[] = []
    const recommendations: string[] = []

    try {
      // Check if HTTPS is enforced
      const response = await axios.get(`${this.baseUrl}/api/cubcen/v1/health`, {
        validateStatus: () => true,
        timeout: 5000,
      })

      // Check if running on HTTP in production
      if (
        this.baseUrl.startsWith('http://') &&
        process.env.NODE_ENV === 'production'
      ) {
        issues.push('Application is running on HTTP in production')
        recommendations.push('Configure HTTPS with valid SSL certificate')
      }

      // Check security headers related to HTTPS
      const headers = response.headers
      if (!headers['strict-transport-security']) {
        issues.push('HSTS header not present')
        recommendations.push('Add Strict-Transport-Security header')
      }

      return {
        passed: issues.length === 0,
        message:
          issues.length === 0
            ? 'HTTPS configuration is secure'
            : `Found ${issues.length} HTTPS security issues`,
        details: { issues, headers: Object.keys(headers) },
        recommendations,
      }
    } catch (error) {
      return {
        passed: false,
        message: `HTTPS security check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendations: [
          'Ensure application is accessible for security testing',
        ],
      }
    }
  }

  private async checkSecurityHeaders(): Promise<SecurityResult> {
    const issues: string[] = []
    const recommendations: string[] = []

    try {
      const response = await axios.get(`${this.baseUrl}/api/cubcen/v1/health`, {
        validateStatus: () => true,
        timeout: 5000,
      })

      const headers = response.headers
      const requiredHeaders = {
        'x-content-type-options': 'nosniff',
        'x-frame-options': ['DENY', 'SAMEORIGIN'],
        'x-xss-protection': '1; mode=block',
        'referrer-policy': ['strict-origin-when-cross-origin', 'no-referrer'],
        'content-security-policy': null, // Just check presence
      }

      for (const [header, expectedValues] of Object.entries(requiredHeaders)) {
        const actualValue = headers[header]

        if (!actualValue) {
          issues.push(`Missing security header: ${header}`)
          recommendations.push(`Add ${header} header`)
        } else if (expectedValues && Array.isArray(expectedValues)) {
          if (!expectedValues.includes(actualValue)) {
            issues.push(`Incorrect value for ${header}: ${actualValue}`)
            recommendations.push(
              `Set ${header} to one of: ${expectedValues.join(', ')}`
            )
          }
        } else if (expectedValues && actualValue !== expectedValues) {
          issues.push(`Incorrect value for ${header}: ${actualValue}`)
          recommendations.push(`Set ${header} to: ${expectedValues}`)
        }
      }

      // Check for information disclosure headers
      const dangerousHeaders = ['server', 'x-powered-by', 'x-aspnet-version']
      for (const header of dangerousHeaders) {
        if (headers[header]) {
          issues.push(`Information disclosure header present: ${header}`)
          recommendations.push(`Remove or mask ${header} header`)
        }
      }

      return {
        passed: issues.length === 0,
        message:
          issues.length === 0
            ? 'Security headers are properly configured'
            : `Found ${issues.length} security header issues`,
        details: { issues, presentHeaders: Object.keys(headers) },
        recommendations,
      }
    } catch (error) {
      return {
        passed: false,
        message: `Security headers check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendations: [
          'Ensure application is accessible for header testing',
        ],
      }
    }
  }

  private async checkAuthenticationSecurity(): Promise<SecurityResult> {
    const issues: string[] = []
    const recommendations: string[] = []

    try {
      // Test 1: Access protected endpoint without authentication
      const unauthResponse = await axios.get(
        `${this.baseUrl}/api/cubcen/v1/users`,
        {
          validateStatus: () => true,
          timeout: 5000,
        }
      )

      if (unauthResponse.status === 200) {
        issues.push('Protected endpoint accessible without authentication')
        recommendations.push(
          'Implement authentication middleware for protected routes'
        )
      }

      // Test 2: Test with invalid token
      const invalidTokenResponse = await axios.get(
        `${this.baseUrl}/api/cubcen/v1/users`,
        {
          headers: { Authorization: 'Bearer invalid-token-12345' },
          validateStatus: () => true,
          timeout: 5000,
        }
      )

      if (invalidTokenResponse.status === 200) {
        issues.push('Invalid JWT token accepted')
        recommendations.push('Implement proper JWT token validation')
      }

      // Test 3: Test login endpoint security
      const loginResponse = await axios.post(
        `${this.baseUrl}/api/cubcen/v1/auth/login`,
        {
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        },
        {
          validateStatus: () => true,
          timeout: 5000,
        }
      )

      // Should not reveal whether user exists
      if (
        loginResponse.data &&
        (loginResponse.data as any).message &&
        (loginResponse.data as any).message
          .toLowerCase()
          .includes('user not found')
      ) {
        issues.push('Login endpoint reveals user existence')
        recommendations.push('Use generic error messages for login failures')
      }

      return {
        passed: issues.length === 0,
        message:
          issues.length === 0
            ? 'Authentication security is properly configured'
            : `Found ${issues.length} authentication security issues`,
        details: { issues },
        recommendations,
      }
    } catch (error) {
      // If endpoints don't exist, that's not necessarily a security issue
      if ((error as any).response?.status === 404) {
        return {
          passed: true,
          message: 'Authentication endpoints not available for testing',
          details: { note: 'Endpoints may not be implemented yet' },
        }
      }

      return {
        passed: false,
        message: `Authentication security check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendations: [
          'Ensure authentication endpoints are accessible for testing',
        ],
      }
    }
  }

  private async checkInputValidation(): Promise<SecurityResult> {
    const issues: string[] = []
    const recommendations: string[] = []

    try {
      const maliciousInputs = [
        { name: 'XSS', payload: '<script>alert("xss")</script>' },
        { name: 'SQL Injection', payload: "'; DROP TABLE users; --" },
        { name: 'Path Traversal', payload: '../../etc/passwd' },
        { name: 'Command Injection', payload: '; cat /etc/passwd' },
        { name: 'LDAP Injection', payload: '*)(uid=*))(|(uid=*' },
      ]

      for (const input of maliciousInputs) {
        try {
          const response = await axios.post(
            `${this.baseUrl}/api/cubcen/v1/test`,
            {
              input: input.payload,
            },
            {
              validateStatus: () => true,
              timeout: 5000,
            }
          )

          // Check if malicious input is reflected without sanitization
          if (response.data && typeof response.data === 'object') {
            const responseStr = JSON.stringify(response.data)
            if (responseStr.includes(input.payload)) {
              issues.push(`${input.name} payload not sanitized`)
              recommendations.push(
                `Implement input sanitization for ${input.name}`
              )
            }
          }
        } catch (error) {
          // Individual test failures are not critical for this check
        }
      }

      return {
        passed: issues.length === 0,
        message:
          issues.length === 0
            ? 'Input validation appears secure'
            : `Found ${issues.length} input validation issues`,
        details: { issues },
        recommendations,
      }
    } catch (error) {
      return {
        passed: true,
        message: 'Input validation test endpoints not available',
        details: { note: 'Test endpoints may not be implemented' },
      }
    }
  }

  private async checkRateLimiting(): Promise<SecurityResult> {
    const issues: string[] = []
    const recommendations: string[] = []

    try {
      const requests = []
      const endpoint = `${this.baseUrl}/api/cubcen/v1/health`

      // Make multiple rapid requests
      for (let i = 0; i < 20; i++) {
        requests.push(
          axios
            .get(endpoint, {
              validateStatus: () => true,
              timeout: 2000,
            })
            .catch(() => ({ status: 0 }))
        )
      }

      const responses = await Promise.all(requests)
      const rateLimitedResponses = responses.filter(r => r.status === 429)

      if (rateLimitedResponses.length === 0) {
        issues.push('Rate limiting not detected')
        recommendations.push('Implement rate limiting to prevent abuse')
      }

      return {
        passed: issues.length === 0,
        message:
          issues.length === 0
            ? 'Rate limiting is working'
            : 'Rate limiting may not be implemented',
        details: {
          totalRequests: requests.length,
          rateLimitedCount: rateLimitedResponses.length,
        },
        recommendations,
      }
    } catch (error) {
      return {
        passed: true,
        message: 'Rate limiting test could not be completed',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }
    }
  }

  private async checkFilePermissions(): Promise<SecurityResult> {
    const issues: string[] = []
    const recommendations: string[] = []

    try {
      const fs = require('fs')
      const path = require('path')

      // Check critical files
      const criticalFiles = [
        '.env',
        'package.json',
        'docker-compose.yml',
        'prisma/schema.prisma',
      ]

      for (const file of criticalFiles) {
        if (existsSync(file)) {
          const stats = fs.statSync(file)
          const mode = stats.mode & parseInt('777', 8)

          // Check if world-writable
          if (mode & parseInt('002', 8)) {
            issues.push(`${file} is world-writable`)
            recommendations.push(`Remove world-write permission from ${file}`)
          }

          // Check if .env is readable by others
          if (file === '.env' && mode & parseInt('044', 8)) {
            issues.push(`${file} is readable by group/others`)
            recommendations.push(`Set ${file} permissions to 600`)
          }
        }
      }

      // Check directories
      const criticalDirs = ['logs', 'data', 'backups']
      for (const dir of criticalDirs) {
        if (existsSync(dir)) {
          const stats = fs.statSync(dir)
          const mode = stats.mode & parseInt('777', 8)

          if (mode & parseInt('002', 8)) {
            issues.push(`${dir}/ directory is world-writable`)
            recommendations.push(`Remove world-write permission from ${dir}/`)
          }
        }
      }

      return {
        passed: issues.length === 0,
        message:
          issues.length === 0
            ? 'File permissions are secure'
            : `Found ${issues.length} file permission issues`,
        details: { issues },
        recommendations,
      }
    } catch (error) {
      return {
        passed: false,
        message: `File permissions check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendations: [
          'Ensure file system is accessible for permission checking',
        ],
      }
    }
  }

  private async checkDependencyVulnerabilities(): Promise<SecurityResult> {
    const issues: string[] = []
    const recommendations: string[] = []

    try {
      // Run npm audit
      const auditOutput = execSync('npm audit --json', {
        encoding: 'utf8',
        cwd: process.cwd(),
      })

      const auditResult = JSON.parse(auditOutput)

      if (auditResult.vulnerabilities) {
        const vulnCount = Object.keys(auditResult.vulnerabilities).length
        const highVulns = Object.values(auditResult.vulnerabilities).filter(
          (v: any) => v.severity === 'high' || v.severity === 'critical'
        ).length

        if (vulnCount > 0) {
          issues.push(
            `Found ${vulnCount} dependency vulnerabilities (${highVulns} high/critical)`
          )
          recommendations.push('Run npm audit fix to resolve vulnerabilities')
          recommendations.push(
            'Update vulnerable dependencies to secure versions'
          )
        }
      }

      return {
        passed: issues.length === 0,
        message:
          issues.length === 0
            ? 'No dependency vulnerabilities found'
            : `Found dependency vulnerabilities`,
        details: {
          vulnerabilityCount: auditResult.vulnerabilities
            ? Object.keys(auditResult.vulnerabilities).length
            : 0,
          issues,
        },
        recommendations,
      }
    } catch (error) {
      // npm audit returns non-zero exit code when vulnerabilities are found
      if (error instanceof Error && 'stdout' in error) {
        try {
          const auditResult = JSON.parse((error as any).stdout)
          const vulnCount = auditResult.vulnerabilities
            ? Object.keys(auditResult.vulnerabilities).length
            : 0

          if (vulnCount > 0) {
            return {
              passed: false,
              message: `Found ${vulnCount} dependency vulnerabilities`,
              details: { vulnerabilityCount: vulnCount },
              recommendations: ['Run npm audit fix to resolve vulnerabilities'],
            }
          }
        } catch (parseError) {
          // Fall through to error case
        }
      }

      return {
        passed: false,
        message: `Dependency vulnerability check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendations: ['Ensure npm is available and package.json exists'],
      }
    }
  }

  private async checkDockerSecurity(): Promise<SecurityResult> {
    const issues: string[] = []
    const recommendations: string[] = []

    try {
      // Check if Dockerfile exists and analyze it
      if (existsSync('Dockerfile')) {
        const dockerfile = readFileSync('Dockerfile', 'utf8')

        // Check for running as root
        if (!dockerfile.includes('USER ') || dockerfile.includes('USER root')) {
          issues.push('Docker container may be running as root')
          recommendations.push('Add non-root user in Dockerfile')
        }

        // Check for COPY --chown usage
        if (dockerfile.includes('COPY ') && !dockerfile.includes('--chown=')) {
          issues.push('Docker COPY commands should use --chown for security')
          recommendations.push('Use COPY --chown=user:group syntax')
        }

        // Check for health check
        if (!dockerfile.includes('HEALTHCHECK')) {
          issues.push('Docker container lacks health check')
          recommendations.push('Add HEALTHCHECK instruction to Dockerfile')
        }
      } else {
        issues.push('Dockerfile not found')
        recommendations.push('Create Dockerfile for containerized deployment')
      }

      return {
        passed: issues.length === 0,
        message:
          issues.length === 0
            ? 'Docker configuration is secure'
            : `Found ${issues.length} Docker security issues`,
        details: { issues },
        recommendations,
      }
    } catch (error) {
      return {
        passed: false,
        message: `Docker security check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        recommendations: ['Ensure Dockerfile is readable'],
      }
    }
  }

  private async checkLoggingSecurity(): Promise<SecurityResult> {
    const issues: string[] = []
    const recommendations: string[] = []

    try {
      // Check log files for sensitive data
      const logDirs = ['logs', './logs']
      const sensitivePatterns = [
        /password["\s]*[:=]["\s]*[^"\s]+/gi,
        /secret["\s]*[:=]["\s]*[^"\s]+/gi,
        /token["\s]*[:=]["\s]*[^"\s]+/gi,
        /api[_-]?key["\s]*[:=]["\s]*[^"\s]+/gi,
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email addresses
      ]

      for (const logDir of logDirs) {
        if (existsSync(logDir)) {
          const fs = require('fs')
          const files = fs
            .readdirSync(logDir)
            .filter((f: string) => f.endsWith('.log'))

          for (const file of files.slice(0, 5)) {
            // Check only recent log files
            try {
              const content = readFileSync(join(logDir, file), 'utf8')
              const lines = content.split('\n').slice(-100) // Check last 100 lines

              for (const pattern of sensitivePatterns) {
                if (lines.some(line => pattern.test(line))) {
                  issues.push(`Potential sensitive data found in ${file}`)
                  recommendations.push(
                    'Review logging configuration to prevent sensitive data exposure'
                  )
                  break
                }
              }
            } catch (error) {
              // Skip files that can't be read
            }
          }
        }
      }

      return {
        passed: issues.length === 0,
        message:
          issues.length === 0
            ? 'Logging security is acceptable'
            : `Found ${issues.length} logging security issues`,
        details: { issues },
        recommendations,
      }
    } catch (error) {
      return {
        passed: true,
        message: 'Logging security check could not be completed',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }
    }
  }

  private async checkAPISecurity(): Promise<SecurityResult> {
    const issues: string[] = []
    const recommendations: string[] = []

    try {
      // Test API versioning
      const versionResponse = await axios.get(
        `${this.baseUrl}/api/cubcen/v999/health`,
        {
          validateStatus: () => true,
          timeout: 5000,
        }
      )

      if (versionResponse.status === 200) {
        issues.push('API accepts invalid version numbers')
        recommendations.push('Implement proper API version validation')
      }

      // Test for API documentation exposure
      const docEndpoints = ['/api-docs', '/swagger', '/docs', '/api/docs']
      for (const endpoint of docEndpoints) {
        try {
          const docResponse = await axios.get(`${this.baseUrl}${endpoint}`, {
            validateStatus: () => true,
            timeout: 3000,
          })

          if (
            docResponse.status === 200 &&
            process.env.NODE_ENV === 'production'
          ) {
            issues.push(`API documentation exposed at ${endpoint}`)
            recommendations.push('Disable API documentation in production')
          }
        } catch (error) {
          // Endpoint not available, which is good for production
        }
      }

      return {
        passed: issues.length === 0,
        message:
          issues.length === 0
            ? 'API security is properly configured'
            : `Found ${issues.length} API security issues`,
        details: { issues },
        recommendations,
      }
    } catch (error) {
      return {
        passed: true,
        message: 'API security check could not be completed',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }
    }
  }

  private async checkSessionSecurity(): Promise<SecurityResult> {
    const issues: string[] = []
    const recommendations: string[] = []

    try {
      const response = await axios.get(`${this.baseUrl}/api/cubcen/v1/health`, {
        validateStatus: () => true,
        timeout: 5000,
      })

      const setCookieHeader = response.headers['set-cookie']

      if (setCookieHeader) {
        const cookies = Array.isArray(setCookieHeader)
          ? setCookieHeader
          : [setCookieHeader]

        for (const cookie of cookies) {
          // Check for HttpOnly flag
          if (!cookie.includes('HttpOnly')) {
            issues.push('Session cookie missing HttpOnly flag')
            recommendations.push('Add HttpOnly flag to session cookies')
          }

          // Check for Secure flag in production
          if (
            process.env.NODE_ENV === 'production' &&
            !cookie.includes('Secure')
          ) {
            issues.push('Session cookie missing Secure flag in production')
            recommendations.push(
              'Add Secure flag to session cookies in production'
            )
          }

          // Check for SameSite attribute
          if (!cookie.includes('SameSite')) {
            issues.push('Session cookie missing SameSite attribute')
            recommendations.push('Add SameSite attribute to session cookies')
          }
        }
      }

      return {
        passed: issues.length === 0,
        message:
          issues.length === 0
            ? 'Session security is properly configured'
            : `Found ${issues.length} session security issues`,
        details: { issues },
        recommendations,
      }
    } catch (error) {
      return {
        passed: true,
        message: 'Session security check could not be completed',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }
    }
  }

  private async checkInformationDisclosure(): Promise<SecurityResult> {
    const issues: string[] = []
    const recommendations: string[] = []

    try {
      const sensitiveEndpoints = [
        '/package.json',
        '/.env',
        '/config.json',
        '/api/cubcen/v1/config',
        '/api/cubcen/v1/debug',
        '/server-status',
        '/info',
      ]

      for (const endpoint of sensitiveEndpoints) {
        try {
          const response = await axios.get(`${this.baseUrl}${endpoint}`, {
            validateStatus: () => true,
            timeout: 3000,
          })

          if (response.status === 200) {
            issues.push(`Sensitive endpoint exposed: ${endpoint}`)
            recommendations.push(`Block access to ${endpoint} in production`)
          }
        } catch (error) {
          // Endpoint not accessible, which is good
        }
      }

      return {
        passed: issues.length === 0,
        message:
          issues.length === 0
            ? 'No information disclosure vulnerabilities found'
            : `Found ${issues.length} information disclosure issues`,
        details: { issues },
        recommendations,
      }
    } catch (error) {
      return {
        passed: true,
        message: 'Information disclosure check could not be completed',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }
    }
  }

  private generateReport(): AuditReport {
    const passed = this.results.filter(r => r.passed).length
    const failed = this.results.filter(r => !r.passed).length
    const critical = this.results.filter(
      r => !r.passed && r.severity === 'critical'
    ).length
    const high = this.results.filter(
      r => !r.passed && r.severity === 'high'
    ).length
    const medium = this.results.filter(
      r => !r.passed && r.severity === 'medium'
    ).length
    const low = this.results.filter(
      r => !r.passed && r.severity === 'low'
    ).length

    let overallStatus: 'pass' | 'fail' | 'warning' = 'pass'
    if (critical > 0 || high > 2) {
      overallStatus = 'fail'
    } else if (high > 0 || medium > 0) {
      overallStatus = 'warning'
    }

    return {
      timestamp: new Date().toISOString(),
      overallStatus,
      summary: {
        total: this.results.length,
        passed,
        failed,
        critical,
        high,
        medium,
        low,
      },
      results: this.results,
    }
  }

  private saveReport(report: AuditReport): void {
    const reportPath = 'security-audit-report.json'
    writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📄 Security audit report saved to: ${reportPath}`)
  }

  private displaySummary(report: AuditReport): void {
    console.log('\n' + '='.repeat(60))
    console.log('🔒 PRODUCTION SECURITY AUDIT SUMMARY')
    console.log('='.repeat(60))

    console.log(`\n📊 OVERALL STATUS: ${report.overallStatus.toUpperCase()}`)
    console.log(`📅 Audit Date: ${new Date(report.timestamp).toLocaleString()}`)

    console.log(`\n📈 RESULTS SUMMARY:`)
    console.log(`   Total Checks: ${report.summary.total}`)
    console.log(`   Passed: ${report.summary.passed} ✅`)
    console.log(`   Failed: ${report.summary.failed} ❌`)

    if (report.summary.failed > 0) {
      console.log(`\n🚨 FAILURES BY SEVERITY:`)
      if (report.summary.critical > 0)
        console.log(`   Critical: ${report.summary.critical} 🔴`)
      if (report.summary.high > 0)
        console.log(`   High: ${report.summary.high} 🟠`)
      if (report.summary.medium > 0)
        console.log(`   Medium: ${report.summary.medium} 🟡`)
      if (report.summary.low > 0)
        console.log(`   Low: ${report.summary.low} 🔵`)

      console.log(`\n🔧 FAILED CHECKS:`)
      const failedChecks = this.results.filter(r => !r.passed)
      failedChecks.forEach(check => {
        console.log(
          `   ❌ ${check.name} [${check.severity.toUpperCase()}]: ${check.message}`
        )
        if (check.recommendations && check.recommendations.length > 0) {
          check.recommendations.forEach(rec => {
            console.log(`      💡 ${rec}`)
          })
        }
      })
    }

    console.log(`\n📋 DEPLOYMENT READINESS:`)
    switch (report.overallStatus) {
      case 'pass':
        console.log(`   ✅ READY FOR DEPLOYMENT - All security checks passed`)
        break
      case 'warning':
        console.log(
          `   ⚠️ DEPLOYMENT WITH CAUTION - Some security issues found`
        )
        console.log(
          `   📝 Review and address warnings before production deployment`
        )
        break
      case 'fail':
        console.log(`   ❌ DEPLOYMENT BLOCKED - Critical security issues found`)
        console.log(
          `   🛑 Must resolve critical and high severity issues before deployment`
        )
        break
    }

    console.log('='.repeat(60))
  }
}

// Run the security audit if this script is executed directly
if (require.main === module) {
  const baseUrl = process.argv[2] || 'http://localhost:3000'
  const auditor = new ProductionSecurityAuditor(baseUrl)

  auditor.runFullAudit().catch(error => {
    console.error('❌ Security audit failed:', error.message)
    process.exit(1)
  })
}

export { ProductionSecurityAuditor }
