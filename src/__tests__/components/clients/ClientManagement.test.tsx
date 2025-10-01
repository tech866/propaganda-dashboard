import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClientManagement } from '@/components/clients/ClientManagement';

// Mock the contexts
jest.mock('@/contexts/RoleContext', () => ({
  useRole: () => ({
    userRole: 'admin'
  })
}));

jest.mock('@/contexts/AgencyContext', () => ({
  useAgency: () => ({
    agency: {
      id: 'test-agency-id',
      name: 'Test Agency'
    }
  })
}));

// Mock the client service
jest.mock('@/lib/services/clientService', () => ({
  ClientService: jest.fn().mockImplementation(() => ({
    getClients: jest.fn().mockResolvedValue([
      {
        id: '1',
        name: 'Test Client',
        email: 'test@example.com',
        company: 'Test Company',
        status: 'active',
        industry: 'Technology',
        monthly_budget: 10000,
        created_at: '2024-01-01T00:00:00Z'
      }
    ]),
    createClient: jest.fn().mockResolvedValue({
      id: '2',
      name: 'New Client',
      email: 'new@example.com'
    }),
    updateClient: jest.fn().mockResolvedValue({
      id: '1',
      name: 'Updated Client'
    }),
    deleteClient: jest.fn().mockResolvedValue(true)
  })),
  formatCurrency: jest.fn((amount) => `$${amount.toLocaleString()}`),
  formatDate: jest.fn((date) => new Date(date).toLocaleDateString()),
  getClientStatusColor: jest.fn(() => 'text-green-600'),
  getClientStatusIcon: jest.fn(() => '✅'),
  getIndustryIcon: jest.fn(() => '💻')
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  )
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ ...props }: any) => <input {...props} />
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select">
      <button onClick={() => onValueChange('active')}>{value}</button>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({ children }: any) => <div role="combobox">{children}</div>,
  SelectValue: () => <span>All Statuses</span>
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue }: any) => <div data-testid="tabs">{children}</div>,
  TabsList: ({ children }: any) => <div role="tablist">{children}</div>,
  TabsTrigger: ({ children, value }: any) => <button role="tab" data-value={value}>{children}</button>,
  TabsContent: ({ children, value }: any) => <div role="tabpanel" data-value={value}>{children}</div>
}));

