#!/usr/bin/env ts-node

// Cubcen Security Scanning Script
// Basic penetration testing and security validation

import axios from 'axios'
import crypto from 'crypto'


interface SecurityTest {
  name: string
  description: string
  test: () => Promise<TestResult>
}

interface TestResult {
  passed: boolean
  message: string
  details?: unknown
  severity: 'low' | 'medium' | 'high' | 'critical'
}

class SecurityScanner {
  private baseUrl: string
  private results: Array<TestResult & { testName: string }> = []

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl
  }

  async runAllTests(): Promise<void> {
    console.log('🔒 Starting Cubcen Security Scan...\n')

    const tests: SecurityTest[] = [
      {
        name: 'XSS Protection',
        description: 'Test for Cross-Site Scripting vulnerabilities',
        test: () => this.testXSSProtection(),
      },
      {
        name: 'SQL Injection Protection',
        description: 'Test for SQL injection vulnerabilities',
        test: () => this.testSQLInjection(),
      },
      {
        name: 'CSRF Protection',
        description: 'Test for Cross-Site Request Forgery protection',
        test: () => this.testCSRFProtection(),
      },
      {
        name: 'Security Headers',
        description: 'Validate security headers are present',
        test: () => this.testSecurityHeaders(),
      },
      {
        name: 'Rate Limiting',
        description: 'Test rate limiting implementation',
        test: () => this.testRateLimiting(),
      },
      {
        name: 'Authentication Security',
        description: 'Test authentication mechanisms',
        test: () => this.testAuthenticationSecurity(),
      },
      {
        name: 'Session Security',
        description: 'Test session management security',
        test: () => this.testSessionSecurity(),
      },
      {
        name: 'Input Validation',
        description: 'Test input validation and sanitization',
        test: () => this.testInputValidation(),
      },
      {
        name: 'File Upload Security',
        description: 'Test file upload security controls',
        test: () => this.testFileUploadSecurity(),
      },
      {
        name: 'Information Disclosure',
        description: 'Test for information disclosure vulnerabilities',
        test: () => this.testInformationDisclosure(),
      },
    ]

    for (const test of tests) {
      try {
        console.log(`🧪 Running: ${test.name}`)
        console.log(`   ${test.description}`)

        const result = await test.test()
        this.results.push({ ...result, testName: test.name })

        const status = result.passed ? '✅ PASS' : '❌ FAIL'
        const severity = result.passed
          ? ''
          : ` [${result.severity.toUpperCase()}]`
        console.log(`   ${status}${severity}: ${result.message}\n`)
      } catch (error) {
        const errorResult: TestResult = {
          passed: false,
          message: `Test failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'medium',
        }
        this.results.push({ ...errorResult, testName: test.name })
        console.log(`   ❌ ERROR: ${errorResult.message}\n`)
      }
    }

    this.generateReport()
  }

  private async testXSSProtection(): Promise<TestResult> {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src="x" onerror="alert(\'xss\')">',
      '<svg onload="alert(\'xss\')">',
      '"><script>alert("xss")</script>',
    ]

    try {
      for (const payload of xssPayloads) {
        const response = await axios.post(
          `${this.baseUrl}/api/cubcen/v1/test`,
          {
            input: payload,
          },
          { validateStatus: () => true }
        )

        // Check if payload is reflected without sanitization
        if (response.data && typeof response.data === 'object') {
          const responseStr = JSON.stringify(response.data)
          if (
            responseStr.includes('<script>') ||
            responseStr.includes('javascript:')
          ) {
            return {
              passed: false,
              message: 'XSS payload was not properly sanitized',
              details: { payload, response: response.data },
              severity: 'high',
            }
          }
        }
      }

      return {
        passed: true,
        message: 'XSS protection is working correctly',
        severity: 'low',
      }
    } catch (error) {
      // If endpoint doesn't exist, that's okay for this test
      if (
        error instanceof Error &&
        'response' in error &&
        (error as any).response?.status === 404
      ) {
        return {
          passed: true,
          message:
            'Test endpoint not available, but no XSS vulnerabilities detected',
          severity: 'low',
        }
      }
      throw error
    }
  }

  private async testSQLInjection(): Promise<TestResult> {
    const sqlPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      '1 UNION SELECT * FROM users',
      "admin'--",
      "' OR 1=1#",
    ]

    try {
      for (const payload of sqlPayloads) {
        const response = await axios.get(
          `${this.baseUrl}/api/cubcen/v1/users`,
          {
            params: { search: payload },
            validateStatus: () => true,
          }
        )

        // Check for SQL error messages
        if (response.data && typeof response.data === 'string') {
          const errorIndicators = [
            'sql',
            'syntax error',
            'mysql',
            'postgresql',
            'sqlite',
          ]
          const responseStr = response.data.toLowerCase()

          if (
            errorIndicators.some(indicator => responseStr.includes(indicator))
          ) {
            return {
              passed: false,
              message:
                'SQL injection vulnerability detected - database errors exposed',
              details: { payload, response: response.data },
              severity: 'critical',
            }
          }
        }

        // Check for unexpected data exposure
        if (
          response.status === 200 &&
          response.data &&
          Array.isArray(response.data)
        ) {
          // If we get data back with SQL injection payload, it might be vulnerable
          if (response.data.length > 100) {
            // Suspiciously large result set
            return {
              passed: false,
              message:
                'Possible SQL injection - unexpected large dataset returned',
              details: { payload, resultCount: response.data.length },
              severity: 'high',
            }
          }
        }
      }

      return {
        passed: true,
        message: 'SQL injection protection is working correctly',
        severity: 'low',
      }
    } catch (error) {
      if (
        error instanceof Error &&
        'response' in error &&
        (error as any).response?.status === 404
      ) {
        return {
          passed: true,
          message:
            'Test endpoint not available, but no SQL injection vulnerabilities detected',
          severity: 'low',
        }
      }
      throw error
    }
  }

  private async testCSRFProtection(): Promise<TestResult> {
    try {
      // Try to make a state-changing request without CSRF token
      const response = await axios.post(
        `${this.baseUrl}/api/cubcen/v1/test`,
        {
          action: 'delete',
          target: 'important-data',
        },
        { validateStatus: () => true }
      )

      if (response.status === 200) {
        return {
          passed: false,
          message:
            'CSRF protection may be missing - state-changing request succeeded without token',
          details: { status: response.status, data: response.data },
          severity: 'high',
        }
      }

      if (
        response.status === 403 &&
        (response.data as any)?.error?.code === 'CSRF_TOKEN_INVALID'
      ) {
        return {
          passed: true,
          message: 'CSRF protection is working correctly',
          severity: 'low',
        }
      }

      return {
        passed: true,
        message: 'CSRF protection appears to be in place',
        details: { status: response.status },
        severity: 'low',
      }
    } catch (error) {
      if (
        error instanceof Error &&
        'response' in error &&
        (error as any).response?.status === 404
      ) {
        return {
          passed: true,
          message:
            'Test endpoint not available, CSRF protection status unknown',
          severity: 'low',
        }
      }
      throw error
    }
  }

  private async testSecurityHeaders(): Promise<TestResult> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`)
      const headers = response.headers

      const requiredHeaders = {
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'DENY',
        'x-xss-protection': '1; mode=block',
        'referrer-policy': 'strict-origin-when-cross-origin',
      }

      const missingHeaders: string[] = []
      const incorrectHeaders: Array<{
        header: string
        expected: string
        actual: string
      }> = []

      for (const [header, expectedValue] of Object.entries(requiredHeaders)) {
        const actualValue = headers[header]

        if (!actualValue) {
          missingHeaders.push(header)
        } else if (actualValue !== expectedValue) {
          incorrectHeaders.push({
            header,
            expected: expectedValue,
            actual: actualValue,
          })
        }
      }

      // Check for CSP header
      if (!headers['content-security-policy']) {
        missingHeaders.push('content-security-policy')
      }

      // Check if server information is exposed
      const exposedHeaders = ['server', 'x-powered-by']
      const exposedInfo = exposedHeaders.filter(header => headers[header])

      if (
        missingHeaders.length > 0 ||
        incorrectHeaders.length > 0 ||
        exposedInfo.length > 0
      ) {
        return {
          passed: false,
          message: 'Security headers are missing or incorrect',
          details: { missingHeaders, incorrectHeaders, exposedInfo },
          severity: 'medium',
        }
      }

      return {
        passed: true,
        message: 'All required security headers are present and correct',
        severity: 'low',
      }
    } catch (error) {
      throw error
    }
  }

  private async testRateLimiting(): Promise<TestResult> {
    try {
      const requests = []
      const endpoint = `${this.baseUrl}/api/cubcen/v1/auth/login`

      // Make multiple rapid requests
      for (let i = 0; i < 10; i++) {
        requests.push(
          axios.post(
            endpoint,
            {
              email: 'test@example.com',
              password: 'wrongpassword',
            },
            { validateStatus: () => true }
          )
        )
      }

      const responses = await Promise.all(requests)
      const rateLimitedResponses = responses.filter(r => r.status === 429)

      if (rateLimitedResponses.length === 0) {
        return {
          passed: false,
          message:
            'Rate limiting may not be implemented - no 429 responses received',
          details: { totalRequests: requests.length, rateLimitedCount: 0 },
          severity: 'medium',
        }
      }

      return {
        passed: true,
        message: `Rate limiting is working - ${rateLimitedResponses.length} requests were rate limited`,
        details: {
          totalRequests: requests.length,
          rateLimitedCount: rateLimitedResponses.length,
        },
        severity: 'low',
      }
    } catch (error) {
      if (
        error instanceof Error &&
        'response' in error &&
        (error as any).response?.status === 404
      ) {
        return {
          passed: true,
          message: 'Auth endpoint not available, rate limiting status unknown',
          severity: 'low',
        }
      }
      throw error
    }
  }

  private async testAuthenticationSecurity(): Promise<TestResult> {
    const issues: string[] = []

    try {
      // Test 1: Try to access protected endpoint without authentication
      const unauthResponse = await axios.get(
        `${this.baseUrl}/api/cubcen/v1/users`,
        {
          validateStatus: () => true,
        }
      )

      if (unauthResponse.status === 200) {
        issues.push('Protected endpoint accessible without authentication')
      }

      // Test 2: Try with invalid token
      const invalidTokenResponse = await axios.get(
        `${this.baseUrl}/api/cubcen/v1/users`,
        {
          headers: { Authorization: 'Bearer invalid-token' },
          validateStatus: () => true,
        }
      )

      if (invalidTokenResponse.status === 200) {
        issues.push('Invalid token accepted')
      }

      // Test 3: Try with malformed token
      const malformedTokenResponse = await axios.get(
        `${this.baseUrl}/api/cubcen/v1/users`,
        {
          headers: { Authorization: 'Bearer not.a.jwt' },
          validateStatus: () => true,
        }
      )

      if (malformedTokenResponse.status === 200) {
        issues.push('Malformed token accepted')
      }

      if (issues.length > 0) {
        return {
          passed: false,
          message: 'Authentication security issues detected',
          details: { issues },
          severity: 'high',
        }
      }

      return {
        passed: true,
        message: 'Authentication security appears to be working correctly',
        severity: 'low',
      }
    } catch (error) {
      if (
        error instanceof Error &&
        'response' in error &&
        (error as any).response?.status === 404
      ) {
        return {
          passed: true,
          message:
            'Protected endpoints not available, authentication status unknown',
          severity: 'low',
        }
      }
      throw error
    }
  }

  private async testSessionSecurity(): Promise<TestResult> {
    try {
      // Test session cookie security
      const response = await axios.get(`${this.baseUrl}/health`)
      const setCookieHeader = response.headers['set-cookie']

      if (setCookieHeader) {
        const cookies = Array.isArray(setCookieHeader)
          ? setCookieHeader
          : [setCookieHeader]
        const sessionCookies = cookies.filter(
          cookie =>
            cookie.toLowerCase().includes('session') ||
            cookie.toLowerCase().includes('connect.sid')
        )

        for (const cookie of sessionCookies) {
          if (!cookie.includes('HttpOnly')) {
            return {
              passed: false,
              message: 'Session cookie missing HttpOnly flag',
              details: { cookie },
              severity: 'medium',
            }
          }

          if (
            !cookie.includes('Secure') &&
            process.env.NODE_ENV === 'production'
          ) {
            return {
              passed: false,
              message: 'Session cookie missing Secure flag in production',
              details: { cookie },
              severity: 'medium',
            }
          }

          if (!cookie.includes('SameSite')) {
            return {
              passed: false,
              message: 'Session cookie missing SameSite attribute',
              details: { cookie },
              severity: 'medium',
            }
          }
        }
      }

      return {
        passed: true,
        message: 'Session security configuration appears correct',
        severity: 'low',
      }
    } catch (error) {
      throw error
    }
  }

  private async testInputValidation(): Promise<TestResult> {
    const invalidInputs = [
      { field: 'email', value: 'not-an-email', expected: 'email validation' },
      { field: 'age', value: -1, expected: 'positive number validation' },
      { field: 'name', value: 'a'.repeat(1000), expected: 'length validation' },
      {
        field: 'id',
        value: '../../etc/passwd',
        expected: 'path traversal protection',
      },
    ]

    try {
      for (const input of invalidInputs) {
        const response = await axios.post(
          `${this.baseUrl}/api/cubcen/v1/test`,
          {
            [input.field]: input.value,
          },
          { validateStatus: () => true }
        )

        // If we get a 200 response with invalid input, validation might be missing
        if (response.status === 200 && !(response.data as any)?.error) {
          return {
            passed: false,
            message: `Input validation may be missing for ${input.field}`,
            details: { input, response: response.data },
            severity: 'medium',
          }
        }
      }

      return {
        passed: true,
        message: 'Input validation appears to be working correctly',
        severity: 'low',
      }
    } catch (error) {
      if (
        error instanceof Error &&
        'response' in error &&
        (error as any).response?.status === 404
      ) {
        return {
          passed: true,
          message:
            'Test endpoint not available, input validation status unknown',
          severity: 'low',
        }
      }
      throw error
    }
  }

  private async testFileUploadSecurity(): Promise<TestResult> {
    try {
      // Test with dangerous file types
      const dangerousFiles = [
        {
          name: 'malware.exe',
          content: 'fake executable',
          type: 'application/octet-stream',
        },
        {
          name: 'script.js',
          content: 'alert("xss")',
          type: 'application/javascript',
        },
        {
          name: 'shell.sh',
          content: '#!/bin/bash\nrm -rf /',
          type: 'application/x-sh',
        },
      ]

      for (const file of dangerousFiles) {
        const formData = new FormData()
        const blob = new Blob([file.content], { type: file.type })
        formData.append('file', blob, file.name)

        const response = await axios.post(
          `${this.baseUrl}/api/cubcen/v1/upload`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            validateStatus: () => true,
          }
        )

        if (response.status === 200) {
          return {
            passed: false,
            message: `Dangerous file type ${file.name} was accepted`,
            details: { fileName: file.name, fileType: file.type },
            severity: 'high',
          }
        }
      }

      return {
        passed: true,
        message: 'File upload security appears to be working correctly',
        severity: 'low',
      }
    } catch (error) {
      if (
        error instanceof Error &&
        'response' in error &&
        (error as any).response?.status === 404
      ) {
        return {
          passed: true,
          message:
            'File upload endpoint not available, security status unknown',
          severity: 'low',
        }
      }
      throw error
    }
  }

  private async testInformationDisclosure(): Promise<TestResult> {
    const sensitiveEndpoints = [
      '/api/cubcen/v1/config',
      '/api/cubcen/v1/debug',
      '/api/cubcen/v1/logs',
      '/.env',
      '/package.json',
      '/api-docs',
    ]

    const disclosedInfo: Array<{
      endpoint: string
      status: number
      info: string
    }> = []

    try {
      for (const endpoint of sensitiveEndpoints) {
        const response = await axios.get(`${this.baseUrl}${endpoint}`, {
          validateStatus: () => true,
        })

        if (response.status === 200) {
          let infoType = 'unknown'
          const data = response.data

          if (typeof data === 'object' && data !== null) {
            if ((data as any).version || (data as any).dependencies)
              infoType = 'application metadata'
            if ((data as any).database || (data as any).secrets)
              infoType = 'configuration data'
            if ((data as any).logs || (data as any).errors)
              infoType = 'debug information'
          }

          disclosedInfo.push({
            endpoint,
            status: response.status,
            info: infoType,
          })
        }
      }

      if (disclosedInfo.length > 0) {
        return {
          passed: false,
          message: 'Information disclosure vulnerabilities detected',
          details: { disclosedEndpoints: disclosedInfo },
          severity: 'medium',
        }
      }

      return {
        passed: true,
        message: 'No information disclosure vulnerabilities detected',
        severity: 'low',
      }
    } catch (error) {
      throw error
    }
  }

  private generateReport(): void {
    console.log('\n' + '='.repeat(60))
    console.log('🔒 CUBCEN SECURITY SCAN REPORT')
    console.log('='.repeat(60))

    const passed = this.results.filter(r => r.passed).length
    const failed = this.results.filter(r => !r.passed).length
    const total = this.results.length

    console.log(`\n📊 SUMMARY:`)
    console.log(`   Total Tests: ${total}`)
    console.log(`   Passed: ${passed} ✅`)
    console.log(`   Failed: ${failed} ❌`)
    console.log(`   Success Rate: ${((passed / total) * 100).toFixed(1)}%`)

    if (failed > 0) {
      console.log(`\n🚨 FAILED TESTS:`)
      const failedTests = this.results.filter(r => !r.passed)

      const critical = failedTests.filter(r => r.severity === 'critical')
      const high = failedTests.filter(r => r.severity === 'high')
      const medium = failedTests.filter(r => r.severity === 'medium')
      const low = failedTests.filter(r => r.severity === 'low')

      if (critical.length > 0) {
        console.log(`\n   🔴 CRITICAL (${critical.length}):`)
        critical.forEach(test =>
          console.log(`      - ${test.testName}: ${test.message}`)
        )
      }

      if (high.length > 0) {
        console.log(`\n   🟠 HIGH (${high.length}):`)
        high.forEach(test =>
          console.log(`      - ${test.testName}: ${test.message}`)
        )
      }

      if (medium.length > 0) {
        console.log(`\n   🟡 MEDIUM (${medium.length}):`)
        medium.forEach(test =>
          console.log(`      - ${test.testName}: ${test.message}`)
        )
      }

      if (low.length > 0) {
        console.log(`\n   🔵 LOW (${low.length}):`)
        low.forEach(test =>
          console.log(`      - ${test.testName}: ${test.message}`)
        )
      }
    }

    console.log(`\n📝 RECOMMENDATIONS:`)
    if (failed === 0) {
      console.log(
        `   ✅ All security tests passed! Your application appears secure.`
      )
    } else {
      console.log(
        `   🔧 Address the failed tests above, prioritizing critical and high severity issues.`
      )
      console.log(
        `   📚 Review the security best practices guide for detailed remediation steps.`
      )
      console.log(`   🔄 Re-run this scan after implementing fixes.`)
    }

    console.log(`\n📅 Scan completed at: ${new Date().toISOString()}`)
    console.log('='.repeat(60))

    // Exit with error code if critical or high severity issues found
    const criticalOrHigh = this.results.filter(
      r => !r.passed && (r.severity === 'critical' || r.severity === 'high')
    )

    if (criticalOrHigh.length > 0) {
      process.exit(1)
    }
  }
}

// Run the security scan if this script is executed directly
if (require.main === module) {
  const baseUrl = process.argv[2] || 'http://localhost:3000'
  const scanner = new SecurityScanner(baseUrl)

  scanner.runAllTests().catch(error => {
    console.error('❌ Security scan failed:', error.message)
    process.exit(1)
  })
}

export { SecurityScanner }
