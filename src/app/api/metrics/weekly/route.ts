import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { withErrorHandling } from '@/middleware/errors';
import { MetricsService } from '@/lib/services/metricsService';

// GET /api/metrics/weekly - Get weekly metrics summary
const getWeeklyMetrics = withErrorHandling(async (request: NextRequest, user: User) => {
  const { searchParams } = new URL(request.url);
  
  // Determine access level based on user role
  let clientId: string | undefined;
  let userId: string | undefined;
  
  if (user.role === 'ceo') {
    // CEO can see all data or filter by client/user
    clientId = searchParams.get('clientId') || undefined;
    userId = searchParams.get('userId') || undefined;
  } else if (user.role === 'admin') {
    // Admin can see their client's data or filter by user
    clientId = user.clientId;
    userId = searchParams.get('userId') || undefined;
  } else if (user.role === 'sales') {
    // Sales can only see their own data
    clientId = user.clientId;
    userId = user.id;
  }

  // Get weekly metrics (last 7 days)
  const weeklyMetrics = await MetricsService.getWeeklyMetrics(clientId, userId);

  return NextResponse.json(
    {
      success: true,
      data: weeklyMetrics,
      period: 'last_7_days',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
});

// Export the protected handler
export const GET = withAuth(getWeeklyMetrics);
