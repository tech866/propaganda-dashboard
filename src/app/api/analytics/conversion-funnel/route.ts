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
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

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
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    };

    // Get conversion funnel
    const funnel = await AnalyticsService.getConversionFunnel(workspaceId, filter);

    return NextResponse.json({
      success: true,
      data: funnel,
      filter
    });

  } catch (error) {
    console.error('Error fetching conversion funnel:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversion funnel' },
      { status: 500 }
    );
  }
}
