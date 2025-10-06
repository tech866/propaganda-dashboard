// =====================================================
// Role-Based Access Control Middleware
// Task 20.4: Extend Role-Based Access Control for Workspace-Scoped Roles
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { User } from '@supabase/supabase-js';
import { RBACService, PermissionCheck } from '@/lib/services/rbacService';
import { WORKSPACE_ERROR_CODES } from '@/lib/types/workspace';

export interface RBACOptions {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  workspaceIdParam?: string;
  resourceOwnership?: {
    resourceType: 'call' | 'client';
    resourceIdParam: string;
  };
  customCheck?: (user: User, workspaceId: string, params: any) => Promise<PermissionCheck>;
}

export interface RBACContext {
  user: User;
  workspaceId: string;
  hasPermission: boolean;
  userRole?: string;
  reason?: string;
}

/**
 * RBAC Middleware Factory
 */
export function createRBACMiddleware(options: RBACOptions) {
  return async function rbacMiddleware(
    request: NextRequest,
    user: User,
    params: any = {}
  ): Promise<NextResponse | RBACContext> {
    try {
      // Extract workspace ID
      const workspaceId = extractWorkspaceId(request, options.workspaceIdParam, params);
      
      if (!workspaceId) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Workspace ID is required',
            code: WORKSPACE_ERROR_CODES.WORKSPACE_ACCESS_DENIED
          },
          { status: 400 }
        );
      }

      // Perform permission check
      let permissionCheck: PermissionCheck;

      if (options.customCheck) {
        permissionCheck = await options.customCheck(user, workspaceId, params);
      } else if (options.permission) {
        permissionCheck = await RBACService.checkPermission(
          user.id,
          workspaceId,
          options.permission
        );
      } else if (options.permissions) {
        if (options.requireAll) {
          permissionCheck = await RBACService.checkAllPermissions(
            user.id,
            workspaceId,
            options.permissions
          );
        } else {
          permissionCheck = await RBACService.checkAnyPermission(
            user.id,
            workspaceId,
            options.permissions
          );
        }
      } else {
        // Default to workspace access check
        const access = await RBACService.getWorkspaceAccess(user.id, workspaceId);
        permissionCheck = {
          hasPermission: access.hasAccess,
          userRole: access.role,
          workspaceId,
          reason: access.hasAccess ? undefined : 'User does not have access to this workspace'
        };
      }

      // Check resource ownership if specified
      if (options.resourceOwnership && permissionCheck.hasPermission) {
        const resourceId = params[options.resourceOwnership.resourceIdParam];
        if (resourceId) {
          if (options.resourceOwnership.resourceType === 'call') {
            const canAccess = await RBACService.canAccessCall(
              user.id,
              resourceId,
              workspaceId
            );
            if (!canAccess.hasPermission) {
              permissionCheck = canAccess;
            }
          }
          // Add other resource types as needed
        }
      }

      if (!permissionCheck.hasPermission) {
        return NextResponse.json(
          { 
            success: false, 
            error: permissionCheck.reason || 'Access denied',
            code: WORKSPACE_ERROR_CODES.INSUFFICIENT_PERMISSIONS
          },
          { status: 403 }
        );
      }

      // Return RBAC context for successful checks
      return {
        user,
        workspaceId,
        hasPermission: true,
        userRole: permissionCheck.userRole,
        reason: permissionCheck.reason
      };

    } catch (error) {
      console.error('RBAC middleware error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authorization check failed',
          code: WORKSPACE_ERROR_CODES.WORKSPACE_ACCESS_DENIED
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Extract workspace ID from request
 */
function extractWorkspaceId(
  request: NextRequest,
  workspaceIdParam?: string,
  params: any = {}
): string | null {
  // Try URL params first
  if (workspaceIdParam && params[workspaceIdParam]) {
    return params[workspaceIdParam];
  }

  // Try query parameters
  const url = new URL(request.url);
  const workspaceId = url.searchParams.get('workspaceId');
  if (workspaceId) {
    return workspaceId;
  }

  // Try request body (for POST/PUT requests)
  if (request.method !== 'GET') {
    // Note: This would require reading the body, which should be done carefully
    // to avoid consuming the body stream
  }

  // Try path segments (e.g., /api/workspaces/{id}/...)
  const pathSegments = url.pathname.split('/');
  const workspaceIndex = pathSegments.findIndex(segment => segment === 'workspaces');
  if (workspaceIndex !== -1 && pathSegments[workspaceIndex + 1]) {
    return pathSegments[workspaceIndex + 1];
  }

  return null;
}

// =====================================================
// Pre-configured RBAC Middleware Functions
// =====================================================

/**
 * Require workspace access
 */
export const requireWorkspaceAccess = createRBACMiddleware({});

/**
 * Require admin role
 */
export const requireAdmin = createRBACMiddleware({
  permission: 'workspace:manage'
});

/**
 * Require member management permissions
 */
export const requireMemberManagement = createRBACMiddleware({
  permissions: ['members:invite', 'members:remove', 'members:manage_roles'],
  requireAll: false
});

/**
 * Require client management permissions
 */
export const requireClientManagement = createRBACMiddleware({
  permissions: ['clients:create', 'clients:update', 'clients:delete'],
  requireAll: false
});

/**
 * Require call management permissions
 */
export const requireCallManagement = createRBACMiddleware({
  permissions: ['calls:create', 'calls:update', 'calls:delete'],
  requireAll: false
});

/**
 * Require analytics view permissions
 */
export const requireAnalyticsView = createRBACMiddleware({
  permissions: ['analytics:view', 'analytics:view_own'],
  requireAll: false
});

/**
 * Require call access with ownership check
 */
export const requireCallAccess = createRBACMiddleware({
  permission: 'calls:read',
  resourceOwnership: {
    resourceType: 'call',
    resourceIdParam: 'id'
  }
});

// =====================================================
// Utility Functions
// =====================================================

/**
 * Check if user has permission in workspace
 */
export async function checkUserPermission(
  user: User,
  workspaceId: string,
  permission: string
): Promise<boolean> {
  const check = await RBACService.checkPermission(user.id, workspaceId, permission);
  return check.hasPermission;
}

/**
 * Get user's role in workspace
 */
export async function getUserWorkspaceRole(
  user: User,
  workspaceId: string
): Promise<string | null> {
  const access = await RBACService.getWorkspaceAccess(user.id, workspaceId);
  return access.role || null;
}

/**
 * Validate workspace access for API route
 */
export async function validateWorkspaceAccess(
  user: User,
  workspaceId: string
): Promise<{ hasAccess: boolean; error?: string }> {
  const access = await RBACService.getWorkspaceAccess(user.id, workspaceId);
  
  if (!access.hasAccess) {
    return {
      hasAccess: false,
      error: 'User does not have access to this workspace'
    };
  }

  return { hasAccess: true };
}

/**
 * Extract workspace ID from various sources
 */
export function extractWorkspaceIdFromRequest(
  request: NextRequest,
  params: any = {}
): string | null {
  return extractWorkspaceId(request, undefined, params);
}

// =====================================================
// Error Response Helpers
// =====================================================

export function createAccessDeniedResponse(reason?: string) {
  return NextResponse.json(
    { 
      success: false, 
      error: reason || 'Access denied',
      code: WORKSPACE_ERROR_CODES.INSUFFICIENT_PERMISSIONS
    },
    { status: 403 }
  );
}

export function createWorkspaceNotFoundResponse() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Workspace not found',
      code: WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND
    },
    { status: 404 }
  );
}

export function createInvalidWorkspaceResponse() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Invalid workspace ID',
      code: WORKSPACE_ERROR_CODES.WORKSPACE_ACCESS_DENIED
    },
    { status: 400 }
  );
}
