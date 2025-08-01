module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/e2e'],
  testMatch: [
    '<rootDir>/e2e/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/e2e/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/e2e/setup/jest.setup.js'],
  globalSetup: '<rootDir>/e2e/setup/global-setup.ts',
  globalTeardown: '<rootDir>/e2e/setup/global-teardown.ts',
  testRunner: 'jest-circus/runner',
  reporters: ['default'],
  globalSetup: 'npx prisma migrate dev --name init',
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/node_modules/**',
  ],
  coverageDirectory: 'coverage/e2e',
  testTimeout: 30000,
  maxWorkers: 1, // Run E2E tests sequentially
  verbose: true,
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
}
