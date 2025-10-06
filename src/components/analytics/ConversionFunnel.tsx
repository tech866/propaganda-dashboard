'use client';

import React, { useState, useEffect } from 'react';
import { MetricsFilter } from '@/lib/services/analyticsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Users, CheckCircle } from 'lucide-react';

interface ConversionFunnelProps {
  filters: MetricsFilter;
  className?: string;
}

interface FunnelStage {
  stage: string;
  count: number;
  conversion_rate: number;
}

export default function ConversionFunnel({ filters, className = '' }: ConversionFunnelProps) {
  const [funnel, setFunnel] = useState<FunnelStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFunnel();
  }, [filters]);

  const fetchFunnel = async () => {
    if (!filters.workspace_id) return;

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('workspace_id', filters.workspace_id);
      
      if (filters.traffic_source && filters.traffic_source !== 'all') {
        queryParams.append('traffic_source', filters.traffic_source);
      }
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

      const response = await fetch(`/api/analytics/conversion-funnel?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversion funnel');
      }

      const data = await response.json();
      setFunnel(data.data);
    } catch (err) {
      console.error('Error fetching conversion funnel:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch funnel');
    } finally {
      setLoading(false);
    }
  };

  const getStageIcon = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'scheduled':
        return <Users className="h-5 w-5" />;
      case 'showed':
        return <Target className="h-5 w-5" />;
      case 'closed won':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-600';
      case 'showed':
        return 'bg-green-600';
      case 'closed won':
        return 'bg-emerald-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getConversionRateColor = (rate: number) => {
    if (rate >= 70) return 'text-green-400';
    if (rate >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConversionRateIcon = (rate: number) => {
    if (rate >= 50) return <TrendingUp className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <Card className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Target className="h-5 w-5" />
            Conversion Funnel
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
            <Target className="h-5 w-5" />
            Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchFunnel}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!funnel || !Array.isArray(funnel) || funnel.length === 0) {
    return (
      <Card className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Target className="h-5 w-5" />
            Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No conversion funnel data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...funnel.map(stage => stage.count));

  return (
    <Card className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Target className="h-5 w-5" />
          Conversion Funnel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Funnel Visualization */}
          <div className="space-y-4">
            {funnel.map((stage, index) => {
              const widthPercentage = maxCount > 0 ? ((stage?.count || 0) / maxCount) * 100 : 0;
              const isLastStage = index === funnel.length - 1;
              
              return (
                <div key={stage?.stage || `stage-${index}`} className="relative">
                  {/* Stage Label */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded ${getStageColor(stage?.stage || '')}`}>
                        {getStageIcon(stage?.stage || '')}
                      </div>
                      <span className="text-sm font-medium text-foreground">{stage?.stage || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-foreground">{stage?.count || 0}</span>
                      {!isLastStage && (
                        <div className={`flex items-center gap-1 ${getConversionRateColor(stage?.conversion_rate || 0)}`}>
                          {getConversionRateIcon(stage?.conversion_rate || 0)}
                          <span className="text-sm font-medium">{(stage?.conversion_rate || 0).toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Funnel Bar */}
                  <div className="relative">
                    <div className="w-full bg-slate-700 rounded-lg h-8 overflow-hidden">
                      <div
                        className={`h-full ${getStageColor(stage?.stage || '')} transition-all duration-500 ease-out`}
                        style={{ width: `${widthPercentage}%` }}
                      />
                    </div>
                    
                    {/* Conversion Rate Badge */}
                    {!isLastStage && (
                      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getConversionRateColor(stage?.conversion_rate || 0)} border-current`}
                        >
                          {(stage?.conversion_rate || 0).toFixed(1)}%
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Funnel Summary */}
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
            <h3 className="text-sm font-semibold text-foreground mb-3">Funnel Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {funnel.length > 0 ? (funnel[0]?.count || 0) : 0}
                </div>
                <div className="text-xs text-muted-foreground">Total Scheduled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {funnel.length > 1 ? (funnel[1]?.count || 0) : 0}
                </div>
                <div className="text-xs text-muted-foreground">Total Showed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {funnel.length > 2 ? (funnel[2]?.count || 0) : 0}
                </div>
                <div className="text-xs text-muted-foreground">Total Closed</div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
            <h3 className="text-sm font-semibold text-foreground mb-3">Performance Insights</h3>
            <div className="space-y-2">
              {funnel.map((stage, index) => {
                if (index === funnel.length - 1) return null;
                
                const nextStage = funnel[index + 1];
                const currentCount = stage?.count || 0;
                const nextCount = nextStage?.count || 0;
                const dropOff = currentCount - nextCount;
                const dropOffRate = currentCount > 0 ? ((dropOff / currentCount) * 100) : 0;
                
                return (
                  <div key={`insight-${stage?.stage || index}`} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {stage?.stage || 'Unknown'} → {nextStage?.stage || 'Unknown'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">
                        {dropOff} lost ({dropOffRate.toFixed(1)}%)
                      </span>
                      {dropOffRate > 50 ? (
                        <TrendingDown className="h-3 w-3 text-red-400" />
                      ) : (
                        <TrendingUp className="h-3 w-3 text-green-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
