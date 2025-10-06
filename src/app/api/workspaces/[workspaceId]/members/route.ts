// =====================================================
// Workspace Members API Route
// Task 20.4: Extend Role-Based Access Control for Workspace-Scoped Roles
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { withMemberManagement, createSuccessResponse, createErrorResponse } from '@/lib/api/rbacWrapper';
import { WorkspaceService } from '@/lib/services/workspaceService';
import { RBACService } from '@/lib/services/rbacService';
import { UpdateMembershipRequest } from '@/lib/types/workspace';

// GET /api/workspaces/[workspaceId]/members - Get workspace members
export const GET = withMemberManagement(async (request: NextRequest, context) => {
  const { workspaceId } = context;
  
  try {
    const members = await WorkspaceService.getWorkspaceMembers(workspaceId);
    
    return createSuccessResponse(
      { members },
      context,
      'Workspace members retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching workspace members:', error);
    return createErrorResponse(
      'Failed to fetch workspace members',
      'FETCH_MEMBERS_ERROR',
      500
    );
  }
});

// POST /api/workspaces/[workspaceId]/members - Add user to workspace
export const POST = withMemberManagement(async (request: NextRequest, context) => {
  const { workspaceId } = context;
  
  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return createErrorResponse(
        'User ID and role are required',
        'VALIDATION_ERROR',
        400
      );
    }

    // Check if current user can assign this role
    const canManageRoles = await RBACService.canManageRoles(context.user.id, workspaceId);
    if (!canManageRoles.hasPermission) {
      return createErrorResponse(
        'Insufficient permissions to manage roles',
        'INSUFFICIENT_PERMISSIONS',
        403
      );
    }

    const membership = await WorkspaceService.addUserToWorkspace(
      workspaceId,
      userId,
      role,
      context.user.id
    );

    return createSuccessResponse(
      { membership },
      context,
      'User added to workspace successfully'
    );
  } catch (error) {
    console.error('Error adding user to workspace:', error);
    return createErrorResponse(
      'Failed to add user to workspace',
      'ADD_MEMBER_ERROR',
      500
    );
  }
});

// PUT /api/workspaces/[workspaceId]/members/[membershipId] - Update membership
export const PUT = withMemberManagement(async (request: NextRequest, context) => {
  const { workspaceId } = context;
  
  try {
    const url = new URL(request.url);
    const membershipId = url.pathname.split('/').pop();

    if (!membershipId) {
      return createErrorResponse(
        'Membership ID is required',
        'VALIDATION_ERROR',
        400
      );
    }

    const body = await request.json();
    const updateData: UpdateMembershipRequest = body;

    // Check if current user can manage roles
    const canManageRoles = await RBACService.canManageRoles(context.user.id, workspaceId);
    if (!canManageRoles.hasPermission) {
      return createErrorResponse(
        'Insufficient permissions to manage roles',
        'INSUFFICIENT_PERMISSIONS',
        403
      );
    }

    const updatedMembership = await WorkspaceService.updateMembership(
      membershipId,
      updateData
    );

    return createSuccessResponse(
      { membership: updatedMembership },
      context,
      'Membership updated successfully'
    );
  } catch (error) {
    console.error('Error updating membership:', error);
    return createErrorResponse(
      'Failed to update membership',
      'UPDATE_MEMBERSHIP_ERROR',
      500
    );
  }
});

// DELETE /api/workspaces/[workspaceId]/members/[membershipId] - Remove user from workspace
export const DELETE = withMemberManagement(async (request: NextRequest, context) => {
  const { workspaceId } = context;
  
  try {
    const url = new URL(request.url);
    const membershipId = url.pathname.split('/').pop();

    if (!membershipId) {
      return createErrorResponse(
        'Membership ID is required',
        'VALIDATION_ERROR',
        400
      );
    }

    // Check if current user can remove members
    const canRemoveMembers = await RBACService.canRemoveMembers(context.user.id, workspaceId);
    if (!canRemoveMembers.hasPermission) {
      return createErrorResponse(
        'Insufficient permissions to remove members',
        'INSUFFICIENT_PERMISSIONS',
        403
      );
    }

    // Get membership details to get user ID
    const members = await WorkspaceService.getWorkspaceMembers(workspaceId);
    const membership = members.find(m => m.id === membershipId);
    
    if (!membership) {
      return createErrorResponse(
        'Membership not found',
        'NOT_FOUND',
        404
      );
    }

    await WorkspaceService.removeUserFromWorkspace(workspaceId, membership.user_id);

    return createSuccessResponse(
      { removed: true },
      context,
      'User removed from workspace successfully'
    );
  } catch (error) {
    console.error('Error removing user from workspace:', error);
    return createErrorResponse(
      'Failed to remove user from workspace',
      'REMOVE_MEMBER_ERROR',
      500
    );
  }
});