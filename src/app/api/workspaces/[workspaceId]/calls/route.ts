// =====================================================
// Workspace-Scoped Calls API Route
// Task 20.4: Extend Role-Based Access Control for Workspace-Scoped Roles
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { withCallManagement, createSuccessResponse, createErrorResponse } from '@/lib/api/rbacWrapper';
import { SalesCallService } from '@/lib/services/salesCallService';
import { RBACService } from '@/lib/services/rbacService';
import { validateCreateCall, validateUpdateCall } from '@/lib/validation/clientSchemas';

// GET /api/workspaces/[workspaceId]/calls - Get calls for workspace
export const GET = withCallManagement(async (request: NextRequest, context) => {
  const { workspaceId } = context;
  
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');

    // Check if user can read calls
    const canReadCalls = await RBACService.canReadCalls(context.user.id, workspaceId);
    if (!canReadCalls.hasPermission) {
      return createErrorResponse(
        'Insufficient permissions to read calls',
        'INSUFFICIENT_PERMISSIONS',
        403
      );
    }

    // Get calls with workspace filtering
    const calls = await SalesCallService.getSalesCalls({
      workspaceId,
      page,
      limit,
      status: status as any,
      clientId
    });

    return createSuccessResponse(
      { calls },
      context,
      'Calls retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching calls:', error);
    return createErrorResponse(
      'Failed to fetch calls',
      'FETCH_CALLS_ERROR',
      500
    );
  }
});

// POST /api/workspaces/[workspaceId]/calls - Create new call
export const POST = withCallManagement(async (request: NextRequest, context) => {
  const { workspaceId } = context;
  
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = await validateCreateCall(body);
    if (!validation.isValid) {
      return createErrorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        400
      );
    }

    // Check if user can create calls
    const canCreateCalls = await RBACService.canCreateCalls(context.user.id, workspaceId);
    if (!canCreateCalls.hasPermission) {
      return createErrorResponse(
        'Insufficient permissions to create calls',
        'INSUFFICIENT_PERMISSIONS',
        403
      );
    }

    // Add workspace ID to call data
    const callData = {
      ...validation.data!,
      workspaceId
    };

    const newCall = await SalesCallService.createSalesCall(callData, context.user);

    // Create audit log entry for call creation
    try {
      await fetch(`${request.nextUrl.origin}/api/workspaces/${workspaceId}/audit-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || '',
        },
        body: JSON.stringify({
          action: 'call_created',
          resource_type: 'call',
          resource_id: newCall.id,
          details: {
            call_id: newCall.id,
            prospect_name: newCall.prospect_name,
            crm_stage: newCall.crm_stage,
            traffic_source: newCall.traffic_source,
            company_name: newCall.company_name,
            call_type: newCall.call_type,
          },
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
          user_agent: request.headers.get('user-agent') || null,
        }),
      });
    } catch (auditError) {
      console.warn('Failed to create audit log for call creation:', auditError);
      // Don't fail the main operation if audit logging fails
    }

    return createSuccessResponse(
      { call: newCall },
      context,
      'Call created successfully'
    );
  } catch (error) {
    console.error('Error creating call:', error);
    return createErrorResponse(
      'Failed to create call',
      'CREATE_CALL_ERROR',
      500
    );
  }
});

// PUT /api/workspaces/[workspaceId]/calls/[callId] - Update call
export const PUT = withCallManagement(async (request: NextRequest, context) => {
  const { workspaceId } = context;
  
  try {
    const url = new URL(request.url);
    const callId = url.pathname.split('/').pop();

    if (!callId) {
      return createErrorResponse(
        'Call ID is required',
        'VALIDATION_ERROR',
        400
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validation = await validateUpdateCall(body);
    if (!validation.isValid) {
      return createErrorResponse(
        'Validation failed',
        'VALIDATION_ERROR',
        400
      );
    }

    // Check if user can access this specific call
    const canAccessCall = await RBACService.canAccessCall(
      context.user.id,
      callId,
      workspaceId
    );
    if (!canAccessCall.hasPermission) {
      return createErrorResponse(
        canAccessCall.reason || 'Access denied',
        'INSUFFICIENT_PERMISSIONS',
        403
      );
    }

    // Check if user can update calls
    const canUpdateCalls = await RBACService.canUpdateCalls(context.user.id, workspaceId);
    if (!canUpdateCalls.hasPermission) {
      return createErrorResponse(
        'Insufficient permissions to update calls',
        'INSUFFICIENT_PERMISSIONS',
        403
      );
    }

    const updatedCall = await SalesCallService.updateSalesCall(
      callId,
      validation.data!,
      context.user
    );

    if (!updatedCall) {
      return createErrorResponse(
        'Call not found',
        'NOT_FOUND',
        404
      );
    }

    // Create audit log entry for call update
    try {
      await fetch(`${request.nextUrl.origin}/api/workspaces/${workspaceId}/audit-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || '',
        },
        body: JSON.stringify({
          action: 'call_updated',
          resource_type: 'call',
          resource_id: callId,
          details: {
            call_id: callId,
            prospect_name: updatedCall.prospect_name,
            crm_stage: updatedCall.crm_stage,
            traffic_source: updatedCall.traffic_source,
            company_name: updatedCall.company_name,
            updated_fields: Object.keys(validation.data!),
          },
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
          user_agent: request.headers.get('user-agent') || null,
        }),
      });
    } catch (auditError) {
      console.warn('Failed to create audit log for call update:', auditError);
      // Don't fail the main operation if audit logging fails
    }

    return createSuccessResponse(
      { call: updatedCall },
      context,
      'Call updated successfully'
    );
  } catch (error) {
    console.error('Error updating call:', error);
    return createErrorResponse(
      'Failed to update call',
      'UPDATE_CALL_ERROR',
      500
    );
  }
});

