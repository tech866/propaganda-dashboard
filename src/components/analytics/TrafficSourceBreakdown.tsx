'use client';

import React, { useState, useEffect } from 'react';
import { MetricsFilter, TrafficSourceBreakdown as TrafficSourceBreakdownType } from '@/lib/services/analyticsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, PieChart } from 'lucide-react';

interface TrafficSourceBreakdownProps {
  filters: MetricsFilter;
  className?: string;
}

export default function TrafficSourceBreakdown({ filters, className = '' }: TrafficSourceBreakdownProps) {
  const [breakdown, setBreakdown] = useState<TrafficSourceBreakdownType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBreakdown();
  }, [filters]);

  const fetchBreakdown = async () => {
    if (!filters.workspace_id) return;

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('workspace_id', filters.workspace_id);
      
      if (filters.user_id) {
        queryParams.append('user_id', filters.user_id);
      }
      if (filters.client_id) {
        queryParams.append('client_id', filters.client_id);
      }
      if (filters.date_from) {
        queryParams.append('date_from', filters.date_from);
      }
      if (filters.date_to) {
        queryParams.append('date_to', filters.date_to);
      }

      const response = await fetch(`/api/analytics/traffic-source-breakdown?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch traffic source breakdown');
      }

      const data = await response.json();
      setBreakdown(data.data);
    } catch (err) {
      console.error('Error fetching traffic source breakdown:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch breakdown');
    } finally {
      setLoading(false);
    }
  };

  const getTrafficSourceColor = (source: string) => {
    switch (source) {
      case 'organic':
        return 'bg-green-600';
      case 'meta':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getTrafficSourceIcon = (source: string) => {
    switch (source) {
      case 'organic':
        return '🌱';
      case 'meta':
        return '📱';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <Card className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BarChart3 className="h-5 w-5" />
            Traffic Source Breakdown
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
            <BarChart3 className="h-5 w-5" />
            Traffic Source Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchBreakdown}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!breakdown || !Array.isArray(breakdown) || breakdown.length === 0) {
    return (
      <Card className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BarChart3 className="h-5 w-5" />
            Traffic Source Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No traffic source data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalCalls = breakdown.reduce((sum, item) => sum + (item?.metrics?.calls_scheduled || 0), 0);
  const totalRevenue = breakdown.reduce((sum, item) => sum + (item?.metrics?.cash_collected || 0), 0);

  return (
    <Card className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <BarChart3 className="h-5 w-5" />
          Traffic Source Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-foreground">{totalCalls}</div>
              <div className="text-sm text-muted-foreground">Total Calls</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-foreground">${totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-foreground">{breakdown.length}</div>
              <div className="text-sm text-muted-foreground">Traffic Sources</div>
            </div>
          </div>

          {/* Traffic Source Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {breakdown.map((item, index) => (
              <div key={index} className="bg-slate-700/30 rounded-lg p-6 border border-slate-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getTrafficSourceColor(item.traffic_source)}`}>
                      <span className="text-white text-lg">{getTrafficSourceIcon(item.traffic_source)}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground capitalize">
                        {item.traffic_source} Traffic
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {(item?.percentage_of_total || 0).toFixed(1)}% of total
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-2xl font-bold text-foreground">{item?.metrics?.calls_scheduled || 0}</div>
                    <div className="text-xs text-muted-foreground">Calls Scheduled</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{item?.metrics?.calls_showed || 0}</div>
                    <div className="text-xs text-muted-foreground">Calls Showed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{item?.metrics?.calls_closed_won || 0}</div>
                    <div className="text-xs text-muted-foreground">Closed Won</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">${(item?.metrics?.cash_collected || 0).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Revenue</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Show Rate:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-foreground">{item?.metrics?.show_rate || 0}%</span>
                      {(item?.metrics?.show_rate || 0) > 50 ? (
                        <TrendingUp className="h-3 w-3 text-green-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Close Rate:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-foreground">{item?.metrics?.close_rate || 0}%</span>
                      {(item?.metrics?.close_rate || 0) > 30 ? (
                        <TrendingUp className="h-3 w-3 text-green-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">AOV:</span>
                    <span className="text-sm font-medium text-foreground">${(item?.metrics?.cash_based_aov || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Performance Comparison */}
          {breakdown.length === 2 && (
            <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600">
              <h3 className="text-lg font-semibold text-foreground mb-4">Performance Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Best Show Rate</div>
                  <div className="text-lg font-bold text-foreground">
                    {breakdown.reduce((best, current) => 
                      (current?.metrics?.show_rate || 0) > (best?.metrics?.show_rate || 0) ? current : best
                    ).traffic_source} - {Math.max(...breakdown.map(b => b?.metrics?.show_rate || 0)).toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Best Close Rate</div>
                  <div className="text-lg font-bold text-foreground">
                    {breakdown.reduce((best, current) => 
                      (current?.metrics?.close_rate || 0) > (best?.metrics?.close_rate || 0) ? current : best
                    ).traffic_source} - {Math.max(...breakdown.map(b => b?.metrics?.close_rate || 0)).toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">Highest AOV</div>
                  <div className="text-lg font-bold text-foreground">
                    {breakdown.reduce((best, current) => 
                      (current?.metrics?.cash_based_aov || 0) > (best?.metrics?.cash_based_aov || 0) ? current : best
                    ).traffic_source} - ${Math.max(...breakdown.map(b => b?.metrics?.cash_based_aov || 0)).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
