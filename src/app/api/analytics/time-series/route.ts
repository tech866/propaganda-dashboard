import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/analyticsService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const workspaceId = searchParams.get('workspace_id');
    const trafficSource = searchParams.get('traffic_source') as 'organic' | 'meta' | 'all' | null;
    const userId = searchParams.get('user_id');
    const clientId = searchParams.get('client_id');
    const days = parseInt(searchParams.get('days') || '30');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    // Build filter object
    const filter = {
      workspace_id: workspaceId,
      traffic_source: trafficSource || 'all',
      user_id: userId || undefined,
      client_id: clientId || undefined,
    };

    // Get time series data
    const timeSeries = await AnalyticsService.getMetricsTimeSeries(filter, days);

    return NextResponse.json({
      success: true,
      data: timeSeries,
      filter,
      days
    });

  } catch (error) {
    console.error('Error fetching time series data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch time series data' },
      { status: 500 }
    );
  }
}
