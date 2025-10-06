// =====================================================
// Workspace-Scoped Call Management API
// Task 21.3: Update Supabase Schema and Implement Backend APIs
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { withRbacProtection, RbacContext } from '@/lib/api/rbacWrapper';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/createErrorResponse';
import { query } from '@/lib/database';
import { AuditService } from '@/lib/services/auditService';

// GET /api/workspaces/[workspaceId]/calls/[callId] - Get specific call
export const GET = withRbacProtection(async (
  request: NextRequest,
  context: { params: { workspaceId: string; callId: string } },
  rbac: RbacContext
) => {
  const { workspaceId, callId } = context.params;
  
  try {
    // Check if user can read calls
    if (!(await rbac.hasPermission('calls:read'))) {
      return createErrorResponse('Access Denied: Cannot read calls', 403);
    }

    const sql = `
      SELECT 
        c.*,
        cl.name as client_name,
        u.name as user_name,
        u.email as user_email
      FROM calls c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = $1 AND c.workspace_id = $2
    `;

    const result = await query(sql, [callId, workspaceId]);

    if (result.rows.length === 0) {
      return createErrorResponse('Call not found', 404);
    }

    const call = result.rows[0];

    // Log analytics view
    await AuditService.logAnalyticsViewed(
      workspaceId,
      { id: rbac.userId } as any,
      'call_details',
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );

    return createSuccessResponse(
      { call },
      rbac,
      'Call retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching call:', error);
    return createErrorResponse(
      'Failed to fetch call',
      'FETCH_CALL_ERROR',
      500
    );
  }
}, {
  permissions: ['calls:read']
});

// PATCH /api/workspaces/[workspaceId]/calls/[callId] - Update call (for Kanban moves)
export const PATCH = withRbacProtection(async (
  request: NextRequest,
  context: { params: { workspaceId: string; callId: string } },
  rbac: RbacContext
) => {
  const { workspaceId, callId } = context.params;
  
  try {
    // Check if user can update calls
    if (!(await rbac.hasPermission('calls:update'))) {
      return createErrorResponse('Access Denied: Cannot update calls', 403);
    }

    const body = await request.json();
    const { crm_stage, traffic_source, ...otherUpdates } = body;

    // Validate CRM stage if provided
    const validCrmStages = ['scheduled', 'in_progress', 'completed', 'no_show', 'closed_won', 'lost'];
    if (crm_stage && !validCrmStages.includes(crm_stage)) {
      return createErrorResponse(
        `Invalid CRM stage. Must be one of: ${validCrmStages.join(', ')}`,
        400
      );
    }

    // Validate traffic source if provided
    const validTrafficSources = ['organic', 'meta'];
    if (traffic_source && !validTrafficSources.includes(traffic_source)) {
      return createErrorResponse(
        `Invalid traffic source. Must be one of: ${validTrafficSources.join(', ')}`,
        400
      );
    }

    // Get current call data for audit logging
    const currentCallResult = await query(
      'SELECT * FROM calls WHERE id = $1 AND workspace_id = $2',
      [callId, workspaceId]
    );

    if (currentCallResult.rows.length === 0) {
      return createErrorResponse('Call not found', 404);
    }

    const currentCall = currentCallResult.rows[0];

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (crm_stage !== undefined) {
      updateFields.push(`crm_stage = $${paramIndex}`);
      updateValues.push(crm_stage);
      paramIndex++;
    }

    if (traffic_source !== undefined) {
      updateFields.push(`traffic_source = $${paramIndex}`);
      updateValues.push(traffic_source);
      paramIndex++;
    }

    // Add other fields if provided
    const allowedFields = [
      'prospect_name', 'prospect_email', 'prospect_phone', 'notes',
      'call_duration', 'scheduled_at', 'completed_at', 'outcome',
      'source_of_set_appointment', 'scrms_outcome'
    ];

    for (const [key, value] of Object.entries(otherUpdates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        updateValues.push(value);
        paramIndex++;
      }
    }

    if (updateFields.length === 0) {
      return createErrorResponse('No valid fields to update', 400);
    }

    // Add updated_at and workspace_id/user_id for WHERE clause
    updateFields.push(`updated_at = NOW()`);
    updateValues.push(callId, workspaceId);

    const updateSql = `
      UPDATE calls 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex} AND workspace_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await query(updateSql, updateValues);

    if (result.rows.length === 0) {
      return createErrorResponse('Call not found or update failed', 404);
    }

    const updatedCall = result.rows[0];

    // Log the update for audit
    const changes: Record<string, any> = {};
    if (crm_stage !== undefined && crm_stage !== currentCall.crm_stage) {
      changes.crm_stage = { from: currentCall.crm_stage, to: crm_stage };
    }
    if (traffic_source !== undefined && traffic_source !== currentCall.traffic_source) {
      changes.traffic_source = { from: currentCall.traffic_source, to: traffic_source };
    }

    // Log other changes
    for (const [key, value] of Object.entries(otherUpdates)) {
      if (allowedFields.includes(key) && value !== currentCall[key]) {
        changes[key] = { from: currentCall[key], to: value };
      }
    }

    if (Object.keys(changes).length > 0) {
      await AuditService.logCallUpdated(
        workspaceId,
        { id: rbac.userId } as any,
        callId,
        currentCall.prospect_name || 'Unknown',
        changes,
        request.headers.get('x-forwarded-for') || undefined,
        request.headers.get('user-agent') || undefined
      );
    }

    return createSuccessResponse(
      { call: updatedCall },
      rbac,
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
}, {
  permissions: ['calls:update']
});

// DELETE /api/workspaces/[workspaceId]/calls/[callId] - Delete call
export const DELETE = withRbacProtection(async (
  request: NextRequest,
  context: { params: { workspaceId: string; callId: string } },
  rbac: RbacContext
) => {
  const { workspaceId, callId } = context.params;
  
  try {
    // Check if user can delete calls
    if (!(await rbac.hasPermission('calls:delete'))) {
      return createErrorResponse('Access Denied: Cannot delete calls', 403);
    }

    // Get call data for audit logging
    const callResult = await query(
      'SELECT * FROM calls WHERE id = $1 AND workspace_id = $2',
      [callId, workspaceId]
    );

    if (callResult.rows.length === 0) {
      return createErrorResponse('Call not found', 404);
    }

    const call = callResult.rows[0];

    // Delete the call
    const deleteResult = await query(
      'DELETE FROM calls WHERE id = $1 AND workspace_id = $2 RETURNING id',
      [callId, workspaceId]
    );

    if (deleteResult.rows.length === 0) {
      return createErrorResponse('Call not found or already deleted', 404);
    }

    // Log the deletion
    await AuditService.logCallDeleted(
      workspaceId,
      { id: rbac.userId } as any,
      callId,
      call.prospect_name || 'Unknown',
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );

    return createSuccessResponse(
      { deleted: true },
      rbac,
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
}, {
  permissions: ['calls:delete']
});
