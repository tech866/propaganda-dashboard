// Dashboard service for multi-tenant agency data
import { supabase } from '@/lib/supabase';

export interface DashboardKPIs {
  totalAdSpend: number;
  totalRevenue: number;
  averageOrderValue: number;
  roas: number;
  adSpendChange: number;
  revenueChange: number;
  aovChange: number;
  roasChange: number;
}

export interface ClientSummary {
  id: string;
  name: string;
  status: 'excellent' | 'good' | 'needs_attention' | 'poor';
  totalRevenue: number;
  totalAdSpend: number;
  margin: number;
  profit: number;
  campaignCount: number;
  lastActivity: string;
}

export interface CampaignMetrics {
  id: string;
  name: string;
  clientName: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  adSpend: number;
  revenue: number;
  roas: number;
  startDate: string;
  endDate?: string;
}

export interface FinancialRecord {
  id: string;
  type: 'revenue' | 'expense' | 'refund';
  amount: number;
  description: string;
  date: string;
  clientId?: string;
  campaignId?: string;
}

export class DashboardService {
  private agencyId: string;

  constructor(agencyId: string) {
    this.agencyId = agencyId;
  }

  // Get agency-specific KPIs
  async getKPIs(): Promise<DashboardKPIs> {
    try {
      // Check if Supabase is configured
      if (!supabase) {
        console.log('Supabase not configured, returning mock data for development');
        return this.getMockKPIs();
      }

      // Get financial records for this agency
      const { data: financialRecords, error: financialError } = await supabase
        .from('financial_records')
        .select(`
          *,
          campaigns!inner(
            id,
            client_id,
            clients!inner(
              id,
              agency_id
            )
          )
        `)
        .eq('campaigns.clients.agency_id', this.agencyId);

      if (financialError) throw financialError;

      // Calculate KPIs from financial records
      const revenue = financialRecords
        ?.filter(record => record.type === 'revenue')
        .reduce((sum, record) => sum + record.amount, 0) || 0;

      const expenses = financialRecords
        ?.filter(record => record.type === 'expense')
        .reduce((sum, record) => sum + record.amount, 0) || 0;

      const adSpend = expenses; // Assuming expenses are primarily ad spend
      const roas = adSpend > 0 ? revenue / adSpend : 0;
      const aov = revenue > 0 ? revenue / Math.max(1, financialRecords?.length || 1) : 0;

      // For now, return mock change percentages (in real app, calculate from historical data)
      return {
        totalAdSpend: adSpend,
        totalRevenue: revenue,
        averageOrderValue: aov,
        roas: roas,
        adSpendChange: 8.2, // Mock data - would calculate from historical data
        revenueChange: 15.3,
        aovChange: -2.1,
        roasChange: 0.24
      };
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      // Return mock data on error
      return {
        totalAdSpend: 847293,
        totalRevenue: 2234891,
        averageOrderValue: 4892,
        roas: 3.36,
        adSpendChange: 8.2,
        revenueChange: 15.3,
        aovChange: -2.1,
        roasChange: 0.24
      };
    }
  }

  // Get client summaries for this agency
  async getClientSummaries(): Promise<ClientSummary[]> {
    try {
      // Check if Supabase is configured
      if (!supabase) {
        console.log('Supabase not configured, returning mock client summaries for development');
        return this.getMockClientSummaries();
      }

      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select(`
          *,
          campaigns(
            id,
            financial_records(
              amount,
              type
            )
          )
        `)
        .eq('agency_id', this.agencyId)
        .eq('active_status', true);

      if (clientsError) throw clientsError;

      return clients?.map(client => {
        const campaigns = client.campaigns || [];
        const allFinancialRecords = campaigns.flatMap(campaign => 
          campaign.financial_records || []
        );

        const revenue = allFinancialRecords
          .filter(record => record.type === 'revenue')
          .reduce((sum, record) => sum + record.amount, 0);

        const adSpend = allFinancialRecords
          .filter(record => record.type === 'expense')
          .reduce((sum, record) => sum + record.amount, 0);

        const profit = revenue - adSpend;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

        // Determine status based on margin
        let status: 'excellent' | 'good' | 'needs_attention' | 'poor';
        if (margin >= 70) status = 'excellent';
        else if (margin >= 50) status = 'good';
        else if (margin >= 30) status = 'needs_attention';
        else status = 'poor';

        return {
          id: client.id,
          name: client.name,
          status,
          totalRevenue: revenue,
          totalAdSpend: adSpend,
          margin,
          profit,
          campaignCount: campaigns.length,
          lastActivity: client.updated_at
        };
      }) || [];
    } catch (error) {
      console.error('Error fetching client summaries:', error);
      // Return mock data on error
      return [
        {
          id: '1',
          name: 'TechCorp Inc.',
          status: 'excellent',
          totalRevenue: 892000,
          totalAdSpend: 268000,
          margin: 70.0,
          profit: 624000,
          campaignCount: 5,
          lastActivity: new Date().toISOString()
        },
        {
          id: '2',
          name: 'StartupXYZ',
          status: 'excellent',
          totalRevenue: 650000,
          totalAdSpend: 195000,
          margin: 70.0,
          profit: 455000,
          campaignCount: 3,
          lastActivity: new Date().toISOString()
        }
      ];
    }
  }

