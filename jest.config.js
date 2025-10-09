const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFiles: ['<rootDir>/src/__tests__/setup/nextjs-setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup/test-setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: [
    '<rootDir>/.next/', 
    '<rootDir>/node_modules/', 
    '<rootDir>/tests/e2e/',
    '<rootDir>/src/__tests__/setup/nextjs-setup.ts',
    '<rootDir>/src/__tests__/setup/test-setup.ts'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/__tests__/**',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
  ],
  // Optimize test performance
  maxWorkers: '50%', // Use half of available CPU cores
  testTimeout: 10000, // 10 second timeout
  // Reduce console noise during tests
  silent: false,
  verbose: true,
  // Mock console methods to reduce noise
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)