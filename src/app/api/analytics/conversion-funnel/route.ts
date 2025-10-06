import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Return mock conversion funnel data for testing
    const mockFunnelData = [
      {
        stage: 'Scheduled',
        count: 100,
        conversion_rate: 100.0
      },
      {
        stage: 'Showed',
        count: 70,
        conversion_rate: 70.0
      },
      {
        stage: 'Closed Won',
        count: 25,
        conversion_rate: 35.7
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockFunnelData,
      message: 'Mock conversion funnel data for testing'
    });
  } catch (error) {
    console.error('Error in conversion funnel API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversion funnel data' },
      { status: 500 }
    );
  }
}