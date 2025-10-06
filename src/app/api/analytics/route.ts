import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { withErrorHandling, createValidationError, createNotFoundError } from '@/lib/utils/errorHandling';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Analytics data interface
interface AnalyticsData {
  overall: {
    totalCalls: number;
    showRate: number;
    closeRate: number;
    callsByStage: Record<string, number>;
  };
  organic: {
    totalCalls: number;
    showRate: number;
    closeRate: number;
    callsByStage: Record<string, number>;
  };
  meta: {
    totalCalls: number;
    showRate: number;
    callsByStage: Record<string, number>;
  };
}

// GET /api/analytics - Get analytics data for the current workspace
const getAnalytics = withErrorHandling(async (request: NextRequest, user: any) => {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get('workspaceId');

  if (!workspaceId) {
    throw createValidationError('Workspace ID is required');
  }

  // Get all calls for the workspace
  const { data: calls, error } = await supabase
    .from('calls')
    .select('*')
    .eq('workspace_id', workspaceId);

  if (error) {
    throw createValidationError(`Failed to fetch calls: ${error.message}`);
  }

  if (!calls || calls.length === 0) {
    return NextResponse.json({
      success: true,
      data: {
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
      }
    });
  }

  // Calculate analytics
  const analytics: AnalyticsData = {
    overall: {
      totalCalls: calls.length,
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

  // Process calls by traffic source
  const organicCalls = calls.filter(call => call.traffic_source === 'organic');
  const metaCalls = calls.filter(call => call.traffic_source === 'meta');

  // Calculate overall metrics
  analytics.overall.totalCalls = calls.length;
  analytics.overall.callsByStage = calls.reduce((acc, call) => {
    const stage = call.crm_stage || 'scheduled';
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate show rate (completed calls / total calls)
  const completedCalls = calls.filter(call => 
    ['completed', 'no_show', 'closed_won', 'lost'].includes(call.crm_stage || 'scheduled')
  ).length;
  analytics.overall.showRate = analytics.overall.totalCalls > 0 ? 
    (completedCalls / analytics.overall.totalCalls) * 100 : 0;

  // Calculate close rate (closed_won calls / completed calls)
  const closedWonCalls = calls.filter(call => call.crm_stage === 'closed_won').length;
  analytics.overall.closeRate = completedCalls > 0 ? 
    (closedWonCalls / completedCalls) * 100 : 0;

  // Calculate organic metrics
  analytics.organic.totalCalls = organicCalls.length;
  analytics.organic.callsByStage = organicCalls.reduce((acc, call) => {
    const stage = call.crm_stage || 'scheduled';
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const organicCompletedCalls = organicCalls.filter(call => 
    ['completed', 'no_show', 'closed_won', 'lost'].includes(call.crm_stage || 'scheduled')
  ).length;
  analytics.organic.showRate = analytics.organic.totalCalls > 0 ? 
    (organicCompletedCalls / analytics.organic.totalCalls) * 100 : 0;

  const organicClosedWonCalls = organicCalls.filter(call => call.crm_stage === 'closed_won').length;
  analytics.organic.closeRate = organicCompletedCalls > 0 ? 
    (organicClosedWonCalls / organicCompletedCalls) * 100 : 0;

  // Calculate meta metrics
  analytics.meta.totalCalls = metaCalls.length;
  analytics.meta.callsByStage = metaCalls.reduce((acc, call) => {
    const stage = call.crm_stage || 'scheduled';
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const metaCompletedCalls = metaCalls.filter(call => 
    ['completed', 'no_show', 'closed_won', 'lost'].includes(call.crm_stage || 'scheduled')
  ).length;
  analytics.meta.showRate = analytics.meta.totalCalls > 0 ? 
    (metaCompletedCalls / analytics.meta.totalCalls) * 100 : 0;

  const metaClosedWonCalls = metaCalls.filter(call => call.crm_stage === 'closed_won').length;
  analytics.meta.closeRate = metaCompletedCalls > 0 ? 
    (metaClosedWonCalls / metaCompletedCalls) * 100 : 0;

  return NextResponse.json({
    success: true,
    data: analytics
  });
});

export { getAnalytics as GET };
