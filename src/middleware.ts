/**
 * Next.js Middleware
 * Propaganda Dashboard - Global middleware with basic request logging
 * Note: Full audit logging is handled in API routes to avoid Edge Runtime issues
 */

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  
  // Skip logging for certain paths
  const skipPaths = [
    '/_next/',
    '/favicon.ico',
    '/api/health',
    '/api/auth/session'
  ];
  
  const shouldSkip = skipPaths.some(path => request.nextUrl.pathname.startsWith(path));
  
  if (shouldSkip) {
    return NextResponse.next();
  }

  // Extract basic user information from JWT token (Edge Runtime compatible)
  let user: any = null;
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (token) {
      user = {
        id: token.sub || 'unknown',
        email: token.email || 'unknown',
        name: token.name || 'unknown',
        role: (token as any).role || 'sales',
        clientId: (token as any).clientId || 'unknown',
      };
    }
  } catch (error) {
    console.warn('Failed to extract user from request:', error);
  }

  // Create basic audit context (without database operations)
  const context = {
    clientId: user?.clientId || null,
    userId: user?.id || null,
    sessionId: user?.sessionId || null,
    ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || request.ip || null,
    userAgent: request.headers.get('user-agent') || null,
    endpoint: request.nextUrl.pathname,
    httpMethod: request.method,
    metadata: {
      referer: request.headers.get('referer'),
      origin: request.headers.get('origin'),
      timestamp: new Date().toISOString(),
      userEmail: user?.email,
      userRole: user?.role,
    },
  };

  // Log basic request information (console only for Edge Runtime)
  console.log('Request:', {
    method: context.httpMethod,
    endpoint: context.endpoint,
    userId: context.userId,
    clientId: context.clientId,
    ipAddress: context.ipAddress,
    timestamp: context.metadata.timestamp
  });

  // Create response with audit context
  const response = NextResponse.next();
  
  // Add audit context to response headers for downstream use
  response.headers.set('x-audit-context', JSON.stringify({
    clientId: context.clientId,
    userId: context.userId,
    sessionId: context.sessionId
  }));

  // Log basic response information
  const duration = Date.now() - startTime;
  console.log('Response:', {
    method: context.httpMethod,
    endpoint: context.endpoint,
    status: response.status,
    duration: `${duration}ms`,
    userId: context.userId,
    clientId: context.clientId
  });

  return response;
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
