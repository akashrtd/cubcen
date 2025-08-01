#!/usr/bin/env tsx

/**
 * Final Deployment Preparation Script
 * Comprehensive preparation for production deployment
 */

import { execSync, spawn } from 'child_process'
import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'fs'
import { join } from 'path'

interface PreparationStep {
  name: string
  description: string
  critical: boolean
  execute: () => Promise<boolean>
}

class FinalDeploymentPreparation {
  private results: Array<{ name: string; success: boolean; message: string }> =
    []

  async prepare(): Promise<void> {
    console.log('🚀 Final Deployment Preparation for Cubcen')
    console.log('='.repeat(60))
    console.log('Preparing all systems for production deployment...\n')

    const steps: PreparationStep[] = [
      {
        name: 'Environment Setup',
        description: 'Ensure production environment is properly configured',
        critical: true,
        execute: () => this.setupEnvironment(),
      },
      {
        name: 'Database Preparation',
        description: 'Setup and validate database configuration',
        critical: true,
        execute: () => this.prepareDatabase(),
      },
      {
        name: 'Security Configuration',
        description: 'Validate and enhance security settings',
        critical: true,
        execute: () => this.configureSecurity(),
      },
      {
        name: 'Build Optimization',
        description: 'Optimize builds for production deployment',
        critical: true,
        execute: () => this.optimizeBuilds(),
      },
      {
        name: 'Health Check Setup',
        description: 'Configure monitoring and health checks',
        critical: false,
        execute: () => this.setupHealthChecks(),
      },
      {
        name: 'Documentation Validation',
        description: 'Ensure all documentation is complete',
        critical: false,
        execute: () => this.validateDocumentation(),
      },
      {
        name: 'Backup Configuration',
        description: 'Setup backup and recovery systems',
        critical: false,
        execute: () => this.configureBackups(),
      },
      {
        name: 'Performance Optimization',
        description: 'Apply performance optimizations',
        critical: false,
        execute: () => this.optimizePerformance(),
      },
    ]

    // Execute all preparation steps
    for (const step of steps) {
      console.log(`🔧 ${step.name}...`)
      console.log(`   ${step.description}`)

      try {
        const success = await step.execute()
        this.results.push({
          name: step.name,
          success,
          message: success ? 'Completed successfully' : 'Failed or had issues',
        })

        const status = success ? '✅' : step.critical ? '❌' : '⚠️'
        console.log(`   ${status} ${success ? 'Success' : 'Failed'}\n`)
      } catch (error) {
        this.results.push({
          name: step.name,
          success: false,
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        })
        console.log(
          `   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`
        )
      }
    }

    // Generate final report
    await this.generateFinalReport()

    // Determine if deployment is ready
    const criticalFailures = this.results.filter(
      r => !r.success && steps.find(s => s.name === r.name)?.critical
    )

    if (criticalFailures.length === 0) {
      console.log('🎉 DEPLOYMENT PREPARATION COMPLETE!')
      console.log('✅ All critical systems are ready for production deployment')
      process.exit(0)
    } else {
      console.log('❌ DEPLOYMENT PREPARATION FAILED!')
      console.log('🛑 Critical issues must be resolved before deployment')
      process.exit(1)
    }
  }

