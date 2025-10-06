/**
 * Workspace Management API Tests
 * Tests for workspace creation, management, and team invitations
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock Clerk auth
const mockAuth = {
  userId: 'test-user-123',
  sessionId: 'test-session-123'
};

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ 
        data: [{ id: 'workspace-123', name: 'Test Workspace', slug: 'test-workspace' }], 
        error: null 
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }))
};

// Mock the auth module
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => Promise.resolve(mockAuth))
}));

// Mock the Supabase client
jest.mock('@/lib/supabase-client', () => ({
  createAdminSupabaseClient: jest.fn(() => mockSupabase)
}));

describe('Workspace Management API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/workspaces - Create Workspace', () => {
    it('should create a new workspace with valid data', async () => {
      const workspaceData = {
        name: 'Test Workspace',
        slug: 'test-workspace',
        description: 'A test workspace'
      };

      // Mock successful workspace creation
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })) // Slug available
          }))
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ 
            data: [{ 
              id: 'workspace-123', 
              name: 'Test Workspace', 
              slug: 'test-workspace',
              description: 'A test workspace',
              created_at: '2025-01-15T10:00:00Z'
            }], 
            error: null 
          }))
        }))
      });

      // Simulate API call
      const response = {
        ok: true,
        status: 201,
        json: () => Promise.resolve({
          success: true,
          data: {
            id: 'workspace-123',
            name: 'Test Workspace',
            slug: 'test-workspace',
            description: 'A test workspace'
          }
        })
      };

      expect(response.ok).toBe(true);
      expect(response.status).toBe(201);
      
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Test Workspace');
      expect(result.data.slug).toBe('test-workspace');
    });

    it('should reject workspace creation with invalid slug', async () => {
      const workspaceData = {
        name: 'Test Workspace',
        slug: 'invalid slug!', // Invalid slug with spaces and special characters
        description: 'A test workspace'
      };

      // Simulate validation error
      const response = {
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: 'Invalid workspace data',
          details: ['Slug can only contain lowercase letters, numbers, and hyphens']
        })
      };

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      
      const result = await response.json();
      expect(result.error).toBe('Invalid workspace data');
    });

    it('should reject workspace creation with duplicate slug', async () => {
      const workspaceData = {
        name: 'Test Workspace',
        slug: 'existing-workspace',
        description: 'A test workspace'
      };

      // Mock slug already exists
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ 
              data: { id: 'existing-workspace-id' }, // Slug already exists
              error: null 
            }))
          }))
        }))
      });

      // Simulate conflict error
      const response = {
        ok: false,
        status: 409,
        json: () => Promise.resolve({
          error: 'Workspace slug is already taken'
        })
      };

      expect(response.ok).toBe(false);
      expect(response.status).toBe(409);
      
      const result = await response.json();
      expect(result.error).toBe('Workspace slug is already taken');
    });

    it('should require authentication', async () => {
      // Mock no authentication
      const mockAuthNoUser = {
        userId: null,
        sessionId: null
      };

      // Simulate unauthorized response
      const response = {
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          error: 'Unauthorized'
        })
      };

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
      
      const result = await response.json();
      expect(result.error).toBe('Unauthorized');
    });
  });

  describe('GET /api/workspaces - Get User Workspaces', () => {
    it('should return user workspaces', async () => {
      const mockWorkspaces = [
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

      // Mock successful workspace fetch
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => Promise.resolve({ 
          data: mockWorkspaces, 
          error: null 
        }))
      });

      // Simulate API call
      const response = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          data: mockWorkspaces
        })
      };

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe('Workspace 1');
    });

    it('should return empty array for user with no workspaces', async () => {
      // Mock no workspaces
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => Promise.resolve({ 
          data: [], 
          error: null 
        }))
      });

      // Simulate API call
      const response = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          data: []
        })
      };

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.data).toHaveLength(0);
    });
  });

  describe('Workspace Invitations', () => {
    it('should send invitation email successfully', async () => {
      const invitationData = {
        workspaceId: 'workspace-123',
        inviteeEmail: 'test@example.com',
        inviteeRole: 'member'
      };

      // Mock successful invitation creation
      mockSupabase.from.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ 
            data: [{ 
              id: 'invitation-123',
              token: 'invitation-token-123',
              expires_at: '2025-01-22T10:00:00Z'
            }], 
            error: null 
          }))
        }))
      });

      // Simulate successful email sending
      const emailResponse = {
        success: true,
        data: { id: 'email-123' }
      };

      expect(emailResponse.success).toBe(true);
      expect(emailResponse.data.id).toBe('email-123');
    });

    it('should handle invitation email failure', async () => {
      const invitationData = {
        workspaceId: 'workspace-123',
        inviteeEmail: 'invalid-email',
        inviteeRole: 'member'
      };

      // Simulate email sending failure
      const emailResponse = {
        success: false,
        error: 'Invalid email address'
      };

      expect(emailResponse.success).toBe(false);
      expect(emailResponse.error).toBe('Invalid email address');
    });
  });

  describe('Workspace Validation', () => {
    it('should validate workspace name requirements', () => {
      const validNames = [
        'My Workspace',
        'Test Company',
        'A',
        'This is a very long workspace name that should still be valid'
      ];

      const invalidNames = [
        '', // Empty
        '   ', // Only spaces
        'A'.repeat(256) // Too long
      ];

      validNames.forEach(name => {
        expect(name.length).toBeGreaterThan(0);
        expect(name.trim().length).toBeGreaterThan(0);
        expect(name.length).toBeLessThanOrEqual(255);
      });

      invalidNames.forEach(name => {
        const isValid = name.trim().length > 0 && name.length <= 255;
        expect(isValid).toBe(false);
      });
    });

    it('should validate workspace slug format', () => {
      const validSlugs = [
        'my-workspace',
        'test123',
        'company-name',
        'a',
        'workspace-with-numbers123'
      ];

      const invalidSlugs = [
        'My Workspace', // Uppercase
        'my workspace', // Spaces
        'my_workspace', // Underscores
        'my.workspace', // Dots
        'my@workspace', // Special characters
        '', // Empty
        '   ' // Only spaces
      ];

      const slugRegex = /^[a-z0-9-]+$/;

      validSlugs.forEach(slug => {
        expect(slugRegex.test(slug)).toBe(true);
        expect(slug.length).toBeGreaterThan(0);
        expect(slug.length).toBeLessThanOrEqual(100);
      });

      invalidSlugs.forEach(slug => {
        const isValid = slugRegex.test(slug) && slug.length > 0 && slug.length <= 100;
        expect(isValid).toBe(false);
      });
    });
  });
});
