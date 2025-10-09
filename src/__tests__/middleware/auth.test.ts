// Mock next/server module
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(public url: string, public init?: RequestInit) {
      const urlObj = new URL(url);
      this.nextUrl = { pathname: urlObj.pathname };
    }
    headers = new Map();
    method = 'GET';
    nextUrl: { pathname: string };
    ip = '127.0.0.1';
  },
  NextResponse: {
    next: () => ({ status: 200 }),
    json: (data: any) => ({ status: 200, json: () => Promise.resolve(data) })
  }
}));

import { NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Mock Clerk middleware
jest.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: jest.fn((handler) => {
    // Simulate the actual clerkMiddleware behavior
    return async (auth: any, req: NextRequest) => {
      // Call the handler with the auth function and request
      return await handler(auth, req);
    };
  }),
  createRouteMatcher: jest.fn((patterns: string[]) => {
    return jest.fn((req: NextRequest) => {
      const pathname = req.nextUrl.pathname;
      return patterns.some(pattern => {
        // Convert pattern to regex-like matching
        // Handle (.*) patterns by converting them to .*
        const regexPattern = pattern.replace(/\(\.\*\)/g, '.*');
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(pathname);
      });
    });
  }),
}));

// Mock admin middleware
jest.mock('@/middleware/admin', () => ({
  adminMiddleware: jest.fn(() => null),
  clientManagementMiddleware: jest.fn(() => null),
}));

describe('Authentication Middleware', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Route Matcher', () => {
    it('should identify protected routes correctly', () => {
      const isProtectedRoute = createRouteMatcher([
        '/dashboard(.*)',
        '/admin(.*)',
        '/calls(.*)',
        '/clients(.*)',
        '/settings(.*)',
        '/performance(.*)'
      ]);

      expect(isProtectedRoute(new NextRequest('http://localhost:3000/dashboard'))).toBe(true);
      expect(isProtectedRoute(new NextRequest('http://localhost:3000/admin/users'))).toBe(true);
      expect(isProtectedRoute(new NextRequest('http://localhost:3000/calls/new'))).toBe(true);
      expect(isProtectedRoute(new NextRequest('http://localhost:3000/clients/123'))).toBe(true);
      expect(isProtectedRoute(new NextRequest('http://localhost:3000/settings/profile'))).toBe(true);
      expect(isProtectedRoute(new NextRequest('http://localhost:3000/performance/metrics'))).toBe(true);
    });

    it('should identify public routes correctly', () => {
      const isProtectedRoute = createRouteMatcher([
        '/dashboard(.*)',
        '/admin(.*)',
        '/calls(.*)',
        '/clients(.*)',
        '/settings(.*)',
        '/performance(.*)'
      ]);

      expect(isProtectedRoute(new NextRequest('http://localhost:3000/'))).toBe(false);
      expect(isProtectedRoute(new NextRequest('http://localhost:3000/auth/signin'))).toBe(false);
      expect(isProtectedRoute(new NextRequest('http://localhost:3000/auth/register'))).toBe(false);
      expect(isProtectedRoute(new NextRequest('http://localhost:3000/api/health'))).toBe(false);
    });
  });

  describe('Middleware Integration', () => {
    it('should export middleware function', async () => {
      const middleware = (await import('@/middleware')).default;
      expect(typeof middleware).toBe('function');
    });

    it('should have proper config export', async () => {
      const config = (await import('@/middleware')).config;
      expect(config).toBeDefined();
      expect(config.matcher).toBeDefined();
      expect(Array.isArray(config.matcher)).toBe(true);
    });
  });
});

