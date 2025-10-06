import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/services/analyticsService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const workspaceId = searchParams.get('workspace_id');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    // Get real-time metrics
    const realTimeMetrics = await AnalyticsService.getRealTimeMetrics(workspaceId);

    return NextResponse.json({
      success: true,
      data: realTimeMetrics
    });

  } catch (error) {
    console.error('Error fetching real-time metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch real-time metrics' },
      { status: 500 }
    );
  }
}
