// =====================================================
// RBAC Service Tests
// Task 20.4: Extend Role-Based Access Control for Workspace-Scoped Roles
// =====================================================

import { RBACService } from '@/lib/services/rbacService';
import { WorkspaceRole } from '@/lib/types/workspace';

// Mock the database query function
jest.mock('@/lib/database', () => ({
  query: jest.fn()
}));

import { query } from '@/lib/database';

describe('RBACService', () => {
  const mockUserId = 'user-123';
  const mockWorkspaceId = 'workspace-456';
  const mockMembership = {
    id: 'membership-789',
    workspace_id: mockWorkspaceId,
    user_id: mockUserId,
    role: 'admin' as WorkspaceRole,
    permissions: {},
    status: 'active',
    invited_by: 'admin-123',
    invited_at: '2024-01-01T00:00:00Z',
    joined_at: '2024-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkPermission', () => {
    it('should return true for admin with workspace:manage permission', async () => {
      (query as jest.Mock).mockResolvedValue({
        rows: [mockMembership]
      });

      const result = await RBACService.checkPermission(
        mockUserId,
        mockWorkspaceId,
        'workspace:manage'
      );

      expect(result.hasPermission).toBe(true);
      expect(result.userRole).toBe('admin');
      expect(result.workspaceId).toBe(mockWorkspaceId);
    });

    it('should return false for non-member', async () => {
      (query as jest.Mock).mockResolvedValue({
        rows: []
      });

      const result = await RBACService.checkPermission(
        mockUserId,
        mockWorkspaceId,
        'workspace:manage'
      );

      expect(result.hasPermission).toBe(false);
      expect(result.reason).toBe('User is not a member of this workspace');
    });

    it('should return false for inactive membership', async () => {
      (query as jest.Mock).mockResolvedValue({
        rows: [{ ...mockMembership, status: 'suspended' }]
      });

      const result = await RBACService.checkPermission(
        mockUserId,
        mockWorkspaceId,
        'workspace:manage'
      );

      expect(result.hasPermission).toBe(false);
      expect(result.reason).toBe('User membership is suspended');
    });

    it('should return false for insufficient permissions', async () => {
      (query as jest.Mock).mockResolvedValue({
        rows: [{ ...mockMembership, role: 'viewer' }]
      });

      const result = await RBACService.checkPermission(
        mockUserId,
        mockWorkspaceId,
        'workspace:manage'
      );

      expect(result.hasPermission).toBe(false);
      expect(result.reason).toContain("User role 'viewer' does not have permission 'workspace:manage'");
    });

    it('should return true for custom permissions', async () => {
      (query as jest.Mock).mockResolvedValue({
        rows: [{
          ...mockMembership,
          role: 'viewer',
          permissions: { 'custom:permission': true }
        }]
      });

      const result = await RBACService.checkPermission(
        mockUserId,
        mockWorkspaceId,
        'custom:permission'
      );

      expect(result.hasPermission).toBe(true);
      expect(result.userRole).toBe('viewer');
    });
  });

  describe('checkAnyPermission', () => {
    it('should return true if user has any of the required permissions', async () => {
      (query as jest.Mock).mockResolvedValue({
        rows: [{ ...mockMembership, role: 'manager' }]
      });

      const result = await RBACService.checkAnyPermission(
        mockUserId,
        mockWorkspaceId,
        ['workspace:manage', 'members:invite']
      );

      expect(result.hasPermission).toBe(true);
      expect(result.userRole).toBe('manager');
    });

    it('should return false if user has none of the required permissions', async () => {
      (query as jest.Mock).mockResolvedValue({
        rows: [{ ...mockMembership, role: 'viewer' }]
      });

      const result = await RBACService.checkAnyPermission(
        mockUserId,
        mockWorkspaceId,
        ['workspace:manage', 'members:invite']
      );

      expect(result.hasPermission).toBe(false);
      expect(result.reason).toContain('User does not have any of the required permissions');
    });
  });

  describe('checkAllPermissions', () => {
    it('should return true if user has all required permissions', async () => {
      (query as jest.Mock).mockResolvedValue({
        rows: [{ ...mockMembership, role: 'admin' }]
      });

      const result = await RBACService.checkAllPermissions(
        mockUserId,
        mockWorkspaceId,
        ['workspace:manage', 'members:invite']
      );

      expect(result.hasPermission).toBe(true);
      expect(result.userRole).toBe('admin');
    });

    it('should return false if user is missing any required permission', async () => {
      (query as jest.Mock).mockResolvedValue({
        rows: [{ ...mockMembership, role: 'manager' }]
      });

      const result = await RBACService.checkAllPermissions(
        mockUserId,
        mockWorkspaceId,
        ['workspace:manage', 'members:invite']
      );

      expect(result.hasPermission).toBe(false);
      expect(result.reason).toContain('Missing permissions');
    });
  });

  describe('getWorkspaceAccess', () => {
    it('should return access information for active member', async () => {
      (query as jest.Mock).mockResolvedValue({
        rows: [mockMembership]
      });

      const result = await RBACService.getWorkspaceAccess(
        mockUserId,
        mockWorkspaceId
      );

      expect(result.hasAccess).toBe(true);
      expect(result.role).toBe('admin');
      expect(result.permissions).toContain('workspace:manage');
      expect(result.membership).toEqual(mockMembership);
    });

    it('should return no access for non-member', async () => {
      (query as jest.Mock).mockResolvedValue({
        rows: []
      });

      const result = await RBACService.getWorkspaceAccess(
        mockUserId,
        mockWorkspaceId
      );

      expect(result.hasAccess).toBe(false);
      expect(result.permissions).toEqual([]);
    });
  });

  describe('canAccessCall', () => {
    it('should allow admin to access any call', async () => {
      (query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockMembership] }) // getWorkspaceMembership
        .mockResolvedValueOnce({ rows: [{ id: 'call-123' }] }); // ownsCall check

      const result = await RBACService.canAccessCall(
        mockUserId,
        'call-123',
        mockWorkspaceId
      );

      expect(result.hasPermission).toBe(true);
      expect(result.userRole).toBe('admin');
    });

    it('should allow user to access their own call', async () => {
      (query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ ...mockMembership, role: 'sales_rep' }] }) // getWorkspaceMembership
        .mockResolvedValueOnce({ rows: [{ id: 'call-123' }] }); // ownsCall check

      const result = await RBACService.canAccessCall(
        mockUserId,
        'call-123',
        mockWorkspaceId
      );

      expect(result.hasPermission).toBe(true);
      expect(result.userRole).toBe('sales_rep');
    });

    it('should deny access to other users calls for non-admin', async () => {
      (query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ ...mockMembership, role: 'sales_rep' }] }) // getWorkspaceMembership
        .mockResolvedValueOnce({ rows: [] }); // ownsCall check - no ownership

      const result = await RBACService.canAccessCall(
        mockUserId,
        'call-123',
        mockWorkspaceId
      );

      expect(result.hasPermission).toBe(false);
      expect(result.reason).toBe('User can only access their own calls');
    });
  });

  describe('hasMinimumRole', () => {
    it('should return true for higher role', () => {
      expect(RBACService.hasMinimumRole('admin', 'manager')).toBe(true);
      expect(RBACService.hasMinimumRole('manager', 'sales_rep')).toBe(true);
    });

    it('should return true for same role', () => {
      expect(RBACService.hasMinimumRole('admin', 'admin')).toBe(true);
      expect(RBACService.hasMinimumRole('sales_rep', 'sales_rep')).toBe(true);
    });

    it('should return false for lower role', () => {
      expect(RBACService.hasMinimumRole('sales_rep', 'manager')).toBe(false);
      expect(RBACService.hasMinimumRole('viewer', 'admin')).toBe(false);
    });
  });

  describe('getRolePermissions', () => {
    it('should return correct permissions for admin role', () => {
      const permissions = RBACService.getRolePermissions('admin');
      expect(permissions).toContain('workspace:manage');
      expect(permissions).toContain('members:invite');
      expect(permissions).toContain('clients:create');
    });

    it('should return correct permissions for sales_rep role', () => {
      const permissions = RBACService.getRolePermissions('sales_rep');
      expect(permissions).toContain('calls:create');
      expect(permissions).toContain('calls:read');
      expect(permissions).not.toContain('workspace:manage');
    });

    it('should return empty array for invalid role', () => {
      const permissions = RBACService.getRolePermissions('invalid' as WorkspaceRole);
      expect(permissions).toEqual([]);
    });
  });

  describe('isValidPermission', () => {
    it('should return true for valid permissions', () => {
      expect(RBACService.isValidPermission('workspace:manage')).toBe(true);
      expect(RBACService.isValidPermission('calls:create')).toBe(true);
      expect(RBACService.isValidPermission('analytics:view')).toBe(true);
    });

    it('should return false for invalid permissions', () => {
      expect(RBACService.isValidPermission('invalid:permission')).toBe(false);
      expect(RBACService.isValidPermission('')).toBe(false);
    });
  });

  describe('checkBulkPermissions', () => {
    it('should check multiple permissions at once', async () => {
      (query as jest.Mock).mockResolvedValue({
        rows: [mockMembership]
      });

      const result = await RBACService.checkBulkPermissions(
        mockUserId,
        mockWorkspaceId,
        ['workspace:manage', 'calls:create', 'invalid:permission']
      );

      expect(result['workspace:manage'].hasPermission).toBe(true);
      expect(result['calls:create'].hasPermission).toBe(true);
      expect(result['invalid:permission'].hasPermission).toBe(false);
    });
  });
});
