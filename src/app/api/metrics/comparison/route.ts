import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { createValidationError, withErrorHandling } from '@/middleware/errors';
import { validateMetricsFilter } from '@/lib/validation';
import { MetricsService } from '@/lib/services/metricsService';

// GET /api/metrics/comparison - Compare metrics between two time periods
const getMetricsComparison = withErrorHandling(async (request: NextRequest, user: User) => {
  const { searchParams } = new URL(request.url);
  
  // Current period filters
  const currentFilterData = {
    clientId: searchParams.get('clientId') || undefined,
    userId: searchParams.get('userId') || undefined,
    dateFrom: searchParams.get('currentDateFrom') ? new Date(searchParams.get('currentDateFrom')!) : undefined,
    dateTo: searchParams.get('currentDateTo') ? new Date(searchParams.get('currentDateTo')!) : undefined,
  };

  // Previous period filters
  const previousFilterData = {
    clientId: searchParams.get('clientId') || undefined,
    userId: searchParams.get('userId') || undefined,
    dateFrom: searchParams.get('previousDateFrom') ? new Date(searchParams.get('previousDateFrom')!) : undefined,
    dateTo: searchParams.get('previousDateTo') ? new Date(searchParams.get('previousDateTo')!) : undefined,
  };

  // Validate both filter sets
  const [currentValidation, previousValidation] = await Promise.all([
    validateMetricsFilter(currentFilterData),
    validateMetricsFilter(previousFilterData)
  ]);

  if (!currentValidation.isValid) {
    throw createValidationError('Invalid current period filter parameters', currentValidation.errors);
  }

  if (!previousValidation.isValid) {
    throw createValidationError('Invalid previous period filter parameters', previousValidation.errors);
  }

  const currentFilters = currentValidation.data!;
  const previousFilters = previousValidation.data!;

  // Determine access level based on user role
  let currentMetricsFilters: any = {};
  let previousMetricsFilters: any = {};
  
  if (user.role === 'ceo') {
    // CEO can see all data
    currentMetricsFilters = currentFilters;
    previousMetricsFilters = previousFilters;
  } else if (user.role === 'admin') {
    // Admin can see their client's data
    currentMetricsFilters = { 
      clientId: currentFilters.clientId || user.clientId, 
      userId: currentFilters.userId, 
      dateFrom: currentFilters.dateFrom, 
      dateTo: currentFilters.dateTo 
    };
    previousMetricsFilters = { 
      clientId: previousFilters.clientId || user.clientId, 
      userId: previousFilters.userId, 
      dateFrom: previousFilters.dateFrom, 
      dateTo: previousFilters.dateTo 
    };
  } else if (user.role === 'sales') {
    // Sales can only see their own data
    currentMetricsFilters = { 
      clientId: user.clientId, 
      userId: user.id, 
      dateFrom: currentFilters.dateFrom, 
      dateTo: currentFilters.dateTo 
    };
    previousMetricsFilters = { 
      clientId: user.clientId, 
      userId: user.id, 
      dateFrom: previousFilters.dateFrom, 
      dateTo: previousFilters.dateTo 
    };
  }

  // Get metrics comparison
  const comparison = await MetricsService.getMetricsComparison(
    currentMetricsFilters,
    previousMetricsFilters
  );

  return NextResponse.json(
    {
      success: true,
      data: comparison
    },
    { status: 200 }
  );
});

// Export the protected handler
export const GET = withAuth(getMetricsComparison);
