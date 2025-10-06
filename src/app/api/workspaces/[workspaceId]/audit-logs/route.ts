// =====================================================
// Workspace Audit Logs API Route
// Task 20.5: Implement Workspace Management UI Components and Audit Logging
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { withAnalyticsView, createSuccessResponse, createErrorResponse } from '@/lib/api/rbacWrapper';
import { query } from '@/lib/database';

// GET /api/workspaces/[workspaceId]/audit-logs - Get audit logs for workspace
export const GET = withAnalyticsView(async (request: NextRequest, context) => {
  const { workspaceId } = context;
  
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const offset = (page - 1) * limit;

    // Build query conditions
    let whereConditions = ['al.workspace_id = $1'];
    let params: any[] = [workspaceId];
    let paramIndex = 2;

    if (search) {
      whereConditions.push(`(
        al.action ILIKE $${paramIndex} OR 
        al.resource_type ILIKE $${paramIndex} OR 
        u.name ILIKE $${paramIndex} OR 
        u.email ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (type && type !== 'all') {
      whereConditions.push(`al.resource_type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get audit logs with user information
    const logsQuery = `
      SELECT 
        al.id,
        al.workspace_id,
        al.user_id,
        al.action,
        al.resource_type,
        al.resource_id,
        al.details,
        al.ip_address,
        al.user_agent,
        al.created_at,
        u.name as user_name,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    const logsResult = await query(logsQuery, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE ${whereClause}
    `;

    const countResult = await query(countQuery, params.slice(0, -2)); // Remove limit and offset
    const total = parseInt(countResult.rows[0].total);
    const hasMore = offset + limit < total;

    return createSuccessResponse(
      {
        logs: logsResult.rows,
        pagination: {
          page,
          limit,
          total,
          hasMore,
          totalPages: Math.ceil(total / limit)
        }
      },
      context,
      'Audit logs retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return createErrorResponse(
      'Failed to fetch audit logs',
      'FETCH_AUDIT_LOGS_ERROR',
      500
    );
  }
});

// POST /api/workspaces/[workspaceId]/audit-logs - Create audit log entry
export const POST = withAnalyticsView(async (request: NextRequest, context) => {
  const { workspaceId, user } = context;
  
  try {
    const body = await request.json();
    const { action, resource_type, resource_id, details, ip_address, user_agent } = body;

    if (!action || !resource_type) {
      return createErrorResponse(
        'Action and resource_type are required',
        'VALIDATION_ERROR',
        400
      );
    }

    // Create audit log entry
    const insertQuery = `
      INSERT INTO audit_logs (
        workspace_id,
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
        user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await query(insertQuery, [
      workspaceId,
      user.id,
      action,
      resource_type,
      resource_id || null,
      details ? JSON.stringify(details) : null,
      ip_address || null,
      user_agent || null
    ]);

    return createSuccessResponse(
      { log: result.rows[0] },
      context,
      'Audit log created successfully'
    );
  } catch (error) {
    console.error('Error creating audit log:', error);
    return createErrorResponse(
      'Failed to create audit log',
      'CREATE_AUDIT_LOG_ERROR',
      500
    );
  }
});
