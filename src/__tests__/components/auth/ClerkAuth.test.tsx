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
      
      render(<SignInPage />);
      
      expect(screen.getByTestId('clerk-signin')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    });

    it('shows configuration error when Clerk is not configured', () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = undefined;
      
      render(<SignInPage />);
      
      expect(screen.getByText(/Clerk authentication is not configured/)).toBeInTheDocument();
      expect(screen.getByText(/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY/)).toBeInTheDocument();
      expect(screen.getByText(/CLERK_SECRET_KEY/)).toBeInTheDocument();
    });

    it('shows configuration error when Clerk key is placeholder', () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_placeholder_key';
      
      render(<SignInPage />);
      
      expect(screen.getByText(/Clerk authentication is not configured/)).toBeInTheDocument();
    });

    it('shows configuration error when Clerk key is too short', () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_short';
      
      render(<SignInPage />);
      
      expect(screen.getByText(/Clerk authentication is not configured/)).toBeInTheDocument();
    });
  });

  describe('RegisterPage', () => {
    it('renders Clerk SignUp component when properly configured', () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_valid_key_here_123456789';
      
      render(<RegisterPage />);
      
      expect(screen.getByTestId('clerk-signup')).toBeInTheDocument();
      expect(screen.getByText('Create your account')).toBeInTheDocument();
    });

    it('shows configuration error when Clerk is not configured', () => {
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = undefined;
      
      render(<RegisterPage />);
      
      expect(screen.getByText(/Clerk authentication is not configured/)).toBeInTheDocument();
      expect(screen.getByText(/NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY/)).toBeInTheDocument();
      expect(screen.getByText(/CLERK_SECRET_KEY/)).toBeInTheDocument();
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