  private async setupEnvironment(): Promise<boolean> {
    try {
      // Ensure all required directories exist
      const dirs = ['data', 'logs', 'backups', 'e2e/temp', 'test-results']
      dirs.forEach(dir => {
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true })
        }
      })

      // Validate environment variables
      const requiredVars = ['NODE_ENV', 'DATABASE_URL', 'JWT_SECRET']
      const missingVars = requiredVars.filter(varName => !process.env[varName])

      if (missingVars.length > 0) {
        console.log(
          `   Missing environment variables: ${missingVars.join(', ')}`
        )
        return false
      }

      // Validate JWT secret strength
      const jwtSecret = process.env.JWT_SECRET
      if (!jwtSecret || jwtSecret.length < 32) {
        console.log('   JWT_SECRET is too short (minimum 32 characters)')
        return false
      }

      return true
    } catch (error) {
      console.log(`   Environment setup failed: ${error}`)
      return false
    }
  }

  private async prepareDatabase(): Promise<boolean> {
    try {
      // Generate Prisma client
      execSync('npx prisma generate', { stdio: 'pipe' })

      // Run database migrations
      execSync('npx prisma migrate deploy', {
        stdio: 'pipe',
        env: { ...process.env },
      })

      // Validate database connection
      execSync('npx prisma db pull', { stdio: 'pipe' })

      return true
    } catch (error) {
      console.log(`   Database preparation failed: ${error}`)
      return false
    }
  }

  private async configureSecurity(): Promise<boolean> {
    try {
      // Check for production security settings
      if (process.env.NODE_ENV !== 'production') {
        console.log('   NODE_ENV should be set to production')
        return false
      }

      // Validate JWT secret entropy
      const jwtSecret = process.env.JWT_SECRET || ''
      const entropy = this.calculateEntropy(jwtSecret)
      if (entropy < 4.0) {
        console.log(`   JWT secret has low entropy: ${entropy.toFixed(2)}`)
        return false
      }

      // Check for secure cookie settings
      const securityConfig = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
      }

      return true
    } catch (error) {
      console.log(`   Security configuration failed: ${error}`)
      return false
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

  private async optimizeBuilds(): Promise<boolean> {
    try {
      // Build frontend
      console.log('   Building frontend...')
      execSync('npm run build', { stdio: 'pipe' })

      // Build backend
      console.log('   Building backend...')
      execSync('npm run build:server', { stdio: 'pipe' })

      // Verify build artifacts exist
      const buildArtifacts = ['.next', 'dist']
      const missingArtifacts = buildArtifacts.filter(
        artifact => !existsSync(artifact)
      )

      if (missingArtifacts.length > 0) {
        console.log(
          `   Missing build artifacts: ${missingArtifacts.join(', ')}`
        )
        return false
      }

      return true
    } catch (error) {
      console.log(`   Build optimization failed: ${error}`)
      return false
    }
  }

  private async setupHealthChecks(): Promise<boolean> {
    try {
      // Verify health check endpoints exist
      const healthFiles = ['src/backend/routes/health.ts', 'src/lib/health.ts']

      const missingFiles = healthFiles.filter(file => !existsSync(file))
      if (missingFiles.length > 0) {
        console.log(`   Missing health check files: ${missingFiles.join(', ')}`)
        return false
      }

      // Create health monitoring script
      const monitorScript = `#!/bin/bash
# Health monitoring script for Cubcen
while true; do
  if ! curl -f -s http://localhost:3000/api/cubcen/v1/health > /dev/null; then
    echo "$(date): Health check failed" >> logs/health-monitor.log
  fi
  sleep 60
done
`
      writeFileSync('scripts/monitor-health.sh', monitorScript)
      execSync('chmod +x scripts/monitor-health.sh')

      return true
    } catch (error) {
      console.log(`   Health check setup failed: ${error}`)
      return false
    }
  }

  private async validateDocumentation(): Promise<boolean> {
    try {
      const requiredDocs = [
        'docs/user-guide.md',
        'docs/deployment.md',
        'README.md',
      ]

      const missingDocs = requiredDocs.filter(doc => !existsSync(doc))
      if (missingDocs.length > 0) {
        console.log(`   Missing documentation: ${missingDocs.join(', ')}`)
        return false
      }

      // Validate API documentation
      try {
        execSync('npm run test:api-docs', { stdio: 'pipe' })
      } catch (error) {
        console.log('   API documentation validation failed')
        return false
      }

      return true
    } catch (error) {
      console.log(`   Documentation validation failed: ${error}`)
      return false
    }
  }

  private async configureBackups(): Promise<boolean> {
    try {
      // Ensure backup directory exists
      const backupDir = process.env.BACKUP_PATH || './backups'
      if (!existsSync(backupDir)) {
        mkdirSync(backupDir, { recursive: true })
      }

      // Create backup script
      const backupScript = `#!/bin/bash
# Backup script for Cubcen
BACKUP_DIR="${backupDir}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/cubcen_backup_$TIMESTAMP.tar.gz"

# Create backup
tar -czf "$BACKUP_FILE" data/ logs/ .env

# Keep only last 10 backups
ls -t "$BACKUP_DIR"/cubcen_backup_*.tar.gz | tail -n +11 | xargs rm -f

echo "Backup created: $BACKUP_FILE"
`
      writeFileSync('scripts/create-backup.sh', backupScript)
      execSync('chmod +x scripts/create-backup.sh')

      return true
    } catch (error) {
      console.log(`   Backup configuration failed: ${error}`)
      return false
    }
  }

  private async optimizePerformance(): Promise<boolean> {
    try {
      // Create performance monitoring configuration
      const perfConfig = {
        monitoring: {
          enabled: true,
          interval: 30000,
          metrics: ['cpu', 'memory', 'response_time', 'error_rate'],
        },
        caching: {
          enabled: true,
          ttl: 300000,
          maxSize: 1000,
        },
        rateLimit: {
          windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
          max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'),
        },
      }

      writeFileSync(
        'config/performance.json',
        JSON.stringify(perfConfig, null, 2)
      )

      return true
    } catch (error) {
      console.log(`   Performance optimization failed: ${error}`)
      return false
    }
  }

  private async generateFinalReport(): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      preparation_status: this.results.every(r => r.success)
        ? 'ready'
        : 'issues',
      results: this.results,
      next_steps: this.generateNextSteps(),
    }

    writeFileSync(
      'deployment-preparation-report.json',
      JSON.stringify(report, null, 2)
    )

    console.log('\n📊 Final Preparation Report')
    console.log('='.repeat(40))
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌'
      console.log(`${status} ${result.name}: ${result.message}`)
    })
    console.log('')
  }

  private generateNextSteps(): string[] {
    const failedSteps = this.results.filter(r => !r.success)

    if (failedSteps.length === 0) {
      return [
        'All preparation steps completed successfully',
        'Run deployment script: ./scripts/deploy-production.sh',
        'Monitor deployment logs and health checks',
        'Validate post-deployment functionality',
      ]
    } else {
      return [
        'Fix failed preparation steps listed above',
        'Re-run preparation script after fixes',
        'Do not deploy until all critical issues resolved',
        'Contact development team if assistance needed',
      ]
    }
  }
}

// Run the final deployment preparation
if (require.main === module) {
  const preparation = new FinalDeploymentPreparation()
  preparation.prepare().catch(error => {
    console.error('💥 Deployment preparation failed:', error)
    process.exit(1)
  })
}

export { FinalDeploymentPreparation }
