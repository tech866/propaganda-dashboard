'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';

// Clerk configuration with better error handling
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
  const isClerkConfigured = !!(
    clerkConfig.publishableKey && 
    clerkConfig.publishableKey.length > 20 &&
    !clerkConfig.publishableKey.includes('placeholder') &&
    !clerkConfig.publishableKey.includes('undefined')
  );

  // If Clerk is not configured, render children without Clerk provider
  if (!isClerkConfigured) {
    console.warn('Clerk not properly configured:', {
      hasKey: !!clerkConfig.publishableKey,
      keyLength: clerkConfig.publishableKey?.length || 0,
      keyPreview: clerkConfig.publishableKey?.substring(0, 10) + '...'
    });
    return <>{children}</>;
  }

  console.log('Clerk configured successfully, initializing provider');

  return (
    <ClerkProvider
      publishableKey={clerkConfig.publishableKey}
      signInUrl={clerkConfig.signInUrl}
      signUpUrl={clerkConfig.signUpUrl}
      afterSignInUrl={clerkConfig.afterSignInUrl}
      afterSignUpUrl={clerkConfig.afterSignUpUrl}
      appearance={{
        baseTheme: undefined,
        elements: {
          formButtonPrimary: 'bg-primary hover:bg-primary/90 text-sm normal-case',
          card: 'bg-slate-800/50 backdrop-blur-sm border border-slate-700',
          headerTitle: 'text-white',
          headerSubtitle: 'text-gray-300',
          socialButtonsBlockButton: 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600',
          formFieldInput: 'bg-slate-700 border-slate-600 text-white',
          formFieldLabel: 'text-gray-300',
          footerActionLink: 'text-primary hover:text-primary/80',
          identityPreviewText: 'text-gray-300',
          formResendCodeLink: 'text-primary hover:text-primary/80',
        }
      }}
    >
      {children}
    </ClerkProvider>
  );
}
