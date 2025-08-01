import { execSync } from 'child_process'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

/**
 * Global setup for E2E tests
 * Sets up test database, starts test server, and prepares test environment
 */
export default async function globalSetup() {
  console.log('🚀 Setting up E2E test environment...')

  // Create test directories
  const testDir = join(process.cwd(), 'e2e', 'temp')
  if (!existsSync(testDir)) {
    mkdirSync(testDir, { recursive: true })
  }

  // Set test environment variables
  process.env.NODE_ENV = 'test'
  process.env.DATABASE_URL = 'file:./e2e/temp/test.db'
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-e2e-testing'
  process.env.PORT = '3001'
  process.env.DISABLE_LOGGING = 'true'

  try {
    // Generate Prisma client for test environment
    console.log('📦 Generating Prisma client...')
    execSync('npx prisma generate', { stdio: 'inherit' })

    // Create test database
    console.log('🗄️ Setting up test database...')
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: 'file:./e2e/temp/test.db' }
    })

    // Seed test database with initial data
    console.log('🌱 Seeding test database...')
    execSync('npx tsx e2e/setup/seed-test-data.ts', { stdio: 'inherit' })

    console.log('✅ E2E test environment setup complete')
  } catch (error) {
    console.error('❌ Failed to setup E2E test environment:', error)
    process.exit(1)
  }
}