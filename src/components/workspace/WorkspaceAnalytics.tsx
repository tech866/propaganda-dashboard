'use client';

// =====================================================
// Workspace Analytics Component
// Task 20.5: Implement Workspace Management UI Components and Audit Logging
// =====================================================

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Users, 
  Phone, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calendar,
  Target,
  BarChart3
} from 'lucide-react';
import { 
  AnalyticsView 
} from '@/components/rbac/RBACGuard';

interface WorkspaceAnalyticsProps {
  workspaceId: string;
}

interface AnalyticsData {
  workspace_id: string;
  workspace_name: string;
  total_members: number;
  admin_count: number;
  manager_count: number;
  sales_rep_count: number;
  client_count: number;
  total_clients: number;
  total_calls: number;
  completed_calls: number;
  closed_calls: number;
  total_cash_collected: number;
  total_revenue: number;
  workspace_created_at: string;
}

interface CallAnalytics {
  totalCalls: number;
  showRate: number;
  closeRate: number;
  callsByStage: Record<string, number>;
  trafficSourceBreakdown: {
    organic: { totalCalls: number; showRate: number; closeRate: number };
    meta: { totalCalls: number; showRate: number; closeRate: number };
  };
}

export function WorkspaceAnalytics({ workspaceId }: WorkspaceAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [callAnalytics, setCallAnalytics] = useState<CallAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [workspaceId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch workspace analytics
      const workspaceResponse = await fetch(`/api/workspaces/${workspaceId}/analytics`);
      if (!workspaceResponse.ok) {
        throw new Error('Failed to fetch workspace analytics');
      }
      const workspaceData = await workspaceResponse.json();
      setAnalytics(workspaceData.analytics);

      // Fetch call analytics
      const callResponse = await fetch(`/api/workspaces/${workspaceId}/analytics/calls`);
      if (callResponse.ok) {
        const callData = await callResponse.json();
        setCallAnalytics(callData.analytics);
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-700 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="h-64 bg-slate-700 rounded-lg"></div>
            <div className="h-64 bg-slate-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
        <CardContent className="p-6">
          <div className="text-center">
            <Activity className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Analytics</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button 
              onClick={fetchAnalytics}
              variant="outline"
              className="border-slate-600 text-foreground"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
        <CardContent className="p-6">
          <div className="text-center">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Analytics Data</h3>
            <p className="text-muted-foreground">Analytics data is not available for this workspace.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnalyticsView workspaceId={workspaceId}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Workspace Analytics</h2>
            <p className="text-muted-foreground">Overview of workspace performance and metrics</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-slate-600 text-foreground"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold text-foreground">{analytics.total_members}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Badge variant="outline" className="border-slate-600 text-foreground">
                  {analytics.admin_count} Admin{analytics.admin_count !== 1 ? 's' : ''}
                </Badge>
                <Badge variant="outline" className="border-slate-600 text-foreground">
                  {analytics.sales_rep_count} Sales Rep{analytics.sales_rep_count !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Calls</p>
                  <p className="text-2xl font-bold text-foreground">{analytics.total_calls}</p>
                </div>
                <Phone className="w-8 h-8 text-green-400" />
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  {analytics.completed_calls} completed
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Close Rate</p>
                  <p className="text-2xl font-bold text-foreground">
                    {analytics.total_calls > 0 
                      ? formatPercentage(analytics.closed_calls / analytics.total_calls)
                      : '0%'
                    }
                  </p>
                </div>
                <Target className="w-8 h-8 text-purple-400" />
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  {analytics.closed_calls} closed calls
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(analytics.total_revenue)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(analytics.total_cash_collected)} collected
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Call Performance */}
          {callAnalytics && (
            <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Call Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-2xl font-bold text-foreground">
                      {formatPercentage(callAnalytics.showRate)}
                    </p>
                    <p className="text-sm text-muted-foreground">Show Rate</p>
                  </div>
                  <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-2xl font-bold text-foreground">
                      {formatPercentage(callAnalytics.closeRate)}
                    </p>
                    <p className="text-sm text-muted-foreground">Close Rate</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Traffic Source Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-foreground">Organic</span>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {callAnalytics.trafficSourceBreakdown.organic.totalCalls} calls
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatPercentage(callAnalytics.trafficSourceBreakdown.organic.closeRate)} close rate
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-foreground">Meta Ads</span>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {callAnalytics.trafficSourceBreakdown.meta.totalCalls} calls
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatPercentage(callAnalytics.trafficSourceBreakdown.meta.closeRate)} close rate
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Workspace Info */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Workspace Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-foreground">
                    {new Date(analytics.workspace_created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Clients</span>
                  <span className="text-foreground">{analytics.total_clients}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed Calls</span>
                  <span className="text-foreground">{analytics.completed_calls}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cash Collected</span>
                  <span className="text-foreground">
                    {formatCurrency(analytics.total_cash_collected)}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-600">
                <h4 className="font-semibold text-foreground mb-3">Team Composition</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Admins</span>
                    <Badge className="bg-red-600 text-white">{analytics.admin_count}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Managers</span>
                    <Badge className="bg-blue-600 text-white">{analytics.manager_count}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sales Reps</span>
                    <Badge className="bg-green-600 text-white">{analytics.sales_rep_count}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clients</span>
                    <Badge className="bg-purple-600 text-white">{analytics.client_count}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AnalyticsView>
  );
}
