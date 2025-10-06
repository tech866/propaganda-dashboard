/**
 * Audit Logs API Endpoint
 * GET /api/audit - Retrieve audit logs with filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAnyRole, User } from '@/middleware/auth';
import { AuditService } from '@/lib/services/auditService';
import { AuditLogQuery } from '@/lib/types/audit';

const getAuditLogs = withAnyRole(['admin', 'ceo'], async (request: NextRequest, user: User) => {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters safely with defaults
    const query: AuditLogQuery = {
      clientId: user.clientId, // Always filter by user's client
      userId: searchParams.get('userId') || undefined,
      tableName: searchParams.get('tableName') || undefined,
      action: searchParams.get('action') as any || undefined,
      endpoint: searchParams.get('endpoint') || undefined,
      httpMethod: searchParams.get('httpMethod') as any || undefined,
      statusCode: searchParams.get('statusCode') ? parseInt(searchParams.get('statusCode')!) : undefined,
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
      limit: Math.min(Math.max(parseInt(searchParams.get('limit') || '50'), 1), 100),
      offset: Math.max(parseInt(searchParams.get('offset') || '0'), 0),
      orderBy: (searchParams.get('orderBy') as any) || 'created_at',
      orderDirection: (searchParams.get('orderDirection') as any) || 'DESC'
    };

    // Apply role-based filtering
    if (user.role === 'sales') {
      // Sales users can only see their own audit logs
      query.userId = user.id;
    }

    const result = await AuditService.getAuditLogs(user.clientId, query);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in getAuditLogs:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
});

// Only Admin and CEO roles can access audit logs
export const GET = getAuditLogs;