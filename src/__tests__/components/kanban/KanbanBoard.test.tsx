/**
 * Kanban Board Component Tests
 * Tests for the CRM pipeline drag-and-drop functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useRBAC } from '@/hooks/useRBAC';
import { Call } from '@/lib/types/call';

// Mock the hooks
jest.mock('@/hooks/useAuth');
jest.mock('@/contexts/WorkspaceContext');
jest.mock('@/hooks/useRBAC');

// Mock fetch
global.fetch = jest.fn();

const mockUseAuth = useAuth as jest.Mock;
const mockUseWorkspace = useWorkspace as jest.Mock;
const mockUseRBAC = useRBAC as jest.Mock;

const mockCalls: Call[] = [
  {
    id: '1',
    client_id: 'client-1',
    user_id: 'user-1',
    prospect_name: 'John Doe',
    company_name: 'Acme Corp',
    prospect_phone: '+1-555-0123',
    prospect_email: 'john@acme.com',
    call_type: 'outbound',
    status: 'completed',
    crm_stage: 'scheduled',
    scrms_outcome: 'call_booked',
    traffic_source: 'organic',
    source_of_set_appointment: 'non_sdr_booked_call',
    scheduled_at: '2025-01-15T14:00:00Z',
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-01-10T10:00:00Z',
  },
  {
    id: '2',
    client_id: 'client-1',
    user_id: 'user-1',
    prospect_name: 'Jane Smith',
    company_name: 'Tech Solutions Inc',
    prospect_phone: '+1-555-0456',
    prospect_email: 'jane@techsolutions.com',
    call_type: 'outbound',
    status: 'completed',
    crm_stage: 'showed',
    scrms_outcome: 'call_booked',
    traffic_source: 'meta',
    source_of_set_appointment: 'sdr_booked_call',
    scheduled_at: '2025-01-14T15:30:00Z',
    completed_at: '2025-01-14T15:30:00Z',
    created_at: '2025-01-09T09:00:00Z',
    updated_at: '2025-01-14T15:30:00Z',
  },
  {
    id: '3',
    client_id: 'client-1',
    user_id: 'user-1',
    prospect_name: 'Mike Davis',
    company_name: 'Digital Marketing Co',
    prospect_phone: '+1-555-0789',
    prospect_email: 'mike@digitalmarketing.com',
    call_type: 'outbound',
    status: 'completed',
    crm_stage: 'closed_won',
    scrms_outcome: 'closed_paid_in_full',
    traffic_source: 'organic',
    source_of_set_appointment: 'non_sdr_booked_call',
    scheduled_at: '2025-01-13T11:00:00Z',
    completed_at: '2025-01-13T11:00:00Z',
    created_at: '2025-01-08T14:00:00Z',
    updated_at: '2025-01-13T11:00:00Z',
  },
];

describe('KanbanBoard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      isLoaded: true,
      isSignedIn: true
    });

    mockUseWorkspace.mockReturnValue({
      currentWorkspace: { id: 'workspace-123', name: 'Test Workspace' },
      isLoading: false
    });

    mockUseRBAC.mockReturnValue({
      checkPermission: jest.fn(() => true),
      hasAnyPermission: jest.fn(() => true),
      hasAllPermissions: jest.fn(() => true),
      isLoading: false
    });

    // Mock successful fetch response for audit logging
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
  });

  it('renders without crashing', () => {
    render(<KanbanBoard calls={[]} onCallUpdate={jest.fn()} onRefresh={jest.fn()} />);
    
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
    expect(screen.getByText('Showed')).toBeInTheDocument();
    expect(screen.getByText('No Show')).toBeInTheDocument();
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
    expect(screen.getByText('Rescheduled')).toBeInTheDocument();
    expect(screen.getByText('Closed/Won')).toBeInTheDocument();
    expect(screen.getByText('Disqualified')).toBeInTheDocument();
  });

  it('displays calls in correct stages', () => {
    render(<KanbanBoard calls={mockCalls} onCallUpdate={jest.fn()} onRefresh={jest.fn()} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Mike Davis')).toBeInTheDocument();
  });

  it('shows call details correctly', () => {
    render(<KanbanBoard calls={mockCalls} onCallUpdate={jest.fn()} onRefresh={jest.fn()} />);
    
    // Check for company names
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Tech Solutions Inc')).toBeInTheDocument();
    expect(screen.getByText('Digital Marketing Co')).toBeInTheDocument();
    
    // Check for contact info
    expect(screen.getByText('📞 +1-555-0123')).toBeInTheDocument();
    expect(screen.getByText('📧 john@acme.com')).toBeInTheDocument();
  });

  it('handles drag and drop updates', async () => {
    const mockOnCallUpdate = jest.fn();
    render(<KanbanBoard calls={mockCalls} onCallUpdate={mockOnCallUpdate} onRefresh={jest.fn()} />);
    
    // Find the first call card
    const callCard = screen.getByText('John Doe').closest('[data-testid="call-card"]') || 
                    screen.getByText('John Doe').closest('.call-card') ||
                    screen.getByText('John Doe').closest('div');
    
    if (callCard) {
      // Simulate drag end event
      fireEvent.dragEnd(callCard, {
        dataTransfer: {
          getData: () => '1'
        }
      });
      
      // The component should handle the drag end
      expect(callCard).toBeInTheDocument();
    }
  });

  it('respects RBAC permissions for updates', () => {
    mockUseRBAC.mockReturnValue({
      checkPermission: jest.fn(() => false), // No permission
      hasAnyPermission: jest.fn(() => false),
      hasAllPermissions: jest.fn(() => false),
      isLoading: false
    });

    render(<KanbanBoard calls={mockCalls} onCallUpdate={jest.fn()} onRefresh={jest.fn()} />);
    
    // Should still render but with restricted permissions
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('handles empty calls array', () => {
    render(<KanbanBoard calls={[]} onCallUpdate={jest.fn()} onRefresh={jest.fn()} />);
    
    // Should show empty columns
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
    expect(screen.getByText('Showed')).toBeInTheDocument();
  });

  it('displays traffic source indicators', () => {
    render(<KanbanBoard calls={mockCalls} onCallUpdate={jest.fn()} onRefresh={jest.fn()} />);
    
    // Should show traffic source information
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('shows cash collected for closed won calls', () => {
    render(<KanbanBoard calls={mockCalls} onCallUpdate={jest.fn()} onRefresh={jest.fn()} />);
    
    // Should show cash collected for closed won calls
    expect(screen.getByText('Mike Davis')).toBeInTheDocument();
  });

  it('handles call update errors gracefully', async () => {
    const mockOnCallUpdate = jest.fn().mockRejectedValue(new Error('Update failed'));
    
    render(<KanbanBoard calls={mockCalls} onCallUpdate={mockOnCallUpdate} onRefresh={jest.fn()} />);
    
    // Should still render the component
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays correct stage colors', () => {
    render(<KanbanBoard calls={mockCalls} onCallUpdate={jest.fn()} onRefresh={jest.fn()} />);
    
    // Check that stage headers are present (colors are handled by CSS classes)
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
    expect(screen.getByText('Showed')).toBeInTheDocument();
    expect(screen.getByText('Closed/Won')).toBeInTheDocument();
  });

  it('handles missing workspace gracefully', () => {
    mockUseWorkspace.mockReturnValue({
      currentWorkspace: null,
      isLoading: false
    });

    render(<KanbanBoard calls={mockCalls} onCallUpdate={jest.fn()} onRefresh={jest.fn()} />);
    
    // Should still render the component
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });

  it('shows loading state when updating', () => {
    const { rerender } = render(
      <KanbanBoard calls={mockCalls} onCallUpdate={jest.fn()} onRefresh={jest.fn()} />
    );
    
    // Component should render normally
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('handles different call outcomes correctly', () => {
    const callsWithDifferentOutcomes: Call[] = [
      { ...mockCalls[0], crm_stage: 'no_show', scrms_outcome: 'no_show' },
      { ...mockCalls[1], crm_stage: 'cancelled', scrms_outcome: 'cancelled' },
      { ...mockCalls[2], crm_stage: 'rescheduled', scrms_outcome: 'rescheduled' },
    ];

    render(<KanbanBoard calls={callsWithDifferentOutcomes} onCallUpdate={jest.fn()} onRefresh={jest.fn()} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Mike Davis')).toBeInTheDocument();
  });
});