  // Get recent campaigns for this agency
  async getRecentCampaigns(limit: number = 5): Promise<CampaignMetrics[]> {
    try {
      // Check if Supabase is configured
      if (!supabase) {
        console.log('Supabase not configured, returning mock recent campaigns for development');
        return this.getMockRecentCampaigns(limit);
      }

      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select(`
          *,
          clients!inner(
            id,
            name,
            agency_id
          ),
          financial_records(
            amount,
            type
          )
        `)
        .eq('clients.agency_id', this.agencyId)
        .eq('active_status', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (campaignsError) throw campaignsError;

      return campaigns?.map(campaign => {
        const financialRecords = campaign.financial_records || [];
        const revenue = financialRecords
          .filter(record => record.type === 'revenue')
          .reduce((sum, record) => sum + record.amount, 0);

        const adSpend = financialRecords
          .filter(record => record.type === 'expense')
          .reduce((sum, record) => sum + record.amount, 0);

        const roas = adSpend > 0 ? revenue / adSpend : 0;

        return {
          id: campaign.id,
          name: campaign.name,
          clientName: campaign.clients.name,
          status: campaign.status as 'active' | 'paused' | 'completed' | 'draft',
          adSpend,
          revenue,
          roas,
          startDate: campaign.start_date,
          endDate: campaign.end_date
        };
      }) || [];
    } catch (error) {
      console.error('Error fetching recent campaigns:', error);
      return [];
    }
  }

  // Get recent financial activity
  async getRecentFinancialActivity(limit: number = 10): Promise<FinancialRecord[]> {
    try {
      // Check if Supabase is configured
      if (!supabase) {
        console.log('Supabase not configured, returning mock financial activity for development');
        return this.getMockFinancialActivity(limit);
      }

      const { data: financialRecords, error: financialError } = await supabase
        .from('financial_records')
        .select(`
          *,
          campaigns!inner(
            id,
            client_id,
            clients!inner(
              id,
              agency_id
            )
          )
        `)
        .eq('campaigns.clients.agency_id', this.agencyId)
        .order('date', { ascending: false })
        .limit(limit);

      if (financialError) throw financialError;

      return financialRecords?.map(record => ({
        id: record.id,
        type: record.type as 'revenue' | 'expense' | 'refund',
        amount: record.amount,
        description: record.description,
        date: record.date,
        clientId: record.campaigns?.client_id,
        campaignId: record.campaign_id
      })) || [];
    } catch (error) {
      console.error('Error fetching financial activity:', error);
      return [];
    }
  }

  // Get agency statistics
  async getAgencyStats() {
    try {
      // Check if Supabase is configured
      if (!supabase) {
        console.log('Supabase not configured, returning mock agency stats for development');
        return {
          totalClients: 8,
          totalCampaigns: 12,
          totalUsers: 3
        };
      }

      const [clientsResult, campaignsResult, usersResult] = await Promise.all([
        supabase
          .from('clients')
          .select('id', { count: 'exact' })
          .eq('agency_id', this.agencyId)
          .eq('active_status', true),
        supabase
          .from('campaigns')
          .select(`
            id,
            clients!inner(
              agency_id
            )
          `, { count: 'exact' })
          .eq('clients.agency_id', this.agencyId)
          .eq('active_status', true),
        supabase
          .from('users')
          .select('id', { count: 'exact' })
          .eq('agency_id', this.agencyId)
          .eq('active_status', true)
      ]);

      return {
        totalClients: clientsResult.count || 0,
        totalCampaigns: campaignsResult.count || 0,
        totalUsers: usersResult.count || 0
      };
    } catch (error) {
      console.error('Error fetching agency stats:', error);
      return {
        totalClients: 0,
        totalCampaigns: 0,
        totalUsers: 0
      };
    }
  }

  // Mock KPIs for development when Supabase is not configured
  private getMockKPIs(): DashboardKPIs {
    return {
      totalRevenue: 125000,
      totalAdSpend: 45000,
      averageOrderValue: 125.0,
      roas: 2.78,
      adSpendChange: 8.7,
      revenueChange: 15.2,
      aovChange: 5.3,
      roasChange: 12.3
    };
  }

  // Mock client summaries for development
  private getMockClientSummaries(): ClientSummary[] {
    return [
      {
        id: 'mock-client-1',
        name: 'Mock Client Inc.',
        status: 'excellent',
        totalRevenue: 125000,
        totalAdSpend: 45000,
        margin: 64.0,
        profit: 80000,
        campaignCount: 5,
        lastActivity: new Date().toISOString()
      },
      {
        id: 'mock-client-2',
        name: 'Demo Company LLC',
        status: 'good',
        totalRevenue: 85000,
        totalAdSpend: 32000,
        margin: 62.4,
        profit: 53000,
        campaignCount: 3,
        lastActivity: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  }

  // Mock recent campaigns for development
  private getMockRecentCampaigns(limit: number): CampaignMetrics[] {
    const campaigns = [
      {
        id: 'mock-campaign-1',
        name: 'Mock Campaign - Q4 2024',
        clientId: 'mock-client-1',
        clientName: 'Mock Client Inc.',
        status: 'active',
        startDate: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
        endDate: new Date(Date.now() + 2592000000).toISOString(), // 30 days from now
        budget: 10000,
        spent: 5952,
        adSpend: 5952,
        revenue: 25000,
        roas: 4.2,
        impressions: 125000,
        clicks: 2500,
        conversions: 125,
        ctr: 2.0,
        cpc: 2.38,
        cpa: 47.62,
        conversionRate: 5.0
      },
      {
        id: 'mock-campaign-2',
        name: 'Demo Campaign - Black Friday',
        clientId: 'mock-client-2',
        clientName: 'Demo Company LLC',
        status: 'completed',
        startDate: new Date(Date.now() - 1728000000).toISOString(), // 20 days ago
        endDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        budget: 5000,
        spent: 4800,
        adSpend: 4800,
        revenue: 12000,
        roas: 2.5,
        impressions: 75000,
        clicks: 1500,
        conversions: 75,
        ctr: 2.0,
        cpc: 3.2,
        cpa: 64.0,
        conversionRate: 5.0
      }
    ];
    return campaigns.slice(0, limit);
  }

  // Mock financial activity for development
  private getMockFinancialActivity(limit: number): FinancialRecord[] {
    const activities = [
      {
        id: 'mock-financial-1',
        type: 'revenue' as const,
        amount: 25000,
        description: 'Revenue from Mock Campaign - Q4 2024',
        date: new Date().toISOString(),
        campaignId: 'mock-campaign-1',
        clientId: 'mock-client-1'
      },
      {
        id: 'mock-financial-2',
        type: 'expense' as const,
        amount: 5952,
        description: 'Ad spend for Mock Campaign - Q4 2024',
        date: new Date(Date.now() - 3600000).toISOString(),
        campaignId: 'mock-campaign-1',
        clientId: 'mock-client-1'
      },
      {
        id: 'mock-financial-3',
        type: 'revenue' as const,
        amount: 12000,
        description: 'Revenue from Demo Campaign - Black Friday',
        date: new Date(Date.now() - 86400000).toISOString(),
        campaignId: 'mock-campaign-2',
        clientId: 'mock-client-2'
      }
    ];
    return activities.slice(0, limit);
  }
}

// Utility functions for formatting
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function formatROAS(roas: number): string {
  return `${roas.toFixed(2)}x`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'excellent': return 'text-green-600 bg-green-50';
    case 'good': return 'text-blue-600 bg-blue-50';
    case 'needs_attention': return 'text-yellow-600 bg-yellow-50';
    case 'poor': return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}
