'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plug, 
  Globe, 
  Key, 
  Save,
  TestTube,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { SystemSettings } from '@/lib/services/settingsService';

interface IntegrationSettingsSectionProps {
  settings: SystemSettings | null;
  onSave: (data: Partial<SystemSettings>) => Promise<void>;
  saving: boolean;
}

const integrationProviders = [
  {
    id: 'google',
    name: 'Google Ads',
    description: 'Google advertising platform integration',
    status: 'connected',
    icon: '🔵'
  },
  {
    id: 'facebook',
    name: 'Facebook Ads',
    description: 'Facebook advertising platform integration',
    status: 'connected',
    icon: '🔵'
  },
  {
    id: 'meta',
    name: 'Meta Business',
    description: 'Meta business platform integration',
    status: 'connected',
    icon: '🔵'
  },
  {
    id: 'tiktok',
    name: 'TikTok Ads',
    description: 'TikTok advertising platform integration',
    status: 'disconnected',
    icon: '⚫'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Ads',
    description: 'LinkedIn advertising platform integration',
    status: 'disconnected',
    icon: '⚫'
  },
  {
    id: 'twitter',
    name: 'Twitter Ads',
    description: 'Twitter advertising platform integration',
    status: 'disconnected',
    icon: '⚫'
  }
];

export default function IntegrationSettingsSection({ 
  settings, 
  onSave, 
  saving 
}: IntegrationSettingsSectionProps) {
  const [settingsData, setSettingsData] = useState<Partial<SystemSettings>>({});
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  React.useEffect(() => {
    if (settings) {
      setSettingsData(settings);
    }
  }, [settings]);

  const handleInputChange = (path: string, value: any) => {
    const keys = path.split('.');
    setSettingsData(prev => {
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleToggle = (path: string, value: boolean) => {
    const keys = path.split('.');
    setSettingsData(prev => {
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSave(settingsData);
    } catch (error) {
      console.error('Error saving integration settings:', error);
    }
  };

  const handleTestConnection = async (providerId: string) => {
    setTestingConnection(providerId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setTestingConnection(null);
  };

  const handleCopyApiKey = () => {
    const apiKey = settingsData.integrations?.apiKey || settings?.integrations.apiKey;
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'disconnected':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2" />
              API Configuration
            </CardTitle>
            <CardDescription>
              Configure API keys and webhook settings for integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  value={settingsData.integrations?.webhookUrl || settings.integrations.webhookUrl || ''}
                  onChange={(e) => handleInputChange('integrations.webhookUrl', e.target.value)}
                  placeholder="https://api.propaganda.com/webhooks"
                />
                <p className="text-sm text-muted-foreground">
                  URL for receiving webhook notifications from integrated services
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="apiKey"
                    type={showApiKey ? 'text' : 'password'}
                    value={settingsData.integrations?.apiKey || settings.integrations.apiKey || ''}
                    onChange={(e) => handleInputChange('integrations.apiKey', e.target.value)}
                    placeholder="Enter your API key"
                    className="pr-20"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyApiKey}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  API key for authenticating with external services
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Providers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plug className="h-5 w-5 mr-2" />
              Integration Providers
            </CardTitle>
            <CardDescription>
              Manage connections to external advertising and marketing platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {integrationProviders.map((provider) => (
                <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{provider.icon}</div>
                    <div>
                      <h4 className="font-medium">{provider.name}</h4>
                      <p className="text-sm text-muted-foreground">{provider.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(provider.status)}>
                      {getStatusIcon(provider.status)}
                      <span className="ml-1 capitalize">{provider.status}</span>
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(provider.id)}
                      disabled={testingConnection === provider.id}
                    >
                      {testingConnection === provider.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                      ) : (
                        <TestTube className="h-4 w-4" />
                      )}
                      <span className="ml-2">Test</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="ml-2">Configure</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Allowed Providers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Allowed Providers
            </CardTitle>
            <CardDescription>
              Configure which integration providers are available to users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrationProviders.map((provider) => (
                  <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg">{provider.icon}</div>
                      <div>
                        <h4 className="font-medium">{provider.name}</h4>
                        <p className="text-sm text-muted-foreground">{provider.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={settingsData.integrations?.allowedProviders?.includes(provider.id) ?? 
                              settings.integrations.allowedProviders.includes(provider.id)}
                      onCheckedChange={(checked) => {
                        const currentProviders = settingsData.integrations?.allowedProviders || 
                                                settings.integrations.allowedProviders;
                        const newProviders = checked 
                          ? [...currentProviders, provider.id]
                          : currentProviders.filter((p: string) => p !== provider.id);
                        handleInputChange('integrations.allowedProviders', newProviders);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Integration Status
            </CardTitle>
            <CardDescription>
              Monitor the health and status of your integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Connected</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mt-2">3</p>
                  <p className="text-sm text-muted-foreground">Active integrations</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Disconnected</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-600 mt-2">3</p>
                  <p className="text-sm text-muted-foreground">Inactive integrations</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium">Errors</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600 mt-2">0</p>
                  <p className="text-sm text-muted-foreground">Integration errors</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Integration Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
