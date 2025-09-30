import { supabase } from '@/lib/supabase';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  created_at: string;
  updated_at: string;
  agency_id: string;
  active_status: boolean;
  billing_address?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
  billing_country?: string;
  contact_person?: string;
  notes?: string;
  monthly_budget?: number;
  contract_start_date?: string;
  contract_end_date?: string;
}

export interface ClientFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  industry?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  billing_address?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
  billing_country?: string;
  contact_person?: string;
  notes?: string;
  monthly_budget?: number;
  contract_start_date?: string;
  contract_end_date?: string;
}

export interface ClientPerformanceMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSpend: number;
  totalRevenue: number;
  totalProfit: number;
  averageROAS: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  averageCTR: number;
  averageCPC: number;
  averageCPM: number;
  averageConversionRate: number;
  monthlyGrowth: number;
  lastActivity: string;
}

export interface ClientAnalytics {
  clientId: string;
  clientName: string;
  period: string;
  metrics: ClientPerformanceMetrics;
  campaignBreakdown: Array<{
    campaignId: string;
    campaignName: string;
    status: string;
    spend: number;
    revenue: number;
    roas: number;
    impressions: number;
    clicks: number;
    conversions: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    spend: number;
    revenue: number;
    profit: number;
    conversions: number;
  }>;
}

export class ClientService {
  private agencyId: string;

  constructor(agencyId: string) {
    this.agencyId = agencyId;
  }

