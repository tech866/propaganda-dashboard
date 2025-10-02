import { supabase } from '@/lib/supabase';
import { 
  calculateEnhancedMetrics,
  calculateEnhancedMetricsForDateRange,
  validateEnhancedCallData,
  type EnhancedCallData,
  type EnhancedCalculationResult
} from '@/lib/calculations/enhancedMetricsCalculations';

export interface EnhancedMetricsFilters {
  clientId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  adSpend?: number; // For ROAS calculation
}

export interface EnhancedMetricsCache {
  data: EnhancedCalculationResult;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// Simple in-memory cache for enhanced metrics (in production, use Redis or similar)
const enhancedMetricsCache = new Map<string, EnhancedMetricsCache>();

export class EnhancedMetricsService {
  // Cache TTL in milliseconds (5 minutes)
  private static readonly CACHE_TTL = 5 * 60 * 1000;

  /**
   * Generate cache key for enhanced metrics
   */
  private static generateCacheKey(filters: EnhancedMetricsFilters): string {
    return JSON.stringify(filters);
  }

  /**
   * Get cached enhanced metrics if available and not expired
   */
  private static getCachedMetrics(cacheKey: string): EnhancedCalculationResult | null {
    const cached = enhancedMetricsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    if (cached) {
      enhancedMetricsCache.delete(cacheKey);
    }
    return null;
  }

