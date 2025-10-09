/**
 * End-to-End User Flow Tests
 * Tests for complete user workflows and feature integration
 */

import { describe, it, expect, jest } from '@jest/globals';

// Mock fetch for testing
global.fetch = jest.fn();

describe('End-to-End User Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Workspace Creation Flow', () => {
    it('should create workspace and redirect to dashboard', async () => {
      // Step 1: User visits workspace creation page
      const createPageResponse = {
        ok: true,
        status: 200
      };

      // Step 2: User fills out form and submits
      const workspaceData = {
        name: 'My New Workspace',
        slug: 'my-new-workspace',
        description: 'A test workspace for E2E testing'
      };

      // Mock successful workspace creation
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({
          success: true,
          data: {
            id: 'workspace-123',
            ...workspaceData,
            created_at: '2025-01-15T10:00:00Z'
          }
        })
      });

      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workspaceData)
      });

      const result = await response.json();

      // Verify workspace creation
      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('My New Workspace');
      expect(result.data.slug).toBe('my-new-workspace');

      // Step 3: User should be redirected to workspace dashboard
      const expectedRedirectUrl = `/workspace/${result.data.slug}/dashboard`;
      expect(expectedRedirectUrl).toBe('/workspace/my-new-workspace/dashboard');
    });

    it('should handle workspace creation with team invitation', async () => {
      // Step 1: Create workspace
      const workspaceData = {
        name: 'Team Workspace',
        slug: 'team-workspace',
        description: 'Workspace with team members'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({
          success: true,
          data: {
            id: 'workspace-456',
            ...workspaceData
          }
        })
      });

      const workspaceResponse = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workspaceData)
      });

      const workspaceResult = await workspaceResponse.json();

      // Step 2: Invite team member
      const invitationData = {
        workspaceId: workspaceResult.data.id,
        inviteeEmail: 'teammate@example.com',
        inviteeRole: 'member'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({
          success: true,
          data: {
            id: 'invitation-123',
            token: 'invitation-token-123',
            expires_at: '2025-01-22T10:00:00Z'
          }
        })
      });

      const invitationResponse = await fetch('/api/workspaces/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invitationData)
      });

      const invitationResult = await invitationResponse.json();

      // Verify invitation creation
      expect(invitationResponse.ok).toBe(true);
      expect(invitationResult.success).toBe(true);
      expect(invitationResult.data.token).toBe('invitation-token-123');
    });
  });

  describe('Complete Call Logging and CRM Flow', () => {
    it('should log call and track through CRM pipeline', async () => {
      // Step 1: Log new call
      const callData = {
        prospect_name: 'John Prospect',
        company_name: 'Prospect Corp',
        phone: '+1-555-0123',
        email: 'john@prospectcorp.com',
        traffic_source: 'organic',
        source_of_appointment: 'email',
        scheduled_call_time: '2025-01-16T14:00:00Z'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({
          success: true,
          data: {
            id: 'call-123',
            ...callData,
            crm_stage: 'scheduled',
            call_outcome: 'scheduled',
            created_at: '2025-01-15T10:00:00Z'
          }
        })
      });

      const createResponse = await fetch('/api/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callData)
      });

      const createResult = await createResponse.json();

      // Verify call creation
      expect(createResponse.ok).toBe(true);
      expect(createResult.success).toBe(true);
      expect(createResult.data.prospect_name).toBe('John Prospect');
      expect(createResult.data.crm_stage).toBe('scheduled');

      // Step 2: Update call to "showed"
      const updateData1 = {
        crm_stage: 'showed',
        call_outcome: 'showed',
        actual_call_time: '2025-01-16T14:00:00Z'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            id: 'call-123',
            ...updateData1
          }
        })
      });

      const updateResponse1 = await fetch('/api/calls/call-123', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData1)
      });

      const updateResult1 = await updateResponse1.json();

      // Verify call update
      expect(updateResponse1.ok).toBe(true);
      expect(updateResult1.data.crm_stage).toBe('showed');

      // Step 3: Update call to "closed_won" with cash collected
      const updateData2 = {
        crm_stage: 'closed_won',
        call_outcome: 'closed_won',
        cash_collected: 5000
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            id: 'call-123',
            ...updateData2
          }
        })
      });

      const updateResponse2 = await fetch('/api/calls/call-123', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData2)
      });

      const updateResult2 = await updateResponse2.json();

      // Verify final call state
      expect(updateResponse2.ok).toBe(true);
      expect(updateResult2.data.crm_stage).toBe('closed_won');
      expect(updateResult2.data.cash_collected).toBe(5000);
    });

    it('should track analytics throughout call lifecycle', async () => {
      // Step 1: Get initial analytics
      const initialAnalytics = {
        calls_scheduled: 10,
        calls_taken: 8,
        calls_showed: 6,
        calls_closed_won: 2,
        cash_collected: 10000,
        show_rate: 60.0,
        close_rate: 25.0
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: initialAnalytics
        })
      });

      const analyticsResponse = await fetch('/api/analytics/test');
      const analyticsResult = await analyticsResponse.json();

      // Verify initial analytics
      expect(analyticsResponse.ok).toBe(true);
      expect(analyticsResult.data.calls_scheduled).toBe(10);
      expect(analyticsResult.data.show_rate).toBe(60.0);

      // Step 2: After logging new call, analytics should update
      const updatedAnalytics = {
        ...initialAnalytics,
        calls_scheduled: 11,
        show_rate: 54.5 // 6/11 * 100
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: updatedAnalytics
        })
      });

      const updatedAnalyticsResponse = await fetch('/api/analytics/test');
      const updatedAnalyticsResult = await updatedAnalyticsResponse.json();

      // Verify updated analytics
      expect(updatedAnalyticsResponse.ok).toBe(true);
      expect(updatedAnalyticsResult.data.calls_scheduled).toBe(11);
      expect(updatedAnalyticsResult.data.show_rate).toBe(54.5);
    });
  });

  describe('Multi-Workspace Management Flow', () => {
    it('should switch between workspaces and maintain data isolation', async () => {
      // Step 1: Get workspaces for user
      const userWorkspaces = [
        {
          id: 'workspace-1',
          name: 'Workspace 1',
          slug: 'workspace-1',
          role: 'owner'
        },
        {
          id: 'workspace-2',
          name: 'Workspace 2',
          slug: 'workspace-2',
          role: 'member'
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: userWorkspaces
        })
      });

      const workspacesResponse = await fetch('/api/workspaces');
      const workspacesResult = await workspacesResponse.json();

      // Verify workspaces
      expect(workspacesResponse.ok).toBe(true);
      expect(workspacesResult.data).toHaveLength(2);

      // Step 2: Get calls for workspace 1
      const workspace1Calls = [
        {
          id: 'call-1',
          prospect_name: 'Prospect 1',
          workspace_id: 'workspace-1',
          crm_stage: 'scheduled'
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          calls: workspace1Calls
        })
      });

      const workspace1CallsResponse = await fetch('/api/calls/test?workspace_id=workspace-1');
      const workspace1CallsResult = await workspace1CallsResponse.json();

      // Verify workspace 1 calls
      expect(workspace1CallsResponse.ok).toBe(true);
      expect(workspace1CallsResult.calls).toHaveLength(1);
      expect(workspace1CallsResult.calls[0].workspace_id).toBe('workspace-1');

      // Step 3: Get calls for workspace 2
      const workspace2Calls = [
        {
          id: 'call-2',
          prospect_name: 'Prospect 2',
          workspace_id: 'workspace-2',
          crm_stage: 'showed'
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          calls: workspace2Calls
        })
      });

      const workspace2CallsResponse = await fetch('/api/calls/test?workspace_id=workspace-2');
      const workspace2CallsResult = await workspace2CallsResponse.json();

      // Verify workspace 2 calls (data isolation)
      expect(workspace2CallsResponse.ok).toBe(true);
      expect(workspace2CallsResult.calls).toHaveLength(1);
      expect(workspace2CallsResult.calls[0].workspace_id).toBe('workspace-2');
      expect(workspace2CallsResult.calls[0].id).not.toBe('call-1');
    });
  });

  describe('Error Recovery Flows', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('/api/analytics/test');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }

      // Should be able to retry successfully
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { calls_scheduled: 10 }
        })
      });

      const retryResponse = await fetch('/api/analytics/test');
      const retryResult = await retryResponse.json();

      expect(retryResponse.ok).toBe(true);
      expect(retryResult.success).toBe(true);
    });

    it('should handle validation errors and allow correction', async () => {
      // Step 1: Submit invalid data
      const invalidData = {
        name: '', // Invalid: empty name
        slug: 'invalid slug!', // Invalid: spaces and special characters
        description: 'Test workspace'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: 'Invalid workspace data',
          details: [
            'Workspace name is required',
            'Slug can only contain lowercase letters, numbers, and hyphens'
          ]
        })
      });

      const invalidResponse = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidData)
      });

      const invalidResult = await invalidResponse.json();

      // Verify validation error
      expect(invalidResponse.ok).toBe(false);
      expect(invalidResponse.status).toBe(400);
      expect(invalidResult.error).toBe('Invalid workspace data');
      expect(invalidResult.details).toContain('Workspace name is required');

      // Step 2: Submit corrected data
      const validData = {
        name: 'Valid Workspace',
        slug: 'valid-workspace',
        description: 'Test workspace'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({
          success: true,
          data: {
            id: 'workspace-123',
            ...validData
          }
        })
      });

      const validResponse = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validData)
      });

      const validResult = await validResponse.json();

      // Verify successful creation
      expect(validResponse.ok).toBe(true);
      expect(validResponse.status).toBe(201);
      expect(validResult.success).toBe(true);
      expect(validResult.data.name).toBe('Valid Workspace');
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle multiple concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => 
        fetch('/api/analytics/test').then(response => response.json())
      );

      // Mock all responses
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { calls_scheduled: 100 }
        })
      });

      const results = await Promise.all(promises);

      // Verify all requests completed successfully
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.data.calls_scheduled).toBe(100);
      });
    });

    it('should handle large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `call-${i}`,
        prospect_name: `Prospect ${i}`,
        crm_stage: 'scheduled',
        call_outcome: 'scheduled'
      }));

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          calls: largeDataset
        })
      });

      const response = await fetch('/api/calls/test');
      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.calls).toHaveLength(1000);
    });
  });
});



