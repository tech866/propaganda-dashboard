import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return mock traffic source breakdown data for testing
    const mockBreakdownData = [
      {
        traffic_source: 'organic' as const,
        metrics: {
          calls_scheduled: 60,
          calls_taken: 50,
          calls_cancelled: 5,
          calls_rescheduled: 3,
          calls_showed: 45,
          calls_closed_won: 15,
          calls_disqualified: 2,
          cash_collected: 30000,
          show_rate: 75.0,
          close_rate: 30.0,
          gross_collected_per_booked_call: 500.0,
          cash_per_live_call: 600.0,
          cash_based_aov: 2000.0,
        },
        percentage_of_total: 60.0
      },
      {
        traffic_source: 'meta' as const,
        metrics: {
          calls_scheduled: 40,
          calls_taken: 30,
          calls_cancelled: 5,
          calls_rescheduled: 2,
          calls_showed: 25,
          calls_closed_won: 10,
          calls_disqualified: 3,
          cash_collected: 20000,
          show_rate: 62.5,
          close_rate: 33.33,
          gross_collected_per_booked_call: 500.0,
          cash_per_live_call: 666.67,
          cash_based_aov: 2000.0,
        },
        percentage_of_total: 40.0
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockBreakdownData,
      message: 'Mock traffic source breakdown data for testing'
    });
  } catch (error) {
    console.error('Error in traffic source breakdown API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch traffic source breakdown' },
      { status: 500 }
    );
  }
}