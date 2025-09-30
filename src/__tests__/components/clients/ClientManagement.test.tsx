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

// Mock the child components
jest.mock('@/components/clients/ClientForm', () => {
  return function MockClientForm({ onSave, onCancel }: any) {
    return (
      <div data-testid="client-form">
        <button onClick={() => onSave({ name: 'Test Client' })}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  };
});

jest.mock('@/components/clients/ClientDetails', () => {
  return function MockClientDetails({ client, onEdit, onDelete, onClose }: any) {
    return (
      <div data-testid="client-details">
        <h2>{client.name}</h2>
        <button onClick={onEdit}>Edit</button>
        <button onClick={onDelete}>Delete</button>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

jest.mock('@/components/clients/ClientPerformanceDashboard', () => {
  return function MockClientPerformanceDashboard({ client }: any) {
    return (
      <div data-testid="client-performance">
        <h2>Performance for {client.name}</h2>
      </div>
    );
  };
});

jest.mock('@/components/clients/ClientAnalytics', () => {
  return function MockClientAnalytics({ client }: any) {
    return (
      <div data-testid="client-analytics">
        <h2>Analytics for {client.name}</h2>
      </div>
    );
  };
});

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
    
    await waitFor(() => {
      const addButton = screen.getByText('Add Client');
      fireEvent.click(addButton);
    });

    expect(screen.getByTestId('client-form')).toBeInTheDocument();
  });

  it('opens client details when view button is clicked', async () => {
    render(<ClientManagement />);
    
    await waitFor(() => {
      const viewButtons = screen.getAllByRole('button');
      const viewButton = viewButtons.find(button => 
        button.querySelector('svg') // Assuming the view button has an icon
      );
      if (viewButton) {
        fireEvent.click(viewButton);
      }
    });

    // The client details should be shown
    await waitFor(() => {
      expect(screen.getByTestId('client-details')).toBeInTheDocument();
    });
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
    
    await waitFor(() => {
      const statusSelect = screen.getByDisplayValue('All Statuses');
      fireEvent.change(statusSelect, { target: { value: 'active' } });
    });

    // Should still show the active test client
    expect(screen.getByText('Test Client')).toBeInTheDocument();
  });

  it('shows performance tab content when selected', async () => {
    render(<ClientManagement />);
    
    await waitFor(() => {
      const performanceTab = screen.getByText('Performance');
      fireEvent.click(performanceTab);
    });

    // Should show the performance dashboard
    expect(screen.getByTestId('client-performance')).toBeInTheDocument();
  });

  it('shows analytics tab content when selected', async () => {
    render(<ClientManagement />);
    
    await waitFor(() => {
      const analyticsTab = screen.getByText('Analytics');
      fireEvent.click(analyticsTab);
    });

    // Should show the analytics dashboard
    expect(screen.getByTestId('client-analytics')).toBeInTheDocument();
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
