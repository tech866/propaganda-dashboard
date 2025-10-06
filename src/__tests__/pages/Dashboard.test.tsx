import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '@/app/dashboard/page';
import { AgencyProvider } from '@/contexts/AgencyContext';
import { RoleProvider } from '@/contexts/RoleContext';

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

// Mock Clerk hooks
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(() => ({
    user: {
      id: 'test-user-id',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User'
    },
    isLoaded: true,
    isSignedIn: true
  })),
  useOrganization: jest.fn(() => ({
    organization: {
      id: 'test-org-id',
      name: 'Test Organization'
    },
    isLoaded: true
  }))
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

jest.mock('@/components/dashboard/ProgressiveDashboard', () => {
  return function MockProgressiveDashboard() {
    return <div data-testid="progressive-dashboard">Progressive Dashboard</div>;
  };
});

// Mock the contexts to prevent real context usage
jest.mock('@/contexts/AgencyContext', () => ({
  AgencyProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAgency: () => ({
    agency: { id: '1', name: 'Test Agency' },
    isLoading: false,
    error: null
  })
}));

jest.mock('@/contexts/RoleContext', () => ({
  RoleProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useRole: () => ({
    user: { id: 'test-user', role: 'admin' },
    isLoading: false,
    error: null
  })
}));

// Helper function to render Dashboard (components are mocked so no providers needed)
const renderDashboard = () => {
  return render(<Dashboard />);
};

describe('Dashboard Page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard layout and progressive dashboard', async () => {
    renderDashboard();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
      expect(screen.getByTestId('progressive-dashboard')).toBeInTheDocument();
    });
  });

  it('renders the progressive dashboard after loading', async () => {
    renderDashboard();

    // Wait for loading to complete and dashboard to render
    await waitFor(() => {
      expect(screen.getByTestId('progressive-dashboard')).toBeInTheDocument();
    });

    // Should render the dashboard layout
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
  });

  it('renders without loading state in development mode', () => {
    renderDashboard();

    // In development mode with placeholder Clerk key, loading is bypassed
    // So we should see the dashboard immediately
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    expect(screen.getByTestId('progressive-dashboard')).toBeInTheDocument();
  });
});
