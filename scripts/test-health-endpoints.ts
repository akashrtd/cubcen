#!/usr/bin/env tsx

/**
 * Health Endpoints Test Script
 * Tests all health monitoring endpoints to ensure they work correctly
 */

import { spawn } from 'child_process'
import { setTimeout } from 'timers/promises'

const BASE_URL = 'http://localhost:3001'

interface TestResult {
  endpoint: string
  status: number
  success: boolean
  data?: any
  error?: string
}

async function makeRequest(endpoint: string): Promise<TestResult> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`)
    const data = await response.json()
    
    return {
      endpoint,
      status: response.status,
      success: response.ok,
      data
    }
  } catch (error) {
    return {
      endpoint,
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function testHealthEndpoints() {
  console.log('🏥 Testing Cubcen Health Monitoring Endpoints\n')
  
  const endpoints = [
    '/health',
    '/health/live',
    '/health/ready',
    '/health/checks/database',
    '/health/checks/memory',
    '/health/checks/disk',
    '/health/checks/application',
    '/health/metrics',
    '/health/metrics/history'
  ]
  
  const results: TestResult[] = []
  
  for (const endpoint of endpoints) {
    console.log(`Testing ${endpoint}...`)
    const result = await makeRequest(endpoint)
    results.push(result)
    
    if (result.success) {
      console.log(`✅ ${endpoint} - Status: ${result.status}`)
    } else {
      console.log(`❌ ${endpoint} - Status: ${result.status} - Error: ${result.error || 'Request failed'}`)
    }
    
    // Small delay between requests
    await setTimeout(100)
  }
  
  console.log('\n📊 Test Summary:')
  console.log(`Total endpoints tested: ${results.length}`)
  console.log(`Successful: ${results.filter(r => r.success).length}`)
  console.log(`Failed: ${results.filter(r => !r.success).length}`)
  
  // Show detailed results for failed endpoints
  const failed = results.filter(r => !r.success)
  if (failed.length > 0) {
    console.log('\n❌ Failed Endpoints:')
    failed.forEach(result => {
      console.log(`  ${result.endpoint}: ${result.error || `HTTP ${result.status}`}`)
    })
  }
  
  // Show sample data from successful endpoints
  const successful = results.filter(r => r.success)
  if (successful.length > 0) {
    console.log('\n✅ Sample Responses:')
    successful.slice(0, 3).forEach(result => {
      console.log(`\n${result.endpoint}:`)
      console.log(JSON.stringify(result.data, null, 2))
    })
  }
  
  return results.every(r => r.success)
}

async function startServer(): Promise<() => void> {
  console.log('🚀 Starting Cubcen server...')
  
  const serverProcess = spawn('npm', ['run', 'dev:server'], {
    stdio: 'pipe',
    cwd: process.cwd()
  })
  
  // Wait for server to start
  await setTimeout(3000)
  
  return () => {
    console.log('🛑 Stopping server...')
    serverProcess.kill()
  }
}

async function main() {
  let stopServer: (() => void) | undefined
  
  try {
    stopServer = await startServer()
    
    // Wait a bit more for server to be fully ready
    await setTimeout(2000)
    
    const allPassed = await testHealthEndpoints()
    
    if (allPassed) {
      console.log('\n🎉 All health endpoints are working correctly!')
      process.exit(0)
    } else {
      console.log('\n💥 Some health endpoints failed!')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Test script failed:', error)
    process.exit(1)
  } finally {
    if (stopServer) {
      stopServer()
    }
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  main().catch(console.error)
}

export { testHealthEndpoints, makeRequest }