'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';

// Clerk configuration
const clerkConfig = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/auth/signin',
  signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/auth/register',
  afterSignInUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/dashboard',
  afterSignUpUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '/dashboard',
};

// Clerk provider wrapper component
export function ClerkProviderWrapper({ children }: { children: ReactNode }) {
  // Temporarily disable Clerk for development
  // TODO: Re-enable when proper Clerk keys are configured
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('placeholder')) {
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
