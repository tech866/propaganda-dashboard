import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return mock time series data for testing
    const mockTimeSeriesData = [
      {
        date: '2024-01-01',
        metrics: {
          calls_scheduled: 20,
          calls_taken: 18,
          calls_showed: 15,
          calls_closed_won: 5,
          cash_collected: 10000
        }
      },
      {
        date: '2024-01-02',
        metrics: {
          calls_scheduled: 25,
          calls_taken: 22,
          calls_showed: 18,
          calls_closed_won: 7,
          cash_collected: 14000
        }
      },
      {
        date: '2024-01-03',
        metrics: {
          calls_scheduled: 30,
          calls_taken: 26,
          calls_showed: 22,
          calls_closed_won: 8,
          cash_collected: 16000
        }
      },
      {
        date: '2024-01-04',
        metrics: {
          calls_scheduled: 25,
          calls_taken: 20,
          calls_showed: 15,
          calls_closed_won: 5,
          cash_collected: 10000
        }
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockTimeSeriesData,
      message: 'Mock time series data for testing'
    });
  } catch (error) {
    console.error('Error in time series API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time series data' },
      { status: 500 }
    );
  }
}