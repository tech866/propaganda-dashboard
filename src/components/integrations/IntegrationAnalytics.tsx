'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { IntegrationAnalytics, formatProviderName, getProviderIcon } from '@/lib/services/integrationService';

interface IntegrationAnalyticsProps {
  analytics: IntegrationAnalytics;
}

export default function IntegrationAnalyticsComponent({ analytics }: IntegrationAnalyticsProps) {
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getProviderStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getProviderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'partial':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'unhealthy':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'up_to_date':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'delayed':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'never_synced':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'up_to_date':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'delayed':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'never_synced':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Health Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Integration Health Score
          </CardTitle>
          <CardDescription>
            Overall health of your integration ecosystem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                <span className={getHealthScoreColor(analytics.sync_health_score)}>
                  {analytics.sync_health_score}%
                </span>
              </span>
              <Badge className={getHealthScoreBgColor(analytics.sync_health_score)}>
                {analytics.sync_health_score >= 80 ? 'Excellent' : 
                 analytics.sync_health_score >= 60 ? 'Good' : 'Needs Attention'}
              </Badge>
            </div>
            <Progress 
              value={analytics.sync_health_score} 
              className="h-2"
            />
            <p className="text-sm text-muted-foreground">
              Based on sync status and connection health across all integrations
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sync Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Status Breakdown</CardTitle>
          <CardDescription>
            Distribution of sync statuses across all integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {getSyncStatusIcon('up_to_date')}
              </div>
              <div className="text-2xl font-bold text-green-600">
                {analytics.last_sync_summary.up_to_date}
              </div>
              <div className="text-sm text-muted-foreground">Up to Date</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {getSyncStatusIcon('delayed')}
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {analytics.last_sync_summary.delayed}
              </div>
              <div className="text-sm text-muted-foreground">Delayed</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {getSyncStatusIcon('failed')}
              </div>
              <div className="text-2xl font-bold text-red-600">
                {analytics.last_sync_summary.failed}
              </div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {getSyncStatusIcon('never_synced')}
              </div>
              <div className="text-2xl font-bold text-gray-600">
                {analytics.last_sync_summary.never_synced}
              </div>
              <div className="text-sm text-muted-foreground">Never Synced</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Status</CardTitle>
          <CardDescription>
            Health status by integration provider
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.provider_breakdown.map((provider) => (
              <div key={provider.provider} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getProviderIcon(provider.provider)}</span>
                  <div>
                    <div className="font-medium">{formatProviderName(provider.provider)}</div>
                    <div className="text-sm text-muted-foreground">
                      {provider.connected} of {provider.count} connected
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getProviderStatusColor(provider.status)}>
                    <div className="flex items-center space-x-1">
                      {getProviderStatusIcon(provider.status)}
                      <span className="capitalize">{provider.status}</span>
                    </div>
                  </Badge>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {provider.count > 0 ? Math.round((provider.connected / provider.count) * 100) : 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connection Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              Connected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics.connected_count}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.total_integrations > 0 
                ? Math.round((analytics.connected_count / analytics.total_integrations) * 100)
                : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <XCircle className="h-4 w-4 mr-2 text-gray-400" />
              Disconnected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {analytics.disconnected_count}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.total_integrations > 0 
                ? Math.round((analytics.disconnected_count / analytics.total_integrations) * 100)
                : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analytics.failed_count}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.total_integrations > 0 
                ? Math.round((analytics.failed_count / analytics.total_integrations) * 100)
                : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {analytics.sync_health_score < 80 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-yellow-700">
              {analytics.last_sync_summary.failed > 0 && (
                <p>• {analytics.last_sync_summary.failed} integration(s) have failed syncs. Check connection status and retry.</p>
              )}
              {analytics.last_sync_summary.delayed > 0 && (
                <p>• {analytics.last_sync_summary.delayed} integration(s) have delayed syncs. Consider increasing sync frequency.</p>
              )}
              {analytics.last_sync_summary.never_synced > 0 && (
                <p>• {analytics.last_sync_summary.never_synced} integration(s) have never synced. Test connections and configure sync settings.</p>
              )}
              {analytics.disconnected_count > 0 && (
                <p>• {analytics.disconnected_count} integration(s) are disconnected. Reconnect to restore functionality.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
