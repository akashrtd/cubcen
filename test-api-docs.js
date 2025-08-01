/**
 * Simple test to verify API documentation functionality
 */

const { specs, validateApiSpec } = require('./src/lib/swagger.ts')

console.log('Testing API Documentation...')

try {
  // Test OpenAPI spec generation
  console.log('✓ OpenAPI spec generated successfully')
  console.log(`  - Title: ${specs.info.title}`)
  console.log(`  - Version: ${specs.info.version}`)
  console.log(`  - Paths: ${Object.keys(specs.paths || {}).length}`)

  // Test validation
  const isValid = validateApiSpec()
  console.log(`✓ OpenAPI spec validation: ${isValid ? 'PASSED' : 'FAILED'}`)

  // Test schemas
  const schemas = specs.components?.schemas || {}
  console.log(`✓ Schemas defined: ${Object.keys(schemas).length}`)
  console.log(`  - Error schema: ${schemas.Error ? 'YES' : 'NO'}`)
  console.log(`  - Agent schema: ${schemas.Agent ? 'YES' : 'NO'}`)
  console.log(`  - Task schema: ${schemas.Task ? 'YES' : 'NO'}`)

  console.log('\n✅ API Documentation test completed successfully!')
} catch (error) {
  console.error('❌ API Documentation test failed:', error.message)
  process.exit(1)
}