  /**
   * Cache enhanced metrics data
   */
  private static setCachedMetrics(cacheKey: string, data: EnhancedCalculationResult): void {
    enhancedMetricsCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL
    });
  }

  /**
   * Clear all cached enhanced metrics
   */
  static clearCache(): void {
    enhancedMetricsCache.clear();
  }

  /**
   * Get comprehensive enhanced metrics for a client or user
   */
  static async getEnhancedMetrics(filters: EnhancedMetricsFilters, useCache: boolean = true): Promise<EnhancedCalculationResult> {
    const cacheKey = this.generateCacheKey(filters);
    
    // Check cache first
    if (useCache) {
      const cached = this.getCachedMetrics(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const { clientId, userId, dateFrom, dateTo, adSpend = 0 } = filters;

    // Get enhanced call data with all new fields using Supabase
    let callsQuery = supabase
      .from('calls')
      .select(`
        id,
        status,
        outcome,
        created_at,
        completed_at,
        loss_reason_id,
        closer_first_name,
        closer_last_name,
        source_of_set_appointment,
        enhanced_call_outcome,
        initial_payment_collected_on,
        customer_full_name,
        customer_email,
        calls_taken,
        setter_first_name,
        setter_last_name,
        cash_collected_upfront,
        total_amount_owed,
        prospect_notes,
        lead_source
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (clientId) {
      callsQuery = callsQuery.eq('client_id', clientId);
    }
    if (userId) {
      callsQuery = callsQuery.eq('user_id', userId);
    }
    if (dateFrom) {
      callsQuery = callsQuery.gte('created_at', dateFrom);
    }
    if (dateTo) {
      callsQuery = callsQuery.lte('created_at', dateTo);
    }

    const { data: callsResult, error: callsError } = await callsQuery;
    
    if (callsError) {
      throw new Error(`Failed to fetch calls: ${callsError.message}`);
    }
    const calls: EnhancedCallData[] = (callsResult || []).map(row => ({
      id: row.id,
      status: row.status,
      outcome: row.outcome,
      created_at: row.created_at,
      completed_at: row.completed_at,
      loss_reason_id: row.loss_reason_id,
      closer_first_name: row.closer_first_name,
      closer_last_name: row.closer_last_name,
      source_of_set_appointment: row.source_of_set_appointment,
      enhanced_call_outcome: row.enhanced_call_outcome,
      initial_payment_collected_on: row.initial_payment_collected_on,
      customer_full_name: row.customer_full_name,
      customer_email: row.customer_email,
      calls_taken: row.calls_taken,
      setter_first_name: row.setter_first_name,
      setter_last_name: row.setter_last_name,
      cash_collected_upfront: row.cash_collected_upfront,
      total_amount_owed: row.total_amount_owed,
      prospect_notes: row.prospect_notes,
      lead_source: row.lead_source
    }));

    // Use enhanced calculation functions to compute metrics
    const metrics = calculateEnhancedMetrics(calls, adSpend);
    
    // Cache the results
    this.setCachedMetrics(cacheKey, metrics);
    
    return metrics;
  }

  /**
   * Get enhanced metrics for a specific date range
   */
  static async getEnhancedMetricsByDateRange(
    clientId: string, 
    dateFrom: string, 
    dateTo: string,
    adSpend: number = 0
  ): Promise<EnhancedCalculationResult> {
    return this.getEnhancedMetrics({ clientId, dateFrom, dateTo, adSpend });
  }

  /**
   * Get enhanced metrics for a specific user
   */
  static async getEnhancedMetricsByUser(userId: string, clientId?: string, adSpend: number = 0): Promise<EnhancedCalculationResult> {
    return this.getEnhancedMetrics({ userId, clientId, adSpend });
  }

  /**
   * Get agency-wide enhanced metrics (CEO view)
   */
  static async getAgencyEnhancedMetrics(dateFrom?: string, dateTo?: string, adSpend: number = 0): Promise<EnhancedCalculationResult> {
    return this.getEnhancedMetrics({ dateFrom, dateTo, adSpend });
  }

  /**
   * Get real-time enhanced metrics (last 24 hours)
   */
  static async getRealTimeEnhancedMetrics(clientId?: string, userId?: string, adSpend: number = 0): Promise<EnhancedCalculationResult> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return this.getEnhancedMetrics({
      clientId,
      userId,
      dateFrom: yesterday.toISOString(),
      dateTo: now.toISOString(),
      adSpend
    }, false); // Don't use cache for real-time data
  }

  /**
   * Get weekly enhanced metrics summary
   */
  static async getWeeklyEnhancedMetrics(clientId?: string, userId?: string, adSpend: number = 0): Promise<EnhancedCalculationResult> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return this.getEnhancedMetrics({
      clientId,
      userId,
      dateFrom: weekAgo.toISOString(),
      dateTo: now.toISOString(),
      adSpend
    });
  }

  /**
   * Get monthly enhanced metrics summary
   */
  static async getMonthlyEnhancedMetrics(clientId?: string, userId?: string, adSpend: number = 0): Promise<EnhancedCalculationResult> {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return this.getEnhancedMetrics({
      clientId,
      userId,
      dateFrom: monthAgo.toISOString(),
      dateTo: now.toISOString(),
      adSpend
    });
  }

  /**
   * Get enhanced metrics comparison between two time periods
   */
  static async getEnhancedMetricsComparison(
    filters: EnhancedMetricsFilters,
    previousFilters: EnhancedMetricsFilters
  ): Promise<{
    current: EnhancedCalculationResult;
    previous: EnhancedCalculationResult;
    change: {
      showRate: number;
      closeRate: number;
      enhancedCloseRate: number;
      averageOrderValue: number;
      totalRevenue: number;
      roas?: number;
    };
  }> {
    const [current, previous] = await Promise.all([
      this.getEnhancedMetrics(filters),
      this.getEnhancedMetrics(previousFilters)
    ]);

    const change = {
      showRate: current.showRate.percentage - previous.showRate.percentage,
      closeRate: current.closeRate.percentage - previous.closeRate.percentage,
      enhancedCloseRate: current.enhancedCloseRate.percentage - previous.enhancedCloseRate.percentage,
      averageOrderValue: current.revenue.averageOrderValue - previous.revenue.averageOrderValue,
      totalRevenue: current.revenue.totalRevenue - previous.revenue.totalRevenue,
      roas: current.roas && previous.roas ? current.roas.roas - previous.roas.roas : undefined
    };

    return {
      current,
      previous,
      change
    };
  }

  /**
   * Get lead source performance breakdown
   */
  static async getLeadSourcePerformance(
    clientId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<{
    organic: {
      calls: number;
      shows: number;
      closes: number;
      revenue: number;
      showRate: number;
      closeRate: number;
    };
    ads: {
      calls: number;
      shows: number;
      closes: number;
      revenue: number;
      showRate: number;
      closeRate: number;
    };
  }> {
    const metrics = await this.getEnhancedMetrics({ clientId, dateFrom, dateTo });
    return metrics.leadSourcePerformance;
  }

  /**
   * Get team performance breakdown
   */
  static async getTeamPerformance(
    clientId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<{
    closers: Array<{
      name: string;
      calls: number;
      shows: number;
      closes: number;
      revenue: number;
      showRate: number;
      closeRate: number;
    }>;
    setters: Array<{
      name: string;
      appointments: number;
      shows: number;
      closes: number;
      showRate: number;
      closeRate: number;
    }>;
  }> {
    const metrics = await this.getEnhancedMetrics({ clientId, dateFrom, dateTo });
    return metrics.teamPerformance;
  }

  /**
   * Get revenue metrics breakdown
   */
  static async getRevenueMetrics(
    clientId: string,
    dateFrom?: string,
    dateTo?: string
  ): Promise<{
    totalCashCollected: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalDeals: number;
  }> {
    const metrics = await this.getEnhancedMetrics({ clientId, dateFrom, dateTo });
    return metrics.revenue;
  }

  /**
   * Get ROAS metrics (requires ad spend)
   */
  static async getROASMetrics(
    clientId: string,
    adSpend: number,
    dateFrom?: string,
    dateTo?: string
  ): Promise<{
    totalAdSpend: number;
    totalRevenue: number;
    roas: number;
  } | null> {
    const metrics = await this.getEnhancedMetrics({ clientId, dateFrom, dateTo, adSpend });
    return metrics.roas || null;
  }

  /**
   * Validate enhanced metrics filters
   */
  static validateFilters(filters: EnhancedMetricsFilters): { isValid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (filters.clientId && !this.isValidUUID(filters.clientId)) {
      errors.push('Invalid clientId format');
    }

    if (filters.userId && !this.isValidUUID(filters.userId)) {
      errors.push('Invalid userId format');
    }

    if (filters.dateFrom && isNaN(Date.parse(filters.dateFrom))) {
      errors.push('Invalid dateFrom format');
    }

    if (filters.dateTo && isNaN(Date.parse(filters.dateTo))) {
      errors.push('Invalid dateTo format');
    }

    if (filters.dateFrom && filters.dateTo && 
        new Date(filters.dateFrom) > new Date(filters.dateTo)) {
      errors.push('dateFrom cannot be after dateTo');
    }

    if (filters.adSpend !== undefined && (typeof filters.adSpend !== 'number' || filters.adSpend < 0)) {
      errors.push('Ad spend must be a non-negative number');
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Helper method to validate UUID format
   */
  private static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
