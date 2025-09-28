import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { createValidationError, withErrorHandling } from '@/middleware/errors';
import { validateMetricsFilter } from '@/lib/validation';
import { MetricsService } from '@/lib/services/metricsService';

// GET /api/metrics/summary - Get comprehensive metrics summary
const getMetricsSummary = withErrorHandling(async (request: NextRequest, user: User) => {
  const { searchParams } = new URL(request.url);
  
  // Prepare filter data for validation
  const filterData = {
    clientId: searchParams.get('clientId') || undefined,
    userId: searchParams.get('userId') || undefined,
    dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
    dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
  };

  // Validate filter parameters
  const filterValidation = await validateMetricsFilter(filterData);
  if (!filterValidation.isValid) {
    throw createValidationError('Invalid filter parameters', filterValidation.errors);
  }

  const validatedFilters = filterValidation.data!;
  const clientId = validatedFilters.clientId;
  const userId = validatedFilters.userId;
  const dateFrom = validatedFilters.dateFrom;
  const dateTo = validatedFilters.dateTo;

  // Determine access level based on user role
  let metricsFilters: any = {};
  
  if (user.role === 'ceo') {
    // CEO can see all data
    metricsFilters = { clientId, userId, dateFrom, dateTo };
  } else if (user.role === 'admin') {
    // Admin can see their client's data
    metricsFilters = { 
      clientId: clientId || user.clientId, 
      userId, 
      dateFrom, 
      dateTo 
    };
  } else if (user.role === 'sales') {
    // Sales can only see their own data
    metricsFilters = { 
      clientId: user.clientId, 
      userId: user.id, 
      dateFrom, 
      dateTo 
    };
  }

  // Get comprehensive metrics summary
  const summary = await MetricsService.getMetricsSummary(metricsFilters);

  return NextResponse.json(
    {
      success: true,
      data: summary
    },
    { status: 200 }
  );
});

// Export the protected handler
export const GET = withAuth(getMetricsSummary);
