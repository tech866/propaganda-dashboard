/**
 * Audit Logs Statistics API Endpoint
 * GET /api/audit/stats - Get audit log statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAnyRole, User } from '@/middleware/auth';
import { AuditService } from '@/lib/services/auditService';

const getAuditStats = withAnyRole(['admin', 'ceo'], async (request: NextRequest, user: User) => {
  try {
    const searchParams = request.nextUrl.searchParams;

    let dateFrom: Date | undefined;
    let dateTo: Date | undefined;

    // Safe date parsing
    const dateFromStr = searchParams.get('dateFrom');
    const dateToStr = searchParams.get('dateTo');

    if (dateFromStr) {
      const parsedDateFrom = new Date(dateFromStr);
      if (!isNaN(parsedDateFrom.getTime())) {
        dateFrom = parsedDateFrom;
      }
    }

    if (dateToStr) {
      const parsedDateTo = new Date(dateToStr);
      if (!isNaN(parsedDateTo.getTime())) {
        dateTo = parsedDateTo;
      }
    }

    // Validate date range
    if (dateFrom && dateTo && dateFrom > dateTo) {
      return NextResponse.json(
        { success: false, error: 'dateFrom must be before dateTo' },
        { status: 400 }
      );
    }

    const result = await AuditService.getAuditStats(user.clientId, dateFrom, dateTo);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in getAuditStats:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
});

// Only Admin and CEO roles can access audit statistics
export const GET = getAuditStats;