'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { IntegrationService, IntegrationSourceFormData, formatProviderName, getProviderIcon } from '@/lib/services/integrationService';

const schema = yup.object({
  provider_name: yup.string().oneOf(['meta', 'whop', 'stripe', 'google_ads', 'linkedin']).required('Provider is required'),
  connection_id: yup.string().required('Connection ID is required').min(3, 'Connection ID must be at least 3 characters'),
  api_version: yup.string().optional()
});

interface IntegrationFormProps {
  onClose: () => void;
  onSuccess: (integration: IntegrationSource) => void;
  integrationService: IntegrationService | null;
  integration?: IntegrationSource;
}

const providerOptions = [
  { value: 'meta', label: 'Meta (Facebook)', description: 'Facebook and Instagram advertising platform' },
  { value: 'stripe', label: 'Stripe', description: 'Payment processing and billing' },
  { value: 'whop', label: 'Whop', description: 'Digital product marketplace' },
  { value: 'google_ads', label: 'Google Ads', description: 'Google advertising platform' },
  { value: 'linkedin', label: 'LinkedIn', description: 'LinkedIn advertising platform' }
];

export default function IntegrationForm({ onClose, onSuccess, integrationService, integration }: IntegrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<IntegrationSourceFormData>({
    resolver: yupResolver(schema),
    defaultValues: integration ? {
      provider_name: integration.provider_name,
      connection_id: integration.connection_id,
      api_version: integration.api_version || ''
    } : {
      provider_name: 'meta',
      connection_id: '',
      api_version: ''
    }
  });

  const selectedProvider = watch('provider_name');

  const onSubmit = async (data: IntegrationSourceFormData) => {
    if (!integrationService) {
      setError('Integration service not available');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let result: IntegrationSource;
      
      if (integration) {
        // Update existing integration
        result = await integrationService.updateIntegrationSource(integration.id, data);
      } else {
        // Create new integration
        result = await integrationService.createIntegrationSource(data);
      }

      setSuccess(true);
      
      // Close form after a brief success message
      setTimeout(() => {
        onSuccess(result);
      }, 1500);

    } catch (err) {
      console.error('Error saving integration:', err);
      setError(err instanceof Error ? err.message : 'Failed to save integration');
    } finally {
      setLoading(false);
    }
  };

  const getProviderDescription = (provider: string) => {
    const option = providerOptions.find(opt => opt.value === provider);
    return option?.description || '';
  };

  const getConnectionIdPlaceholder = (provider: string) => {
    switch (provider) {
      case 'meta':
        return 'e.g., act_123456789012345';
      case 'stripe':
        return 'e.g., acct_1A2B3C4D5E6F7G8H';
      case 'whop':
        return 'e.g., whop_conn_abc123def456';
      case 'google_ads':
        return 'e.g., 123-456-7890';
      case 'linkedin':
        return 'e.g., li_123456789';
      default:
        return 'Enter connection ID';
    }
  };

  const getApiVersionPlaceholder = (provider: string) => {
    switch (provider) {
      case 'meta':
        return 'e.g., v18.0';
      case 'stripe':
        return 'e.g., v1';
      case 'whop':
        return 'e.g., v2';
      case 'google_ads':
        return 'e.g., v14';
      case 'linkedin':
        return 'e.g., v2';
      default:
        return 'e.g., v1';
    }
  };

  if (success) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Integration {integration ? 'Updated' : 'Created'} Successfully</h3>
            <p className="text-muted-foreground text-center">
              Your integration has been {integration ? 'updated' : 'created'} and is ready to use.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {integration ? 'Edit Integration' : 'Add New Integration'}
          </DialogTitle>
          <DialogDescription>
            {integration 
              ? 'Update your integration settings and connection details.'
              : 'Connect a new external service to sync data and manage campaigns.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider_name">Provider *</Label>
            <Select
              value={selectedProvider}
              onValueChange={(value) => setValue('provider_name', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {providerOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getProviderIcon(option.value)}</span>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.provider_name && (
              <p className="text-sm text-red-600">{errors.provider_name.message}</p>
            )}
            {selectedProvider && (
              <p className="text-sm text-muted-foreground">
                {getProviderDescription(selectedProvider)}
              </p>
            )}
          </div>

          {/* Connection ID */}
          <div className="space-y-2">
            <Label htmlFor="connection_id">Connection ID *</Label>
            <Input
              id="connection_id"
              placeholder={getConnectionIdPlaceholder(selectedProvider)}
              {...register('connection_id')}
            />
            {errors.connection_id && (
              <p className="text-sm text-red-600">{errors.connection_id.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              This is the unique identifier for your connection to {formatProviderName(selectedProvider)}.
            </p>
          </div>

          {/* API Version */}
          <div className="space-y-2">
            <Label htmlFor="api_version">API Version (Optional)</Label>
            <Input
              id="api_version"
              placeholder={getApiVersionPlaceholder(selectedProvider)}
              {...register('api_version')}
            />
            <p className="text-sm text-muted-foreground">
              Specify the API version if you need a specific version for compatibility.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {integration ? 'Update Integration' : 'Create Integration'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
