/**
 * Next.js Middleware
 * Propaganda Dashboard - Clerk authentication middleware
 * Note: Full audit logging is handled in API routes to avoid Edge Runtime issues
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/calls(.*)',
  '/clients(.*)',
  '/settings(.*)',
  '/performance(.*)'
]);

// Temporarily disable Clerk middleware for development
// TODO: Re-enable when proper Clerk keys are configured
export default function middleware(req: NextRequest) {
  // Basic request logging
  const skipPaths = [
    '/_next/',
    '/favicon.ico',
    '/api/health',
    '/api/webhooks/clerk'
  ];
  
  const shouldSkip = skipPaths.some(path => req.nextUrl.pathname.startsWith(path));
  
  if (!shouldSkip) {
    // Log basic request information
    console.log('Request:', {
      method: req.method,
      endpoint: req.nextUrl.pathname,
      userId: null,
      agencyId: null,
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0] || req.ip || null,
      timestamp: new Date().toISOString()
    });
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
