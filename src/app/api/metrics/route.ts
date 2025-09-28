import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { createValidationError, withErrorHandling } from '@/middleware/errors';
import { validateMetricsFilter } from '@/lib/validation';

// GET /api/metrics - Get performance metrics
const getMetrics = withErrorHandling(async (request: NextRequest, user: User) => {
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

    // TODO: Implement actual metrics calculation from database
    // For now, return mock data
    const mockMetrics = {
      showRate: {
        value: 0.75, // 75%
        label: 'Show Rate',
        description: 'Shows / Booked calls',
        trend: '+5%' // vs previous period
      },
      closeRate: {
        value: 0.45, // 45%
        label: 'Close Rate',
        description: 'Wins / (Shows or Qualified)',
        trend: '+2%' // vs previous period
      },
      totalCalls: 120,
      totalShows: 90,
      totalWins: 41,
      lossReasons: [
        { reason: 'Price too high', count: 15, percentage: 30.6 },
        { reason: 'Not interested', count: 12, percentage: 24.5 },
        { reason: 'Timing not right', count: 8, percentage: 16.3 },
        { reason: 'Competitor chosen', count: 7, percentage: 14.3 },
        { reason: 'Other', count: 7, percentage: 14.3 }
      ],
      period: {
        from: dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        to: dateTo || new Date().toISOString()
      },
      filters: { clientId, userId }
    };

  return NextResponse.json(
    {
      success: true,
      data: mockMetrics
    },
    { status: 200 }
  );
});

// Export the protected handler
export const GET = withAuth(getMetrics);
