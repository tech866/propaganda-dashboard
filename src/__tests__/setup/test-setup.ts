/**
 * Test Setup and Configuration
 * Global test configuration and utilities
 */

import '@testing-library/jest-dom';

// Mock environment variables
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock_key';
process.env.CLERK_SECRET_KEY = 'sk_test_mock_key';
process.env.CLERK_WEBHOOK_SECRET = 'whsec_mock_secret';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock_anon_key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock_service_role_key';
process.env.RESEND_API_KEY = 're_mock_key';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    entries: jest.fn(),
    forEach: jest.fn(),
    toString: jest.fn(),
  }),
  usePathname: () => '/test-path',
}));

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-123',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User',
    },
    isLoaded: true,
    isSignedIn: true,
  }),
  useUser: () => ({
    user: {
      id: 'test-user-123',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User',
    },
    isLoaded: true,
    isSignedIn: true,
  }),
  SignInButton: ({ children }: { children: React.ReactNode }) => React.createElement('button', {}, children),
  SignUpButton: ({ children }: { children: React.ReactNode }) => React.createElement('button', {}, children),
  UserButton: () => React.createElement('div', {}, 'UserButton'),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children),
}));

// Mock Supabase
jest.mock('@/lib/supabase-client', () => ({
  createAdminSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    },
  })),
  createClientComponentClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
  })),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn(() => Promise.resolve({ data: { id: 'email-123' }, error: null })),
    },
  })),
}));

// Mock @react-email/render
jest.mock('@react-email/render', () => ({
  render: jest.fn(() => '<html>Mock email HTML</html>'),
}));

// Setup global test utilities
global.testUtils = {
  mockUser: {
    id: 'test-user-123',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
    firstName: 'Test',
    lastName: 'User',
  },
  mockWorkspace: {
    id: 'test-workspace-123',
    name: 'Test Workspace',
    slug: 'test-workspace',
    role: 'owner',
  },
  mockCall: {
    id: 'test-call-123',
    prospect_name: 'Test Prospect',
    company_name: 'Test Company',
    phone: '+1-555-0123',
    email: 'test@testcompany.com',
    crm_stage: 'scheduled',
    call_outcome: 'scheduled',
    traffic_source: 'organic',
    source_of_appointment: 'email',
    cash_collected: 0,
    scheduled_call_time: '2025-01-15T14:00:00Z',
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-01-10T10:00:00Z',
  },
  mockAnalytics: {
    calls_scheduled: 100,
    calls_taken: 80,
    calls_showed: 70,
    calls_closed_won: 25,
    cash_collected: 50000,
    show_rate: 70.0,
    close_rate: 31.25,
    gross_collected_per_booked_call: 500.0,
    cash_per_live_call: 625.0,
    cash_based_aov: 2000.0,
  },
};

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is deprecated') ||
       args[0].includes('Warning: componentWillReceiveProps') ||
       args[0].includes('Warning: componentWillMount'))
    ) {
      return;
    }
    originalConsoleError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillReceiveProps') ||
       args[0].includes('componentWillMount'))
    ) {
      return;
    }
    originalConsoleWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  (global.fetch as jest.Mock).mockClear();
});

// Global test timeout
jest.setTimeout(10000);
