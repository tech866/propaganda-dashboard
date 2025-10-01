import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import ModernSidebar from '@/components/layout/ModernSidebar';
import { RoleProvider } from '@/contexts/RoleContext';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock the RoleContext
const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'admin',
  publicMetadata: {
    role: 'admin'
  }
};

const mockRoleContext = {
  user: mockUser,
  isLoading: false,
  hasAnyRole: jest.fn(() => true),
  hasPermission: jest.fn(() => true),
  hasRole: jest.fn(() => true),
  isAdmin: true,
  isCEO: false,
  isSales: false,
  isAgencyUser: false,
  isClientUser: false,
};

// Mock the RoleProvider
jest.mock('@/contexts/RoleContext', () => ({
  RoleProvider: ({ children }: { children: React.ReactNode }) => children,
  useRole: () => mockRoleContext,
}));

describe('ModernSidebar', () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the sidebar with branding', () => {
    render(<ModernSidebar />);
    
    expect(screen.getByText('Propaganda')).toBeInTheDocument();
    expect(screen.getByText('Agency Dashboard')).toBeInTheDocument();
  });

  it('renders navigation items', () => {
    render(<ModernSidebar />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Log Call')).toBeInTheDocument();
    expect(screen.getByText('View Calls')).toBeInTheDocument();
    expect(screen.getByText('Client Management')).toBeInTheDocument();
    expect(screen.getByText('Integrations')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
    // Use getAllByText since there might be multiple "Settings" elements
    const settingsElements = screen.getAllByText('Settings');
    expect(settingsElements.length).toBeGreaterThan(0);
  });

  it('highlights active navigation item', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
    
    render(<ModernSidebar />);
    
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('active');
  });

  it('renders admin section for admin users', () => {
    render(<ModernSidebar />);
    
    expect(screen.getByText('Administration')).toBeInTheDocument();
    expect(screen.getByText('Manage Users')).toBeInTheDocument();
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('renders user info in footer', () => {
    render(<ModernSidebar />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('renders admin navigation items for admin users', () => {
    render(<ModernSidebar />);
    
    // Should show admin items for admin users
    expect(screen.getByText('Manage Users')).toBeInTheDocument();
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<ModernSidebar className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders with proper accessibility attributes', () => {
    render(<ModernSidebar />);
    
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toBeInTheDocument();
  });

  it('renders user info correctly', () => {
    render(<ModernSidebar />);
    
    // Should show user info for authenticated users
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });
});
