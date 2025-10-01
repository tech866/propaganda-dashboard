'use client';

import { useUser } from '@clerk/nextjs';
import { useMockUser } from '@/components/providers/MockAuthProvider';

// Check if Clerk is configured
const isClerkConfigured = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('placeholder') &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.length > 20;

// Conditional auth hook
export function useAuth() {
  if (isClerkConfigured) {
    // Use Clerk authentication
    const clerkAuth = useUser();
    return {
      user: clerkAuth.user,
      isLoaded: clerkAuth.isLoaded,
      isSignedIn: !!clerkAuth.user,
    };
  } else {
    // Use mock authentication
    const mockAuth = useMockUser();
    return {
      user: mockAuth.user,
      isLoaded: mockAuth.isLoaded,
      isSignedIn: mockAuth.isSignedIn,
    };
  }
}

