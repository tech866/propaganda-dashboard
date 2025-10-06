// =====================================================
// RBAC Check API Route
// Task 20.4: Extend Role-Based Access Control for Workspace-Scoped Roles
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { withWorkspaceAccess, createSuccessResponse, createErrorResponse } from '@/lib/api/rbacWrapper';
import { RBACService } from '@/lib/services/rbacService';

// POST /api/workspaces/[workspaceId]/rbac/check - Check user permissions
export const POST = withWorkspaceAccess(async (request: NextRequest, context) => {
  const { workspaceId, user } = context;
  
  try {
    const body = await request.json();
    const { permission, permissions, requireAll } = body;

    let permissionCheck;

    if (permission) {
      // Check single permission
      permissionCheck = await RBACService.checkPermission(
        user.id,
        workspaceId,
        permission
      );
    } else if (permissions && Array.isArray(permissions)) {
      // Check multiple permissions
      if (requireAll) {
        permissionCheck = await RBACService.checkAllPermissions(
          user.id,
          workspaceId,
          permissions
        );
      } else {
        permissionCheck = await RBACService.checkAnyPermission(
          user.id,
          workspaceId,
          permissions
        );
      }
    } else {
      // Get all user permissions in workspace
      const access = await RBACService.getWorkspaceAccess(user.id, workspaceId);
      permissionCheck = {
        hasPermission: access.hasAccess,
        userRole: access.role,
        workspaceId,
        reason: access.hasAccess ? undefined : 'User does not have access to this workspace'
      };
    }

    return createSuccessResponse(
      {
        hasPermission: permissionCheck.hasPermission,
        userRole: permissionCheck.userRole,
        permissions: permissionCheck.hasPermission 
          ? await RBACService.getEffectivePermissions(user.id, workspaceId)
          : [],
        reason: permissionCheck.reason
      },
      context,
      'Permission check completed'
    );
  } catch (error) {
    console.error('Error checking permissions:', error);
    return createErrorResponse(
      'Failed to check permissions',
      'PERMISSION_CHECK_ERROR',
      500
    );
  }
});

// GET /api/workspaces/[workspaceId]/rbac/check - Get user's effective permissions
export const GET = withWorkspaceAccess(async (request: NextRequest, context) => {
  const { workspaceId, user } = context;
  
  try {
    const access = await RBACService.getWorkspaceAccess(user.id, workspaceId);
    
    if (!access.hasAccess) {
      return createErrorResponse(
        'User does not have access to this workspace',
        'WORKSPACE_ACCESS_DENIED',
        403
      );
    }

    return createSuccessResponse(
      {
        hasAccess: true,
        userRole: access.role,
        permissions: access.permissions,
        membership: access.membership
      },
      context,
      'User permissions retrieved successfully'
    );
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return createErrorResponse(
      'Failed to get user permissions',
      'GET_PERMISSIONS_ERROR',
      500
    );
  }
});
