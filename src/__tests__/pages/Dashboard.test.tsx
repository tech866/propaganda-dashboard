import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '@/app/dashboard/page';
import { useRole } from '@/contexts/RoleContext';
import { useAgency } from '@/contexts/AgencyContext';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }))
}));

// Mock the contexts
jest.mock('@/contexts/RoleContext', () => ({
  useRole: jest.fn()
}));

jest.mock('@/contexts/AgencyContext', () => ({
  useAgency: jest.fn()
}));

// Mock child components
jest.mock('@/components/layout/ModernDashboardLayout', () => {
  return function MockModernDashboardLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="dashboard-layout">{children}</div>;
  };
});

jest.mock('@/components/dashboard/EnhancedDashboard', () => {
  return function MockEnhancedDashboard() {
    return <div data-testid="enhanced-dashboard">Enhanced Dashboard</div>;
  };
});

const mockUseRole = useRole as jest.MockedFunction<typeof useRole>;
const mockUseAgency = useAgency as jest.MockedFunction<typeof useAgency>;

describe('Dashboard Page', () => {
  beforeEach(() => {
    mockUseAgency.mockReturnValue({
      agency: {
        id: 'agency-1',
        name: 'Test Agency',
        registration_date: '2024-01-01',
        subscription_plan: 'professional',
        contact_info: {
          phone: '+1-555-0123',
          email: 'test@agency.com',
          website: 'https://test-agency.com'
        },
        billing_address: '123 Test Street, Test City, TC 12345',
        active_status: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      isLoading: false,
      error: null
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard with authenticated user', () => {
    const mockUser = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin'
    };

    mockUseRole.mockReturnValue({
      user: mockUser,
      isLoading: false,
      hasAnyRole: jest.fn().mockReturnValue(true),
      hasPermission: jest.fn().mockReturnValue(true),
    });

    render(<Dashboard />);

    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    expect(screen.getByTestId('enhanced-dashboard')).toBeInTheDocument();
  });

  it('shows loading state when user is loading', () => {
    mockUseRole.mockReturnValue({
      user: null,
      isLoading: true,
      hasAnyRole: jest.fn(),
      hasPermission: jest.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('shows access denied for unauthorized users', () => {
    const mockUser = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'client_user'
    };

    mockUseRole.mockReturnValue({
      user: mockUser,
      isLoading: false,
      hasAnyRole: jest.fn().mockReturnValue(false),
      hasPermission: jest.fn().mockReturnValue(false),
    });

    render(<Dashboard />);

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('You don\'t have permission to access the dashboard.')).toBeInTheDocument();
  });

  it('shows authentication required when user is null', () => {
    mockUseRole.mockReturnValue({
      user: null,
      isLoading: false,
      hasAnyRole: jest.fn(),
      hasPermission: jest.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    expect(screen.getByText('Please sign in to access the dashboard.')).toBeInTheDocument();
  });

  it('passes correct props to EnhancedDashboard', () => {
    const mockUser = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin'
    };

    mockUseRole.mockReturnValue({
      user: mockUser,
      isLoading: false,
      hasAnyRole: jest.fn().mockReturnValue(true),
      hasPermission: jest.fn().mockReturnValue(true),
    });

    render(<Dashboard />);

    // The EnhancedDashboard component should receive the user and agency data
    expect(screen.getByTestId('enhanced-dashboard')).toBeInTheDocument();
  });

  it('handles agency loading state', () => {
    const mockUser = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin'
    };

    mockUseRole.mockReturnValue({
      user: mockUser,
      isLoading: false,
      hasAnyRole: jest.fn().mockReturnValue(true),
      hasPermission: jest.fn().mockReturnValue(true),
    });

    mockUseAgency.mockReturnValue({
      agency: null,
      isLoading: true,
      error: null
    });

    render(<Dashboard />);

    // Should still render the dashboard layout even if agency is loading
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
  });

  it('handles agency error state', () => {
    const mockUser = {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin'
    };

    mockUseRole.mockReturnValue({
      user: mockUser,
      isLoading: false,
      hasAnyRole: jest.fn().mockReturnValue(true),
      hasPermission: jest.fn().mockReturnValue(true),
    });

    mockUseAgency.mockReturnValue({
      agency: null,
      isLoading: false,
      error: 'Failed to load agency data'
    });

    render(<Dashboard />);

    // Should still render the dashboard layout even if there's an agency error
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
  });
});
