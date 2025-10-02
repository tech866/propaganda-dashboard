import { NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Mock Clerk middleware
jest.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: jest.fn((handler) => handler),
  createRouteMatcher: jest.fn(() => jest.fn((req: NextRequest) => {
    const protectedPaths = ['/dashboard', '/admin', '/calls', '/clients', '/settings', '/performance'];
    return protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));
  })),
}));

// Mock console.log to avoid noise in tests
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('Authentication Middleware', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Route Protection', () => {
    it('should protect dashboard routes when Clerk is configured', async () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_valid_key_here_123456789';
      
      // Import middleware after setting env var
      const middleware = (await import('@/middleware')).default;
      
      const mockRequest = new NextRequest('http://localhost:3000/dashboard');
      const mockAuth = jest.fn().mockResolvedValue({
        userId: 'user_123',
        protect: jest.fn()
      });

      await middleware(mockAuth, mockRequest);

      expect(mockAuth).toHaveBeenCalled();
    });

    it('should not protect routes when Clerk is not configured', async () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = undefined;
      
      const middleware = (await import('@/middleware')).default;
      
      const mockRequest = new NextRequest('http://localhost:3000/dashboard');
      const mockAuth = jest.fn().mockResolvedValue({
        userId: null,
        protect: jest.fn()
      });

      await middleware(mockAuth, mockRequest);

      // Should not call protect when Clerk is not configured
      const authResult = await mockAuth();
      expect(authResult.protect).not.toHaveBeenCalled();
    });

    it('should skip logging for static assets', async () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_valid_key_here_123456789';
      
      const middleware = (await import('@/middleware')).default;
      
      const mockRequest = new NextRequest('http://localhost:3000/_next/static/chunk.js');
      const mockAuth = jest.fn().mockResolvedValue({
        userId: 'user_123',
        protect: jest.fn()
      });

      await middleware(mockAuth, mockRequest);

      // Should not log for static assets
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should log requests for non-static paths', async () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_valid_key_here_123456789';
      
      const middleware = (await import('@/middleware')).default;
      
      const mockRequest = new NextRequest('http://localhost:3000/dashboard');
      mockRequest.headers.set('x-forwarded-for', '192.168.1.1');
      
      const mockAuth = jest.fn().mockResolvedValue({
        userId: 'user_123',
        protect: jest.fn()
      });

      await middleware(mockAuth, mockRequest);

      expect(console.log).toHaveBeenCalledWith('Request:', {
        method: 'GET',
        endpoint: '/dashboard',
        userId: 'user_123',
        agencyId: null,
        ipAddress: '192.168.1.1',
        timestamp: expect.any(String)
      });
    });
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
});

