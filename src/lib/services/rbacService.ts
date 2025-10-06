// =====================================================
// Role-Based Access Control Service
// Task 20.4: Extend Role-Based Access Control for Workspace-Scoped Roles
// =====================================================

import { query } from '../database';
import { User } from '@supabase/supabase-js';
import { 
  WorkspaceRole, 
  ROLE_PERMISSIONS, 
  WORKSPACE_ERROR_CODES,
  WorkspaceMembership 
} from '../types/workspace';

export interface PermissionCheck {
  hasPermission: boolean;
  reason?: string;
  userRole?: WorkspaceRole;
  workspaceId?: string;
}

export interface WorkspaceAccess {
  hasAccess: boolean;
  role?: WorkspaceRole;
  permissions: string[];
  membership?: WorkspaceMembership;
}

export class RBACService {
  // =====================================================
  // Core Permission Checking
  // =====================================================

  /**
   * Check if user has specific permission in workspace
   */
  static async checkPermission(
    userId: string,
    workspaceId: string,
    permission: string
  ): Promise<PermissionCheck> {
    try {
      // Get user's membership in workspace
      const membership = await this.getUserWorkspaceMembership(userId, workspaceId);
      
      if (!membership) {
        return {
          hasPermission: false,
          reason: 'User is not a member of this workspace'
        };
      }

      if (membership.status !== 'active') {
        return {
          hasPermission: false,
          reason: `User membership is ${membership.status}`
        };
      }

      // Check role-based permissions
      const rolePermissions = ROLE_PERMISSIONS[membership.role] || [];
      if (rolePermissions.includes(permission)) {
        return {
          hasPermission: true,
          userRole: membership.role,
          workspaceId
        };
      }

      // Check custom permissions
      const customPermissions = membership.permissions || {};
      if (customPermissions[permission] === true) {
        return {
          hasPermission: true,
          userRole: membership.role,
          workspaceId
        };
      }

      return {
        hasPermission: false,
        reason: `User role '${membership.role}' does not have permission '${permission}'`,
        userRole: membership.role,
        workspaceId
      };

    } catch (error) {
      console.error('Error checking permission:', error);
      return {
        hasPermission: false,
        reason: 'Error checking permission'
      };
    }
  }

  /**
   * Check if user has any of the specified permissions
   */
  static async checkAnyPermission(
    userId: string,
    workspaceId: string,
    permissions: string[]
  ): Promise<PermissionCheck> {
    for (const permission of permissions) {
      const check = await this.checkPermission(userId, workspaceId, permission);
      if (check.hasPermission) {
        return check;
      }
    }

    return {
      hasPermission: false,
      reason: `User does not have any of the required permissions: ${permissions.join(', ')}`
    };
  }

  /**
   * Check if user has all of the specified permissions
   */
  static async checkAllPermissions(
    userId: string,
    workspaceId: string,
    permissions: string[]
  ): Promise<PermissionCheck> {
    const results = await Promise.all(
      permissions.map(permission => 
        this.checkPermission(userId, workspaceId, permission)
      )
    );

    const failedChecks = results.filter(check => !check.hasPermission);
    
    if (failedChecks.length > 0) {
      return {
        hasPermission: false,
        reason: `Missing permissions: ${failedChecks.map(c => c.reason).join(', ')}`
      };
    }

    return {
      hasPermission: true,
      userRole: results[0].userRole,
      workspaceId
    };
  }

  // =====================================================
  // Workspace Access Management
  // =====================================================

  /**
   * Get user's access information for a workspace
   */
  static async getWorkspaceAccess(
    userId: string,
    workspaceId: string
  ): Promise<WorkspaceAccess> {
    try {
      const membership = await this.getUserWorkspaceMembership(userId, workspaceId);
      
      if (!membership || membership.status !== 'active') {
        return {
          hasAccess: false,
          permissions: []
        };
      }

      const rolePermissions = ROLE_PERMISSIONS[membership.role] || [];
      const customPermissions = Object.keys(membership.permissions || {})
        .filter(key => membership.permissions![key] === true);

      return {
        hasAccess: true,
        role: membership.role,
        permissions: [...rolePermissions, ...customPermissions],
        membership
      };

    } catch (error) {
      console.error('Error getting workspace access:', error);
      return {
        hasAccess: false,
        permissions: []
      };
    }
  }