// Mock child components
jest.mock('@/components/clients/ClientForm', () => ({
  ClientForm: function MockClientForm({ onSave, onCancel }: any) {
    return (
      <div data-testid="client-form">
        <button onClick={() => onSave({ name: 'New Client' })}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  }
}));

jest.mock('@/components/clients/ClientDetails', () => ({
  ClientDetails: function MockClientDetails({ client, onEdit, onDelete, onClose }: any) {
    return (
      <div data-testid="client-details">
        <h3>{client.name}</h3>
        <button onClick={onEdit}>Edit</button>
        <button onClick={onDelete}>Delete</button>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }
}));

jest.mock('@/components/clients/ClientPerformanceDashboard', () => ({
  ClientPerformanceDashboard: function MockClientPerformanceDashboard({ client }: any) {
    return (
      <div data-testid="client-performance">
        <h3>Performance for {client.name}</h3>
      </div>
    );
  }
}));

jest.mock('@/components/clients/ClientAnalytics', () => ({
  ClientAnalytics: function MockClientAnalytics({ client }: any) {
    return (
      <div data-testid="client-analytics">
        <h3>Analytics for {client.name}</h3>
      </div>
    );
  }
}));


describe('ClientManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the main client management interface', async () => {
    render(<ClientManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Client Management')).toBeInTheDocument();
      expect(screen.getByText('Manage client accounts and view performance for Test Agency')).toBeInTheDocument();
    });
  });

  it('displays summary cards with client statistics', async () => {
    render(<ClientManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Clients')).toBeInTheDocument();
      expect(screen.getByText('Active Clients')).toBeInTheDocument();
      expect(screen.getByText('Total Budget')).toBeInTheDocument();
      expect(screen.getByText('Industries')).toBeInTheDocument();
    });
  });

  it('shows client directory with client cards', async () => {
    render(<ClientManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Client')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Test Company')).toBeInTheDocument();
    });
  });

  it('opens client form when Add Client button is clicked', async () => {
    render(<ClientManagement />);
    
    // Wait for the component to load and render the Add Client button
    await waitFor(() => {
      expect(screen.getByText('Add Client')).toBeInTheDocument();
    });
    
    const addButton = screen.getByText('Add Client');
    fireEvent.click(addButton);

    // Should show the client form modal
    expect(screen.getByTestId('client-form')).toBeInTheDocument();
  });

  it('opens client details when view button is clicked', async () => {
    render(<ClientManagement />);
    
    // Wait for the component to load and render the client cards
    await waitFor(() => {
      expect(screen.getByText('Test Client')).toBeInTheDocument();
    });
    
    // Find the view button by looking for the Eye icon specifically
    const viewButtons = screen.getAllByRole('button');
    const viewButton = viewButtons.find(button => {
      const svg = button.querySelector('svg');
      return svg && svg.getAttribute('class')?.includes('lucide-eye');
    });
    
    expect(viewButton).toBeDefined();
    
    if (viewButton) {
      fireEvent.click(viewButton);
      
      // The client details should be shown
      await waitFor(() => {
        expect(screen.getByTestId('client-details')).toBeInTheDocument();
      });
    }
  });

  it('filters clients based on search query', async () => {
    render(<ClientManagement />);
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search clients...');
      fireEvent.change(searchInput, { target: { value: 'Test' } });
    });

    // Should still show the test client
    expect(screen.getByText('Test Client')).toBeInTheDocument();
  });

  it('filters clients based on status', async () => {
    render(<ClientManagement />);
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Test Client')).toBeInTheDocument();
    });
    
    // Find the status select dropdown (first combobox should be status)
    const statusSelects = screen.getAllByRole('combobox');
    const statusSelect = statusSelects[0]; // First one should be status
    fireEvent.click(statusSelect);
    
    // Select the "Active" option
    const activeOption = screen.getByText('Active');
    fireEvent.click(activeOption);

    // Should still show the test client since it's active
    expect(screen.getByText('Test Client')).toBeInTheDocument();
  });

  it('shows performance tab content when selected', async () => {
    render(<ClientManagement />);
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Test Client')).toBeInTheDocument();
    });
    
    // Click on the Performance tab
    const performanceTab = screen.getByText('Performance');
    fireEvent.click(performanceTab);

    // Should show the "Select a Client" message since no client is selected
    expect(screen.getAllByText('Select a Client')).toHaveLength(2); // Both tabs show this message
  });

  it('shows analytics tab content when selected', async () => {
    render(<ClientManagement />);
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Test Client')).toBeInTheDocument();
    });
    
    // Click on the Analytics tab
    const analyticsTab = screen.getByText('Analytics');
    fireEvent.click(analyticsTab);

    // Should show the "Select a Client" message since no client is selected
    expect(screen.getAllByText('Select a Client')).toHaveLength(2); // Both tabs show this message
  });

  it('handles loading state', () => {
    // Mock the service to return a pending promise
    const { ClientService } = require('@/lib/services/clientService');
    ClientService.mockImplementation(() => ({
      getClients: jest.fn().mockReturnValue(new Promise(() => {})) // Never resolves
    }));

    render(<ClientManagement />);
    
    // Should show loading state
    expect(screen.getByText('Client Management')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    // Mock the service to return an error
    const { ClientService } = require('@/lib/services/clientService');
    ClientService.mockImplementation(() => ({
      getClients: jest.fn().mockRejectedValue(new Error('Failed to load clients'))
    }));

    render(<ClientManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Error Loading Data')).toBeInTheDocument();
      expect(screen.getByText('Failed to load clients. Please try again.')).toBeInTheDocument();
    });
  });
});
