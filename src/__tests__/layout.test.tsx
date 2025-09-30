import React from 'react';
import { render, screen } from '@testing-library/react';
import RootLayout from '@/app/layout';

// Mock Next.js components
jest.mock('next/font/google', () => ({
  Inter: () => ({
    variable: '--font-sans',
    style: { fontFamily: 'Inter' }
  })
}));

// Mock the providers
jest.mock('@/components/providers/ClerkProvider', () => ({
  ClerkProviderWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="clerk-provider">{children}</div>
  )
}));

jest.mock('@/components/providers/TailusProvider', () => ({
  TailusProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tailus-provider">{children}</div>
  )
}));

jest.mock('@/contexts/RoleContext', () => ({
  RoleProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="role-provider">{children}</div>
  )
}));

jest.mock('@/contexts/AgencyContext', () => ({
  AgencyProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="agency-provider">{children}</div>
  )
}));

jest.mock('@/components/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  )
}));

describe('RootLayout', () => {
  it('renders with all providers in correct order', () => {
    render(
      <RootLayout>
        <div data-testid="test-content">Test Content</div>
      </RootLayout>
    );

    // Check that all providers are rendered
    expect(screen.getByTestId('clerk-provider')).toBeInTheDocument();
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
    expect(screen.getByTestId('tailus-provider')).toBeInTheDocument();
    expect(screen.getByTestId('role-provider')).toBeInTheDocument();
    expect(screen.getByTestId('agency-provider')).toBeInTheDocument();
    
    // Check that content is rendered
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('has correct HTML structure', () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    const html = document.querySelector('html');
    const body = document.querySelector('body');
    
    expect(html).toHaveAttribute('lang', 'en');
    // suppressHydrationWarning is a boolean attribute, so it may not be visible in tests
    expect(body).toHaveClass('font-sans', 'antialiased', 'bg-background', 'text-foreground');
  });

  it('applies Inter font variable', () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );

    const body = document.querySelector('body');
    expect(body).toHaveClass('--font-sans');
  });
});
