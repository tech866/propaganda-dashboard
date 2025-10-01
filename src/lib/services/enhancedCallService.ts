import { db } from './databaseService';
import { User } from '@/middleware/auth';

// Enhanced interfaces for the new call logging system
export interface EnhancedCall {
  id: string;
  client_id: string;
  user_id: string;
  prospect_name: string;
  prospect_email?: string;
  prospect_phone?: string;
  company_name?: string;
  closer_first_name?: string;
  closer_last_name?: string;
  source?: 'sdr_call' | 'non_sdr_booked';
  traffic_source?: 'organic' | 'paid_ads';
  call_type: 'inbound' | 'outbound';
  status: 'completed' | 'no-show' | 'rescheduled';
  outcome: 'won' | 'lost' | 'tbd';
  enhanced_outcome?: 'no_show' | 'no_close' | 'canceled' | 'disqualified' | 'rescheduled' | 'payment_plan_deposit' | 'close_paid_in_full' | 'follow_call_scheduled';
  loss_reason_id?: string;
  offer_pitched?: string;
  setter_first_name?: string;
  setter_last_name?: string;
  cash_collected_upfront?: number;
  total_amount_owed?: number;
  payment_installments?: number;
  payment_completion_status?: 'pending' | 'in_progress' | 'completed';
  crm_updated?: boolean;
  prospect_notes?: string;
  notes?: string;
  call_duration?: number;
  scheduled_at?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEnhancedCallData {
  client_id: string;
  prospect_name: string;
  prospect_email?: string;
  prospect_phone?: string;
  company_name?: string;
  closer_first_name?: string;
  closer_last_name?: string;
  source?: 'sdr_call' | 'non_sdr_booked';
  traffic_source?: 'organic' | 'paid_ads';
  call_type: 'inbound' | 'outbound';
  status: 'completed' | 'no-show' | 'rescheduled';
  outcome: 'won' | 'lost' | 'tbd';
  enhanced_outcome?: 'no_show' | 'no_close' | 'canceled' | 'disqualified' | 'rescheduled' | 'payment_plan_deposit' | 'close_paid_in_full' | 'follow_call_scheduled';
  loss_reason_id?: string;
  offer_pitched?: string;
  setter_first_name?: string;
  setter_last_name?: string;
  cash_collected_upfront?: number;
  total_amount_owed?: number;
  payment_installments?: number;
  payment_completion_status?: 'pending' | 'in_progress' | 'completed';
  crm_updated?: boolean;
  prospect_notes?: string;
  notes?: string;
  call_duration?: number;
  scheduled_at?: Date;
  completed_at?: Date;
  payment_schedule?: PaymentScheduleData[];
}

export interface PaymentScheduleData {
  installment_number: number;
  amount_due: number;
  due_date: Date;
}

export interface AdSpendData {
  id?: string;
  client_id: string;
  campaign_name?: string;
  platform: 'meta' | 'google' | 'other';
  spend_amount: number;
  date_from: Date;
  date_to: Date;
  clicks?: number;
  impressions?: number;
  source: 'manual' | 'api';
  meta_campaign_id?: string;
}

export interface CallAnalytics {
  total_calls: number;
  total_shows: number;
  total_closes: number;
  paid_ads_calls: number;
  organic_calls: number;
  total_cash_collected: number;
  total_revenue: number;
  show_rate_percentage: number;
  close_rate_percentage: number;
  roas?: number; // Return on Ad Spend
  cost_per_acquisition?: number;
  revenue_per_lead?: number;
}

export class EnhancedCallService {
  // Create a new enhanced call with payment schedule
  static async createEnhancedCall(callData: CreateEnhancedCallData, user: User): Promise<EnhancedCall> {
    try {
      // First, create the call record using the existing sales_calls table
      const callResult = await db.insert('sales_calls', {
        client_id: callData.client_id,
        prospect_name: callData.prospect_name,
        prospect_email: callData.prospect_email,
        prospect_phone: callData.prospect_phone,
        company_name: callData.company_name,
        closer_first_name: callData.closer_first_name || user.firstName,
        closer_last_name: callData.closer_last_name || user.lastName,
        source: callData.source,
        traffic_source: callData.traffic_source,
        enhanced_outcome: callData.enhanced_outcome,
        offer_pitched: callData.offer_pitched,
        setter_first_name: callData.setter_first_name,
        setter_last_name: callData.setter_last_name,
        cash_collected_upfront: callData.cash_collected_upfront || 0,
        total_amount_owed: callData.total_amount_owed || 0,
        payment_installments: callData.payment_installments || 1,
        payment_completion_status: callData.payment_completion_status || 'pending',
        crm_updated: callData.crm_updated || false,
        prospect_notes: callData.prospect_notes,
        notes: callData.notes,
        duration: callData.call_duration,
        scheduled_date_time: callData.scheduled_at,
        call_outcome: callData.status === 'completed' ? 'completed' : 
                     callData.status === 'no-show' ? 'no-show' : 'scheduled',
      });

      if (callResult.error) {
        throw new Error(`Failed to create call: ${callResult.error.message}`);
      }

      const newCall = callResult.data as EnhancedCall;

      // Create payment schedule if provided
      if (callData.payment_schedule && callData.payment_schedule.length > 0) {
        const paymentScheduleData = callData.payment_schedule.map(schedule => ({
          sales_call_id: newCall.id,
          installment_number: schedule.installment_number,
          amount_due: schedule.amount_due,
          due_date: schedule.due_date,
          status: 'pending' as const,
        }));

        const paymentResult = await db.insertMany('payment_schedules', paymentScheduleData);
        if (paymentResult.error) {
          console.error('Failed to create payment schedule:', paymentResult.error);
          // Don't throw here as the call was created successfully
        }
      }

      return newCall;
    } catch (error) {
      console.error('Error creating enhanced call:', error);
      throw error;
    }
  }

