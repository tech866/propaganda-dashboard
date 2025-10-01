import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '@/app/dashboard/page';

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

describe('Dashboard Page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard layout and enhanced dashboard', async () => {
    render(<Dashboard />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
      expect(screen.getByTestId('enhanced-dashboard')).toBeInTheDocument();
    });
  });

  it('renders the enhanced dashboard after loading', async () => {
    render(<Dashboard />);

    // Wait for loading to complete and dashboard to render
    await waitFor(() => {
      expect(screen.getByTestId('enhanced-dashboard')).toBeInTheDocument();
    });

    // Should render the dashboard layout
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
  });

  it('renders without loading state in development mode', () => {
    render(<Dashboard />);

    // In development mode with placeholder Clerk key, loading is bypassed
    // So we should see the dashboard immediately
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    expect(screen.getByTestId('enhanced-dashboard')).toBeInTheDocument();
  });
});
