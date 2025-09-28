import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { withErrorHandling } from '@/middleware/errors';
import { MetricsService } from '@/lib/services/metricsService';

// GET /api/metrics/performance - Get user performance comparison
const getUserPerformance = withErrorHandling(async (request: NextRequest, user: User) => {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId');

  // Validate access permissions
  if (user.role === 'sales') {
    // Sales can only see their own data
    return NextResponse.json(
      { success: false, error: 'Access denied - insufficient permissions' },
      { status: 403 }
    );
  } else if (user.role === 'admin') {
    // Admin can see their client's data
    if (clientId && clientId !== user.clientId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }
  }
  // CEO can see any client's data

  const targetClientId = clientId || user.clientId;
  const performanceData = await MetricsService.getUserPerformanceComparison(targetClientId);

  return NextResponse.json(
    {
      success: true,
      data: performanceData
    },
    { status: 200 }
  );
});

export const GET = withAuth(getUserPerformance);
