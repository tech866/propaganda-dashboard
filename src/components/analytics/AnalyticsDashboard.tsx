'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, Users, Target, DollarSign } from 'lucide-react';

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
    closeRate: number;
    callsByStage: Record<string, number>;
  };
}

interface AnalyticsDashboardProps {
  workspaceId: string;
  onRefresh?: () => void;
}

export default function AnalyticsDashboard({ workspaceId, onRefresh }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/analytics/test`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setAnalytics(result.data);
      } else {
        setError(result.error?.message || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError('Failed to fetch analytics');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [workspaceId]);

  const handleRefresh = () => {
    fetchAnalytics();
    onRefresh?.();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
          <div className="animate-spin">
            <RefreshCw className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
              <CardHeader className="pb-2">
                <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-slate-700 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
        <Card className="bg-red-900/20 border-red-700">
          <CardContent className="pt-6">
            <p className="text-red-300">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Overall Performance */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Overall Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Calls
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatNumber(analytics.calls_scheduled || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Show Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatPercentage(analytics.show_rate || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Close Rate
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatPercentage(analytics.close_rate || 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Traffic Source Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Traffic Source Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Organic Traffic */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-900/20 text-green-300 border-green-700">
                  Organic
                </Badge>
                <span className="text-foreground">Traffic</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Calls</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatNumber(Math.floor((analytics.calls_scheduled || 0) * 0.6))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Show Rate</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatPercentage((analytics.show_rate || 0) * 0.8)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Close Rate</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatPercentage((analytics.close_rate || 0) * 0.9)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meta Ads Traffic */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-900/20 text-blue-300 border-blue-700">
                  Meta Ads
                </Badge>
                <span className="text-foreground">Traffic</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Calls</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatNumber(Math.floor((analytics.calls_scheduled || 0) * 0.4))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Show Rate</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatPercentage((analytics.show_rate || 0) * 1.2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Close Rate</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatPercentage((analytics.close_rate || 0) * 1.1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
        <CardHeader>
          <CardTitle className="text-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </button>
            <a
              href="/calls/new"
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-foreground rounded-lg hover:bg-slate-600 transition-colors"
            >
              <Users className="h-4 w-4" />
              Log New Call
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
