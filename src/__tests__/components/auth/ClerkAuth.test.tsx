import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ClerkProvider } from '@clerk/nextjs';
import SignInPage from '@/app/auth/signin/[[...signin]]/page';
import RegisterPage from '@/app/auth/register/[[...register]]/page';

// Mock Clerk components
jest.mock('@clerk/nextjs', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="clerk-provider">{children}</div>,
  SignIn: () => <div data-testid="clerk-signin">Clerk Sign In Component</div>,
  SignUp: () => <div data-testid="clerk-signup">Clerk Sign Up Component</div>,
}));

// Mock environment variables
const originalEnv = process.env;

describe('Clerk Authentication Components', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('SignInPage', () => {
    it('renders Clerk SignIn component when properly configured', () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_valid_key_here_123456789';
      
      // Re-import the component after setting the environment variable
      const { default: SignInPageWithConfig } = require('@/app/auth/signin/[[...signin]]/page');
      
      render(<SignInPageWithConfig />);
      
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
      expect(screen.getByText('Access your agency dashboard')).toBeInTheDocument();
    });

    it('shows configuration error when Clerk is not configured', () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = undefined;
      
      render(<SignInPage />);
      
      expect(screen.getByText('Authentication Not Configured')).toBeInTheDocument();
      expect(screen.getByText('Please configure Clerk authentication to access the dashboard')).toBeInTheDocument();
      expect(screen.getByText('Contact your administrator to set up authentication.')).toBeInTheDocument();
    });

    it('shows configuration error when Clerk key is placeholder', () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_placeholder_key';
      
      render(<SignInPage />);
      
      expect(screen.getByText('Authentication Not Configured')).toBeInTheDocument();
    });

    it('shows configuration error when Clerk key is too short', () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_short';
      
      render(<SignInPage />);
      
      expect(screen.getByText('Authentication Not Configured')).toBeInTheDocument();
    });
  });

  describe('RegisterPage', () => {
    it('renders Clerk SignUp component when properly configured', () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_valid_key_here_123456789';
      
      // Re-import the component after setting the environment variable
      const { default: RegisterPageWithConfig } = require('@/app/auth/register/[[...register]]/page');
      
      render(<RegisterPageWithConfig />);
      
      expect(screen.getByText('Create your account')).toBeInTheDocument();
      expect(screen.getByText('Start your agency journey')).toBeInTheDocument();
    });

    it('shows configuration error when Clerk is not configured', () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = undefined;
      
      render(<RegisterPage />);
      
      expect(screen.getByText('Registration Not Available')).toBeInTheDocument();
      expect(screen.getByText('Please configure Clerk authentication to enable registration')).toBeInTheDocument();
      expect(screen.getByText('Contact your administrator to set up authentication.')).toBeInTheDocument();
    });
  });

  describe('ClerkProvider Integration', () => {
    it('renders ClerkProvider when properly configured', () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_valid_key_here_123456789';
      
      render(
        <ClerkProvider publishableKey="pk_test_valid_key_here_123456789">
          <div>Test Content</div>
        </ClerkProvider>
      );
      
      expect(screen.getByTestId('clerk-provider')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });
});
