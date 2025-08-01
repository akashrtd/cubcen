// Backend test setup
// Polyfills and mocks for Node.js testing environment

// Add TextEncoder/TextDecoder polyfills for Node.js
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock environment variables for testing
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only'
process.env.DATABASE_URL = 'file:./test.db'
process.env.LOG_LEVEL = 'error' // Reduce log noise in tests

// Increase test timeout for integration tests
jest.setTimeout(10000)

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}