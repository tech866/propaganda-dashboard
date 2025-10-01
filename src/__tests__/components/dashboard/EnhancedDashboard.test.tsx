import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import EnhancedDashboard from '@/components/dashboard/EnhancedDashboard';
import { AgencyProvider } from '@/contexts/AgencyContext';
import { RoleProvider } from '@/contexts/RoleContext';

// Mock the contexts
const mockAgency = {
  id: '1',
  name: 'Test Agency',
  subscription_plan: 'premium',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

const mockAgencyContext = {
  agency: mockAgency,
  isLoading: false,
  error: null,
  updateAgency: jest.fn(),
  refreshAgency: jest.fn(),
};

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

// Mock the contexts
jest.mock('@/contexts/AgencyContext', () => ({
  AgencyProvider: ({ children }: { children: React.ReactNode }) => children,
  useAgency: () => mockAgencyContext,
}));

jest.mock('@/contexts/RoleContext', () => ({
  RoleProvider: ({ children }: { children: React.ReactNode }) => children,
  useRole: () => mockRoleContext,
}));

// Mock the dashboard service
jest.mock('@/lib/services/dashboardService', () => ({
  DashboardService: jest.fn().mockImplementation(() => ({
    getKPIs: jest.fn().mockResolvedValue({
      totalAdSpend: 10000,
      totalRevenue: 15000,
      averageOrderValue: 150,
      roas: 1.5,
      adSpendChange: 10,
      revenueChange: 15,
      aovChange: 5,
      roasChange: 0.2,
    }),
    getClientSummaries: jest.fn().mockResolvedValue([
      {
        id: '1',
        name: 'Test Client',
        status: 'active',
        totalRevenue: 5000,
        totalAdSpend: 3000,
        margin: 40,
        profit: 2000,
      },
    ]),
    getRecentCampaigns: jest.fn().mockResolvedValue([
      {
        id: '1',
        name: 'Test Campaign',
        clientName: 'Test Client',
        roas: 1.5,
        status: 'active',
      },
    ]),
    getRecentFinancialActivity: jest.fn().mockResolvedValue([
      {
        id: '1',
        date: '2024-01-01',
        type: 'revenue',
        description: 'Test Revenue',
        amount: 1000,
      },
    ]),
    getAgencyStats: jest.fn().mockResolvedValue({
      totalClients: 5,
      totalCampaigns: 10,
      totalUsers: 3,
    }),
  })),
  formatCurrency: jest.fn((value) => `$${value.toLocaleString()}`),
  formatPercentage: jest.fn((value) => `${value}%`),
  formatROAS: jest.fn((value) => `${value}x`),
  getStatusColor: jest.fn(() => 'text-green-600'),
}));

describe('EnhancedDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dashboard header with agency name', async () => {
    render(<EnhancedDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Agency Dashboard')).toBeInTheDocument();
    });
  });

  it('renders the agency description', async () => {
    render(<EnhancedDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Comprehensive overview of Test Agency's advertising performance/)).toBeInTheDocument();
    });
  });

  it('renders the role badge', async () => {
    render(<EnhancedDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
    });
  });

  it('renders the user role badge', async () => {
    render(<EnhancedDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
    });
  });

  it('renders the refresh button', async () => {
    render(<EnhancedDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });
  });

  it('renders filter controls', async () => {
    render(<EnhancedDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Time Period')).toBeInTheDocument();
      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByText('Export')).toBeInTheDocument();
    });
  });

  it('renders KPI cards for admin users', async () => {
    render(<EnhancedDashboard />);
    
    await waitFor(() => {
      // Use getAllByText to handle multiple elements with same text
      const adSpendElements = screen.getAllByText('Ad Spend');
      expect(adSpendElements.length).toBeGreaterThan(0);
      
      const revenueElements = screen.getAllByText('Revenue');
      expect(revenueElements.length).toBeGreaterThan(0);
      
      const aovElements = screen.getAllByText('Average Order Value');
      expect(aovElements.length).toBeGreaterThan(0);
      
      const roasElements = screen.getAllByText('ROAS');
      expect(roasElements.length).toBeGreaterThan(0);
    });
  });

  it('renders client performance table', async () => {
    render(<EnhancedDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Client Performance')).toBeInTheDocument();
      // Use getAllByText since there might be multiple "Test Client" elements
      const clientElements = screen.getAllByText('Test Client');
      expect(clientElements.length).toBeGreaterThan(0);
    });
  });

  it('renders recent campaigns section', async () => {
    render(<EnhancedDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Recent Campaigns')).toBeInTheDocument();
      expect(screen.getByText('Test Campaign')).toBeInTheDocument();
    });
  });

  it('renders recent financial activity for admin users', async () => {
    render(<EnhancedDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Recent Financial Activity')).toBeInTheDocument();
      expect(screen.getByText('Test Revenue')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<EnhancedDashboard />);
    
    // Check for loading spinner element
    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('renders dashboard content correctly', async () => {
    render(<EnhancedDashboard />);
    
    await waitFor(() => {
      // Verify basic dashboard elements are present
      expect(screen.getByText('Test Agency Dashboard')).toBeInTheDocument();
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
    });
  });

  it('calls onRefresh when refresh button is clicked', async () => {
    const mockOnRefresh = jest.fn();
    render(<EnhancedDashboard onRefresh={mockOnRefresh} />);
    
    await waitFor(() => {
      const refreshButton = screen.getByText('Refresh');
      refreshButton.click();
    });
    
    expect(mockOnRefresh).toHaveBeenCalled();
  });
});
