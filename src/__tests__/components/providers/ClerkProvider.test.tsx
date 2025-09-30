import React from 'react';
import { render, screen } from '@testing-library/react';
import { ClerkProviderWrapper } from '@/components/providers/ClerkProvider';

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="clerk-provider">{children}</div>
  )
}));

describe('ClerkProviderWrapper', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('renders children without ClerkProvider when publishableKey is not configured', () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'placeholder_key';

    render(
      <ClerkProviderWrapper>
        <div data-testid="test-content">Test Content</div>
      </ClerkProviderWrapper>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.queryByTestId('clerk-provider')).not.toBeInTheDocument();
  });

  it('renders children without ClerkProvider when publishableKey is too short', () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'short';

    render(
      <ClerkProviderWrapper>
        <div data-testid="test-content">Test Content</div>
      </ClerkProviderWrapper>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.queryByTestId('clerk-provider')).not.toBeInTheDocument();
  });

  it('renders children without ClerkProvider when publishableKey contains placeholder', () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_placeholder_key_here';

    render(
      <ClerkProviderWrapper>
        <div data-testid="test-content">Test Content</div>
      </ClerkProviderWrapper>
    );

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.queryByTestId('clerk-provider')).not.toBeInTheDocument();
  });

  it('renders with ClerkProvider when publishableKey is properly configured', () => {
    // Mock the environment variables
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_valid_key_that_is_long_enough',
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/sign-in',
      NEXT_PUBLIC_CLERK_SIGN_UP_URL: '/sign-up',
      NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: '/dashboard',
      NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: '/dashboard'
    };

    // Re-import the component to get the updated environment
    jest.resetModules();
    const { ClerkProviderWrapper: UpdatedClerkProviderWrapper } = require('@/components/providers/ClerkProvider');

    render(
      <UpdatedClerkProviderWrapper>
        <div data-testid="test-content">Test Content</div>
      </UpdatedClerkProviderWrapper>
    );

    expect(screen.getByTestId('clerk-provider')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();

    // Restore original environment
    process.env = originalEnv;
  });

  it('uses default URLs when environment variables are not set', () => {
    // Mock the environment variables
    const originalEnv = process.env;
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_valid_key_that_is_long_enough'
    };
    delete process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;
    delete process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL;
    delete process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL;
    delete process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL;

    // Re-import the component to get the updated environment
    jest.resetModules();
    const { ClerkProviderWrapper: UpdatedClerkProviderWrapper } = require('@/components/providers/ClerkProvider');

    render(
      <UpdatedClerkProviderWrapper>
        <div data-testid="test-content">Test Content</div>
      </UpdatedClerkProviderWrapper>
    );

    expect(screen.getByTestId('clerk-provider')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();

    // Restore original environment
    process.env = originalEnv;
  });

  it('logs message when Clerk is not configured', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'placeholder_key';

    render(
      <ClerkProviderWrapper>
        <div>Test Content</div>
      </ClerkProviderWrapper>
    );

    expect(consoleSpy).toHaveBeenCalledWith('Clerk not configured, rendering without authentication');
    
    consoleSpy.mockRestore();
  });
});
