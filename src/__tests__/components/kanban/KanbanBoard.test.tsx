/**
 * KanbanBoard Component Tests
 * Tests for the Kanban CRM board functionality including RBAC
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useRBAC } from '@/hooks/useRBAC';

// Mock the hooks
jest.mock('@/hooks/useAuth');
jest.mock('@/contexts/WorkspaceContext');
jest.mock('@/hooks/useRBAC');

// Mock the KanbanColumn component
jest.mock('@/components/kanban/KanbanColumn', () => {
  return function MockKanbanColumn({ stage, calls, canUpdate }: any) {
    return (
      <div data-testid={`kanban-column-${stage.id}`}>
        <h3>{stage.title}</h3>
        <div data-testid={`calls-count-${stage.id}`}>{calls.length}</div>
        <div data-testid={`can-update-${stage.id}`}>{canUpdate ? 'true' : 'false'}</div>
        {calls.map((call: any) => (
          <div key={call.id} data-testid={`call-${call.id}`}>
            {call.prospect_name}
          </div>
        ))}
      </div>
    );
  };
});

// Mock the CallCard component
jest.mock('@/components/kanban/CallCard', () => {
  return function MockCallCard({ call, isUpdating }: any) {
    return (
      <div data-testid={`call-card-${call.id}`}>
        {call.prospect_name} - {isUpdating ? 'updating' : 'ready'}
      </div>
    );
  };
});

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseWorkspace = useWorkspace as jest.MockedFunction<typeof useWorkspace>;
const mockUseRBAC = useRBAC as jest.MockedFunction<typeof useRBAC>;

describe('KanbanBoard Component', () => {
  const mockCalls = [
    {
      id: '1',
      prospect_name: 'John Smith',
      company_name: 'Acme Corp',
      crm_stage: 'scheduled',
      call_outcome: 'scheduled',
      traffic_source: 'organic',
      source_of_appointment: 'email',
      cash_collected: 0,
      scheduled_call_time: '2025-01-15T14:00:00Z',
      created_at: '2025-01-10T10:00:00Z',
      updated_at: '2025-01-10T10:00:00Z',
    },
    {
      id: '2',
      prospect_name: 'Sarah Johnson',
      company_name: 'Tech Solutions Inc',
      crm_stage: 'showed',
      call_outcome: 'showed',
      traffic_source: 'meta',
      source_of_appointment: 'sdr_booked_call',
      cash_collected: 0,
      scheduled_call_time: '2025-01-14T15:30:00Z',
      actual_call_time: '2025-01-14T15:30:00Z',
      created_at: '2025-01-09T09:00:00Z',
      updated_at: '2025-01-14T15:30:00Z',
    },
  ];

  const mockOnCallUpdate = jest.fn();
  const mockOnRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      isLoaded: true,
      signOut: jest.fn(),
    });

    mockUseWorkspace.mockReturnValue({
      currentWorkspace: { id: 'workspace-1', name: 'Test Workspace' },
      isLoading: false,
      workspaces: [],
      setCurrentWorkspace: jest.fn(),
      createWorkspace: jest.fn(),
      updateWorkspace: jest.fn(),
      deleteWorkspace: jest.fn(),
    });

    mockUseRBAC.mockReturnValue({
      checkPermission: jest.fn().mockReturnValue(true),
      hasAnyPermission: jest.fn().mockReturnValue(true),
      hasAllPermissions: jest.fn().mockReturnValue(true),
      isAdmin: true,
      isManager: false,
      isClient: false,
      isViewer: false,
      canManageWorkspace: true,
      canManageMembers: true,
      canManageClients: true,
      canManageCalls: true,
      canViewAnalytics: true,
      hasPermission: true,
      userRole: 'admin',
      permissions: ['calls:update', 'calls:view'],
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    });
  });

  describe('RBAC Integration', () => {
    it('should render with proper RBAC permissions', () => {
      render(
        <DndContext>
          <KanbanBoard 
            calls={mockCalls} 
            onCallUpdate={mockOnCallUpdate} 
            onRefresh={mockOnRefresh} 
          />
        </DndContext>
      );

      // Check that all columns show canUpdate as true
      expect(screen.getByTestId('can-update-scheduled')).toHaveTextContent('true');
      expect(screen.getByTestId('can-update-showed')).toHaveTextContent('true');
      expect(screen.getByTestId('can-update-no_show')).toHaveTextContent('true');
      expect(screen.getByTestId('can-update-cancelled')).toHaveTextContent('true');
      expect(screen.getByTestId('can-update-rescheduled')).toHaveTextContent('true');
      expect(screen.getByTestId('can-update-closed_won')).toHaveTextContent('true');
      expect(screen.getByTestId('can-update-disqualified')).toHaveTextContent('true');
    });

    it('should render with restricted RBAC permissions', () => {
      mockUseRBAC.mockReturnValue({
        checkPermission: jest.fn().mockReturnValue(false),
        hasAnyPermission: jest.fn().mockReturnValue(false),
        hasAllPermissions: jest.fn().mockReturnValue(false),
        isAdmin: false,
        isManager: false,
        isClient: false,
        isViewer: true,
        canManageWorkspace: false,
        canManageMembers: false,
        canManageClients: false,
        canManageCalls: false,
        canViewAnalytics: true,
        hasPermission: false,
        userRole: 'viewer',
        permissions: ['calls:view'],
        isLoading: false,
        error: null,
        refresh: jest.fn(),
      });

      render(
        <DndContext>
          <KanbanBoard 
            calls={mockCalls} 
            onCallUpdate={mockOnCallUpdate} 
            onRefresh={mockOnRefresh} 
          />
        </DndContext>
      );

      // Check that all columns show canUpdate as false
      expect(screen.getByTestId('can-update-scheduled')).toHaveTextContent('false');
      expect(screen.getByTestId('can-update-showed')).toHaveTextContent('false');
      expect(screen.getByTestId('can-update-no_show')).toHaveTextContent('false');
      expect(screen.getByTestId('can-update-cancelled')).toHaveTextContent('false');
      expect(screen.getByTestId('can-update-rescheduled')).toHaveTextContent('false');
      expect(screen.getByTestId('can-update-closed_won')).toHaveTextContent('false');
      expect(screen.getByTestId('can-update-disqualified')).toHaveTextContent('false');
    });

    it('should call checkPermission with correct permission', () => {
      const mockCheckPermission = jest.fn().mockReturnValue(true);
      mockUseRBAC.mockReturnValue({
        checkPermission: mockCheckPermission,
        hasAnyPermission: jest.fn().mockReturnValue(true),
        hasAllPermissions: jest.fn().mockReturnValue(true),
        isAdmin: true,
        isManager: false,
        isClient: false,
        isViewer: false,
        canManageWorkspace: true,
        canManageMembers: true,
        canManageClients: true,
        canManageCalls: true,
        canViewAnalytics: true,
        hasPermission: true,
        userRole: 'admin',
        permissions: ['calls:update', 'calls:view'],
        isLoading: false,
        error: null,
        refresh: jest.fn(),
      });

      render(
        <DndContext>
          <KanbanBoard 
            calls={mockCalls} 
            onCallUpdate={mockOnCallUpdate} 
            onRefresh={mockOnRefresh} 
          />
        </DndContext>
      );

      // Should be called for each column (7 columns)
      expect(mockCheckPermission).toHaveBeenCalledWith('calls:update');
      expect(mockCheckPermission).toHaveBeenCalledTimes(7);
    });
  });

  describe('CRM Stages', () => {
    it('should render all CRM stages', () => {
      render(
        <DndContext>
          <KanbanBoard 
            calls={mockCalls} 
            onCallUpdate={mockOnCallUpdate} 
            onRefresh={mockOnRefresh} 
          />
        </DndContext>
      );

      // Check that all CRM stages are rendered
      expect(screen.getByTestId('kanban-column-scheduled')).toBeInTheDocument();
      expect(screen.getByTestId('kanban-column-showed')).toBeInTheDocument();
      expect(screen.getByTestId('kanban-column-no_show')).toBeInTheDocument();
      expect(screen.getByTestId('kanban-column-cancelled')).toBeInTheDocument();
      expect(screen.getByTestId('kanban-column-rescheduled')).toBeInTheDocument();
      expect(screen.getByTestId('kanban-column-closed_won')).toBeInTheDocument();
      expect(screen.getByTestId('kanban-column-disqualified')).toBeInTheDocument();
    });

    it('should display correct stage titles', () => {
      render(
        <DndContext>
          <KanbanBoard 
            calls={mockCalls} 
            onCallUpdate={mockOnCallUpdate} 
            onRefresh={mockOnRefresh} 
          />
        </DndContext>
      );

      expect(screen.getByText('Scheduled')).toBeInTheDocument();
      expect(screen.getByText('Showed')).toBeInTheDocument();
      expect(screen.getByText('No Show')).toBeInTheDocument();
      expect(screen.getByText('Cancelled')).toBeInTheDocument();
      expect(screen.getByText('Rescheduled')).toBeInTheDocument();
      expect(screen.getByText('Closed/Won')).toBeInTheDocument();
      expect(screen.getByText('Disqualified')).toBeInTheDocument();
    });
  });

  describe('Call Distribution', () => {
    it('should distribute calls to correct stages', () => {
      render(
        <DndContext>
          <KanbanBoard 
            calls={mockCalls} 
            onCallUpdate={mockOnCallUpdate} 
            onRefresh={mockOnRefresh} 
          />
        </DndContext>
      );

      // Check call counts in each stage
      expect(screen.getByTestId('calls-count-scheduled')).toHaveTextContent('1');
      expect(screen.getByTestId('calls-count-showed')).toHaveTextContent('1');
      expect(screen.getByTestId('calls-count-no_show')).toHaveTextContent('0');
      expect(screen.getByTestId('calls-count-cancelled')).toHaveTextContent('0');
      expect(screen.getByTestId('calls-count-rescheduled')).toHaveTextContent('0');
      expect(screen.getByTestId('calls-count-closed_won')).toHaveTextContent('0');
      expect(screen.getByTestId('calls-count-disqualified')).toHaveTextContent('0');
    });

    it('should display call names in correct stages', () => {
      render(
        <DndContext>
          <KanbanBoard 
            calls={mockCalls} 
            onCallUpdate={mockOnCallUpdate} 
            onRefresh={mockOnRefresh} 
          />
        </DndContext>
      );

      // Check that calls are in the right stages
      expect(screen.getByTestId('call-1')).toHaveTextContent('John Smith');
      expect(screen.getByTestId('call-2')).toHaveTextContent('Sarah Johnson');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing workspace gracefully', () => {
      mockUseWorkspace.mockReturnValue({
        currentWorkspace: null,
        isLoading: false,
        workspaces: [],
        setCurrentWorkspace: jest.fn(),
        createWorkspace: jest.fn(),
        updateWorkspace: jest.fn(),
        deleteWorkspace: jest.fn(),
      });

      render(
        <DndContext>
          <KanbanBoard 
            calls={mockCalls} 
            onCallUpdate={mockOnCallUpdate} 
            onRefresh={mockOnRefresh} 
          />
        </DndContext>
      );

      // Should still render the board even without workspace
      expect(screen.getByTestId('kanban-column-scheduled')).toBeInTheDocument();
    });

    it('should handle RBAC errors gracefully', () => {
      mockUseRBAC.mockReturnValue({
        checkPermission: jest.fn().mockImplementation(() => {
          throw new Error('RBAC error');
        }),
        hasAnyPermission: jest.fn().mockReturnValue(false),
        hasAllPermissions: jest.fn().mockReturnValue(false),
        isAdmin: false,
        isManager: false,
        isClient: false,
        isViewer: false,
        canManageWorkspace: false,
        canManageMembers: false,
        canManageClients: false,
        canManageCalls: false,
        canViewAnalytics: false,
        hasPermission: false,
        userRole: null,
        permissions: [],
        isLoading: false,
        error: 'RBAC error',
        refresh: jest.fn(),
      });

      // Should not throw an error
      expect(() => {
        render(
          <DndContext>
            <KanbanBoard 
              calls={mockCalls} 
              onCallUpdate={mockOnCallUpdate} 
              onRefresh={mockOnRefresh} 
            />
          </DndContext>
        );
      }).not.toThrow();
    });
  });

  describe('Component Integration', () => {
    it('should pass correct props to KanbanColumn components', () => {
      render(
        <DndContext>
          <KanbanBoard 
            calls={mockCalls} 
            onCallUpdate={mockOnCallUpdate} 
            onRefresh={mockOnRefresh} 
          />
        </DndContext>
      );

      // Check that each column receives the correct props
      const scheduledColumn = screen.getByTestId('kanban-column-scheduled');
      expect(scheduledColumn).toBeInTheDocument();
      expect(screen.getByTestId('calls-count-scheduled')).toHaveTextContent('1');
      expect(screen.getByTestId('can-update-scheduled')).toHaveTextContent('true');
    });

    it('should handle empty calls array', () => {
      render(
        <DndContext>
          <KanbanBoard 
            calls={[]} 
            onCallUpdate={mockOnCallUpdate} 
            onRefresh={mockOnRefresh} 
          />
        </DndContext>
      );

      // All columns should show 0 calls
      expect(screen.getByTestId('calls-count-scheduled')).toHaveTextContent('0');
      expect(screen.getByTestId('calls-count-showed')).toHaveTextContent('0');
      expect(screen.getByTestId('calls-count-no_show')).toHaveTextContent('0');
      expect(screen.getByTestId('calls-count-cancelled')).toHaveTextContent('0');
      expect(screen.getByTestId('calls-count-rescheduled')).toHaveTextContent('0');
      expect(screen.getByTestId('calls-count-closed_won')).toHaveTextContent('0');
      expect(screen.getByTestId('calls-count-disqualified')).toHaveTextContent('0');
    });
  });
});
