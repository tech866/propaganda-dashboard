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
    const callOutcome = searchParams.get('call_outcome');

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
      call_outcome: callOutcome || undefined,
    };

    // Calculate metrics
    const metrics = await AnalyticsService.calculateWorkspaceMetrics(filter);

    return NextResponse.json({
      success: true,
      data: metrics,
      filter
    });

  } catch (error) {
    console.error('Error fetching analytics metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspace_id, date, metrics, traffic_source } = body;

    if (!workspace_id || !date || !metrics) {
      return NextResponse.json(
        { error: 'Missing required fields: workspace_id, date, metrics' },
        { status: 400 }
      );
    }

    // Update metrics snapshot
    await AnalyticsService.updateMetricsSnapshot(
      workspace_id,
      date,
      metrics,
      traffic_source
    );

    return NextResponse.json({
      success: true,
      message: 'Metrics snapshot updated successfully'
    });

  } catch (error) {
    console.error('Error updating metrics snapshot:', error);
    return NextResponse.json(
      { error: 'Failed to update metrics snapshot' },
      { status: 500 }
    );
  }
}
