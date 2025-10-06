/**
 * Advanced Sales Analytics Service
 * 
 * This service provides comprehensive analytics calculation for sales metrics
 * including real-time KPI computation, traffic source filtering, and multi-tenant support.
 */

import { createAdminSupabaseClient } from '@/lib/supabase-client';
import { TrafficSourceService } from './trafficSourceService';

export interface SalesMetrics {
  // Core counts
  calls_scheduled: number;
  calls_taken: number;
  calls_cancelled: number;
  calls_rescheduled: number;
  calls_showed: number;
  calls_closed_won: number;
  calls_disqualified: number;
  
  // Financial metrics
  cash_collected: number;
  
  // Calculated rates and ratios
  show_rate: number; // showed / calls_scheduled
  close_rate: number; // closed_won / calls_taken
  gross_collected_per_booked_call: number; // cash_collected / calls_scheduled
  cash_per_live_call: number; // cash_collected / calls_taken
  cash_based_aov: number; // cash_collected / closed_won
}

export interface MetricsFilter {
  workspace_id: string;
  traffic_source?: 'organic' | 'meta' | 'all';
  user_id?: string;
  client_id?: string;
  date_from?: string;
  date_to?: string;
  call_outcome?: string;
}

export interface MetricsTimeSeries {
  date: string;
  metrics: SalesMetrics;
}

export interface TrafficSourceBreakdown {
  traffic_source: 'organic' | 'meta';
  metrics: SalesMetrics;
  percentage_of_total: number;
}

export class AnalyticsService {
  /**
   * Calculate comprehensive sales metrics for a workspace
   */
  static async calculateWorkspaceMetrics(filter: MetricsFilter): Promise<SalesMetrics> {
    const supabase = createAdminSupabaseClient();
    const { workspace_id, traffic_source, user_id, client_id, date_from, date_to } = filter;

    // Build the base query
    let query = supabase
      .from('calls')
      .select('*')
      .eq('workspace_id', workspace_id);

    // Apply filters
    if (traffic_source && traffic_source !== 'all') {
      query = query.eq('traffic_source', traffic_source);
    }

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    if (client_id) {
      query = query.eq('client_id', client_id);
    }

    if (date_from) {
      query = query.gte('created_at', date_from);
    }

    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    const { data: calls, error } = await query;

    if (error) {
      console.error('Error fetching calls for metrics:', error);
      throw new Error('Failed to fetch calls data');
    }

    if (!calls || calls.length === 0) {
      return this.getEmptyMetrics();
    }

    return this.calculateMetricsFromCalls(calls);
  }

  /**
   * Calculate metrics from an array of calls
   */
  static calculateMetricsFromCalls(calls: any[]): SalesMetrics {
    const totalCalls = calls.length;
    const callsScheduled = calls.filter(call => call.call_outcome === 'scheduled').length;
    const callsTaken = calls.filter(call => 
      ['showed', 'no_show', 'closed_won', 'closed_lost', 'disqualified'].includes(call.call_outcome)
    ).length;
    const callsCancelled = calls.filter(call => call.call_outcome === 'cancelled').length;
    const callsRescheduled = calls.filter(call => call.call_outcome === 'rescheduled').length;
    const callsShowed = calls.filter(call => call.call_outcome === 'showed').length;
    const callsClosedWon = calls.filter(call => call.call_outcome === 'closed_won').length;
    const callsDisqualified = calls.filter(call => call.call_outcome === 'disqualified').length;
    
    const cashCollected = calls.reduce((sum, call) => sum + (call.cash_collected || 0), 0);

    // Calculate rates and ratios
    const showRate = callsScheduled > 0 ? (callsShowed / callsScheduled) * 100 : 0;
    const closeRate = callsTaken > 0 ? (callsClosedWon / callsTaken) * 100 : 0;
    const grossCollectedPerBookedCall = callsScheduled > 0 ? cashCollected / callsScheduled : 0;
    const cashPerLiveCall = callsTaken > 0 ? cashCollected / callsTaken : 0;
    const cashBasedAOV = callsClosedWon > 0 ? cashCollected / callsClosedWon : 0;

    return {
      calls_scheduled: callsScheduled,
      calls_taken: callsTaken,
      calls_cancelled: callsCancelled,
      calls_rescheduled: callsRescheduled,
      calls_showed: callsShowed,
      calls_closed_won: callsClosedWon,
      calls_disqualified: callsDisqualified,
      cash_collected: cashCollected,
      show_rate: Math.round(showRate * 100) / 100,
      close_rate: Math.round(closeRate * 100) / 100,
      gross_collected_per_booked_call: Math.round(grossCollectedPerBookedCall * 100) / 100,
      cash_per_live_call: Math.round(cashPerLiveCall * 100) / 100,
      cash_based_aov: Math.round(cashBasedAOV * 100) / 100,
    };
  }

