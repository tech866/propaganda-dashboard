import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { adminMiddleware, clientManagementMiddleware } from './middleware/admin';

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/calls(.*)',
  '/clients(.*)',
  '/settings(.*)',
  '/performance(.*)'
]);

// Define public routes that should not be protected
const isPublicRoute = createRouteMatcher([
  '/',
  '/auth/signin(.*)',
  '/auth/register(.*)',
  '/api/webhooks(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Skip middleware for public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Apply admin middleware first for admin routes
  const adminResponse = await adminMiddleware(req);
  if (adminResponse) {
    return adminResponse;
  }

  // Apply client management middleware for client routes
  const clientResponse = await clientManagementMiddleware(req);
  if (clientResponse) {
    return clientResponse;
  }

  // Protect routes
  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    
    if (!userId) {
      // Redirect to sign-in page if not authenticated
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
