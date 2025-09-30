// Financial records service for multi-tenant agency financial management
import { supabase } from '@/lib/supabase';

export interface FinancialRecord {
  id: string;
  campaign_id: string;
  campaign_name?: string;
  client_name?: string;
  integration_source_id: string;
  integration_source_name?: string;
  transaction_date: string;
  amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  transaction_type: 'ad_spend' | 'payment' | 'refund' | 'fee' | 'revenue' | 'expense' | 'adjustment' | 'commission' | 'bonus' | 'salary' | 'equipment' | 'software' | 'travel' | 'office' | 'marketing' | 'consulting' | 'training' | 'legal' | 'insurance' | 'tax' | 'other';
  currency: string;
  reference_number?: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialRecordFormData {
  campaign_id: string;
  integration_source_id: string;
  transaction_date: string;
  amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  transaction_type: 'ad_spend' | 'payment' | 'refund' | 'fee' | 'revenue' | 'expense' | 'adjustment' | 'commission' | 'bonus' | 'salary' | 'equipment' | 'software' | 'travel' | 'office' | 'marketing' | 'consulting' | 'training' | 'legal' | 'insurance' | 'tax' | 'other';
  currency: string;
  reference_number?: string;
}

export interface FinancialAnalytics {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  total_ad_spend: number;
  total_payments: number;
  total_refunds: number;
  total_fees: number;
  revenue_by_month: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
  expenses_by_type: Array<{
    type: string;
    amount: number;
    percentage: number;
  }>;
  top_campaigns: Array<{
    campaign_id: string;
    campaign_name: string;
    revenue: number;
    expenses: number;
    profit: number;
    roi: number;
  }>;
}

export interface FinancialSummary {
  period: string;
  total_transactions: number;
  total_amount: number;
  revenue: number;
  expenses: number;
  profit_margin: number;
  average_transaction: number;
}

export class FinancialService {
  private agencyId: string;

  constructor(agencyId: string) {
    this.agencyId = agencyId;
  }

