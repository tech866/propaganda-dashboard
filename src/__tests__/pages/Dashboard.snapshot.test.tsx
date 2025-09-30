import React from 'react';
import { render } from '@testing-library/react';
import Dashboard from '@/app/dashboard/page';
import { useRole } from '@/contexts/RoleContext';
import { useAgency } from '@/contexts/AgencyContext';

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

describe('Dashboard Page Snapshot', () => {
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

  it('matches snapshot for authenticated admin user', () => {
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

    const { container } = render(<Dashboard />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for loading state', () => {
    mockUseRole.mockReturnValue({
      user: null,
      isLoading: true,
      hasAnyRole: jest.fn(),
      hasPermission: jest.fn(),
    });

    const { container } = render(<Dashboard />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for unauthenticated user', () => {
    mockUseRole.mockReturnValue({
      user: null,
      isLoading: false,
      hasAnyRole: jest.fn(),
      hasPermission: jest.fn(),
    });

    const { container } = render(<Dashboard />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for unauthorized user', () => {
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

    const { container } = render(<Dashboard />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot for CEO user', () => {
    const mockUser = {
      id: 'user-1',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'ceo'
    };

    mockUseRole.mockReturnValue({
      user: mockUser,
      isLoading: false,
      hasAnyRole: jest.fn().mockReturnValue(true),
      hasPermission: jest.fn().mockReturnValue(true),
    });

    const { container } = render(<Dashboard />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
