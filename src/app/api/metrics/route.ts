import { NextRequest, NextResponse } from 'next/server';

// GET /api/metrics - Get performance metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const userId = searchParams.get('userId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

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
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch metrics',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
