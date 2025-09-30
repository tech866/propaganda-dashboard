// Campaign service for multi-tenant agency campaign management
import { supabase } from '@/lib/supabase';

export interface Campaign {
  id: string;
  name: string;
  client_id: string;
  client_name?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  budget: number;
  spent_amount: number;
  target_audience?: string;
  objectives?: string;
  platform: string;
  campaign_type: string;
  created_at: string;
  updated_at: string;
  active_status: boolean;
}

export interface CampaignMetrics {
  id: string;
  campaign_id: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  revenue: number;
  roas: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversion_rate: number;
  date: string;
}

export interface CampaignFormData {
  name: string;
  client_id: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  budget: number;
  target_audience?: string;
  objectives?: string;
  platform: string;
  campaign_type: string;
}

export class CampaignService {
  private agencyId: string;

  constructor(agencyId: string) {
    this.agencyId = agencyId;
  }

  // Get all campaigns for this agency
  async getCampaigns(): Promise<Campaign[]> {
    try {
      const { data: campaigns, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          clients!inner(
            id,
            name,
            agency_id
          )
        `)
        .eq('clients.agency_id', this.agencyId)
        .eq('active_status', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return campaigns?.map(campaign => ({
        ...campaign,
        client_name: campaign.clients.name
      })) || [];
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }
  }

  // Get a specific campaign by ID
  async getCampaign(campaignId: string): Promise<Campaign | null> {
    try {
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          clients!inner(
            id,
            name,
            agency_id
          )
        `)
        .eq('id', campaignId)
        .eq('clients.agency_id', this.agencyId)
        .single();

      if (error) throw error;

      return campaign ? {
        ...campaign,
        client_name: campaign.clients.name
      } : null;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      return null;
    }
  }

  // Create a new campaign
  async createCampaign(campaignData: CampaignFormData): Promise<Campaign | null> {
    try {
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .insert({
          ...campaignData,
          spent_amount: 0,
          active_status: true
        })
        .select(`
          *,
          clients!inner(
            id,
            name,
            agency_id
          )
        `)
        .single();

      if (error) throw error;

      return campaign ? {
        ...campaign,
        client_name: campaign.clients.name
      } : null;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  // Update an existing campaign
  async updateCampaign(campaignId: string, campaignData: Partial<CampaignFormData>): Promise<Campaign | null> {
    try {
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .update({
          ...campaignData,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)
        .select(`
          *,
          clients!inner(
            id,
            name,
            agency_id
          )
        `)
        .single();

      if (error) throw error;

      return campaign ? {
        ...campaign,
        client_name: campaign.clients.name
      } : null;
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  }

  // Delete a campaign (soft delete)
  async deleteCampaign(campaignId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          active_status: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      return false;
    }
  }

  // Get campaign metrics
  async getCampaignMetrics(campaignId: string): Promise<CampaignMetrics[]> {
    try {
      const { data: metrics, error } = await supabase
        .from('campaign_metrics')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('date', { ascending: false });

      if (error) throw error;

      return metrics || [];
    } catch (error) {
      console.error('Error fetching campaign metrics:', error);
      return [];
    }
  }

  // Get campaign performance summary
  async getCampaignPerformance(campaignId: string): Promise<{
    totalSpend: number;
    totalRevenue: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    averageROAS: number;
    averageCTR: number;
    averageCPC: number;
    averageCPM: number;
    averageConversionRate: number;
  }> {
    try {
      const metrics = await this.getCampaignMetrics(campaignId);
      
      if (metrics.length === 0) {
        return {
          totalSpend: 0,
          totalRevenue: 0,
          totalImpressions: 0,
          totalClicks: 0,
          totalConversions: 0,
          averageROAS: 0,
          averageCTR: 0,
          averageCPC: 0,
          averageCPM: 0,
          averageConversionRate: 0
        };
      }

      const totals = metrics.reduce((acc, metric) => ({
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
      });

      const averages = {
        averageROAS: totals.totalSpend > 0 ? totals.totalRevenue / totals.totalSpend : 0,
        averageCTR: totals.totalImpressions > 0 ? (totals.totalClicks / totals.totalImpressions) * 100 : 0,
        averageCPC: totals.totalClicks > 0 ? totals.totalSpend / totals.totalClicks : 0,
        averageCPM: totals.totalImpressions > 0 ? (totals.totalSpend / totals.totalImpressions) * 1000 : 0,
        averageConversionRate: totals.totalClicks > 0 ? (totals.totalConversions / totals.totalClicks) * 100 : 0
      };

      return { ...totals, ...averages };
    } catch (error) {
      console.error('Error calculating campaign performance:', error);
      return {
        totalSpend: 0,
        totalRevenue: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        averageROAS: 0,
        averageCTR: 0,
        averageCPC: 0,
        averageCPM: 0,
        averageConversionRate: 0
      };
    }
  }

  // Get clients for campaign creation
  async getClients(): Promise<Array<{ id: string; name: string }>> {
    try {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('agency_id', this.agencyId)
        .eq('active_status', true)
        .order('name');

      if (error) throw error;
      return clients || [];
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  }
}

// Utility functions for campaign management
export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'paused':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'completed':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'draft':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    case 'cancelled':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'active':
      return '▶️';
    case 'paused':
      return '⏸️';
    case 'completed':
      return '✅';
    case 'draft':
      return '📝';
    case 'cancelled':
      return '❌';
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

export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateObj);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

