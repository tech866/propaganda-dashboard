/**
 * Audit Logs Statistics API Endpoint
 * GET /api/audit/stats - Get audit log statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withRole, User } from '@/middleware/auth';
import { withErrorHandling } from '@/middleware/errors';
import { auditService } from '@/lib/services/auditService';

// GET /api/audit/stats - Get audit log statistics
const getAuditStats = withErrorHandling(async (request: NextRequest, user: User) => {
  const { searchParams } = new URL(request.url);

  const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined;
  const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined;

  // Validate date range
  if (dateFrom && dateTo && dateFrom > dateTo) {
    return NextResponse.json(
      { success: false, error: 'dateFrom must be before dateTo' },
      { status: 400 }
    );
  }

  const result = await auditService.getAuditStats(user.clientId, dateFrom, dateTo);

  return NextResponse.json(result, { status: 200 });
});

// Only Admin and CEO roles can access audit statistics
export const GET = withAuth(withRole(['admin', 'ceo'])(getAuditStats));
