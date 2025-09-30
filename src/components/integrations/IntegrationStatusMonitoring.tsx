'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  IntegrationSource, 
  IntegrationService, 
  IntegrationTestResult,
  formatProviderName, 
  getProviderIcon, 
  getAuthenticationStatusColor, 
  getSyncStatusColor, 
  formatDate, 
  formatRelativeTime 
} from '@/lib/services/integrationService';

interface IntegrationStatusMonitoringProps {
  integrations: IntegrationSource[];
  onRefresh: () => void;
}

interface MonitoringData {
  integration: IntegrationSource;
  testResult?: IntegrationTestResult;
  isTesting: boolean;
  lastChecked?: string;
}

export default function IntegrationStatusMonitoring({ integrations, onRefresh }: IntegrationStatusMonitoringProps) {
  const [monitoringData, setMonitoringData] = useState<MonitoringData[]>([]);
  const [testingAll, setTestingAll] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize monitoring data
    setMonitoringData(integrations.map(integration => ({
      integration,
      isTesting: false
    })));
  }, [integrations]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        onRefresh();
      }, 30000); // Refresh every 30 seconds
      setRefreshInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh, onRefresh]);

  const testSingleIntegration = async (integration: IntegrationSource) => {
    const integrationService = new IntegrationService(integration.agency_id);
    
    setMonitoringData(prev => 
      prev.map(item => 
        item.integration.id === integration.id 
          ? { ...item, isTesting: true }
          : item
      )
    );

    try {
      const testResult = await integrationService.testIntegrationConnection(integration.id);
      
      setMonitoringData(prev => 
        prev.map(item => 
          item.integration.id === integration.id 
            ? { 
                ...item, 
                testResult, 
                isTesting: false,
                lastChecked: new Date().toISOString()
              }
            : item
        )
      );
    } catch (error) {
      console.error('Error testing integration:', error);
      setMonitoringData(prev => 
        prev.map(item => 
          item.integration.id === integration.id 
            ? { 
                ...item, 
                testResult: {
                  success: false,
                  message: 'Test failed',
                  error_details: error instanceof Error ? error.message : 'Unknown error',
                  last_checked: new Date().toISOString()
                },
                isTesting: false,
                lastChecked: new Date().toISOString()
              }
            : item
        )
      );
    }
  };

  const testAllIntegrations = async () => {
    setTestingAll(true);
    
    const promises = integrations.map(integration => testSingleIntegration(integration));
    await Promise.all(promises);
    
    setTestingAll(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
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
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTestResultIcon = (result?: IntegrationTestResult) => {
    if (!result) return <Minus className="h-4 w-4 text-gray-400" />;
    
    return result.success ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getTestResultColor = (result?: IntegrationTestResult) => {
    if (!result) return 'text-gray-600 bg-gray-50 border-gray-200';
    
    return result.success 
      ? 'text-green-600 bg-green-50 border-green-200'
      : 'text-red-600 bg-red-50 border-red-200';
  };

  const getHealthTrend = (integration: IntegrationSource) => {
    // Simple trend calculation based on sync status
    if (integration.data_sync_status === 'up_to_date') {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (integration.data_sync_status === 'delayed') {
      return <TrendingDown className="h-4 w-4 text-yellow-600" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
  };

  const getOverallHealthScore = () => {
    if (integrations.length === 0) return 0;
    
    const healthyCount = integrations.filter(i => 
      i.authentication_status === 'connected' && i.data_sync_status === 'up_to_date'
    ).length;
    
    return Math.round((healthyCount / integrations.length) * 100);
  };

  const healthScore = getOverallHealthScore();

  return (
    <div className="space-y-6">
      {/* Monitoring Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Real-time Monitoring
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
              >
                {autoRefresh ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </Button>
              <Button
                onClick={testAllIntegrations}
                disabled={testingAll}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${testingAll ? 'animate-spin' : ''}`} />
                {testingAll ? 'Testing All...' : 'Test All'}
              </Button>
              <Button onClick={onRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Monitor integration health and performance in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <div className="text-2xl font-bold">
                  <span className={healthScore >= 80 ? 'text-green-600' : healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                    {healthScore}%
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">Overall Health</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{integrations.length}</div>
                <div className="text-sm text-muted-foreground">Total Integrations</div>
              </div>
            </div>
            {autoRefresh && (
              <div className="text-sm text-muted-foreground">
                Auto-refreshing every 30 seconds
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Integration Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {monitoringData.map((data) => (
          <Card key={data.integration.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getProviderIcon(data.integration.provider_name)}</span>
                  <div>
                    <CardTitle className="text-lg">{formatProviderName(data.integration.provider_name)}</CardTitle>
                    <CardDescription className="text-sm">
                      {data.integration.connection_id}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {getHealthTrend(data.integration)}
                  {data.isTesting && (
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Connection Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Connection</span>
                <Badge className={getAuthenticationStatusColor(data.integration.authentication_status)}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(data.integration.authentication_status)}
                    <span className="capitalize">{data.integration.authentication_status}</span>
                  </div>
                </Badge>
              </div>

              {/* Sync Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sync Status</span>
                <Badge className={getSyncStatusColor(data.integration.data_sync_status)}>
                  <div className="flex items-center space-x-1">
                    {getSyncStatusIcon(data.integration.data_sync_status)}
                    <span className="capitalize">{data.integration.data_sync_status.replace('_', ' ')}</span>
                  </div>
                </Badge>
              </div>

              {/* Test Result */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Test</span>
                <Badge className={getTestResultColor(data.testResult)}>
                  <div className="flex items-center space-x-1">
                    {getTestResultIcon(data.testResult)}
                    <span>
                      {data.testResult ? (data.testResult.success ? 'Passed' : 'Failed') : 'Not Tested'}
                    </span>
                  </div>
                </Badge>
              </div>

              {/* Last Sync Time */}
              {data.integration.last_sync_time && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Sync</span>
                  <span className="text-sm">
                    {formatRelativeTime(data.integration.last_sync_time)}
                  </span>
                </div>
              )}

              {/* Test Details */}
              {data.testResult && (
                <div className="pt-2 border-t">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Response: {data.testResult.response_time}ms</div>
                    <div>Message: {data.testResult.message}</div>
                    {data.testResult.error_details && (
                      <div className="text-red-600">Error: {data.testResult.error_details}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Test Button */}
              <Button
                onClick={() => testSingleIntegration(data.integration)}
                disabled={data.isTesting}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${data.isTesting ? 'animate-spin' : ''}`} />
                {data.isTesting ? 'Testing...' : 'Test Connection'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts and Issues */}
      {integrations.some(i => i.authentication_status === 'error' || i.data_sync_status === 'failed') && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium">Integration Issues Detected</div>
              <div className="text-sm">
                {integrations.filter(i => i.authentication_status === 'error').length} connection error(s) and{' '}
                {integrations.filter(i => i.data_sync_status === 'failed').length} sync failure(s) detected.
                Review the integration status above and take corrective action.
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {integrations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No integrations to monitor</h3>
            <p className="text-muted-foreground text-center">
              Add integrations to start monitoring their health and performance.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
