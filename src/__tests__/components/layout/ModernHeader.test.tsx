import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ModernHeader from '@/components/layout/ModernHeader';
import { useRole } from '@/contexts/RoleContext';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock the role context
jest.mock('@/contexts/RoleContext', () => ({
  useRole: jest.fn()
}));

// Mock child components
jest.mock('@/components/layout/MobileNavigation', () => {
  return function MockMobileNavigation() {
    return <div data-testid="mobile-navigation">Mobile Navigation</div>;
  };
});

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseRole = useRole as jest.MockedFunction<typeof useRole>;

describe('ModernHeader', () => {
  const mockPush = jest.fn();
  const mockHasAnyRole = jest.fn();

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    } as any);

    mockHasAnyRole.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders header with user information', () => {
    const mockUser = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin'
    };

    mockUseRole.mockReturnValue({
      user: mockUser,
      isLoading: false,
      hasAnyRole: mockHasAnyRole,
      hasPermission: jest.fn(),
    });

    render(<ModernHeader />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('renders mobile navigation', () => {
    const mockUser = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin'
    };

    mockUseRole.mockReturnValue({
      user: mockUser,
      isLoading: false,
      hasAnyRole: mockHasAnyRole,
      hasPermission: jest.fn(),
    });

    render(<ModernHeader />);

    expect(screen.getByTestId('mobile-navigation')).toBeInTheDocument();
  });

  it('displays user avatar with initials', () => {
    const mockUser = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin'
    };

    mockUseRole.mockReturnValue({
      user: mockUser,
      isLoading: false,
      hasAnyRole: mockHasAnyRole,
      hasPermission: jest.fn(),
    });

    render(<ModernHeader />);

    // Check that avatar displays initials
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('handles sign out action', () => {
    const mockUser = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin'
    };

    mockUseRole.mockReturnValue({
      user: mockUser,
      isLoading: false,
      hasAnyRole: mockHasAnyRole,
      hasPermission: jest.fn(),
    });

    render(<ModernHeader />);

    // Click on user menu trigger
    const userButton = screen.getByRole('button');
    fireEvent.click(userButton);

    // Click on sign out
    const signOutButton = screen.getByText('Sign out');
    fireEvent.click(signOutButton);

    // In development mode, should redirect to home
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('shows correct role badge variant', () => {
    const mockUser = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'ceo'
    };

    mockUseRole.mockReturnValue({
      user: mockUser,
      isLoading: false,
      hasAnyRole: mockHasAnyRole,
      hasPermission: jest.fn(),
    });

    render(<ModernHeader />);

    expect(screen.getByText('CEO')).toBeInTheDocument();
  });

  it('renders notification and settings buttons', () => {
    const mockUser = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin'
    };

    mockUseRole.mockReturnValue({
      user: mockUser,
      isLoading: false,
      hasAnyRole: mockHasAnyRole,
      hasPermission: jest.fn(),
    });

    render(<ModernHeader />);

    // Check for notification button
    const notificationButton = screen.getByRole('button', { name: /notifications/i });
    expect(notificationButton).toBeInTheDocument();

    // Check for settings button in dropdown
    const userButton = screen.getByRole('button');
    fireEvent.click(userButton);
    
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('handles user with no name gracefully', () => {
    const mockUser = {
      id: 'user-1',
      name: null,
      email: 'john@example.com',
      role: 'admin'
    };

    mockUseRole.mockReturnValue({
      user: mockUser,
      isLoading: false,
      hasAnyRole: mockHasAnyRole,
      hasPermission: jest.fn(),
    });

    render(<ModernHeader />);

    // Should show 'U' as fallback
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const mockUser = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin'
    };

    mockUseRole.mockReturnValue({
      user: mockUser,
      isLoading: false,
      hasAnyRole: mockHasAnyRole,
      hasPermission: jest.fn(),
    });

    render(<ModernHeader className="custom-header" />);

    const header = screen.getByTestId('mobile-navigation').parentElement;
    expect(header).toHaveClass('custom-header');
  });
});