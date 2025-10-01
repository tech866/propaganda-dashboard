import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { canAccessClient } from '@/middleware/utils';
import { 
  createValidationError, 
  createAuthorizationError, 
  withErrorHandling 
} from '@/middleware/errors';
import { EnhancedMetricsService, EnhancedMetricsFilters } from '@/lib/services/enhancedMetricsService';

// GET /api/metrics/enhanced - Get enhanced metrics
const getEnhancedMetrics = withErrorHandling(async (request: NextRequest, user: User) => {
  const { searchParams } = new URL(request.url);
  
  // Prepare filter data
  const filters: EnhancedMetricsFilters = {
    clientId: searchParams.get('clientId') || undefined,
    userId: searchParams.get('userId') || undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
    adSpend: searchParams.get('adSpend') ? parseFloat(searchParams.get('adSpend')!) : undefined,
  };

  // Validate filters
  const validation = EnhancedMetricsService.validateFilters(filters);
  if (!validation.isValid) {
    throw createValidationError('Invalid filter parameters', validation.errors);
  }

  // Validate client access
  if (filters.clientId && !canAccessClient(user, filters.clientId)) {
    throw createAuthorizationError('Access denied to client data');
  }

  // Set client ID from user if not provided
  if (!filters.clientId && user.role !== 'ceo') {
    filters.clientId = user.clientId;
  }

  // Set user ID for sales users
  if (user.role === 'sales') {
    filters.userId = user.id;
  }

  // Get enhanced metrics
  const metrics = await EnhancedMetricsService.getEnhancedMetrics(filters);

  return NextResponse.json(
    {
      success: true,
      data: metrics,
      filters,
      user: { id: user.id, role: user.role, clientId: user.clientId }
    },
    { status: 200 }
  );
});

// Export the protected handler
export const GET = withAuth(getEnhancedMetrics);
