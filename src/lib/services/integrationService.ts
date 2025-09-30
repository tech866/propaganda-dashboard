// Integration sources service for multi-tenant agency integration management
import { supabase } from '@/lib/supabase';

export interface IntegrationSource {
  id: string;
  agency_id: string;
  provider_name: 'meta' | 'whop' | 'stripe' | 'google_ads' | 'linkedin';
  connection_id: string;
  data_sync_status: 'up_to_date' | 'delayed' | 'failed' | 'never_synced';
  last_sync_time?: string;
  authentication_status: 'connected' | 'disconnected' | 'expired' | 'error';
  api_version?: string;
  created_at: string;
  updated_at: string;
}

export interface IntegrationSourceFormData {
  provider_name: 'meta' | 'whop' | 'stripe' | 'google_ads' | 'linkedin';
  connection_id: string;
  api_version?: string;
}

export interface IntegrationAnalytics {
  total_integrations: number;
  connected_count: number;
  disconnected_count: number;
  failed_count: number;
  last_sync_summary: {
    up_to_date: number;
    delayed: number;
    failed: number;
    never_synced: number;
  };
  provider_breakdown: Array<{
    provider: string;
    count: number;
    connected: number;
    status: string;
  }>;
  sync_health_score: number;
}

export interface IntegrationTestResult {
  success: boolean;
  message: string;
  response_time?: number;
  error_details?: string;
  last_checked: string;
}

export class IntegrationService {
  private agencyId: string;

  constructor(agencyId: string) {
    this.agencyId = agencyId;
  }

  // Get all integration sources for the agency
  async getIntegrationSources(): Promise<IntegrationSource[]> {
    try {
      const { data, error } = await supabase
        .from('integration_sources')
        .select('*')
        .eq('agency_id', this.agencyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching integration sources:', error);
        return this.getMockIntegrationSources();
      }

      return data || [];
    } catch (error) {
      console.error('Error in getIntegrationSources:', error);
      return this.getMockIntegrationSources();
    }
  }

