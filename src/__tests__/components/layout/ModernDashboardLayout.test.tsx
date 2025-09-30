import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ModernDashboardLayout from '@/components/layout/ModernDashboardLayout';
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
jest.mock('@/components/layout/ModernHeader', () => {
  return function MockModernHeader() {
    return <div data-testid="modern-header">Modern Header</div>;
  };
});

jest.mock('@/components/layout/ModernSidebar', () => {
  return function MockModernSidebar({ className }: { className?: string }) {
    return <div data-testid="modern-sidebar" className={className}>Modern Sidebar</div>;
  };
});

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseRole = useRole as jest.MockedFunction<typeof useRole>;

describe('ModernDashboardLayout', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when user is loading', () => {
    mockUseRole.mockReturnValue({
      user: null,
      isLoading: true,
      hasAnyRole: jest.fn(),
      hasPermission: jest.fn(),
    });

    render(
      <ModernDashboardLayout>
        <div data-testid="test-content">Test Content</div>
      </ModernDashboardLayout>
    );

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    expect(screen.queryByTestId('test-content')).not.toBeInTheDocument();
  });

  it('renders authentication required when user is null', () => {
    mockUseRole.mockReturnValue({
      user: null,
      isLoading: false,
      hasAnyRole: jest.fn(),
      hasPermission: jest.fn(),
    });

    render(
      <ModernDashboardLayout>
        <div data-testid="test-content">Test Content</div>
      </ModernDashboardLayout>
    );

    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    expect(screen.getByText('Please sign in to access the dashboard.')).toBeInTheDocument();
    expect(screen.queryByTestId('test-content')).not.toBeInTheDocument();
  });

  it('renders dashboard layout when user is authenticated', () => {
    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin'
    };

    mockUseRole.mockReturnValue({
      user: mockUser,
      isLoading: false,
      hasAnyRole: jest.fn(),
      hasPermission: jest.fn(),
    });

    render(
      <ModernDashboardLayout>
        <div data-testid="test-content">Test Content</div>
      </ModernDashboardLayout>
    );

    expect(screen.getByTestId('modern-header')).toBeInTheDocument();
    expect(screen.getByTestId('modern-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('applies correct CSS classes to sidebar', () => {
    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin'
    };

    mockUseRole.mockReturnValue({
      user: mockUser,
      isLoading: false,
      hasAnyRole: jest.fn(),
      hasPermission: jest.fn(),
    });

    render(
      <ModernDashboardLayout>
        <div>Test Content</div>
      </ModernDashboardLayout>
    );

    const sidebar = screen.getByTestId('modern-sidebar');
    expect(sidebar).toHaveClass('hidden', 'lg:flex');
  });

  it('applies custom className to main content', () => {
    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin'
    };

    mockUseRole.mockReturnValue({
      user: mockUser,
      isLoading: false,
      hasAnyRole: jest.fn(),
      hasPermission: jest.fn(),
    });

    render(
      <ModernDashboardLayout className="custom-class">
        <div data-testid="test-content">Test Content</div>
      </ModernDashboardLayout>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveClass('custom-class');
  });

  it('has correct layout structure', () => {
    const mockUser = {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      role: 'admin'
    };

    mockUseRole.mockReturnValue({
      user: mockUser,
      isLoading: false,
      hasAnyRole: jest.fn(),
      hasPermission: jest.fn(),
    });

    render(
      <ModernDashboardLayout>
        <div data-testid="test-content">Test Content</div>
      </ModernDashboardLayout>
    );

    // Check that the main components are rendered
    expect(screen.getByTestId('modern-header')).toBeInTheDocument();
    expect(screen.getByTestId('modern-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();

    // Check that main element exists
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
  });
});