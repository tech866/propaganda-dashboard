'use client';

import React, { useState, useEffect } from 'react';
import { MetricsFilter, MetricsTimeSeries } from '@/lib/services/analyticsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface TimeSeriesChartProps {
  filters: MetricsFilter;
  className?: string;
}

export default function TimeSeriesChart({ filters, className = '' }: TimeSeriesChartProps) {
  const [timeSeries, setTimeSeries] = useState<MetricsTimeSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<keyof MetricsTimeSeries['metrics']>('calls_scheduled');

  const metricOptions = [
    { value: 'calls_scheduled', label: 'Calls Scheduled' },
    { value: 'calls_taken', label: 'Calls Taken' },
    { value: 'calls_showed', label: 'Calls Showed' },
    { value: 'calls_closed_won', label: 'Calls Closed Won' },
    { value: 'cash_collected', label: 'Cash Collected' },
    { value: 'show_rate', label: 'Show Rate (%)' },
    { value: 'close_rate', label: 'Close Rate (%)' },
  ];

  useEffect(() => {
    fetchTimeSeries();
  }, [filters]);

  const fetchTimeSeries = async () => {
    if (!filters.workspace_id) return;

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('workspace_id', filters.workspace_id);
      queryParams.append('days', '30');
      
      if (filters.traffic_source && filters.traffic_source !== 'all') {
        queryParams.append('traffic_source', filters.traffic_source);
      }
      if (filters.user_id) {
        queryParams.append('user_id', filters.user_id);
      }
      if (filters.client_id) {
        queryParams.append('client_id', filters.client_id);
      }

      const response = await fetch(`/api/analytics/time-series?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch time series data');
      }

      const data = await response.json();
      setTimeSeries(data.data);
    } catch (err) {
      console.error('Error fetching time series data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch time series');
    } finally {
      setLoading(false);
    }
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

  const getMaxValue = () => {
    if (timeSeries.length === 0) return 0;
    return Math.max(...timeSeries.map(item => item.metrics[selectedMetric]));
  };

  const getMinValue = () => {
    if (timeSeries.length === 0) return 0;
    return Math.min(...timeSeries.map(item => item.metrics[selectedMetric]));
  };

  if (loading) {
    return (
      <Card className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BarChart3 className="h-5 w-5" />
            Time Series Analytics
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
            Time Series Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchTimeSeries}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (timeSeries.length === 0) {
    return (
      <Card className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BarChart3 className="h-5 w-5" />
            Time Series Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No time series data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = getMaxValue();
  const minValue = getMinValue();
  const range = maxValue - minValue;

  return (
    <Card className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BarChart3 className="h-5 w-5" />
            Time Series Analytics
          </CardTitle>
          <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as keyof MetricsTimeSeries['metrics'])}>
            <SelectTrigger className="w-48 bg-slate-700/50 border-slate-600 text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {metricOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart */}
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
            <div className="space-y-2">
              {timeSeries.map((item, index) => {
                const value = item.metrics[selectedMetric];
                const heightPercentage = range > 0 ? ((value - minValue) / range) * 100 : 50;
                
                return (
                  <div key={item.date} className="flex items-center gap-4">
                    <div className="w-20 text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 bg-slate-600 rounded-full h-6 relative overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${heightPercentage}%` }}
                        />
                      </div>
                      <div className="w-20 text-right text-sm font-medium text-foreground">
                        {formatValue(value, selectedMetric)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
              <div className="text-sm text-muted-foreground mb-1">Average</div>
              <div className="text-lg font-bold text-foreground">
                {formatValue(
                  timeSeries.reduce((sum, item) => sum + item.metrics[selectedMetric], 0) / timeSeries.length,
                  selectedMetric
                )}
              </div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
              <div className="text-sm text-muted-foreground mb-1">Maximum</div>
              <div className="text-lg font-bold text-foreground">
                {formatValue(maxValue, selectedMetric)}
              </div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
              <div className="text-sm text-muted-foreground mb-1">Minimum</div>
              <div className="text-lg font-bold text-foreground">
                {formatValue(minValue, selectedMetric)}
              </div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
              <div className="text-sm text-muted-foreground mb-1">Total</div>
              <div className="text-lg font-bold text-foreground">
                {formatValue(
                  timeSeries.reduce((sum, item) => sum + item.metrics[selectedMetric], 0),
                  selectedMetric
                )}
              </div>
            </div>
          </div>

          {/* Trend Analysis */}
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
            <h3 className="text-sm font-semibold text-foreground mb-3">Trend Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">First Half Average</div>
                <div className="text-lg font-bold text-foreground">
                  {formatValue(
                    timeSeries.slice(0, Math.floor(timeSeries.length / 2))
                      .reduce((sum, item) => sum + item.metrics[selectedMetric], 0) / Math.floor(timeSeries.length / 2),
                    selectedMetric
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Second Half Average</div>
                <div className="text-lg font-bold text-foreground">
                  {formatValue(
                    timeSeries.slice(Math.floor(timeSeries.length / 2))
                      .reduce((sum, item) => sum + item.metrics[selectedMetric], 0) / Math.ceil(timeSeries.length / 2),
                    selectedMetric
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
