import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Admin-only routes that require specific role checking
const ADMIN_ROUTES = [
  '/admin/clients',
  '/admin/users',
  '/admin/settings',
  '/admin/audit-logs'
];

// CEO-only routes
const CEO_ROUTES = [
  '/admin/financial',
  '/admin/company-settings'
];

// Check if route requires admin access
export function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

// Check if route requires CEO access
export function isCEORoute(pathname: string): boolean {
  return CEO_ROUTES.some(route => pathname.startsWith(route));
}

// Enhanced admin middleware
export async function adminMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip if not an admin route
  if (!isAdminRoute(pathname) && !isCEORoute(pathname)) {
    return NextResponse.next();
  }

  // In development mode, allow access with mock user
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // Get user role from session claims
    const userRole = sessionClaims?.role as string;
    
    if (!userRole) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Check CEO routes
    if (isCEORoute(pathname)) {
      if (userRole !== 'ceo') {
        return NextResponse.redirect(new URL('/dashboard?error=insufficient_permissions', request.url));
      }
    }
    
    // Check admin routes
    if (isAdminRoute(pathname)) {
      if (!['admin', 'ceo'].includes(userRole)) {
        return NextResponse.redirect(new URL('/dashboard?error=insufficient_permissions', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
}

// Client management specific middleware
export async function clientManagementMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only apply to client management routes
  if (!pathname.startsWith('/admin/clients')) {
    return NextResponse.next();
  }

  // In development mode, allow access
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    const userRole = sessionClaims?.role as string;
    
    // Only admin and CEO can access client management
    if (!['admin', 'ceo'].includes(userRole)) {
      return NextResponse.redirect(new URL('/dashboard?error=client_management_restricted', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Client management middleware error:', error);
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
}


