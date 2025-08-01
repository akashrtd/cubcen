#!/usr/bin/env tsx

/**
 * Validate Testing Setup Script
 * Ensures testing infrastructure is properly configured
 */

import { execSync } from 'child_process'
import { existsSync, writeFileSync, mkdirSync } from 'fs'

class TestingSetupValidator {
  async validateSetup(): Promise<void> {
    console.log('🧪 Validating Testing Setup for Cubcen')
    console.log('='.repeat(50))

    const validations = [
      { name: 'Test Environment', test: () => this.validateTestEnvironment() },
      { name: 'Database Setup', test: () => this.validateTestDatabase() },
      { name: 'Jest Configuration', test: () => this.validateJestConfig() },
      {
        name: 'Test Dependencies',
        test: () => this.validateTestDependencies(),
      },
    ]

    let allPassed = true

    for (const validation of validations) {
      try {
        console.log(`🔍 ${validation.name}...`)
        const passed = await validation.test()
        console.log(
          `   ${passed ? '✅' : '❌'} ${passed ? 'Valid' : 'Issues found'}`
        )
        if (!passed) allPassed = false
      } catch (error) {
        console.log(
          `   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
        allPassed = false
      }
      console.log('')
    }

    if (allPassed) {
      console.log('🎉 TESTING SETUP VALIDATED!')
      console.log('✅ All testing components are properly configured')
    } else {
      console.log('⚠️ TESTING SETUP HAS ISSUES')
      console.log('🔧 Some components need attention')
    }
  }

  private async validateTestEnvironment(): Promise<boolean> {
    // Create test directories
    const testDirs = ['e2e/temp', 'test-results', 'coverage']
    testDirs.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
    })

    // Set test environment variables
    process.env.DATABASE_URL = 'file:./e2e/temp/test.db'
    process.env.JWT_SECRET = 'test-jwt-secret-for-testing-purposes-min-32-chars'

    return true
  }

  private async validateTestDatabase(): Promise<boolean> {
    try {
      // Generate Prisma client for testing
      execSync('npx prisma generate', { stdio: 'pipe' })

      // Setup test database
      execSync('npx prisma migrate deploy', {
        stdio: 'pipe',
        env: { ...process.env, DATABASE_URL: 'file:./e2e/temp/test.db' },
      })

      return true
    } catch (error) {
      console.log(`   Test database setup failed: ${error}`)
      return false
    }
  }

  private async validateJestConfig(): Promise<boolean> {
    const jestFiles = [
      'jest.config.js',
      'jest.backend.config.js',
      'jest.e2e.config.js',
    ]

    const missingFiles = jestFiles.filter(file => !existsSync(file))

    if (missingFiles.length > 0) {
      console.log(`   Missing Jest config files: ${missingFiles.join(', ')}`)
      return false
    }

    return true
  }

  private async validateTestDependencies(): Promise<boolean> {
    try {
      // Check if test dependencies are installed
      execSync('npm list jest', { stdio: 'pipe' })
      execSync('npm list @testing-library/react', { stdio: 'pipe' })
      execSync('npm list supertest', { stdio: 'pipe' })

      return true
    } catch (error) {
      console.log('   Some test dependencies may be missing')
      return false
    }
  }
}

// Run the testing setup validation
if (require.main === module) {
  const validator = new TestingSetupValidator()
  validator.validateSetup().catch(error => {
    console.error('💥 Testing setup validation failed:', error)
    process.exit(1)
  })
}

export { TestingSetupValidator }
