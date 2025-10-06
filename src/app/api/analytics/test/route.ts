import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return mock analytics data for testing
    const mockData = {
      calls_scheduled: 100,
      calls_taken: 80,
      calls_cancelled: 10,
      calls_rescheduled: 5,
      calls_showed: 70,
      calls_closed_won: 25,
      calls_disqualified: 5,
      cash_collected: 50000,
      show_rate: 70.0,
      close_rate: 31.25,
      gross_collected_per_booked_call: 500.0,
      cash_per_live_call: 625.0,
      cash_based_aov: 2000.0,
    };

    return NextResponse.json({
      success: true,
      data: mockData,
      message: 'Mock analytics data for testing'
    });
  } catch (error) {
    console.error('Error in test analytics API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test analytics' },
      { status: 500 }
    );
  }
}