  /**
   * Get empty metrics object
   */
  static getEmptyMetrics(): SalesMetrics {
    return {
      calls_scheduled: 0,
      calls_taken: 0,
      calls_cancelled: 0,
      calls_rescheduled: 0,
      calls_showed: 0,
      calls_closed_won: 0,
      calls_disqualified: 0,
      cash_collected: 0,
      show_rate: 0,
      close_rate: 0,
      gross_collected_per_booked_call: 0,
      cash_per_live_call: 0,
      cash_based_aov: 0,
    };
  }

  /**
   * Get metrics breakdown by traffic source
   */
  static async getTrafficSourceBreakdown(filter: MetricsFilter): Promise<TrafficSourceBreakdown[]> {
    const { workspace_id, user_id, client_id, date_from, date_to } = filter;

    // Get metrics for organic traffic
    const organicMetrics = await this.calculateWorkspaceMetrics({
      ...filter,
      traffic_source: 'organic'
    });

    // Get metrics for meta traffic
    const metaMetrics = await this.calculateWorkspaceMetrics({
      ...filter,
      traffic_source: 'meta'
    });

    // Get total metrics for percentage calculation
    const totalMetrics = await this.calculateWorkspaceMetrics({
      ...filter,
      traffic_source: 'all'
    });

    const totalCalls = totalMetrics.calls_scheduled;

    const breakdown: TrafficSourceBreakdown[] = [];

    if (organicMetrics.calls_scheduled > 0) {
      breakdown.push({
        traffic_source: 'organic',
        metrics: organicMetrics,
        percentage_of_total: totalCalls > 0 ? (organicMetrics.calls_scheduled / totalCalls) * 100 : 0
      });
    }

    if (metaMetrics.calls_scheduled > 0) {
      breakdown.push({
        traffic_source: 'meta',
        metrics: metaMetrics,
        percentage_of_total: totalCalls > 0 ? (metaMetrics.calls_scheduled / totalCalls) * 100 : 0
      });
    }

    return breakdown;
  }

  /**
   * Get time series data for metrics
   */
  static async getMetricsTimeSeries(filter: MetricsFilter, days: number = 30): Promise<MetricsTimeSeries[]> {
    const { workspace_id } = filter;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const timeSeries: MetricsTimeSeries[] = [];

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const dayMetrics = await this.calculateWorkspaceMetrics({
        ...filter,
        date_from: `${dateStr}T00:00:00.000Z`,
        date_to: `${dateStr}T23:59:59.999Z`
      });

      timeSeries.push({
        date: dateStr,
        metrics: dayMetrics
      });
    }

