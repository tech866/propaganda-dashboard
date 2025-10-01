import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import MobileNavigation from '@/components/layout/MobileNavigation';

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

describe('MobileNavigation', () => {
  beforeEach(() => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the mobile navigation trigger button', () => {
    render(<MobileNavigation />);
    
    const triggerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    expect(triggerButton).toBeInTheDocument();
  });

  it('opens the mobile navigation sheet when trigger is clicked', () => {
    render(<MobileNavigation />);
    
    const triggerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    fireEvent.click(triggerButton);
    
    // Check if the sheet content is visible
    expect(screen.getByText('Propaganda')).toBeInTheDocument();
    // Use getAllByText and check the navigation item specifically
    const dashboardElements = screen.getAllByText('Dashboard');
    expect(dashboardElements.length).toBeGreaterThan(0);
  });

  it('renders navigation items in the mobile sheet', () => {
    render(<MobileNavigation />);
    
    const triggerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    fireEvent.click(triggerButton);
    
    const dashboardElements = screen.getAllByText('Dashboard');
    expect(dashboardElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Log Call')).toBeInTheDocument();
    expect(screen.getByText('View Calls')).toBeInTheDocument();
    expect(screen.getByText('Integrations')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
  });

  it('renders admin section for admin users', () => {
    render(<MobileNavigation />);
    
    const triggerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    fireEvent.click(triggerButton);
    
    expect(screen.getByText('Administration')).toBeInTheDocument();
    expect(screen.getByText('Manage Users')).toBeInTheDocument();
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('renders user info in footer', () => {
    render(<MobileNavigation />);
    
    const triggerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    fireEvent.click(triggerButton);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('renders navigation items for admin users', () => {
    render(<MobileNavigation />);
    
    const triggerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    fireEvent.click(triggerButton);
    
    // Should show admin items for admin users
    expect(screen.getByText('Manage Users')).toBeInTheDocument();
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<MobileNavigation className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders user info correctly', () => {
    render(<MobileNavigation />);
    
    const triggerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    fireEvent.click(triggerButton);
    
    // Should show user info for authenticated users
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('renders navigation items correctly', () => {
    render(<MobileNavigation />);
    
    const triggerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    fireEvent.click(triggerButton);
    
    // Verify basic navigation items are present
    expect(screen.getByText('Propaganda')).toBeInTheDocument();
    const dashboardElements = screen.getAllByText('Dashboard');
    expect(dashboardElements.length).toBeGreaterThan(0);
  });
});
