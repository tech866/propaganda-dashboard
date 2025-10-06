import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return mock real-time metrics data for testing
    const mockRealTimeData = {
      current: {
        calls_scheduled: 100,
        calls_showed: 70,
        calls_closed_won: 25,
        cash_collected: 50000
      },
      previous_period: {
        calls_scheduled: 90,
        calls_showed: 65,
        calls_closed_won: 20,
        cash_collected: 45000
      },
      trends: [
        {
          metric: 'calls_scheduled',
          change: 10,
          change_percentage: 11.1
        },
        {
          metric: 'calls_showed',
          change: 5,
          change_percentage: 7.7
        },
        {
          metric: 'calls_closed_won',
          change: 5,
          change_percentage: 25.0
        },
        {
          metric: 'cash_collected',
          change: 5000,
          change_percentage: 11.1
        }
      ]
    };

    return NextResponse.json({
      success: true,
      data: mockRealTimeData,
      message: 'Mock real-time metrics data for testing'
    });
  } catch (error) {
    console.error('Error in real-time metrics API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch real-time metrics' },
      { status: 500 }
    );
  }
}