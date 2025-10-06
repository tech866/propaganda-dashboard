// =====================================================
// Kanban Board API Route
// Task 21.3: Update Supabase Schema and Implement Backend APIs
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { withRbacProtection, RbacContext } from '@/lib/api/rbacWrapper';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/createErrorResponse';
import { query } from '@/lib/database';

// GET /api/workspaces/[workspaceId]/kanban - Get calls organized by CRM stage for Kanban board
export const GET = withRbacProtection(async (
  request: NextRequest,
  context: { params: { workspaceId: string } },
  rbac: RbacContext
) => {
  const { workspaceId } = context.params;
  
  try {
    // Check if user can read calls
    if (!(await rbac.hasPermission('calls:read'))) {
      return createErrorResponse('Access Denied: Cannot read calls', 403);
    }

    const { searchParams } = new URL(request.url);
    const trafficSource = searchParams.get('traffic_source'); // Filter by traffic source if provided

    // Build the query with optional traffic source filtering
    let whereClause = 'WHERE c.workspace_id = $1';
    let params: any[] = [workspaceId];
    let paramIndex = 2;

    if (trafficSource && ['organic', 'meta'].includes(trafficSource)) {
      whereClause += ` AND c.traffic_source = $${paramIndex}`;
      params.push(trafficSource);
      paramIndex++;
    }

    const sql = `
      SELECT 
        c.id,
        c.prospect_name,
        c.prospect_first_name,
        c.prospect_last_name,
        c.prospect_email,
        c.prospect_phone,
        c.company_name,
        c.crm_stage,
        c.traffic_source,
        c.status,
        c.outcome,
        c.notes,
        c.call_duration,
        c.scheduled_at,
        c.completed_at,
        c.source_of_set_appointment,
        c.scrms_outcome,
        c.created_at,
        c.updated_at,
        cl.name as client_name,
        u.name as user_name,
        u.email as user_email
      FROM calls c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN users u ON c.user_id = u.id
      ${whereClause}
      ORDER BY c.created_at DESC
    `;

    const result = await query(sql, params);
    const calls = result.rows;

    // Organize calls by CRM stage
    const crmStages = [
      'scheduled',
      'in_progress', 
      'completed',
      'no_show',
      'closed_won',
      'lost'
    ];

    const kanbanData = crmStages.reduce((acc, stage) => {
      acc[stage] = calls.filter(call => call.crm_stage === stage);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate summary statistics
    const totalCalls = calls.length;
    const completedCalls = calls.filter(call => 
      ['completed', 'no_show', 'closed_won', 'lost'].includes(call.crm_stage)
    ).length;
    const closedCalls = calls.filter(call => 
      ['closed_won', 'lost'].includes(call.crm_stage)
    ).length;

    const showRate = totalCalls > 0 ? (completedCalls / totalCalls) : 0;
    const closeRate = completedCalls > 0 ? (closedCalls / completedCalls) : 0;

    // Calculate traffic source breakdown
    const organicCalls = calls.filter(call => call.traffic_source === 'organic');
    const metaCalls = calls.filter(call => call.traffic_source === 'meta');

    const organicCompleted = organicCalls.filter(call => 
      ['completed', 'no_show', 'closed_won', 'lost'].includes(call.crm_stage)
    ).length;
    const organicClosed = organicCalls.filter(call => 
      ['closed_won', 'lost'].includes(call.crm_stage)
    ).length;

    const metaCompleted = metaCalls.filter(call => 
      ['completed', 'no_show', 'closed_won', 'lost'].includes(call.crm_stage)
    ).length;
    const metaClosed = metaCalls.filter(call => 
      ['closed_won', 'lost'].includes(call.crm_stage)
    ).length;

    const organicShowRate = organicCalls.length > 0 ? (organicCompleted / organicCalls.length) : 0;
    const organicCloseRate = organicCompleted > 0 ? (organicClosed / organicCompleted) : 0;

    const metaShowRate = metaCalls.length > 0 ? (metaCompleted / metaCalls.length) : 0;
    const metaCloseRate = metaCompleted > 0 ? (metaClosed / metaCompleted) : 0;

    const analytics = {
      overall: {
        totalCalls,
        completedCalls,
        closedCalls,
        showRate,
        closeRate
      },
      organic: {
        totalCalls: organicCalls.length,
        completedCalls: organicCompleted,
        closedCalls: organicClosed,
        showRate: organicShowRate,
        closeRate: organicCloseRate
      },
      meta: {
        totalCalls: metaCalls.length,
        completedCalls: metaCompleted,
        closedCalls: metaClosed,
        showRate: metaShowRate,
        closeRate: metaCloseRate
      }
    };

    return createSuccessResponse(
      {
        kanbanData,
        analytics,
        filters: {
          trafficSource: trafficSource || null
        }
      },
      rbac,
      'Kanban data retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching kanban data:', error);
    return createErrorResponse(
      'Failed to fetch kanban data',
      'FETCH_KANBAN_ERROR',
      500
    );
  }
}, {
  permissions: ['calls:read']
});

// PATCH /api/workspaces/[workspaceId]/kanban - Bulk update calls (for drag & drop operations)
export const PATCH = withRbacProtection(async (
  request: NextRequest,
  context: { params: { workspaceId: string } },
  rbac: RbacContext
) => {
  const { workspaceId } = context.params;
  
  try {
    // Check if user can update calls
    if (!(await rbac.hasPermission('calls:update'))) {
      return createErrorResponse('Access Denied: Cannot update calls', 403);
    }

    const body = await request.json();
    const { updates } = body; // Array of { callId, crm_stage, traffic_source?, ...otherFields }

    if (!Array.isArray(updates) || updates.length === 0) {
      return createErrorResponse('Updates array is required', 400);
    }

    const validCrmStages = ['scheduled', 'in_progress', 'completed', 'no_show', 'closed_won', 'lost'];
    const validTrafficSources = ['organic', 'meta'];

    // Validate all updates
    for (const update of updates) {
      if (!update.callId) {
        return createErrorResponse('callId is required for each update', 400);
      }
      
      if (update.crm_stage && !validCrmStages.includes(update.crm_stage)) {
        return createErrorResponse(
          `Invalid CRM stage: ${update.crm_stage}. Must be one of: ${validCrmStages.join(', ')}`,
          400
        );
      }

      if (update.traffic_source && !validTrafficSources.includes(update.traffic_source)) {
        return createErrorResponse(
          `Invalid traffic source: ${update.traffic_source}. Must be one of: ${validTrafficSources.join(', ')}`,
          400
        );
      }
    }

    // Process updates in a transaction
    const updatedCalls = [];
    
    for (const update of updates) {
      const { callId, ...updateFields } = update;
      
      // Build update query dynamically
      const updateFieldsList: string[] = [];
      const updateValues: any[] = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(updateFields)) {
        if (value !== undefined) {
          updateFieldsList.push(`${key} = $${paramIndex}`);
          updateValues.push(value);
          paramIndex++;
        }
      }

      if (updateFieldsList.length === 0) {
        continue; // Skip if no valid fields to update
      }

      // Add updated_at and WHERE clause parameters
      updateFieldsList.push('updated_at = NOW()');
      updateValues.push(callId, workspaceId);

      const updateSql = `
        UPDATE calls 
        SET ${updateFieldsList.join(', ')}
        WHERE id = $${paramIndex} AND workspace_id = $${paramIndex + 1}
        RETURNING *
      `;

      const result = await query(updateSql, updateValues);
      
      if (result.rows.length > 0) {
        updatedCalls.push(result.rows[0]);
      }
    }

    return createSuccessResponse(
      { 
        updatedCalls,
        updateCount: updatedCalls.length
      },
      rbac,
      'Calls updated successfully'
    );
  } catch (error) {
    console.error('Error updating calls:', error);
    return createErrorResponse(
      'Failed to update calls',
      'UPDATE_CALLS_ERROR',
      500
    );
  }
}, {
  permissions: ['calls:update']
});
