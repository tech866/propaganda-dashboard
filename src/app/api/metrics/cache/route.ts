import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { createAuthorizationError, withErrorHandling } from '@/middleware/errors';
import { MetricsService } from '@/lib/services/metricsService';

// DELETE /api/metrics/cache - Clear metrics cache (Admin/CEO only)
const clearMetricsCache = withErrorHandling(async (request: NextRequest, user: User) => {
  // Only Admin and CEO can clear cache
  if (user.role !== 'admin' && user.role !== 'ceo') {
    throw createAuthorizationError('Only Admin and CEO users can clear metrics cache');
  }

  // Clear the cache
  MetricsService.clearCache();

  return NextResponse.json(
    {
      success: true,
      message: 'Metrics cache cleared successfully',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
});

// Export the protected handler
export const DELETE = withAuth(clearMetricsCache);
