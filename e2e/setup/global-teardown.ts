import { execSync } from 'child_process'
import { join } from 'path'
import { existsSync, rmSync } from 'fs'

/**
 * Global teardown for E2E tests
 * Cleans up test database and temporary files
 */
export default async function globalTeardown() {
  console.log('🧹 Cleaning up E2E test environment...')

  try {
    // Clean up test database and temporary files
    const testDir = join(process.cwd(), 'e2e', 'temp')
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
      console.log('🗑️ Removed test directory')
    }

    console.log('✅ E2E test environment cleanup complete')
  } catch (error) {
    console.error('❌ Failed to cleanup E2E test environment:', error)
  }
}