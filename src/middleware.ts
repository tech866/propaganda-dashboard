import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/calls(.*)',
  '/clients(.*)',
  '/settings(.*)',
  '/performance(.*)'
]);

export default clerkMiddleware((auth, req) => {
  // Protect routes
  if (isProtectedRoute(req)) {
    // Check if we're in development mode and allow mock user
    if (process.env.NODE_ENV === 'development') {
      // Allow development access - mock user will be used
      return NextResponse.next();
    }
    
    const { userId } = auth();
    
    if (!userId) {
      // Redirect to sign-in page if not authenticated
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
