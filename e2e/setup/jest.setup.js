import { TextEncoder, TextDecoder } from 'util'

// Polyfills for Node.js test environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'file:./e2e/temp/test.db'
process.env.JWT_SECRET = 'test-jwt-secret-key-for-e2e-testing'
process.env.PORT = '3001'
process.env.DISABLE_LOGGING = 'true'

// Increase timeout for E2E tests
jest.setTimeout(30000)