  /**
   * Get user's membership in a specific workspace
   */
  static async getUserWorkspaceMembership(
    userId: string,
    workspaceId: string
  ): Promise<WorkspaceMembership | null> {
    const sql = `
      SELECT wm.*, u.name as user_name, u.email as user_email
      FROM workspace_memberships wm
      JOIN users u ON wm.user_id = u.id
      WHERE wm.workspace_id = $1 AND wm.user_id = $2
    `;
    
    const result = await query(sql, [workspaceId, userId]);
    return result.rows[0] || null;
  }

  /**
   * Get all workspaces user has access to
   */
  static async getUserWorkspaces(userId: string): Promise<WorkspaceAccess[]> {
    const sql = `
      SELECT wm.*, w.id as workspace_id, w.name as workspace_name, w.slug as workspace_slug
      FROM workspace_memberships wm
      JOIN workspaces w ON wm.workspace_id = w.id
      WHERE wm.user_id = $1 AND wm.status = 'active' AND w.is_active = true
      ORDER BY wm.joined_at DESC
    `;
    
    const result = await query(sql, [userId]);
    
    return result.rows.map(row => {
      const rolePermissions = ROLE_PERMISSIONS[row.role] || [];
      const customPermissions = Object.keys(row.permissions || {})
        .filter(key => row.permissions[key] === true);

      return {
        hasAccess: true,
        role: row.role,
        permissions: [...rolePermissions, ...customPermissions],
        membership: row
      };
    });
  }

  // =====================================================
  // Role Management
  // =====================================================

  /**
   * Check if user can manage roles in workspace
   */
  static async canManageRoles(
    userId: string,
    workspaceId: string
  ): Promise<PermissionCheck> {
    return this.checkPermission(userId, workspaceId, 'members:manage_roles');
  }

  /**
   * Check if user can invite members to workspace
   */
  static async canInviteMembers(
    userId: string,
    workspaceId: string
  ): Promise<PermissionCheck> {
    return this.checkPermission(userId, workspaceId, 'members:invite');
  }

  /**
   * Check if user can remove members from workspace
   */
  static async canRemoveMembers(
    userId: string,
    workspaceId: string
  ): Promise<PermissionCheck> {
    return this.checkPermission(userId, workspaceId, 'members:remove');
  }

  /**
   * Check if user can manage workspace settings
   */
  static async canManageWorkspace(
    userId: string,
    workspaceId: string
  ): Promise<PermissionCheck> {
    return this.checkPermission(userId, workspaceId, 'workspace:manage');
  }

  // =====================================================
  // Resource-Specific Permissions
  // =====================================================

  /**
   * Check if user can create clients in workspace
   */
  static async canCreateClients(
    userId: string,
    workspaceId: string
  ): Promise<PermissionCheck> {
    return this.checkPermission(userId, workspaceId, 'clients:create');
  }

  /**
   * Check if user can read clients in workspace
   */
  static async canReadClients(
    userId: string,
    workspaceId: string
  ): Promise<PermissionCheck> {
    return this.checkPermission(userId, workspaceId, 'clients:read');
  }

  /**
   * Check if user can update clients in workspace
   */
  static async canUpdateClients(
    userId: string,
    workspaceId: string
  ): Promise<PermissionCheck> {
    return this.checkPermission(userId, workspaceId, 'clients:update');
  }

  /**
   * Check if user can delete clients in workspace
   */
  static async canDeleteClients(
    userId: string,
    workspaceId: string
  ): Promise<PermissionCheck> {
    return this.checkPermission(userId, workspaceId, 'clients:delete');
  }

  /**
   * Check if user can create calls in workspace
   */
  static async canCreateCalls(
    userId: string,
    workspaceId: string
  ): Promise<PermissionCheck> {
    return this.checkPermission(userId, workspaceId, 'calls:create');
  }