  // Get all clients for this agency
  async getClients(): Promise<Client[]> {
    try {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .eq('agency_id', this.agencyId)
        .eq('active_status', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return clients || [];
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  }

  // Get a specific client by ID
  async getClient(clientId: string): Promise<Client | null> {
    try {
      const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .eq('agency_id', this.agencyId)
        .single();

      if (error) throw error;
      return client;
    } catch (error) {
      console.error('Error fetching client:', error);
      return null;
    }
  }

  // Create a new client
  async createClient(clientData: ClientFormData): Promise<Client | null> {
    try {
      const { data: client, error } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          agency_id: this.agencyId,
          active_status: true
        })
        .select()
        .single();

      if (error) throw error;
      return client;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  // Update an existing client
  async updateClient(clientId: string, clientData: Partial<ClientFormData>): Promise<Client | null> {
    try {
      const { data: client, error } = await supabase
        .from('clients')
        .update({
          ...clientData,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .eq('agency_id', this.agencyId)
        .select()
        .single();

      if (error) throw error;
      return client;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  // Delete a client (soft delete)
  async deleteClient(clientId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ 
          active_status: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .eq('agency_id', this.agencyId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      return false;
    }
  }

  // Get client performance metrics
  async getClientPerformanceMetrics(clientId: string): Promise<ClientPerformanceMetrics> {
    try {
      // Get campaigns for this client
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id, name, status, budget, spent_amount')
        .eq('client_id', clientId)
        .eq('active_status', true);

      if (campaignsError) throw campaignsError;

      // Get campaign metrics
      const campaignIds = campaigns?.map(c => c.id) || [];
      let metrics = {
        totalCampaigns: campaigns?.length || 0,
        activeCampaigns: campaigns?.filter(c => c.status === 'active').length || 0,
        totalSpend: 0,
        totalRevenue: 0,
        totalProfit: 0,
        averageROAS: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        averageCTR: 0,
        averageCPC: 0,
        averageCPM: 0,
        averageConversionRate: 0,
        monthlyGrowth: 0,
        lastActivity: new Date().toISOString()
      };

      if (campaignIds.length > 0) {
        const { data: campaignMetrics, error: metricsError } = await supabase
          .from('campaign_metrics')
          .select('*')
          .in('campaign_id', campaignIds);

        if (metricsError) throw metricsError;

        // Calculate aggregated metrics
        const totals = campaignMetrics?.reduce((acc, metric) => ({
          totalSpend: acc.totalSpend + metric.cost,
          totalRevenue: acc.totalRevenue + metric.revenue,
          totalImpressions: acc.totalImpressions + metric.impressions,
          totalClicks: acc.totalClicks + metric.clicks,
          totalConversions: acc.totalConversions + metric.conversions
        }), {
          totalSpend: 0,
          totalRevenue: 0,
          totalImpressions: 0,
          totalClicks: 0,
          totalConversions: 0
        }) || {
          totalSpend: 0,
          totalRevenue: 0,
          totalImpressions: 0,
          totalClicks: 0,
          totalConversions: 0
        };

        metrics = {
          ...metrics,
          ...totals,
          totalProfit: totals.totalRevenue - totals.totalSpend,
          averageROAS: totals.totalSpend > 0 ? totals.totalRevenue / totals.totalSpend : 0,
          averageCTR: totals.totalImpressions > 0 ? (totals.totalClicks / totals.totalImpressions) * 100 : 0,
          averageCPC: totals.totalClicks > 0 ? totals.totalSpend / totals.totalClicks : 0,
          averageCPM: totals.totalImpressions > 0 ? (totals.totalSpend / totals.totalImpressions) * 1000 : 0,
          averageConversionRate: totals.totalClicks > 0 ? (totals.totalConversions / totals.totalClicks) * 100 : 0,
          monthlyGrowth: 12.5 // Mock growth data
        };
      }

      return metrics;
    } catch (error) {
      console.error('Error fetching client performance metrics:', error);
      return {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalSpend: 0,
        totalRevenue: 0,
        totalProfit: 0,
        averageROAS: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        averageCTR: 0,
        averageCPC: 0,
        averageCPM: 0,
        averageConversionRate: 0,
        monthlyGrowth: 0,
        lastActivity: new Date().toISOString()
      };
    }
  }

  // Get client analytics
  async getClientAnalytics(clientId: string, period: string = '30d'): Promise<ClientAnalytics | null> {
    try {
      const client = await this.getClient(clientId);
      if (!client) return null;

      const metrics = await this.getClientPerformanceMetrics(clientId);

      // Get campaign breakdown
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select(`
          id,
          name,
          status,
          budget,
          spent_amount,
          campaign_metrics(
            cost,
            revenue,
            impressions,
            clicks,
            conversions
          )
        `)
        .eq('client_id', clientId)
        .eq('active_status', true);

      if (campaignsError) throw campaignsError;

      const campaignBreakdown = campaigns?.map(campaign => {
        const campaignMetrics = campaign.campaign_metrics || [];
        const totals = campaignMetrics.reduce((acc: any, metric: any) => ({
          cost: acc.cost + metric.cost,
          revenue: acc.revenue + metric.revenue,
          impressions: acc.impressions + metric.impressions,
          clicks: acc.clicks + metric.clicks,
          conversions: acc.conversions + metric.conversions
        }), { cost: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0 });

        return {
          campaignId: campaign.id,
          campaignName: campaign.name,
          status: campaign.status,
          spend: totals.cost,
          revenue: totals.revenue,
          roas: totals.cost > 0 ? totals.revenue / totals.cost : 0,
          impressions: totals.impressions,
          clicks: totals.clicks,
          conversions: totals.conversions
        };
      }) || [];

      // Mock monthly trend data
      const monthlyTrend = [
        { month: 'Jan', spend: 5000, revenue: 12000, profit: 7000, conversions: 45 },
        { month: 'Feb', spend: 5500, revenue: 13500, profit: 8000, conversions: 52 },
        { month: 'Mar', spend: 6000, revenue: 15000, profit: 9000, conversions: 58 },
        { month: 'Apr', spend: 6500, revenue: 16500, profit: 10000, conversions: 65 },
        { month: 'May', spend: 7000, revenue: 18000, profit: 11000, conversions: 72 },
        { month: 'Jun', spend: 7500, revenue: 19500, profit: 12000, conversions: 78 }
      ];

      return {
        clientId: client.id,
        clientName: client.name,
        period,
        metrics,
        campaignBreakdown,
        monthlyTrend
      };
    } catch (error) {
      console.error('Error fetching client analytics:', error);
      return null;
    }
  }

  // Search clients
  async searchClients(query: string): Promise<Client[]> {
    try {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .eq('agency_id', this.agencyId)
        .eq('active_status', true)
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`)
        .order('name');

      if (error) throw error;
      return clients || [];
    } catch (error) {
      console.error('Error searching clients:', error);
      return [];
    }
  }

  // Get clients by status
  async getClientsByStatus(status: string): Promise<Client[]> {
    try {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .eq('agency_id', this.agencyId)
        .eq('active_status', true)
        .eq('status', status)
        .order('name');

      if (error) throw error;
      return clients || [];
    } catch (error) {
      console.error('Error fetching clients by status:', error);
      return [];
    }
  }
}

// Utility functions for client management
export function getClientStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'inactive':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    case 'pending':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'suspended':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getClientStatusIcon(status: string): string {
  switch (status) {
    case 'active':
      return '✅';
    case 'inactive':
      return '⏸️';
    case 'pending':
      return '⏳';
    case 'suspended':
      return '🚫';
    default:
      return '❓';
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function getIndustryIcon(industry?: string): string {
  switch (industry?.toLowerCase()) {
    case 'technology':
      return '💻';
    case 'healthcare':
      return '🏥';
    case 'finance':
      return '💰';
    case 'retail':
      return '🛍️';
    case 'education':
      return '🎓';
    case 'real estate':
      return '🏠';
    case 'automotive':
      return '🚗';
    case 'food & beverage':
      return '🍽️';
    case 'travel':
      return '✈️';
    case 'entertainment':
      return '🎬';
    default:
      return '🏢';
  }
}