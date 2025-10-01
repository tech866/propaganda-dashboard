// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Setup Next.js mocks
import './src/__tests__/setup/nextjs-setup'

// Mock console methods to reduce noise during tests
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

beforeAll(() => {
  // Suppress console.error for expected errors in tests
  console.error = (...args) => {
    // Only show errors that aren't from our test mocks
    if (
      !args[0]?.includes('Error fetching campaigns:') &&
      !args[0]?.includes('Error fetching clients:') &&
      !args[0]?.includes('Error creating campaign:') &&
      !args[0]?.includes('Error creating client:') &&
      !args[0]?.includes('Error updating campaign:') &&
      !args[0]?.includes('Error updating client:') &&
      !args[0]?.includes('Error deleting campaign:') &&
      !args[0]?.includes('Error deleting client:') &&
      !args[0]?.includes('Error fetching campaign metrics:') &&
      !args[0]?.includes('Error loading clients:') &&
      !args[0]?.includes('Clerk not configured, rendering without authentication') &&
      !args[0]?.includes('Failed to get user from Supabase:') &&
      !args[0]?.includes('Failed to update last login:')
    ) {
      originalError(...args);
    }
  };

  // Suppress console.warn for expected warnings
  console.warn = (...args) => {
    if (!args[0]?.includes('watchman warning:')) {
      originalWarn(...args);
    }
  };

  // Suppress console.log for expected logs
  console.log = (...args) => {
    if (!args[0]?.includes('Clerk not configured, rendering without authentication')) {
      originalLog(...args);
    }
  };
});

afterAll(() => {
  // Restore original console methods
  console.error = originalError;
  console.warn = originalWarn;
  console.log = originalLog;
});

// Mock environment variables for tests
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = '';
process.env.CLERK_SECRET_KEY = '';
process.env.NODE_ENV = 'test';
