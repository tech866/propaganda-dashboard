/**
 * Audit Logs API Endpoint
 * GET /api/audit - Retrieve audit logs with filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole, User } from '@/middleware/auth';
import { withErrorHandling } from '@/middleware/errors';
import { auditService } from '@/lib/services/auditService';
import { AuditLogQuery } from '@/lib/types/audit';

// GET /api/audit - Get audit logs with filtering
const getAuditLogs = withErrorHandling(async (request: NextRequest, user: User) => {
  const { searchParams } = new URL(request.url);

  // Parse query parameters
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
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
    offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    orderBy: (searchParams.get('orderBy') as any) || 'created_at',
    orderDirection: (searchParams.get('orderDirection') as any) || 'DESC'
  };

  // Apply role-based filtering
  if (user.role === 'sales') {
    // Sales users can only see their own audit logs
    query.userId = user.id;
  }
  // Admin and CEO can see all logs for their client

  // Validate limit
  if (query.limit && (query.limit < 1 || query.limit > 100)) {
    return NextResponse.json(
      { success: false, error: 'Limit must be between 1 and 100' },
      { status: 400 }
    );
  }

  // Validate offset
  if (query.offset && query.offset < 0) {
    return NextResponse.json(
      { success: false, error: 'Offset must be non-negative' },
      { status: 400 }
    );
  }

  const result = await auditService.getAuditLogs(query);

  return NextResponse.json(result, { status: 200 });
});

// Only Admin and CEO roles can access audit logs
export const GET = withAuth(withRole(['admin', 'ceo'])(getAuditLogs));