  // Get all financial records for the agency
  async getFinancialRecords(filters?: {
    startDate?: string;
    endDate?: string;
    transactionType?: string;
    paymentStatus?: string;
    campaignId?: string;
  }): Promise<FinancialRecord[]> {
    try {
      let query = supabase
        .from('financial_records')
        .select(`
          *,
          campaigns!inner(
            id,
            name,
            agency_id,
            clients!inner(
              id,
              name
            )
          ),
          integration_sources!inner(
            id,
            provider_name
          )
        `)
        .eq('campaigns.agency_id', this.agencyId)
        .order('transaction_date', { ascending: false });

      // Apply filters
      if (filters?.startDate) {
        query = query.gte('transaction_date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('transaction_date', filters.endDate);
      }
      if (filters?.transactionType) {
        query = query.eq('transaction_type', filters.transactionType);
      }
      if (filters?.paymentStatus) {
        query = query.eq('payment_status', filters.paymentStatus);
      }
      if (filters?.campaignId) {
        query = query.eq('campaign_id', filters.campaignId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching financial records:', error);
        // Return mock data for development
        return this.getMockFinancialRecords();
      }

      return data.map(record => ({
        id: record.id,
        campaign_id: record.campaign_id,
        campaign_name: record.campaigns?.name,
        client_name: record.campaigns?.clients?.name,
        integration_source_id: record.integration_source_id,
        integration_source_name: record.integration_sources?.provider_name,
        transaction_date: record.transaction_date,
        amount: record.amount,
        payment_status: record.payment_status,
        transaction_type: record.transaction_type,
        currency: record.currency,
        reference_number: record.reference_number,
        created_at: record.created_at,
        updated_at: record.updated_at,
      }));
    } catch (error) {
      console.error('Error in getFinancialRecords:', error);
      return this.getMockFinancialRecords();
    }
  }

  // Get a single financial record by ID
  async getFinancialRecord(id: string): Promise<FinancialRecord | null> {
    try {
      const { data, error } = await supabase
        .from('financial_records')
        .select(`
          *,
          campaigns!inner(
            id,
            name,
            agency_id,
            clients!inner(
              id,
              name
            )
          ),
          integration_sources!inner(
            id,
            provider_name
          )
        `)
        .eq('id', id)
        .eq('campaigns.agency_id', this.agencyId)
        .single();

      if (error) {
        console.error('Error fetching financial record:', error);
        return null;
      }

      return {
        id: data.id,
        campaign_id: data.campaign_id,
        campaign_name: data.campaigns?.name,
        client_name: data.campaigns?.clients?.name,
        integration_source_id: data.integration_source_id,
        integration_source_name: data.integration_sources?.provider_name,
        transaction_date: data.transaction_date,
        amount: data.amount,
        payment_status: data.payment_status,
        transaction_type: data.transaction_type,
        currency: data.currency,
        reference_number: data.reference_number,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error('Error in getFinancialRecord:', error);
      return null;
    }
  }

  // Create a new financial record
  async createFinancialRecord(recordData: FinancialRecordFormData): Promise<FinancialRecord> {
    try {
      const { data, error } = await supabase
        .from('financial_records')
        .insert([recordData])
        .select(`
          *,
          campaigns!inner(
            id,
            name,
            agency_id,
            clients!inner(
              id,
              name
            )
          ),
          integration_sources!inner(
            id,
            provider_name
          )
        `)
        .single();

      if (error) {
        console.error('Error creating financial record:', error);
        throw error;
      }

      return {
        id: data.id,
        campaign_id: data.campaign_id,
        campaign_name: data.campaigns?.name,
        client_name: data.campaigns?.clients?.name,
        integration_source_id: data.integration_source_id,
        integration_source_name: data.integration_sources?.provider_name,
        transaction_date: data.transaction_date,
        amount: data.amount,
        payment_status: data.payment_status,
        transaction_type: data.transaction_type,
        currency: data.currency,
        reference_number: data.reference_number,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error('Error in createFinancialRecord:', error);
      throw error;
    }
  }

  // Update a financial record
  async updateFinancialRecord(id: string, recordData: Partial<FinancialRecordFormData>): Promise<FinancialRecord> {
    try {
      const { data, error } = await supabase
        .from('financial_records')
        .update(recordData)
        .eq('id', id)
        .select(`
          *,
          campaigns!inner(
            id,
            name,
            agency_id,
            clients!inner(
              id,
              name
            )
          ),
          integration_sources!inner(
            id,
            provider_name
          )
        `)
        .single();

      if (error) {
        console.error('Error updating financial record:', error);
        throw error;
      }

      return {
        id: data.id,
        campaign_id: data.campaign_id,
        campaign_name: data.campaigns?.name,
        client_name: data.campaigns?.clients?.name,
        integration_source_id: data.integration_source_id,
        integration_source_name: data.integration_sources?.provider_name,
        transaction_date: data.transaction_date,
        amount: data.amount,
        payment_status: data.payment_status,
        transaction_type: data.transaction_type,
        currency: data.currency,
        reference_number: data.reference_number,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error('Error in updateFinancialRecord:', error);
      throw error;
    }
  }

  // Delete a financial record
  async deleteFinancialRecord(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('financial_records')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting financial record:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteFinancialRecord:', error);
      throw error;
    }
  }

  // Get financial analytics for the agency
  async getFinancialAnalytics(period?: {
    startDate?: string;
    endDate?: string;
  }): Promise<FinancialAnalytics> {
    try {
      const records = await this.getFinancialRecords(period);
      
      const total_revenue = records
        .filter(r => r.transaction_type === 'payment')
        .reduce((sum, r) => sum + r.amount, 0);
      
      const total_expenses = records
        .filter(r => ['ad_spend', 'fee', 'expense', 'salary', 'equipment', 'software', 'travel', 'office', 'marketing', 'consulting', 'training', 'legal', 'insurance', 'tax'].includes(r.transaction_type))
        .reduce((sum, r) => sum + r.amount, 0);
      
      const net_profit = total_revenue - total_expenses;
      
      const total_ad_spend = records
        .filter(r => r.transaction_type === 'ad_spend')
        .reduce((sum, r) => sum + r.amount, 0);
      
      const total_payments = total_revenue;
      
      const total_refunds = records
        .filter(r => r.transaction_type === 'refund')
        .reduce((sum, r) => sum + r.amount, 0);
      
      const total_fees = records
        .filter(r => r.transaction_type === 'fee')
        .reduce((sum, r) => sum + r.amount, 0);

      // Group by month for revenue analysis
      const monthlyData = new Map<string, { revenue: number; expenses: number; profit: number }>();
      records.forEach(record => {
        const month = new Date(record.transaction_date).toISOString().slice(0, 7);
        if (!monthlyData.has(month)) {
          monthlyData.set(month, { revenue: 0, expenses: 0, profit: 0 });
        }
        const data = monthlyData.get(month)!;
        if (record.transaction_type === 'payment') {
          data.revenue += record.amount;
        } else if (['ad_spend', 'fee', 'expense', 'salary', 'equipment', 'software', 'travel', 'office', 'marketing', 'consulting', 'training', 'legal', 'insurance', 'tax'].includes(record.transaction_type)) {
          data.expenses += record.amount;
        }
        data.profit = data.revenue - data.expenses;
      });

      const revenue_by_month = Array.from(monthlyData.entries()).map(([month, data]) => ({
        month,
        ...data
      })).sort((a, b) => a.month.localeCompare(b.month));

      // Expenses by type
      const expensesByType = new Map<string, number>();
      records.forEach(record => {
        if (['ad_spend', 'fee', 'expense', 'salary', 'equipment', 'software', 'travel', 'office', 'marketing', 'consulting', 'training', 'legal', 'insurance', 'tax'].includes(record.transaction_type)) {
          const current = expensesByType.get(record.transaction_type) || 0;
          expensesByType.set(record.transaction_type, current + record.amount);
        }
      });

      const expenses_by_type = Array.from(expensesByType.entries()).map(([type, amount]) => ({
        type,
        amount,
        percentage: total_expenses > 0 ? (amount / total_expenses) * 100 : 0
      }));

      // Top campaigns by profit
      const campaignData = new Map<string, { name: string; revenue: number; expenses: number; profit: number }>();
      records.forEach(record => {
        if (!campaignData.has(record.campaign_id)) {
          campaignData.set(record.campaign_id, { 
            name: record.campaign_name || 'Unknown Campaign', 
            revenue: 0, 
            expenses: 0, 
            profit: 0 
          });
        }
        const data = campaignData.get(record.campaign_id)!;
        if (record.transaction_type === 'payment') {
          data.revenue += record.amount;
        } else if (['ad_spend', 'fee', 'expense', 'salary', 'equipment', 'software', 'travel', 'office', 'marketing', 'consulting', 'training', 'legal', 'insurance', 'tax'].includes(record.transaction_type)) {
          data.expenses += record.amount;
        }
        data.profit = data.revenue - data.expenses;
      });

      const top_campaigns = Array.from(campaignData.entries()).map(([campaign_id, data]) => ({
        campaign_id,
        campaign_name: data.name,
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.profit,
        roi: data.expenses > 0 ? (data.revenue / data.expenses) : 0
      })).sort((a, b) => b.profit - a.profit).slice(0, 10);

      return {
        total_revenue,
        total_expenses,
        net_profit,
        total_ad_spend,
        total_payments,
        total_refunds,
        total_fees,
        revenue_by_month,
        expenses_by_type,
        top_campaigns
      };
    } catch (error) {
      console.error('Error in getFinancialAnalytics:', error);
      return this.getMockFinancialAnalytics();
    }
  }

  // Get financial summary for a period
  async getFinancialSummary(period: {
    startDate: string;
    endDate: string;
  }): Promise<FinancialSummary> {
    try {
      const records = await this.getFinancialRecords(period);
      
      const total_transactions = records.length;
      const total_amount = records.reduce((sum, r) => sum + r.amount, 0);
      const revenue = records
        .filter(r => r.transaction_type === 'payment')
        .reduce((sum, r) => sum + r.amount, 0);
      const expenses = records
        .filter(r => ['ad_spend', 'fee', 'expense', 'salary', 'equipment', 'software', 'travel', 'office', 'marketing', 'consulting', 'training', 'legal', 'insurance', 'tax'].includes(r.transaction_type))
        .reduce((sum, r) => sum + r.amount, 0);
      const profit_margin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;
      const average_transaction = total_transactions > 0 ? total_amount / total_transactions : 0;

      return {
        period: `${period.startDate} to ${period.endDate}`,
        total_transactions,
        total_amount,
        revenue,
        expenses,
        profit_margin,
        average_transaction
      };
    } catch (error) {
      console.error('Error in getFinancialSummary:', error);
      return this.getMockFinancialSummary();
    }
  }

  // Get campaigns for dropdown
  async getCampaigns(): Promise<Array<{ id: string; name: string }>> {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name')
        .eq('agency_id', this.agencyId)
        .order('name');

      if (error) {
        console.error('Error fetching campaigns:', error);
        return this.getMockCampaigns();
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCampaigns:', error);
      return this.getMockCampaigns();
    }
  }

  // Get integration sources for dropdown
  async getIntegrationSources(): Promise<Array<{ id: string; provider_name: string }>> {
    try {
      const { data, error } = await supabase
        .from('integration_sources')
        .select('id, provider_name')
        .eq('agency_id', this.agencyId)
        .order('provider_name');

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

  // Mock data methods for development
  private getMockFinancialRecords(): FinancialRecord[] {
    return [
      {
        id: 'mock-1',
        campaign_id: 'campaign-1',
        campaign_name: 'TechCorp Q4 Growth',
        client_name: 'TechCorp Inc',
        integration_source_id: 'integration-1',
        integration_source_name: 'Meta',
        transaction_date: '2024-09-01T00:00:00Z',
        amount: 5000.00,
        payment_status: 'paid',
        transaction_type: 'ad_spend',
        currency: 'USD',
        reference_number: 'FB_AD_001',
        created_at: '2024-09-01T00:00:00Z',
        updated_at: '2024-09-01T00:00:00Z'
      },
      {
        id: 'mock-2',
        campaign_id: 'campaign-1',
        campaign_name: 'TechCorp Q4 Growth',
        client_name: 'TechCorp Inc',
        integration_source_id: 'integration-2',
        integration_source_name: 'Stripe',
        transaction_date: '2024-09-30T00:00:00Z',
        amount: 15000.00,
        payment_status: 'paid',
        transaction_type: 'payment',
        currency: 'USD',
        reference_number: 'STRIPE_PAY_001',
        created_at: '2024-09-30T00:00:00Z',
        updated_at: '2024-09-30T00:00:00Z'
      }
    ];
  }

  private getMockFinancialAnalytics(): FinancialAnalytics {
    return {
      total_revenue: 50000,
      total_expenses: 25000,
      net_profit: 25000,
      total_ad_spend: 20000,
      total_payments: 50000,
      total_refunds: 0,
      total_fees: 5000,
      revenue_by_month: [
        { month: '2024-09', revenue: 25000, expenses: 12000, profit: 13000 },
        { month: '2024-10', revenue: 25000, expenses: 13000, profit: 12000 }
      ],
      expenses_by_type: [
        { type: 'ad_spend', amount: 20000, percentage: 80 },
        { type: 'fee', amount: 5000, percentage: 20 }
      ],
      top_campaigns: [
        {
          campaign_id: 'campaign-1',
          campaign_name: 'TechCorp Q4 Growth',
          revenue: 30000,
          expenses: 15000,
          profit: 15000,
          roi: 2.0
        }
      ]
    };
  }

  private getMockFinancialSummary(): FinancialSummary {
    return {
      period: '2024-09-01 to 2024-09-30',
      total_transactions: 25,
      total_amount: 75000,
      revenue: 50000,
      expenses: 25000,
      profit_margin: 50,
      average_transaction: 3000
    };
  }

  private getMockCampaigns(): Array<{ id: string; name: string }> {
    return [
      { id: 'campaign-1', name: 'TechCorp Q4 Growth' },
      { id: 'campaign-2', name: 'StartupXYZ Launch Campaign' },
      { id: 'campaign-3', name: 'E-commerce Holiday Push' }
    ];
  }

  private getMockIntegrationSources(): Array<{ id: string; provider_name: string }> {
    return [
      { id: 'integration-1', provider_name: 'Meta' },
      { id: 'integration-2', provider_name: 'Stripe' },
      { id: 'integration-3', provider_name: 'Whop' }
    ];
  }
}

// Helper functions for formatting
export const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const getTransactionTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'payment':
    case 'revenue':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'ad_spend':
    case 'marketing':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'refund':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'fee':
    case 'commission':
    case 'bonus':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'salary':
    case 'equipment':
    case 'software':
    case 'travel':
    case 'office':
    case 'consulting':
    case 'training':
    case 'legal':
    case 'insurance':
    case 'tax':
    case 'expense':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'adjustment':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'other':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getPaymentStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'pending':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'failed':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'refunded':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const getTransactionTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'payment':
    case 'revenue':
      return '💰';
    case 'ad_spend':
    case 'marketing':
      return '📢';
    case 'refund':
      return '↩️';
    case 'fee':
    case 'commission':
    case 'bonus':
      return '💳';
    case 'salary':
      return '👥';
    case 'equipment':
      return '💻';
    case 'software':
      return '🔧';
    case 'travel':
      return '✈️';
    case 'office':
      return '🏢';
    case 'consulting':
      return '💼';
    case 'training':
      return '🎓';
    case 'legal':
      return '⚖️';
    case 'insurance':
      return '🛡️';
    case 'tax':
      return '📋';
    case 'expense':
      return '💸';
    case 'adjustment':
      return '🔄';
    case 'other':
      return '📊';
    default:
      return '📊';
  }
};