// DELETE /api/workspaces/[workspaceId]/calls/[callId] - Delete call
export const DELETE = withCallManagement(async (request: NextRequest, context) => {
  const { workspaceId } = context;
  
  try {
    const url = new URL(request.url);
    const callId = url.pathname.split('/').pop();

    if (!callId) {
      return createErrorResponse(
        'Call ID is required',
        'VALIDATION_ERROR',
        400
      );
    }

    // Check if user can access this specific call
    const canAccessCall = await RBACService.canAccessCall(
      context.user.id,
      callId,
      workspaceId
    );
    if (!canAccessCall.hasPermission) {
      return createErrorResponse(
        canAccessCall.reason || 'Access denied',
        'INSUFFICIENT_PERMISSIONS',
        403
      );
    }

    // Check if user can delete calls
    const canDeleteCalls = await RBACService.canDeleteCalls(context.user.id, workspaceId);
    if (!canDeleteCalls.hasPermission) {
      return createErrorResponse(
        'Insufficient permissions to delete calls',
        'INSUFFICIENT_PERMISSIONS',
        403
      );
    }

    const deleted = await SalesCallService.deleteSalesCall(callId, context.user);

    if (!deleted) {
      return createErrorResponse(
        'Call not found',
        'NOT_FOUND',
        404
      );
    }

    // Create audit log entry for call deletion
    try {
      await fetch(`${request.nextUrl.origin}/api/workspaces/${workspaceId}/audit-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || '',
        },
        body: JSON.stringify({
          action: 'call_deleted',
          resource_type: 'call',
          resource_id: callId,
          details: {
            call_id: callId,
            deleted_at: new Date().toISOString(),
          },
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
          user_agent: request.headers.get('user-agent') || null,
        }),
      });
    } catch (auditError) {
      console.warn('Failed to create audit log for call deletion:', auditError);
      // Don't fail the main operation if audit logging fails
    }

    return createSuccessResponse(
      { deleted: true },
      context,
      'Call deleted successfully'
    );
  } catch (error) {
    console.error('Error deleting call:', error);
    return createErrorResponse(
      'Failed to delete call',
      'DELETE_CALL_ERROR',
      500
    );
  }
});
