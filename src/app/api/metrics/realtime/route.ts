import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { withErrorHandling } from '@/middleware/errors';
import { MetricsService } from '@/lib/services/metricsService';

// GET /api/metrics/realtime - Get real-time metrics (last 24 hours)
const getRealTimeMetrics = withErrorHandling(async (request: NextRequest, user: User) => {
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

  // Get real-time metrics (last 24 hours)
  const realTimeMetrics = await MetricsService.getRealTimeMetrics(clientId, userId);

  return NextResponse.json(
    {
      success: true,
      data: realTimeMetrics,
      period: 'last_24_hours',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
});

// Export the protected handler
export const GET = withAuth(getRealTimeMetrics);