  /**
   * Check if user can read calls in workspace
   */
  static async canReadCalls(
    userId: string,
    workspaceId: string
  ): Promise<PermissionCheck> {
    return this.checkPermission(userId, workspaceId, 'calls:read');
  }

  /**
   * Check if user can update calls in workspace
   */
  static async canUpdateCalls(
    userId: string,
    workspaceId: string
  ): Promise<PermissionCheck> {
    return this.checkPermission(userId, workspaceId, 'calls:update');
  }

  /**
   * Check if user can delete calls in workspace
   */
  static async canDeleteCalls(
    userId: string,
    workspaceId: string
  ): Promise<PermissionCheck> {
    return this.checkPermission(userId, workspaceId, 'calls:delete');
  }

  /**
   * Check if user can view analytics in workspace
   */
  static async canViewAnalytics(
    userId: string,
    workspaceId: string
  ): Promise<PermissionCheck> {
    return this.checkAnyPermission(userId, workspaceId, ['analytics:view', 'analytics:view_own']);
  }

  // =====================================================
  // Resource Ownership Checks
  // =====================================================

  /**
   * Check if user owns a specific call
   */
  static async ownsCall(
    userId: string,
    callId: string,
    workspaceId: string
  ): Promise<boolean> {
    const sql = `
      SELECT 1 FROM calls 
      WHERE id = $1 AND user_id = $2 AND workspace_id = $3
    `;
    
    const result = await query(sql, [callId, userId, workspaceId]);
    return result.rows.length > 0;
  }

  /**
   * Check if user can access a specific call
   */
  static async canAccessCall(
    userId: string,
    callId: string,
    workspaceId: string
  ): Promise<PermissionCheck> {
    // First check if user has general call read permission
    const readPermission = await this.canReadCalls(userId, workspaceId);
    if (!readPermission.hasPermission) {
      return readPermission;
    }

    // Check if user owns the call or has admin/manager role
    const membership = await this.getUserWorkspaceMembership(userId, workspaceId);
    if (!membership) {
      return {
        hasPermission: false,
        reason: 'User is not a member of this workspace'
      };
    }

    // Admins and managers can access all calls
    if (['admin', 'manager'].includes(membership.role)) {
      return {
        hasPermission: true,
        userRole: membership.role,
        workspaceId
      };
    }

    // Check if user owns the call
    const ownsCall = await this.ownsCall(userId, callId, workspaceId);
    if (ownsCall) {
      return {
        hasPermission: true,
        userRole: membership.role,
        workspaceId
      };
    }

    return {
      hasPermission: false,
      reason: 'User can only access their own calls',
      userRole: membership.role,
      workspaceId
    };
  }

  // =====================================================
  // Permission Validation Helpers
  // =====================================================

  /**
   * Validate that user has required role or higher
   */
  static hasMinimumRole(
    userRole: WorkspaceRole,
    requiredRole: WorkspaceRole
  ): boolean {
    const roleHierarchy: Record<WorkspaceRole, number> = {
      'admin': 5,
      'manager': 4,
      'sales_rep': 3,
      'client': 2,
      'viewer': 1
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  /**
   * Get all permissions for a role
   */
  static getRolePermissions(role: WorkspaceRole): string[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Check if permission exists in system
   */
  static isValidPermission(permission: string): boolean {
    const allPermissions = Object.values(ROLE_PERMISSIONS).flat();
    return allPermissions.includes(permission);
  }

  // =====================================================
  // Bulk Permission Checks
  // =====================================================

  /**
   * Check multiple permissions at once
   */
  static async checkBulkPermissions(
    userId: string,
    workspaceId: string,
    permissions: string[]
  ): Promise<Record<string, PermissionCheck>> {
    const results: Record<string, PermissionCheck> = {};
    
    await Promise.all(
      permissions.map(async (permission) => {
        results[permission] = await this.checkPermission(userId, workspaceId, permission);
      })
    );

    return results;
  }

  /**
   * Get user's effective permissions in workspace
   */
  static async getEffectivePermissions(
    userId: string,
    workspaceId: string
  ): Promise<string[]> {
    const access = await this.getWorkspaceAccess(userId, workspaceId);
    return access.permissions;
  }
}
