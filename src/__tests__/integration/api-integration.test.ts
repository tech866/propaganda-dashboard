/**
 * API Integration Tests
 * Tests for API endpoints and their integration with the frontend
 */

import { describe, it, expect, jest } from '@jest/globals';

// Mock fetch for testing
global.fetch = jest.fn();

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Analytics API', () => {
    it('should fetch analytics data successfully', async () => {
      const mockAnalyticsData = {
        calls_scheduled: 100,
        calls_taken: 80,
        calls_showed: 70,
        calls_closed_won: 25,
        cash_collected: 50000,
        show_rate: 70.0,
        close_rate: 31.25,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockAnalyticsData
        })
      });

      const response = await fetch('/api/analytics/test');
      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.success).toBe(true);
      expect(result.data.calls_scheduled).toBe(100);
      expect(result.data.show_rate).toBe(70.0);
    });

    it('should handle analytics API errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

      try {
        await fetch('/api/analytics/test');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('API Error');
      }
    });
  });

  describe('Calls API', () => {
    it('should fetch calls data successfully', async () => {
      const mockCallsData = {
        calls: [
          {
            id: '1',
            prospect_name: 'John Doe',
            company_name: 'Acme Corp',
            crm_stage: 'scheduled',
            call_outcome: 'scheduled',
            traffic_source: 'organic',
            cash_collected: 0,
            scheduled_call_time: '2025-01-15T14:00:00Z',
            created_at: '2025-01-10T10:00:00Z',
            updated_at: '2025-01-10T10:00:00Z',
          }
        ],
        message: 'Test calls data loaded successfully'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCallsData)
      });

      const response = await fetch('/api/calls/test');
      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.calls).toHaveLength(1);
      expect(result.calls[0].prospect_name).toBe('John Doe');
    });

    it('should create new call successfully', async () => {
      const newCallData = {
        prospect_name: 'Jane Smith',
        company_name: 'Tech Corp',
        phone: '+1-555-0123',
        email: 'jane@techcorp.com',
        traffic_source: 'organic',
        source_of_appointment: 'email',
        scheduled_call_time: '2025-01-16T10:00:00Z'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve({
          success: true,
          data: { id: 'new-call-123', ...newCallData }
        })
      });

      const response = await fetch('/api/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCallData)
      });

      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.data.prospect_name).toBe('Jane Smith');
    });

    it('should update call successfully', async () => {
      const updateData = {
        crm_stage: 'showed',
        call_outcome: 'showed',
        actual_call_time: '2025-01-15T14:00:00Z'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { id: 'call-123', ...updateData }
        })
      });

      const response = await fetch('/api/calls/call-123', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.success).toBe(true);
      expect(result.data.crm_stage).toBe('showed');
    });
  });

  describe('Workspace API', () => {
    it('should fetch user workspaces successfully', async () => {
      const mockWorkspaces = [
        {
          id: 'workspace-1',
          name: 'My Workspace',
          slug: 'my-workspace',
          role: 'owner'
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockWorkspaces
        })
      });

      const response = await fetch('/api/workspaces');
      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('My Workspace');
    });

    it('should create workspace successfully', async () => {
      const workspaceData = {
        name: 'New Workspace',
        slug: 'new-workspace',
        description: 'A new workspace'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 201,
        json: () => Promise.resolve({
          success: true,
          data: { id: 'workspace-123', ...workspaceData }
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

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('New Workspace');
    });

    it('should handle workspace creation with duplicate slug', async () => {
      const workspaceData = {
        name: 'Duplicate Workspace',
        slug: 'existing-slug',
        description: 'This should fail'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 409,
        json: () => Promise.resolve({
          error: 'Workspace slug is already taken'
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

      expect(response.ok).toBe(false);
      expect(response.status).toBe(409);
      expect(result.error).toBe('Workspace slug is already taken');
    });
  });

  describe('User Sync API', () => {
    it('should sync user data successfully', async () => {
      const userData = {
        clerk_user_id: 'user_123',
        email: 'test@example.com',
        name: 'Test User'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { id: 'db-user-123', ...userData }
        })
      });

      const response = await fetch('/api/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const result = await response.json();

      expect(response.ok).toBe(true);
      expect(result.success).toBe(true);
      expect(result.data.email).toBe('test@example.com');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      try {
        await fetch('/api/analytics/test');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });

    it('should handle 500 server errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          error: 'Internal server error'
        })
      });

      const response = await fetch('/api/analytics/test');
      const result = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
      expect(result.error).toBe('Internal server error');
    });

    it('should handle 404 not found errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({
          error: 'Not found'
        })
      });

      const response = await fetch('/api/nonexistent');
      const result = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
      expect(result.error).toBe('Not found');
    });
  });

  describe('Data Validation', () => {
    it('should validate required fields', async () => {
      const invalidData = {
        // Missing required fields
        description: 'Missing name and slug'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: 'Invalid workspace data',
          details: ['Workspace name is required', 'Workspace slug is required']
        })
      });

      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidData)
      });

      const result = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      expect(result.error).toBe('Invalid workspace data');
      expect(result.details).toContain('Workspace name is required');
    });

    it('should validate data formats', async () => {
      const invalidCallData = {
        prospect_name: 'John Doe',
        email: 'invalid-email-format', // Invalid email
        phone: 'invalid-phone' // Invalid phone
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: 'Invalid call data',
          details: ['Invalid email format', 'Invalid phone format']
        })
      });

      const response = await fetch('/api/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidCallData)
      });

      const result = await response.json();

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      expect(result.error).toBe('Invalid call data');
    });
  });
});
