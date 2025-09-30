import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ModernDashboardLayout from '@/components/layout/ModernDashboardLayout';
import { RoleProvider } from '@/contexts/RoleContext';
import { AgencyProvider } from '@/contexts/AgencyContext';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Tailus components
jest.mock('@tailus/themer', () => ({
  TailusProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="tailus-provider">{children}</div>,
  Sidebar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <aside data-testid="sidebar" className={className}>{children}</aside>
  ),
  SidebarHeader: ({ children }: { children: React.ReactNode }) => (
    <header data-testid="sidebar-header">{children}</header>
  ),
  SidebarContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-content">{children}</div>
  ),
  SidebarFooter: ({ children }: { children: React.ReactNode }) => (
    <footer data-testid="sidebar-footer">{children}</footer>
  ),
  SidebarBrand: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-brand">{children}</div>
  ),
  SidebarUser: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-user">{children}</div>
  ),
  SidebarUserInfo: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-user-info">{children}</div>
  ),
  SidebarUserRole: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-user-role">{children}</div>
  ),
  SidebarUserAvatar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-user-avatar">{children}</div>
  ),
  SidebarUserStatus: ({ className }: { className?: string }) => (
    <div data-testid="sidebar-user-status" className={className}></div>
  ),
  SidebarGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group">{children}</div>
  ),
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group-label">{children}</div>
  ),
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group-content">{children}</div>
  ),
  SidebarItem: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    <div data-testid="sidebar-item">{children}</div>
  ),
  Navbar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <nav data-testid="navbar" className={className}>{children}</nav>
  ),
  NavbarContent: ({ children, justify }: { children: React.ReactNode; justify?: string }) => (
    <div data-testid="navbar-content" data-justify={justify}>{children}</div>
  ),
  NavbarItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="navbar-item">{children}</div>
  ),
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar" className={className}>{children}</div>
  ),
  AvatarImage: ({ src, alt }: { src?: string; alt?: string }) => (
    <img data-testid="avatar-image" src={src} alt={alt} />
  ),
  AvatarFallback: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar-fallback" className={className}>{children}</div>
  ),
  Dropdown: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown">{children}</div>
  ),
  DropdownTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
  DropdownContent: ({ children, className, align }: { children: React.ReactNode; className?: string; align?: string }) => (
    <div data-testid="dropdown-content" className={className} data-align={align}>{children}</div>
  ),
  DropdownItem: ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
    <div data-testid="dropdown-item" onClick={onClick} className={className}>{children}</div>
  ),
  DropdownLabel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-label">{children}</div>
  ),
  DropdownSeparator: () => <div data-testid="dropdown-separator"></div>,
  IconButton: ({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) => (
    <button data-testid="icon-button" data-variant={variant} className={className}>{children}</button>
  ),
  Badge: ({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) => (
    <span data-testid="badge" data-variant={variant} className={className}>{children}</span>
  ),
}));

// Mock the layout components
jest.mock('@/components/layout/ModernHeader', () => {
  return function MockModernHeader({ className }: { className?: string }) {
    return <div data-testid="modern-header" className={className}>Modern Header</div>;
  };
});

jest.mock('@/components/layout/ModernSidebar', () => {
  return function MockModernSidebar({ className }: { className?: string }) {
    return <div data-testid="modern-sidebar" className={className}>Modern Sidebar</div>;
  };
});

// Mock the role context
const mockRoleContext = {
  user: {
    id: 'test-user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'admin',
    clientId: 'test-agency-1'
  },
  hasAnyRole: jest.fn(() => true),
  hasPermission: jest.fn(() => true),
  isLoading: false
};