  // Get enhanced calls with filtering
  static async getEnhancedCalls(
    user: User,
    filters: {
      clientId?: string;
      userId?: string;
      dateFrom?: Date;
      dateTo?: Date;
      trafficSource?: 'organic' | 'paid_ads';
      enhancedOutcome?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<EnhancedCall[]> {
    try {
      const queryFilters: any = {};

      // Multi-tenant filtering
      if (user.role !== 'ceo') {
        queryFilters.client_id = user.clientId;
      } else if (filters.clientId) {
        queryFilters.client_id = filters.clientId;
      }

      // User filtering
      if (user.role === 'sales') {
        queryFilters.user_id = user.id;
      } else if (filters.userId) {
        queryFilters.user_id = filters.userId;
      }

      // Additional filters
      if (filters.trafficSource) {
        queryFilters.traffic_source = filters.trafficSource;
      }
      if (filters.enhancedOutcome) {
        queryFilters.enhanced_outcome = filters.enhancedOutcome;
      }

      const result = await db.select('sales_calls', {
        filters: queryFilters,
        orderBy: { column: 'created_at', ascending: false },
        limit: filters.limit || 100,
        offset: filters.offset || 0,
      });

      if (result.error) {
        throw new Error(`Failed to fetch calls: ${result.error.message}`);
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching enhanced calls:', error);
      throw error;
    }
  }

  // Get call analytics
  static async getCallAnalytics(
    user: User,
    filters: {
      clientId?: string;
      userId?: string;
      dateFrom?: Date;
      dateTo?: Date;
    } = {}
  ): Promise<CallAnalytics> {
    try {
      // Build query filters
      const queryFilters: any = {};

      if (user.role !== 'ceo') {
        queryFilters.client_id = user.clientId;
      } else if (filters.clientId) {
        queryFilters.client_id = filters.clientId;
      }

      if (user.role === 'sales') {
        queryFilters.user_id = user.id;
      } else if (filters.userId) {
        queryFilters.user_id = filters.userId;
      }

      // Get call data
      const callsResult = await db.select('sales_calls', { filters: queryFilters });
      if (callsResult.error) {
        throw new Error(`Failed to fetch calls for analytics: ${callsResult.error.message}`);
      }

      const calls = callsResult.data || [];

      // Calculate analytics
      const totalCalls = calls.length;
      const totalShows = calls.filter(call => call.call_outcome === 'completed').length;
      const totalCloses = calls.filter(call => 
        call.enhanced_outcome === 'close_paid_in_full' || 
        call.enhanced_outcome === 'payment_plan_deposit'
      ).length;
      const paidAdsCalls = calls.filter(call => call.traffic_source === 'paid_ads').length;
      const organicCalls = calls.filter(call => call.traffic_source === 'organic').length;
      
      const totalCashCollected = calls.reduce((sum, call) => sum + (call.cash_collected_upfront || 0), 0);
      const totalRevenue = calls.reduce((sum, call) => sum + (call.total_amount_owed || 0), 0);

      const showRatePercentage = totalCalls > 0 ? (totalShows / totalCalls) * 100 : 0;
      const closeRatePercentage = totalShows > 0 ? (totalCloses / totalShows) * 100 : 0;

      // Get ad spend data for ROAS calculation
      const adSpendResult = await db.select('ad_spend', { 
        filters: { agency_id: queryFilters.client_id } 
      });
      
      let roas: number | undefined;
      let costPerAcquisition: number | undefined;
      let revenuePerLead: number | undefined;

      if (!adSpendResult.error && adSpendResult.data) {
        const totalAdSpend = adSpendResult.data.reduce((sum: number, ad: any) => sum + ad.spend_amount, 0);
        const revenueFromPaidAds = calls
          .filter(call => call.traffic_source === 'paid_ads')
          .reduce((sum, call) => sum + (call.total_amount_owed || 0), 0);

        roas = totalAdSpend > 0 ? revenueFromPaidAds / totalAdSpend : undefined;
        costPerAcquisition = paidAdsCalls > 0 ? totalAdSpend / paidAdsCalls : undefined;
        revenuePerLead = totalCalls > 0 ? totalRevenue / totalCalls : undefined;
      }

      return {
        total_calls: totalCalls,
        total_shows: totalShows,
        total_closes: totalCloses,
        paid_ads_calls: paidAdsCalls,
        organic_calls: organicCalls,
        total_cash_collected: totalCashCollected,
        total_revenue: totalRevenue,
        show_rate_percentage: Math.round(showRatePercentage * 100) / 100,
        close_rate_percentage: Math.round(closeRatePercentage * 100) / 100,
        roas,
        cost_per_acquisition: costPerAcquisition ? Math.round(costPerAcquisition * 100) / 100 : undefined,
        revenue_per_lead: revenuePerLead ? Math.round(revenuePerLead * 100) / 100 : undefined,
      };
    } catch (error) {
      console.error('Error calculating call analytics:', error);
      throw error;
    }
  }

  // Add ad spend data
  static async addAdSpend(adSpendData: AdSpendData, user: User): Promise<AdSpendData> {
    try {
      const result = await db.insert('ad_spend', {
        agency_id: user.clientId, // Using clientId as agency_id for multi-tenancy
        campaign_name: adSpendData.campaign_name,
        platform: adSpendData.platform,
        spend_amount: adSpendData.spend_amount,
        date_from: adSpendData.date_from,
        date_to: adSpendData.date_to,
        clicks: adSpendData.clicks,
        impressions: adSpendData.impressions,
        source: adSpendData.source,
        meta_campaign_id: adSpendData.meta_campaign_id,
      });

      if (result.error) {
        throw new Error(`Failed to add ad spend: ${result.error.message}`);
      }

      return result.data as AdSpendData;
    } catch (error) {
      console.error('Error adding ad spend:', error);
      throw error;
    }
  }

  // Get ad spend data
  static async getAdSpend(
    user: User,
    filters: {
      clientId?: string;
      dateFrom?: Date;
      dateTo?: Date;
      platform?: string;
    } = {}
  ): Promise<AdSpendData[]> {
    try {
      const queryFilters: any = {};

      if (user.role !== 'ceo') {
        queryFilters.agency_id = user.clientId;
      } else if (filters.clientId) {
        queryFilters.agency_id = filters.clientId;
      }

      if (filters.platform) {
        queryFilters.platform = filters.platform;
      }

      const result = await db.select('ad_spend', {
        filters: queryFilters,
        orderBy: { column: 'date_from', ascending: false },
      });

      if (result.error) {
        throw new Error(`Failed to fetch ad spend: ${result.error.message}`);
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching ad spend:', error);
      throw error;
    }
  }

  // Get offers for a client
  static async getOffers(user: User): Promise<any[]> {
    try {
      const queryFilters: any = { is_active: true };

      if (user.role !== 'ceo') {
        queryFilters.agency_id = user.clientId;
      }

      const result = await db.select('offers', { filters: queryFilters });
      if (result.error) {
        throw new Error(`Failed to fetch offers: ${result.error.message}`);
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching offers:', error);
      throw error;
    }
  }

  // Get setters for a client
  static async getSetters(user: User): Promise<any[]> {
    try {
      const queryFilters: any = { is_active: true };

      if (user.role !== 'ceo') {
        queryFilters.agency_id = user.clientId;
      }

      const result = await db.select('setters', { filters: queryFilters });
      if (result.error) {
        throw new Error(`Failed to fetch setters: ${result.error.message}`);
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching setters:', error);
      throw error;
    }
  }

  // Get payment schedules for a call
  static async getPaymentSchedules(callId: string, user: User): Promise<any[]> {
    try {
      // First verify the call exists and user has access
      const callResult = await db.select('sales_calls', {
        filters: { id: callId },
        limit: 1,
      });

      if (callResult.error || !callResult.data || callResult.data.length === 0) {
        throw new Error('Call not found');
      }

      const call = callResult.data[0];

      // Check access permissions
      if (user.role !== 'ceo' && call.client_id !== user.clientId) {
        throw new Error('Access denied');
      }

      if (user.role === 'sales' && call.user_id !== user.id) {
        throw new Error('Access denied');
      }

      const result = await db.select('payment_schedules', {
        filters: { sales_call_id: callId },
        orderBy: { column: 'installment_number', ascending: true },
      });

      if (result.error) {
        throw new Error(`Failed to fetch payment schedules: ${result.error.message}`);
      }

      return result.data || [];
    } catch (error) {
      console.error('Error fetching payment schedules:', error);
      throw error;
    }
  }
}
