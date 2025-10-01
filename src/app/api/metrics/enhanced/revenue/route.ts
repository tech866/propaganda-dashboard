import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { canAccessClient } from '@/middleware/utils';
import { 
  createValidationError, 
  createAuthorizationError, 
  withErrorHandling 
} from '@/middleware/errors';
import { EnhancedMetricsService } from '@/lib/services/enhancedMetricsService';

// GET /api/metrics/enhanced/revenue - Get revenue metrics
const getRevenueMetrics = withErrorHandling(async (request: NextRequest, user: User) => {
  const { searchParams } = new URL(request.url);
  
  const clientId = searchParams.get('clientId') || user.clientId;
  const dateFrom = searchParams.get('dateFrom') || undefined;
  const dateTo = searchParams.get('dateTo') || undefined;

  // Validate client access
  if (!canAccessClient(user, clientId)) {
    throw createAuthorizationError('Access denied to client data');
  }

  // Get revenue metrics
  const metrics = await EnhancedMetricsService.getRevenueMetrics(
    clientId,
    dateFrom,
    dateTo
  );

  return NextResponse.json(
    {
      success: true,
      data: metrics,
      filters: { clientId, dateFrom, dateTo },
      user: { id: user.id, role: user.role, clientId: user.clientId }
    },
    { status: 200 }
  );
});

// Export the protected handler
export const GET = withAuth(getRevenueMetrics);
