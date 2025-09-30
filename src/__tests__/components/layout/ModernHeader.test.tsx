import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ModernHeader from '@/components/layout/ModernHeader';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock the RoleContext
jest.mock('@/contexts/RoleContext', () => ({
  useRole: jest.fn(),
}));

// Mock child components
jest.mock('@/components/layout/MobileNavigation', () => {
  return function MockMobileNavigation() {
    return <div data-testid="mobile-navigation">Mobile Navigation</div>;
  };
});

// Mock environment variables
const originalEnv = process.env;

describe('ModernHeader', () => {
  const mockPush = jest.fn();
  const mockUseRole = require('@/contexts/RoleContext').useRole;
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    // Mock role context
    mockUseRole.mockReturnValue({
      user: {
        role: 'admin'
      }
    });
    
    // Reset environment variables
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('renders nothing when no user in production mode', () => {
    process.env.NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_live_real_key';

    const { container } = render(<ModernHeader />);
    expect(container.firstChild).toBeNull();
  });

  it('renders header with mock user in development mode', async () => {
    process.env.NODE_ENV = 'development';
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_placeholder_key';

    render(<ModernHeader />);

    await waitFor(() => {
      expect(screen.getByText('Propaganda')).toBeInTheDocument();
    });

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-navigation')).toBeInTheDocument();
  });

  it('displays user information correctly', async () => {
    process.env.NODE_ENV = 'development';
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_placeholder_key';

    render(<ModernHeader />);

    await waitFor(() => {
      expect(screen.getByText('DU')).toBeInTheDocument(); // Avatar initials
    });

    // Check that the user avatar button exists
    const userButton = screen.getByRole('button', { name: 'DU' });
    expect(userButton).toBeInTheDocument();
    expect(userButton).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('handles sign out in development mode', async () => {
    process.env.NODE_ENV = 'development';
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_placeholder_key';

    render(<ModernHeader />);

    await waitFor(() => {
      expect(screen.getByText('DU')).toBeInTheDocument(); // Avatar initials
    });

    // Check that the user avatar button exists and can be clicked
    const userButton = screen.getByRole('button', { name: 'DU' });
    expect(userButton).toBeInTheDocument();
    
    // Test that clicking the button doesn't throw an error
    expect(() => fireEvent.click(userButton)).not.toThrow();
  });

  it('displays correct role badge', async () => {
    process.env.NODE_ENV = 'development';
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_placeholder_key';

    // Test different roles
    const roles = ['admin', 'ceo', 'sales', 'agency_user', 'client_user'];
    
    for (const role of roles) {
      mockUseRole.mockReturnValue({
        user: { role }
      });

      const { unmount } = render(<ModernHeader />);

      await waitFor(() => {
        expect(screen.getByText(role.toUpperCase())).toBeInTheDocument();
      });

      unmount();
    }
  });

  it('renders notification bell with indicator', async () => {
    process.env.NODE_ENV = 'development';
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_placeholder_key';

    render(<ModernHeader />);

    await waitFor(() => {
      expect(screen.getByText('DU')).toBeInTheDocument(); // Avatar initials
    });

    const notificationButton = screen.getAllByRole('button')[0]; // First button is the notification bell
    expect(notificationButton).toBeInTheDocument();
    
    // Check for notification indicator
    const indicator = notificationButton.querySelector('.bg-destructive');
    expect(indicator).toBeInTheDocument();
  });

  it('applies custom className', async () => {
    process.env.NODE_ENV = 'development';
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_placeholder_key';

    render(<ModernHeader className="custom-header-class" />);

    await waitFor(() => {
      expect(screen.getByText('DU')).toBeInTheDocument(); // Avatar initials
    });

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('custom-header-class');
  });
});