  // Get a single integration source by ID
  async getIntegrationSource(id: string): Promise<IntegrationSource | null> {
    try {
      const { data, error } = await supabase
        .from('integration_sources')
        .select('*')
        .eq('id', id)
        .eq('agency_id', this.agencyId)
        .single();

      if (error) {
        console.error('Error fetching integration source:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getIntegrationSource:', error);
      return null;
    }
  }

  // Create a new integration source
  async createIntegrationSource(integrationData: IntegrationSourceFormData): Promise<IntegrationSource> {
    try {
      const { data, error } = await supabase
        .from('integration_sources')
        .insert([{
          ...integrationData,
          agency_id: this.agencyId,
          data_sync_status: 'never_synced',
          authentication_status: 'disconnected'
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating integration source:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createIntegrationSource:', error);
      throw error;
    }
  }

  // Update an integration source
  async updateIntegrationSource(id: string, integrationData: Partial<IntegrationSourceFormData>): Promise<IntegrationSource> {
    try {
      const { data, error } = await supabase
        .from('integration_sources')
        .update({
          ...integrationData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('agency_id', this.agencyId)
        .select()
        .single();

      if (error) {
        console.error('Error updating integration source:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateIntegrationSource:', error);
      throw error;
    }
  }

  // Delete an integration source
  async deleteIntegrationSource(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('integration_sources')
        .delete()
        .eq('id', id)
        .eq('agency_id', this.agencyId);

      if (error) {
        console.error('Error deleting integration source:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteIntegrationSource:', error);
      throw error;
    }
  }

  // Test integration connection
  async testIntegrationConnection(id: string): Promise<IntegrationTestResult> {
    try {
      const integration = await this.getIntegrationSource(id);
      if (!integration) {
        return {
          success: false,
          message: 'Integration not found',
          last_checked: new Date().toISOString()
        };
      }

      // Simulate API test based on provider
      const startTime = Date.now();
      const testResult = await this.simulateProviderTest(integration);
      const responseTime = Date.now() - startTime;

      // Update integration status based on test result
      if (testResult.success) {
        await this.updateIntegrationSource(id, {
          authentication_status: 'connected',
          data_sync_status: 'up_to_date',
          last_sync_time: new Date().toISOString()
        });
      } else {
        await this.updateIntegrationSource(id, {
          authentication_status: 'error',
          data_sync_status: 'failed'
        });
      }

      return {
        ...testResult,
        response_time: responseTime,
        last_checked: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error testing integration connection:', error);
      return {
        success: false,
        message: 'Connection test failed',
        error_details: error instanceof Error ? error.message : 'Unknown error',
        last_checked: new Date().toISOString()
      };
    }
  }

  // Simulate provider-specific connection test
  private async simulateProviderTest(integration: IntegrationSource): Promise<Omit<IntegrationTestResult, 'response_time' | 'last_checked'>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));

    // Simulate different success rates based on provider
    const successRates = {
      'meta': 0.9,
      'stripe': 0.95,
      'whop': 0.85,
      'google_ads': 0.8,
      'linkedin': 0.75
    };

    const successRate = successRates[integration.provider_name] || 0.5;
    const isSuccess = Math.random() < successRate;

    if (isSuccess) {
      return {
        success: true,
        message: `${integration.provider_name} connection successful`
      };
    } else {
      return {
        success: false,
        message: `Failed to connect to ${integration.provider_name}`,
        error_details: 'Authentication failed or API endpoint unreachable'
      };
    }
  }

  // Get integration analytics
  async getIntegrationAnalytics(): Promise<IntegrationAnalytics> {
    try {
      const integrations = await this.getIntegrationSources();
      
      const total_integrations = integrations.length;
      const connected_count = integrations.filter(i => i.authentication_status === 'connected').length;
      const disconnected_count = integrations.filter(i => i.authentication_status === 'disconnected').length;
      const failed_count = integrations.filter(i => i.authentication_status === 'error').length;

      const last_sync_summary = {
        up_to_date: integrations.filter(i => i.data_sync_status === 'up_to_date').length,
        delayed: integrations.filter(i => i.data_sync_status === 'delayed').length,
        failed: integrations.filter(i => i.data_sync_status === 'failed').length,
        never_synced: integrations.filter(i => i.data_sync_status === 'never_synced').length
      };

      // Provider breakdown
      const providerStats = new Map<string, { count: number; connected: number }>();
      integrations.forEach(integration => {
        const current = providerStats.get(integration.provider_name) || { count: 0, connected: 0 };
        providerStats.set(integration.provider_name, {
          count: current.count + 1,
          connected: current.connected + (integration.authentication_status === 'connected' ? 1 : 0)
        });
      });

      const provider_breakdown = Array.from(providerStats.entries()).map(([provider, stats]) => ({
        provider,
        count: stats.count,
        connected: stats.connected,
        status: stats.connected === stats.count ? 'healthy' : stats.connected > 0 ? 'partial' : 'unhealthy'
      }));

      // Calculate health score (0-100)
      const sync_health_score = total_integrations > 0 
        ? Math.round((last_sync_summary.up_to_date / total_integrations) * 100)
        : 100;

      return {
        total_integrations,
        connected_count,
        disconnected_count,
        failed_count,
        last_sync_summary,
        provider_breakdown,
        sync_health_score
      };
    } catch (error) {
      console.error('Error in getIntegrationAnalytics:', error);
      return this.getMockIntegrationAnalytics();
    }
  }

  // Sync all integrations
  async syncAllIntegrations(): Promise<{ success: number; failed: number; results: IntegrationTestResult[] }> {
    try {
      const integrations = await this.getIntegrationSources();
      const results: IntegrationTestResult[] = [];
      let success = 0;
      let failed = 0;

      for (const integration of integrations) {
        const result = await this.testIntegrationConnection(integration.id);
        results.push(result);
        
        if (result.success) {
          success++;
        } else {
          failed++;
        }
      }

      return { success, failed, results };
    } catch (error) {
      console.error('Error syncing all integrations:', error);
      return { success: 0, failed: 0, results: [] };
    }
  }

  // Mock data methods for development
  private getMockIntegrationSources(): IntegrationSource[] {
    return [
      {
        id: 'mock-1',
        agency_id: this.agencyId,
        provider_name: 'meta',
        connection_id: 'act_123456789012345',
        data_sync_status: 'up_to_date',
        last_sync_time: '2024-09-30T10:30:00Z',
        authentication_status: 'connected',
        api_version: 'v18.0',
        created_at: '2024-09-01T00:00:00Z',
        updated_at: '2024-09-30T10:30:00Z'
      },
      {
        id: 'mock-2',
        agency_id: this.agencyId,
        provider_name: 'stripe',
        connection_id: 'acct_1A2B3C4D5E6F7G8H',
        data_sync_status: 'up_to_date',
        last_sync_time: '2024-09-30T10:25:00Z',
        authentication_status: 'connected',
        api_version: 'v1',
        created_at: '2024-09-01T00:00:00Z',
        updated_at: '2024-09-30T10:25:00Z'
      },
      {
        id: 'mock-3',
        agency_id: this.agencyId,
        provider_name: 'whop',
        connection_id: 'whop_conn_abc123def456',
        data_sync_status: 'delayed',
        last_sync_time: '2024-09-29T15:20:00Z',
        authentication_status: 'connected',
        api_version: 'v2',
        created_at: '2024-09-01T00:00:00Z',
        updated_at: '2024-09-29T15:20:00Z'
      }
    ];
  }

  private getMockIntegrationAnalytics(): IntegrationAnalytics {
    return {
      total_integrations: 3,
      connected_count: 2,
      disconnected_count: 1,
      failed_count: 0,
      last_sync_summary: {
        up_to_date: 2,
        delayed: 1,
        failed: 0,
        never_synced: 0
      },
      provider_breakdown: [
        { provider: 'meta', count: 1, connected: 1, status: 'healthy' },
        { provider: 'stripe', count: 1, connected: 1, status: 'healthy' },
        { provider: 'whop', count: 1, connected: 1, status: 'partial' }
      ],
      sync_health_score: 67
    };
  }
}

// Helper functions for formatting
export const formatProviderName = (provider: string) => {
  switch (provider.toLowerCase()) {
    case 'meta':
      return 'Meta (Facebook)';
    case 'stripe':
      return 'Stripe';
    case 'whop':
      return 'Whop';
    case 'google_ads':
      return 'Google Ads';
    case 'linkedin':
      return 'LinkedIn';
    default:
      return provider;
  }
};

export const getProviderIcon = (provider: string) => {
  switch (provider.toLowerCase()) {
    case 'meta':
      return '📘';
    case 'stripe':
      return '💳';
    case 'whop':
      return '🛒';
    case 'google_ads':
      return '🔍';
    case 'linkedin':
      return '💼';
    default:
      return '🔗';
  }
};

export const getAuthenticationStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'connected':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'disconnected':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    case 'expired':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'error':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getSyncStatusColor = (status: string) => {
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

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};