    return timeSeries;
  }

  /**
   * Get metrics for a specific user
   */
  static async getUserMetrics(workspaceId: string, userId: string, filter?: Partial<MetricsFilter>): Promise<SalesMetrics> {
    return this.calculateWorkspaceMetrics({
      workspace_id: workspaceId,
      user_id: userId,
      ...filter
    });
  }

  /**
   * Get metrics for a specific client
   */
  static async getClientMetrics(workspaceId: string, clientId: string, filter?: Partial<MetricsFilter>): Promise<SalesMetrics> {
    return this.calculateWorkspaceMetrics({
      workspace_id: workspaceId,
      client_id: clientId,
      ...filter
    });
  }

  /**
   * Update metrics snapshot for a specific date
   */
  static async updateMetricsSnapshot(workspaceId: string, date: string, metrics: SalesMetrics, trafficSource?: string): Promise<void> {
    const supabase = createAdminSupabaseClient();
    const snapshotData = {
      workspace_id: workspaceId,
      snapshot_date: date,
      metric_name: 'comprehensive_metrics',
      metric_value: JSON.stringify(metrics),
      traffic_source: trafficSource || 'all',
      calculation_metadata: {
        calculated_at: new Date().toISOString(),
        version: '1.0'
      }
    };

    const { error } = await supabase
      .from('sales_metrics_snapshots')
      .upsert(snapshotData, {
        onConflict: 'workspace_id,snapshot_date,metric_name,traffic_source,user_id,client_id'
      });

    if (error) {
      console.error('Error updating metrics snapshot:', error);
      throw new Error('Failed to update metrics snapshot');
    }
  }

  /**
   * Get historical metrics snapshots
   */
  static async getHistoricalMetrics(workspaceId: string, days: number = 30): Promise<SalesMetrics[]> {
    const supabase = createAdminSupabaseClient();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('sales_metrics_snapshots')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('metric_name', 'comprehensive_metrics')
      .gte('snapshot_date', startDate.toISOString().split('T')[0])
      .lte('snapshot_date', endDate.toISOString().split('T')[0])
      .order('snapshot_date', { ascending: true });

    if (error) {
      console.error('Error fetching historical metrics:', error);
      throw new Error('Failed to fetch historical metrics');
    }

    return data?.map(snapshot => JSON.parse(snapshot.metric_value)) || [];
  }

  /**
   * Calculate conversion funnel metrics
   */
  static async getConversionFunnel(workspaceId: string, filter?: Partial<MetricsFilter>): Promise<{
    stage: string;
    count: number;
    conversion_rate: number;
  }[]> {
    const metrics = await this.calculateWorkspaceMetrics({
      workspace_id: workspaceId,
      ...filter
    });

    const funnel = [
      {
        stage: 'Scheduled',
        count: metrics.calls_scheduled,
        conversion_rate: 100
      },
      {
        stage: 'Showed',
        count: metrics.calls_showed,
        conversion_rate: metrics.calls_scheduled > 0 ? (metrics.calls_showed / metrics.calls_scheduled) * 100 : 0
      },
      {
        stage: 'Closed Won',
        count: metrics.calls_closed_won,
        conversion_rate: metrics.calls_showed > 0 ? (metrics.calls_closed_won / metrics.calls_showed) * 100 : 0
      }
    ];

    return funnel;
  }

  /**
   * Get top performing users by metrics
   */
  static async getTopPerformingUsers(workspaceId: string, metric: keyof SalesMetrics, limit: number = 10): Promise<{
    user_id: string;
    user_name: string;
    metric_value: number;
  }[]> {
    // This would require joining with users table and aggregating by user
    // For now, return empty array - implement based on your user table structure
    return [];
  }

  /**
   * Validate and classify traffic source for a call
   */
  static async classifyAndUpdateTrafficSource(callId: string, sourceOfAppointment: string): Promise<void> {
    const supabase = createAdminSupabaseClient();
    const classification = TrafficSourceService.classifyFromSourceOfAppointment(sourceOfAppointment as any);
    
    const { error } = await supabase
      .from('calls')
      .update({ 
        traffic_source: classification.traffic_source 
      })
      .eq('id', callId);

    if (error) {
      console.error('Error updating traffic source:', error);
      throw new Error('Failed to update traffic source');
    }

    // Also update the traffic source attribution table
    const { error: attributionError } = await supabase
      .from('traffic_source_attributions')
      .upsert({
        call_id: callId,
        traffic_source: classification.traffic_source,
        source_details: {
          source_of_appointment: sourceOfAppointment,
          confidence: classification.confidence,
          reasoning: classification.reasoning
        },
        attribution_confidence: classification.confidence === 'high' ? 1.0 : classification.confidence === 'medium' ? 0.7 : 0.3
      }, {
        onConflict: 'call_id'
      });

    if (attributionError) {
      console.error('Error updating traffic source attribution:', attributionError);
      // Don't throw here as the main call update succeeded
    }
  }

  /**
   * Get real-time metrics for dashboard
   */
  static async getRealTimeMetrics(workspaceId: string): Promise<{
    current: SalesMetrics;
    previous_period: SalesMetrics;
    trends: {
      metric: keyof SalesMetrics;
      change: number;
      change_percentage: number;
    }[];
  }> {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Get current period metrics (last 30 days)
    const currentMetrics = await this.calculateWorkspaceMetrics({
      workspace_id: workspaceId,
      date_from: thirtyDaysAgo.toISOString(),
      date_to: now.toISOString()
    });

    // Get previous period metrics (30-60 days ago)
    const previousMetrics = await this.calculateWorkspaceMetrics({
      workspace_id: workspaceId,
      date_from: sixtyDaysAgo.toISOString(),
      date_to: thirtyDaysAgo.toISOString()
    });

    // Calculate trends
    const trends = Object.keys(currentMetrics).map(metric => {
      const current = currentMetrics[metric as keyof SalesMetrics];
      const previous = previousMetrics[metric as keyof SalesMetrics];
      const change = current - previous;
      const changePercentage = previous !== 0 ? (change / previous) * 100 : 0;

      return {
        metric: metric as keyof SalesMetrics,
        change,
        change_percentage: Math.round(changePercentage * 100) / 100
      };
    });

    return {
      current: currentMetrics,
      previous_period: previousMetrics,
      trends
    };
  }
}

export default AnalyticsService;
