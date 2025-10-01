'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';

// Clerk configuration
const clerkConfig = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/auth/signin',
  signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/auth/register',
  afterSignInUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/dashboard',
  afterSignUpUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '/dashboard',
};

// Clerk provider wrapper component
export function ClerkProviderWrapper({ children }: { children: ReactNode }) {
  // Check if Clerk is properly configured
  const isClerkConfigured = clerkConfig.publishableKey && 
    !clerkConfig.publishableKey.includes('placeholder') &&
    clerkConfig.publishableKey.length > 20;

  // If Clerk is not configured, render children without Clerk provider
  if (!isClerkConfigured) {
    console.log('Clerk not configured, rendering without authentication');
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      publishableKey={clerkConfig.publishableKey}
      signInUrl={clerkConfig.signInUrl}
      signUpUrl={clerkConfig.signUpUrl}
      afterSignInUrl={clerkConfig.afterSignInUrl}
      afterSignUpUrl={clerkConfig.afterSignUpUrl}
    >
      {children}
    </ClerkProvider>
  );
}
