#!/usr/bin/env tsx

/**
 * Test Deployment Setup Script
 * Validates essential deployment components without strict quality gates
 */

import { execSync } from 'child_process'
import { existsSync, writeFileSync, mkdirSync } from 'fs'

class TestDeploymentSetup {
  async validateDeployment(): Promise<void> {
    console.log('🚀 Testing Deployment Setup for Cubcen')
    console.log('='.repeat(50))
    console.log('Validating essential deployment components...\n')

    const validations = [
      {
        name: 'Environment Configuration',
        test: () => this.validateEnvironment(),
      },
      { name: 'Database Setup', test: () => this.validateDatabase() },
      { name: 'Essential Files', test: () => this.validateEssentialFiles() },
      { name: 'Docker Configuration', test: () => this.validateDocker() },
      { name: 'Health Endpoints', test: () => this.validateHealthEndpoints() },
      { name: 'Documentation', test: () => this.validateDocumentation() },
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
      console.log('🎉 DEPLOYMENT VALIDATION PASSED!')
      console.log('✅ Essential components are ready for deployment')
      console.log('\n📋 Next Steps:')
      console.log('1. Run production deployment script')
      console.log('2. Monitor application startup')
      console.log('3. Validate health endpoints')
      console.log('4. Test core functionality')
    } else {
      console.log('⚠️ DEPLOYMENT VALIDATION HAD ISSUES')
      console.log(
        '🔧 Some components need attention but deployment may still be possible'
      )
      console.log('\n📋 Recommended Actions:')
      console.log('1. Review failed validations above')
      console.log('2. Fix critical issues if any')
      console.log('3. Proceed with caution if only minor issues')
    }
  }

  private async validateEnvironment(): Promise<boolean> {
    // Check if .env exists
    if (!existsSync('.env')) {
      console.log('   Creating .env file from template...')
      const envContent = `NODE_ENV=production
DATABASE_URL=file:./data/cubcen.db
JWT_SECRET=secure-jwt-secret-for-deployment-testing-min-32-characters-long
PORT=3000
HOST=0.0.0.0
`
      writeFileSync('.env', envContent)
    }

    // Check essential environment variables
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET']
    const missingVars = requiredVars.filter(varName => {
      const value = process.env[varName]
      return !value || value.includes('change-me') || value.includes('your-')
    })

    if (missingVars.length > 0) {
      console.log(`   Missing or default values: ${missingVars.join(', ')}`)
      return false
    }

    return true
  }

  private async validateDatabase(): Promise<boolean> {
    try {
      // Ensure data directory exists
      if (!existsSync('data')) {
        mkdirSync('data', { recursive: true })
      }

      // Generate Prisma client
      execSync('npx prisma generate', { stdio: 'pipe' })

      // Run migrations
      execSync('npx prisma migrate deploy', { stdio: 'pipe' })

      return true
    } catch (error) {
      console.log(`   Database setup failed: ${error}`)
      return false
    }
  }

  private async validateEssentialFiles(): Promise<boolean> {
    const essentialFiles = [
      'package.json',
      'prisma/schema.prisma',
      'src/server.ts',
      'src/index.ts',
      'Dockerfile',
      'docker-compose.yml',
    ]

    const missingFiles = essentialFiles.filter(file => !existsSync(file))

    if (missingFiles.length > 0) {
      console.log(`   Missing files: ${missingFiles.join(', ')}`)
      return false
    }

    return true
  }

  private async validateDocker(): Promise<boolean> {
    if (!existsSync('Dockerfile')) {
      console.log('   Dockerfile not found')
      return false
    }

    if (!existsSync('docker-compose.yml')) {
      console.log('   docker-compose.yml not found')
      return false
    }

    return true
  }

  private async validateHealthEndpoints(): Promise<boolean> {
    const healthFiles = ['src/backend/routes/health.ts', 'src/lib/health.ts']

    const existingFiles = healthFiles.filter(file => existsSync(file))

    if (existingFiles.length === 0) {
      console.log('   No health check files found')
      return false
    }

    return true
  }

  private async validateDocumentation(): Promise<boolean> {
    const docFiles = ['README.md', 'docs/user-guide.md', 'docs/deployment.md']

    const existingDocs = docFiles.filter(file => existsSync(file))

    if (existingDocs.length < 2) {
      console.log(
        `   Limited documentation: ${existingDocs.length}/3 files found`
      )
      return false
    }

    return true
  }
}

// Run the test deployment setup
if (require.main === module) {
  const setup = new TestDeploymentSetup()
  setup.validateDeployment().catch(error => {
    console.error('💥 Deployment validation failed:', error)
    process.exit(1)
  })
}

export { TestDeploymentSetup }
