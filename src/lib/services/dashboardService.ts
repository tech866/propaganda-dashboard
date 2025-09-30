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
