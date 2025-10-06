// =====================================================
// Workspace Analytics API Route
// Task 20.4: Extend Role-Based Access Control for Workspace-Scoped Roles
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { withAnalyticsView, createSuccessResponse, createErrorResponse } from '@/lib/api/rbacWrapper';
import { WorkspaceService } from '@/lib/services/workspaceService';
import { RBACService } from '@/lib/services/rbacService';

// GET /api/workspaces/[workspaceId]/analytics - Get workspace analytics
export const GET = withAnalyticsView(async (request: NextRequest, context) => {
  const { workspaceId } = context;
  
  try {
    // Check if user can view analytics
    const canViewAnalytics = await RBACService.canViewAnalytics(context.user.id, workspaceId);
    if (!canViewAnalytics.hasPermission) {
      return createErrorResponse(
        'Insufficient permissions to view analytics',
        'INSUFFICIENT_PERMISSIONS',
        403
      );
    }

    // Get call analytics with traffic source breakdown
    const analytics = await getCallAnalytics(workspaceId, {});

    return NextResponse.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching workspace analytics:', error);
    return createErrorResponse(
      'Failed to fetch workspace analytics',
      'FETCH_ANALYTICS_ERROR',
      500
    );
  }
});

// GET /api/workspaces/[workspaceId]/analytics/calls - Get call analytics
export const GET_CALLS = withAnalyticsView(async (request: NextRequest, context) => {
  const { workspaceId } = context;
  
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const trafficSource = searchParams.get('trafficSource');

    // Check if user can view analytics
    const canViewAnalytics = await RBACService.canViewAnalytics(context.user.id, workspaceId);
    if (!canViewAnalytics.hasPermission) {
      return createErrorResponse(
        'Insufficient permissions to view call analytics',
        'INSUFFICIENT_PERMISSIONS',
        403
      );
    }

    // Get call analytics with filters
    const callAnalytics = await getCallAnalytics(workspaceId, {
      startDate,
      endDate,
      trafficSource
    });

    return createSuccessResponse(
      { analytics: callAnalytics },
      context,
      'Call analytics retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching call analytics:', error);
    return createErrorResponse(
      'Failed to fetch call analytics',
      'FETCH_CALL_ANALYTICS_ERROR',
      500
    );
  }
});

// GET /api/workspaces/[workspaceId]/analytics/performance - Get performance metrics
export const GET_PERFORMANCE = withAnalyticsView(async (request: NextRequest, context) => {
  const { workspaceId } = context;
  
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d, 1y

    // Check if user can view analytics
    const canViewAnalytics = await RBACService.canViewAnalytics(context.user.id, workspaceId);
    if (!canViewAnalytics.hasPermission) {
      return createErrorResponse(
        'Insufficient permissions to view performance analytics',
        'INSUFFICIENT_PERMISSIONS',
        403
      );
    }

    // Get performance metrics
    const performanceMetrics = await getPerformanceMetrics(workspaceId, period);

    return createSuccessResponse(
      { metrics: performanceMetrics },
      context,
      'Performance metrics retrieved successfully'
    );
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return createErrorResponse(
      'Failed to fetch performance metrics',
      'FETCH_PERFORMANCE_ERROR',
      500
    );
  }
});

// Helper function to get call analytics
async function getCallAnalytics(workspaceId: string, filters: {
  startDate?: string | null;
  endDate?: string | null;
  trafficSource?: string | null;
}) {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Build query
  let query = supabase
    .from('calls')
    .select('*')
    .eq('workspace_id', workspaceId);

  // Apply filters
  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }
  if (filters.trafficSource) {
    query = query.eq('traffic_source', filters.trafficSource);
  }

  const { data: calls, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch calls: ${error.message}`);
  }

  if (!calls || calls.length === 0) {
    return {
      overall: {
        totalCalls: 0,
        showRate: 0,
        closeRate: 0,
        callsByStage: {}
      },
      organic: {
        totalCalls: 0,
        showRate: 0,
        closeRate: 0,
        callsByStage: {}
      },
      meta: {
        totalCalls: 0,
        showRate: 0,
        closeRate: 0,
        callsByStage: {}
      }
    };
  }

  // Process calls by traffic source
  const organicCalls = calls.filter(call => call.traffic_source === 'organic');
  const metaCalls = calls.filter(call => call.traffic_source === 'meta');

  // Helper function to calculate metrics
  const calculateMetrics = (callList: any[]) => {
    const totalCalls = callList.length;
    const callsByStage = callList.reduce((acc, call) => {
      const stage = call.crm_stage || 'scheduled';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const completedCalls = callList.filter(call => 
      ['completed', 'no_show', 'closed_won', 'lost'].includes(call.crm_stage || 'scheduled')
    ).length;
    
    const showRate = totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0;

    const closedWonCalls = callList.filter(call => call.crm_stage === 'closed_won').length;
    const closeRate = completedCalls > 0 ? (closedWonCalls / completedCalls) * 100 : 0;

    return {
      totalCalls,
      showRate,
      closeRate,
      callsByStage
    };
  };

  return {
    overall: calculateMetrics(calls),
    organic: calculateMetrics(organicCalls),
    meta: calculateMetrics(metaCalls)
  };
}

// Helper function to get performance metrics
async function getPerformanceMetrics(workspaceId: string, period: string) {
  // This would integrate with your existing performance tracking
  // For now, return a mock structure
  return {
    period,
    metrics: {
      totalRevenue: 0,
      averageDealSize: 0,
      conversionRate: 0,
      topPerformers: [],
      trends: {}
    }
  };
}
