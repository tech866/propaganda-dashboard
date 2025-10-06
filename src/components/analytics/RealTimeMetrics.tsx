'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';

interface RealTimeMetricsProps {
  workspaceId: string;
  className?: string;
}

interface RealTimeData {
  current: any;
  previous_period: any;
  trends: Array<{
    metric: string;
    change: number;
    change_percentage: number;
  }>;
}

export default function RealTimeMetrics({ workspaceId, className = '' }: RealTimeMetricsProps) {
  const [data, setData] = useState<RealTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (workspaceId) {
      fetchRealTimeMetrics();
      // Set up polling for real-time updates
      const interval = setInterval(fetchRealTimeMetrics, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [workspaceId]);

  const fetchRealTimeMetrics = async () => {
    if (!workspaceId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/real-time?workspace_id=${workspaceId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch real-time metrics');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      console.error('Error fetching real-time metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch real-time metrics');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-400" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Activity className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const formatMetricName = (metric: string) => {
    return metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatValue = (value: number, metric: string) => {
    if (metric.includes('rate')) {
      return `${value.toFixed(1)}%`;
    }
    if (metric.includes('cash') || metric.includes('collected')) {
      return `$${value.toLocaleString()}`;
    }
    return value.toString();
  };

  if (loading) {
    return (
      <Card className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Zap className="h-5 w-5" />
            Real-Time Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Zap className="h-5 w-5" />
            Real-Time Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchRealTimeMetrics}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Zap className="h-5 w-5" />
            Real-Time Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No real-time data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get top performing metrics
  const topMetrics = data.trends
    .filter(trend => trend.change > 0)
    .sort((a, b) => b.change_percentage - a.change_percentage)
    .slice(0, 3);

  // Get metrics that need attention
  const attentionMetrics = data.trends
    .filter(trend => trend.change < 0)
    .sort((a, b) => a.change_percentage - b.change_percentage)
    .slice(0, 3);

  return (
    <Card className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Zap className="h-5 w-5" />
          Real-Time Metrics
          <Badge variant="outline" className="text-xs">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current vs Previous Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
              <h3 className="text-sm font-semibold text-foreground mb-3">Current Period (Last 30 Days)</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Calls Scheduled:</span>
                  <span className="text-foreground font-medium">{data.current.calls_scheduled}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Calls Showed:</span>
                  <span className="text-foreground font-medium">{data.current.calls_showed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Calls Closed:</span>
                  <span className="text-foreground font-medium">{data.current.calls_closed_won}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cash Collected:</span>
                  <span className="text-foreground font-medium">${data.current.cash_collected.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
              <h3 className="text-sm font-semibold text-foreground mb-3">Previous Period (30-60 Days Ago)</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Calls Scheduled:</span>
                  <span className="text-foreground font-medium">{data.previous_period.calls_scheduled}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Calls Showed:</span>
                  <span className="text-foreground font-medium">{data.previous_period.calls_showed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Calls Closed:</span>
                  <span className="text-foreground font-medium">{data.previous_period.calls_closed_won}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cash Collected:</span>
                  <span className="text-foreground font-medium">${data.previous_period.cash_collected.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing Metrics */}
          {topMetrics.length > 0 && (
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                Top Performing Metrics
              </h3>
              <div className="space-y-2">
                {topMetrics.map((trend, index) => (
                  <div key={trend.metric} className="flex justify-between items-center">
                    <span className="text-muted-foreground">{formatMetricName(trend.metric)}:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">
                        {formatValue(trend.change, trend.metric)}
                      </span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(trend.change)}
                        <span className={`text-sm font-medium ${getTrendColor(trend.change)}`}>
                          +{trend.change_percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metrics Needing Attention */}
          {attentionMetrics.length > 0 && (
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-400" />
                Metrics Needing Attention
              </h3>
              <div className="space-y-2">
                {attentionMetrics.map((trend, index) => (
                  <div key={trend.metric} className="flex justify-between items-center">
                    <span className="text-muted-foreground">{formatMetricName(trend.metric)}:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">
                        {formatValue(trend.change, trend.metric)}
                      </span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(trend.change)}
                        <span className={`text-sm font-medium ${getTrendColor(trend.change)}`}>
                          {trend.change_percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
