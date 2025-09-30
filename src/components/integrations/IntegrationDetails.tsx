'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  RefreshCw, 
  Trash2, 
  Edit, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  ExternalLink,
  Activity,
  Calendar,
  Code
} from 'lucide-react';
import { 
  IntegrationService, 
  IntegrationSource, 
  IntegrationTestResult,
  formatProviderName, 
  getProviderIcon, 
  getAuthenticationStatusColor, 
  getSyncStatusColor, 
  formatDate, 
  formatRelativeTime 
} from '@/lib/services/integrationService';
import IntegrationForm from './IntegrationForm';

interface IntegrationDetailsProps {
  integration: IntegrationSource;
  onClose: () => void;
  onUpdate: (integration: IntegrationSource) => void;
  onDelete: (integrationId: string) => void;
  integrationService: IntegrationService | null;
}

export default function IntegrationDetails({ 
  integration, 
  onClose, 
  onUpdate, 
  onDelete, 
  integrationService 
}: IntegrationDetailsProps) {
  const [showEditForm, setShowEditForm] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<IntegrationTestResult | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleTestConnection = async () => {
    if (!integrationService) return;

    try {
      setTesting(true);
      setTestResult(null);
      
      const result = await integrationService.testIntegrationConnection(integration.id);
      setTestResult(result);
      
      // Refresh integration data if test was successful
      if (result.success) {
        const updatedIntegration = await integrationService.getIntegrationSource(integration.id);
        if (updatedIntegration) {
          onUpdate(updatedIntegration);
        }
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestResult({
        success: false,
        message: 'Connection test failed',
        error_details: error instanceof Error ? error.message : 'Unknown error',
        last_checked: new Date().toISOString()
      });
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async () => {
    if (!integrationService || !confirm('Are you sure you want to delete this integration? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await integrationService.deleteIntegrationSource(integration.id);
      onDelete(integration.id);
    } catch (error) {
      console.error('Error deleting integration:', error);
      alert('Failed to delete integration. Please try again.');
    } finally {
      setDeleting(false);
    }
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

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{getProviderIcon(integration.provider_name)}</span>
              <div>
                <DialogTitle className="text-xl">
                  {formatProviderName(integration.provider_name)}
                </DialogTitle>
                <DialogDescription>
                  Integration Details & Configuration
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    Connection Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={getAuthenticationStatusColor(integration.authentication_status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(integration.authentication_status)}
                      <span className="capitalize">{integration.authentication_status}</span>
                    </div>
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={getSyncStatusColor(integration.data_sync_status)}>
                    <div className="flex items-center space-x-1">
                      {getSyncStatusIcon(integration.data_sync_status)}
                      <span className="capitalize">{integration.data_sync_status.replace('_', ' ')}</span>
                    </div>
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Connection Test */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Connection Test</CardTitle>
                <CardDescription>
                  Test the connection to verify it's working properly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleTestConnection} 
                  disabled={testing}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
                  {testing ? 'Testing...' : 'Test Connection'}
                </Button>

                {testResult && (
                  <Alert variant={testResult.success ? "default" : "destructive"}>
                    <div className="flex items-center space-x-2">
                      {testResult.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>
                        <div className="space-y-1">
                          <div className="font-medium">{testResult.message}</div>
                          {testResult.response_time && (
                            <div className="text-sm text-muted-foreground">
                              Response time: {testResult.response_time}ms
                            </div>
                          )}
                          {testResult.error_details && (
                            <div className="text-sm text-muted-foreground">
                              {testResult.error_details}
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground">
                            Last checked: {formatDate(testResult.last_checked)}
                          </div>
                        </div>
                      </AlertDescription>
                    </div>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Integration Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Integration Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Connection ID</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{integration.connection_id}</span>
                    </div>
                  </div>

                  {integration.api_version && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">API Version</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Code className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{integration.api_version}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatDate(integration.created_at)}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatDate(integration.updated_at)}</span>
                    </div>
                  </div>

                  {integration.last_sync_time && (
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-muted-foreground">Last Sync</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(integration.last_sync_time)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({formatRelativeTime(integration.last_sync_time)})
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex space-x-2">
                <Button
                  onClick={() => setShowEditForm(true)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleting}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Form Modal */}
      {showEditForm && (
        <IntegrationForm
          onClose={() => setShowEditForm(false)}
          onSuccess={(updatedIntegration) => {
            onUpdate(updatedIntegration);
            setShowEditForm(false);
          }}
          integrationService={integrationService}
          integration={integration}
        />
      )}
    </>
  );
}

// Helper component for labels
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