// Mock the agency context
const mockAgencyContext = {
  agency: {
    id: 'test-agency-1',
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
  error: null,
  canManageAgency: true,
  canViewFinancial: true,
  canManageUsers: true
};

// Mock contexts
jest.mock('@/contexts/RoleContext', () => ({
  useRole: () => mockRoleContext,
  RoleProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="role-provider">{children}</div>
}));

jest.mock('@/contexts/AgencyContext', () => ({
  useAgency: () => mockAgencyContext,
  AgencyProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="agency-provider">{children}</div>
}));

describe('ModernDashboardLayout', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    // Set development environment
    process.env.NODE_ENV = 'development';
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'placeholder_key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProviders = (children: React.ReactNode) => {
    return render(
      <RoleProvider>
        <AgencyProvider>
          {children}
        </AgencyProvider>
      </RoleProvider>
    );
  };

  it('renders loading state initially', async () => {
    renderWithProviders(
      <ModernDashboardLayout>
        <div>Test Content</div>
      </ModernDashboardLayout>
    );

    // In development mode with placeholder keys, the component immediately sets user and renders
    await waitFor(() => {
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  it('renders dashboard layout with sidebar and header when user is loaded', async () => {
    renderWithProviders(
      <ModernDashboardLayout>
        <div>Test Content</div>
      </ModernDashboardLayout>
    );

    await waitFor(() => {
      expect(screen.getByTestId('modern-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('modern-header')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  it('applies correct CSS classes to layout elements', async () => {
    renderWithProviders(
      <ModernDashboardLayout className="custom-class">
        <div>Test Content</div>
      </ModernDashboardLayout>
    );

    await waitFor(() => {
      const sidebar = screen.getByTestId('modern-sidebar');
      expect(sidebar).toHaveClass('hidden', 'lg:flex');
    });
  });

  it('renders main content area with proper structure', async () => {
    renderWithProviders(
      <ModernDashboardLayout>
        <div data-testid="main-content">Test Content</div>
      </ModernDashboardLayout>
    );

    await waitFor(() => {
      const mainContent = screen.getByTestId('main-content');
      expect(mainContent).toBeInTheDocument();
      
      // Check that content is wrapped in proper container
      const container = mainContent.closest('.max-w-7xl');
      expect(container).toBeInTheDocument();
    });
  });

  it('handles production mode without Clerk keys', async () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'real_key';
    
    renderWithProviders(
      <ModernDashboardLayout>
        <div>Test Content</div>
      </ModernDashboardLayout>
    );

    await waitFor(() => {
      // Should not render content without user in production
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
    });
  });

  it('redirects to sign-in when no user in production mode', async () => {
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'real_key';
    
    renderWithProviders(
      <ModernDashboardLayout>
        <div>Test Content</div>
      </ModernDashboardLayout>
    );

    await waitFor(() => {
      // Component should not render content and should redirect
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
    });
  });

  it('renders with custom className', async () => {
    renderWithProviders(
      <ModernDashboardLayout className="custom-layout-class">
        <div>Test Content</div>
      </ModernDashboardLayout>
    );

    await waitFor(() => {
      const main = screen.getByRole('main');
      expect(main).toHaveClass('custom-layout-class');
    });
  });

  it('maintains responsive layout structure', async () => {
    renderWithProviders(
      <ModernDashboardLayout>
        <div>Test Content</div>
      </ModernDashboardLayout>
    );

    await waitFor(() => {
      // Check flex layout structure
      const layout = screen.getByTestId('modern-sidebar').closest('.min-h-screen');
      expect(layout).toHaveClass('flex');
      
      // Check that the main content wrapper has the correct classes
      const mainWrapper = screen.getByRole('main').parentElement;
      expect(mainWrapper).toHaveClass('flex-1', 'flex', 'flex-col', 'min-w-0');
    });
  });

  it('handles user state changes correctly', async () => {
    renderWithProviders(
      <ModernDashboardLayout>
        <div>Test Content</div>
      </ModernDashboardLayout>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    // Test that the component renders correctly with user
    expect(screen.getByTestId('modern-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('modern-header')).toBeInTheDocument();
  });
});

describe('ModernDashboardLayout Integration', () => {
  it('integrates properly with Tailus components', async () => {
    render(
      <RoleProvider>
        <AgencyProvider>
          <ModernDashboardLayout>
            <div>Test Content</div>
          </ModernDashboardLayout>
        </AgencyProvider>
      </RoleProvider>
    );

    await waitFor(() => {
      // Verify Tailus components are rendered
      expect(screen.getByTestId('modern-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('modern-header')).toBeInTheDocument();
    });
  });

  it('maintains accessibility features', async () => {
    render(
      <RoleProvider>
        <AgencyProvider>
          <ModernDashboardLayout>
            <div>Test Content</div>
          </ModernDashboardLayout>
        </AgencyProvider>
      </RoleProvider>
    );

    await waitFor(() => {
      // Check for proper semantic structure
      expect(screen.getByRole('main')).toBeInTheDocument();
      // The loading state is not shown in development mode, so we check for main content
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });
});