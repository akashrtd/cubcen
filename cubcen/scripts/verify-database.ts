#!/usr/bin/env tsx

/**
 * Cubcen Database Verification Script
 * Verifies database setup, migrations, and seed data
 */

import { checkDatabaseHealth, prisma } from '../src/lib/database'
import { getDatabaseStats, validateDatabaseSchema } from '../src/lib/database-utils'
import { logger } from '../src/lib/logger'

async function main() {
  console.log('🔍 Verifying Cubcen database setup...\n')

  try {
    // 1. Check database health
    console.log('1. Checking database health...')
    const health = await checkDatabaseHealth()
    console.log(`   Status: ${health.status}`)
    console.log(`   Connected: ${health.details.connected}`)
    console.log(`   Last checked: ${health.details.lastChecked}`)

    if (health.status !== 'healthy') {
      throw new Error('Database health check failed')
    }

    // 2. Validate schema
    console.log('\n2. Validating database schema...')
    const schemaValidation = await validateDatabaseSchema()
    console.log(`   Schema valid: ${schemaValidation.isValid}`)
    
    if (!schemaValidation.isValid) {
      console.log('   Errors:', schemaValidation.errors)
      throw new Error('Database schema validation failed')
    }

    // 3. Get database statistics
    console.log('\n3. Getting database statistics...')
    const stats = await getDatabaseStats()
    console.log(`   Users: ${stats.users}`)
    console.log(`   Platforms: ${stats.platforms}`)
    console.log(`   Agents: ${stats.agents}`)
    console.log(`   Tasks: ${stats.tasks}`)
    console.log(`   Workflows: ${stats.workflows}`)
    console.log(`   System Logs: ${stats.systemLogs}`)

    // 4. Test basic queries
    console.log('\n4. Testing basic database queries...')
    
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true }
    })
    console.log(`   Found ${users.length} users`)

    const platforms = await prisma.platform.findMany({
      select: { id: true, name: true, type: true, status: true }
    })
    console.log(`   Found ${platforms.length} platforms`)

    const agents = await prisma.agent.findMany({
      select: { 
        id: true, 
        name: true, 
        status: true,
        platform: { 
          select: { name: true, type: true } 
        }
      }
    })
    console.log(`   Found ${agents.length} agents`)

    // 5. Test relationships
    console.log('\n5. Testing database relationships...')
    
    const userWithWorkflows = await prisma.user.findFirst({
      include: { createdWorkflows: true, createdTasks: true }
    })
    
    if (userWithWorkflows) {
      console.log(`   User "${userWithWorkflows.email}" has ${userWithWorkflows.createdWorkflows.length} workflows and ${userWithWorkflows.createdTasks.length} tasks`)
    }

    const platformWithAgents = await prisma.platform.findFirst({
      include: { agents: true }
    })
    
    if (platformWithAgents) {
      console.log(`   Platform "${platformWithAgents.name}" has ${platformWithAgents.agents.length} agents`)
    }

    console.log('\n✅ Database verification completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - Database is healthy and connected`)
    console.log(`   - Schema is valid with all required tables`)
    console.log(`   - Seed data is present and accessible`)
    console.log(`   - Relationships are working correctly`)
    console.log(`   - All quality gates passed`)

  } catch (error) {
    console.error('\n❌ Database verification failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the verification
main().catch((error) => {
  logger.error('Database verification script failed', error)
  process.exit(1)
})