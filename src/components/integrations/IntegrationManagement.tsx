'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  RefreshCw, 
  Settings, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  ExternalLink,
  Activity
} from 'lucide-react';
import { IntegrationService, IntegrationSource, IntegrationAnalytics, formatProviderName, getProviderIcon, getAuthenticationStatusColor, getSyncStatusColor, formatDate, formatRelativeTime } from '@/lib/services/integrationService';
import { useAgency } from '@/contexts/AgencyContext';
import { useRole } from '@/contexts/RoleContext';
import IntegrationForm from './IntegrationForm';
import IntegrationDetails from './IntegrationDetails';
import IntegrationAnalyticsComponent from './IntegrationAnalytics';
import IntegrationStatusMonitoring from './IntegrationStatusMonitoring';

export default function IntegrationManagement() {
  const { agency } = useAgency();
  const { hasPermission } = useRole();
  const [integrations, setIntegrations] = useState<IntegrationSource[]>([]);
  const [analytics, setAnalytics] = useState<IntegrationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationSource | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const integrationService = agency ? new IntegrationService(agency.id) : null;

  useEffect(() => {
    if (integrationService) {
      loadData();
    }
  }, [integrationService]);

  const loadData = async () => {
    if (!integrationService) return;
    
    try {
      setLoading(true);
      const [integrationsData, analyticsData] = await Promise.all([
        integrationService.getIntegrationSources(),
        integrationService.getIntegrationAnalytics()
      ]);
      
      setIntegrations(integrationsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading integration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAll = async () => {
    if (!integrationService) return;
    
    try {
      setSyncing(true);
      const result = await integrationService.syncAllIntegrations();
      
      // Reload data after sync
      await loadData();
      
      // Show sync results
      const message = `Sync completed: ${result.success} successful, ${result.failed} failed`;
      console.log(message);
    } catch (error) {
      console.error('Error syncing integrations:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleIntegrationCreated = async (integration: IntegrationSource) => {
    setIntegrations(prev => [integration, ...prev]);
    setShowForm(false);
    await loadData(); // Refresh analytics
  };

  const handleIntegrationUpdated = async (updatedIntegration: IntegrationSource) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === updatedIntegration.id ? updatedIntegration : integration
      )
    );
    setSelectedIntegration(null);
    await loadData(); // Refresh analytics
  };

  const handleIntegrationDeleted = async (integrationId: string) => {
    setIntegrations(prev => prev.filter(integration => integration.id !== integrationId));
    setSelectedIntegration(null);
    await loadData(); // Refresh analytics
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Manage your external service connections and data synchronization
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {hasPermission('integrations:manage') && (
            <Button
              onClick={handleSyncAll}
              disabled={syncing}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync All'}
            </Button>
          )}
          {hasPermission('integrations:create') && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          )}
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_integrations}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.connected_count} connected
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sync Health</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.sync_health_score}%</div>
              <p className="text-xs text-muted-foreground">
                {analytics.last_sync_summary.up_to_date} up to date
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connected</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.connected_count}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.disconnected_count} disconnected
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Issues</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{analytics.failed_count}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.last_sync_summary.failed} sync failures
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Integrations List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <Card 
                key={integration.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedIntegration(integration)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getProviderIcon(integration.provider_name)}</span>
                      <div>
                        <CardTitle className="text-lg">{formatProviderName(integration.provider_name)}</CardTitle>
                        <CardDescription className="text-sm">
                          {integration.connection_id}
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge className={getAuthenticationStatusColor(integration.authentication_status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(integration.authentication_status)}
                        <span className="capitalize">{integration.authentication_status}</span>
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sync Status</span>
                    <Badge className={getSyncStatusColor(integration.data_sync_status)}>
                      <div className="flex items-center space-x-1">
                        {getSyncStatusIcon(integration.data_sync_status)}
                        <span className="capitalize">{integration.data_sync_status.replace('_', ' ')}</span>
                      </div>
                    </Badge>
                  </div>
                  
                  {integration.last_sync_time && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Sync</span>
                      <span className="text-sm">
                        {formatRelativeTime(integration.last_sync_time)}
                      </span>
                    </div>
                  )}
                  
                  {integration.api_version && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">API Version</span>
                      <span className="text-sm font-mono">{integration.api_version}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {integrations.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No integrations configured</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Connect your external services to start syncing data and managing campaigns.
                </p>
                {hasPermission('integrations:create') && (
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Integration
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          {analytics && <IntegrationAnalyticsComponent analytics={analytics} />}
        </TabsContent>

        <TabsContent value="monitoring">
          <IntegrationStatusMonitoring 
            integrations={integrations}
            onRefresh={loadData}
          />
        </TabsContent>
      </Tabs>

      {/* Integration Form Modal */}
      {showForm && (
        <IntegrationForm
          onClose={() => setShowForm(false)}
          onSuccess={handleIntegrationCreated}
          integrationService={integrationService}
        />
      )}

      {/* Integration Details Modal */}
      {selectedIntegration && (
        <IntegrationDetails
          integration={selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
          onUpdate={handleIntegrationUpdated}
          onDelete={handleIntegrationDeleted}
          integrationService={integrationService}
        />
      )}
    </div>
  );
}
