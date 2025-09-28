import { query } from '@/lib/database';
import { 
  calculateMetrics, 
  calculateMetricsForDateRange, 
  calculateMetricsTrend, 
  calculateUserPerformance,
  validateCallData,
  validateLossReasonData,
  type CallData,
  type LossReasonData,
  type CalculationResult
} from '@/lib/calculations/metricsCalculations';

export interface MetricsData extends CalculationResult {}

export interface MetricsFilters {
  clientId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface MetricsSummary {
  totalCalls: number;
  completedCalls: number;
  wonCalls: number;
  lostCalls: number;
  noShowCalls: number;
  rescheduledCalls: number;
  showRate: number;
  closeRate: number;
  averageCallDuration?: number;
  topLossReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
}

export interface MetricsComparison {
  current: MetricsData;
  previous: MetricsData;
  change: {
    showRate: number;
    closeRate: number;
    totalCalls: number;
    wonCalls: number;
  };
}

export interface MetricsCache {
  data: MetricsData;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// Simple in-memory cache for metrics (in production, use Redis or similar)
const metricsCache = new Map<string, MetricsCache>();

export class MetricsService {
  // Cache TTL in milliseconds (5 minutes)
  private static readonly CACHE_TTL = 5 * 60 * 1000;

  /**
   * Generate cache key for metrics
   */
  private static generateCacheKey(filters: MetricsFilters): string {
    return JSON.stringify(filters);
  }

  /**
   * Get cached metrics if available and not expired
   */
  private static getCachedMetrics(cacheKey: string): MetricsData | null {
    const cached = metricsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    if (cached) {
      metricsCache.delete(cacheKey);
    }
    return null;
  }

  /**
   * Cache metrics data
   */
  private static setCachedMetrics(cacheKey: string, data: MetricsData): void {
    metricsCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL
    });
  }

  /**
   * Clear all cached metrics
   */
  static clearCache(): void {
    metricsCache.clear();
  }

  /**
   * Get comprehensive metrics for a client or user
   */
  static async getMetrics(filters: MetricsFilters, useCache: boolean = true): Promise<MetricsData> {
    const cacheKey = this.generateCacheKey(filters);
    
    // Check cache first
    if (useCache) {
      const cached = this.getCachedMetrics(cacheKey);
      if (cached) {
        return cached;
      }
    }
    const { clientId, userId, dateFrom, dateTo } = filters;

    // Build WHERE clause based on filters
    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (clientId) {
      whereConditions.push(`c.client_id = $${paramIndex}`);
      queryParams.push(clientId);
      paramIndex++;
    }

    if (userId) {
      whereConditions.push(`c.user_id = $${paramIndex}`);
      queryParams.push(userId);
      paramIndex++;
    }

    if (dateFrom) {
      whereConditions.push(`c.created_at >= $${paramIndex}`);
      queryParams.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      whereConditions.push(`c.created_at <= $${paramIndex}`);
      queryParams.push(dateTo);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get call data
    const callsQuery = `
      SELECT 
        c.id,
        c.status,
        c.outcome,
        c.created_at,
        c.completed_at,
        c.loss_reason_id
      FROM calls c
      ${whereClause}
      ORDER BY c.created_at DESC
    `;

    const callsResult = await query(callsQuery, queryParams);
    const calls: CallData[] = callsResult.rows.map(row => ({
      id: row.id,
      status: row.status,
      outcome: row.outcome,
      created_at: row.created_at,
      completed_at: row.completed_at,
      loss_reason_id: row.loss_reason_id
    }));

    // Get loss reasons data
    const lossReasonsQuery = `
      SELECT id, name as reason
      FROM loss_reasons
      WHERE client_id = $1 AND is_active = true
    `;
    const lossReasonsResult = await query(lossReasonsQuery, [clientId]);
    const lossReasons: LossReasonData[] = lossReasonsResult.rows.map(row => ({
      id: row.id,
      reason: row.reason
    }));

    // Use calculation functions to compute metrics
    const metrics = calculateMetrics(calls, lossReasons);
    
    // Cache the results
    this.setCachedMetrics(cacheKey, metrics);
    
    return metrics;
  }

  /**
   * Get metrics for a specific date range
   */
  static async getMetricsByDateRange(
    clientId: string, 
    dateFrom: string, 
    dateTo: string
  ): Promise<MetricsData> {
    return this.getMetrics({ clientId, dateFrom, dateTo });
  }

  /**
   * Get metrics for a specific user
   */
  static async getMetricsByUser(userId: string, clientId?: string): Promise<MetricsData> {
    return this.getMetrics({ userId, clientId });
  }

  /**
   * Get agency-wide metrics (CEO view)
   */
  static async getAgencyMetrics(dateFrom?: string, dateTo?: string): Promise<MetricsData> {
    return this.getMetrics({ dateFrom, dateTo });
  }

  /**
   * Get performance comparison between users
   */
  static async getUserPerformanceComparison(clientId: string): Promise<Array<{
    userId: string;
    userName: string;
    showRate: number;
    closeRate: number;
    totalCalls: number;
    wonCalls: number;
  }>> {
    // Get all calls for the client
    const callsQuery = `
      SELECT 
        c.id,
        c.status,
        c.outcome,
        c.created_at,
        c.completed_at,
        c.loss_reason_id,
        c.user_id
      FROM calls c
      WHERE c.client_id = $1
      ORDER BY c.created_at DESC
    `;

    const callsResult = await query(callsQuery, [clientId]);
    const calls: (CallData & { user_id: string })[] = callsResult.rows.map(row => ({
      id: row.id,
      status: row.status,
      outcome: row.outcome,
      created_at: row.created_at,
      completed_at: row.completed_at,
      loss_reason_id: row.loss_reason_id,
      user_id: row.user_id
    }));

    // Get user information
    const usersQuery = `
      SELECT id, name
      FROM users
      WHERE client_id = $1
    `;
    const usersResult = await query(usersQuery, [clientId]);
    const userIds = usersResult.rows.map(row => row.id);

    // Calculate performance for each user using calculation functions
    const performanceData = calculateUserPerformance(calls, userIds);

    // Combine with user names
    return performanceData.map(perf => {
      const user = usersResult.rows.find(u => u.id === perf.userId);
      return {
        userId: perf.userId,
        userName: user?.name || 'Unknown User',
        showRate: perf.showRate,
        closeRate: perf.closeRate,
        totalCalls: perf.totalCalls,
        wonCalls: perf.wonCalls
      };
    });
  }

  /**
   * Get trend data for metrics over time
   */
  static async getMetricsTrend(
    clientId: string, 
    days: number = 30
  ): Promise<Array<{
    date: string;
    showRate: number;
    closeRate: number;
    totalCalls: number;
    completedCalls: number;
    wonCalls: number;
  }>> {
    // Get all calls for the client within the date range
    const callsQuery = `
      SELECT 
        c.id,
        c.status,
        c.outcome,
        c.created_at,
        c.completed_at,
        c.loss_reason_id
      FROM calls c
      WHERE c.client_id = $1 
        AND c.created_at >= CURRENT_DATE - INTERVAL '${days} days'
      ORDER BY c.created_at DESC
    `;

    const callsResult = await query(callsQuery, [clientId]);
    const calls: CallData[] = callsResult.rows.map(row => ({
      id: row.id,
      status: row.status,
      outcome: row.outcome,
      created_at: row.created_at,
      completed_at: row.completed_at,
      loss_reason_id: row.loss_reason_id
    }));

    // Get loss reasons data
    const lossReasonsQuery = `
      SELECT id, name as reason
      FROM loss_reasons
      WHERE client_id = $1 AND is_active = true
    `;
    const lossReasonsResult = await query(lossReasonsQuery, [clientId]);
    const lossReasons: LossReasonData[] = lossReasonsResult.rows.map(row => ({
      id: row.id,
      reason: row.reason
    }));

    // Use calculation function to compute trend data
    const trendData = calculateMetricsTrend(calls, lossReasons, days);
    
    return trendData;
  }

  /**
   * Get metrics summary with additional insights
   */
  static async getMetricsSummary(filters: MetricsFilters): Promise<MetricsSummary> {
    const metrics = await this.getMetrics(filters);
    
    // Get additional data for summary
    const { clientId, userId, dateFrom, dateTo } = filters;
    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (clientId) {
      whereConditions.push(`c.client_id = $${paramIndex}`);
      queryParams.push(clientId);
      paramIndex++;
    }

    if (userId) {
      whereConditions.push(`c.user_id = $${paramIndex}`);
      queryParams.push(userId);
      paramIndex++;
    }

    if (dateFrom) {
      whereConditions.push(`c.created_at >= $${paramIndex}`);
      queryParams.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      whereConditions.push(`c.created_at <= $${paramIndex}`);
      queryParams.push(dateTo);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get call duration data
    const durationQuery = `
      SELECT 
        AVG(c.call_duration) as avg_duration,
        COUNT(CASE WHEN c.status = 'no-show' THEN 1 END) as no_show_count,
        COUNT(CASE WHEN c.status = 'rescheduled' THEN 1 END) as rescheduled_count
      FROM calls c
      ${whereClause}
    `;

    const durationResult = await query(durationQuery, queryParams);
    const avgDuration = durationResult.rows[0]?.avg_duration || 0;
    const noShowCount = parseInt(durationResult.rows[0]?.no_show_count || '0');
    const rescheduledCount = parseInt(durationResult.rows[0]?.rescheduled_count || '0');

    // Get top loss reasons
    const lossReasonsQuery = `
      SELECT 
        lr.name as reason,
        COUNT(c.id) as count
      FROM calls c
      LEFT JOIN loss_reasons lr ON c.loss_reason_id = lr.id
      ${whereClause}
      AND c.outcome = 'lost'
      GROUP BY lr.name
      ORDER BY count DESC
      LIMIT 5
    `;

    const lossReasonsResult = await query(lossReasonsQuery, queryParams);
    const totalLostCalls = metrics.lostCalls;
    const topLossReasons = lossReasonsResult.rows.map(row => ({
      reason: row.reason || 'Unknown',
      count: parseInt(row.count),
      percentage: totalLostCalls > 0 ? (parseInt(row.count) / totalLostCalls) * 100 : 0
    }));

    return {
      totalCalls: metrics.totalCalls,
      completedCalls: metrics.showRate.completedCalls,
      wonCalls: metrics.wonCalls,
      lostCalls: metrics.lostCalls,
      noShowCalls: noShowCount,
      rescheduledCalls: rescheduledCount,
      showRate: metrics.showRate.percentage,
      closeRate: metrics.closeRate.percentage,
      averageCallDuration: avgDuration ? Math.round(avgDuration) : undefined,
      topLossReasons
    };
  }

  /**
   * Compare metrics between two time periods
   */
  static async getMetricsComparison(
    filters: MetricsFilters,
    previousFilters: MetricsFilters
  ): Promise<MetricsComparison> {
    const [current, previous] = await Promise.all([
      this.getMetrics(filters),
      this.getMetrics(previousFilters)
    ]);

    const change = {
      showRate: current.showRate.percentage - previous.showRate.percentage,
      closeRate: current.closeRate.percentage - previous.closeRate.percentage,
      totalCalls: current.totalCalls - previous.totalCalls,
      wonCalls: current.wonCalls - previous.wonCalls
    };

    return {
      current,
      previous,
      change
    };
  }

  /**
   * Get real-time metrics (last 24 hours)
   */
  static async getRealTimeMetrics(clientId?: string, userId?: string): Promise<MetricsData> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return this.getMetrics({
      clientId,
      userId,
      dateFrom: yesterday.toISOString(),
      dateTo: now.toISOString()
    }, false); // Don't use cache for real-time data
  }

  /**
   * Get weekly metrics summary
   */
  static async getWeeklyMetrics(clientId?: string, userId?: string): Promise<MetricsData> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return this.getMetrics({
      clientId,
      userId,
      dateFrom: weekAgo.toISOString(),
      dateTo: now.toISOString()
    });
  }

  /**
   * Get monthly metrics summary
   */
  static async getMonthlyMetrics(clientId?: string, userId?: string): Promise<MetricsData> {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return this.getMetrics({
      clientId,
      userId,
      dateFrom: monthAgo.toISOString(),
      dateTo: now.toISOString()
    });
  }

  /**
   * Get metrics for a specific date range with enhanced data
   */
  static async getMetricsForDateRange(
    clientId: string, 
    dateFrom: string, 
    dateTo: string
  ): Promise<MetricsData> {
    return this.getMetrics({ clientId, dateFrom, dateTo });
  }

  /**
   * Get metrics for a specific user with enhanced data
   */
  static async getMetricsByUser(userId: string, clientId?: string): Promise<MetricsData> {
    return this.getMetrics({ userId, clientId });
  }

  /**
   * Get agency-wide metrics (CEO view) with enhanced data
   */
  static async getAgencyMetrics(dateFrom?: string, dateTo?: string): Promise<MetricsData> {
    return this.getMetrics({ dateFrom, dateTo });
  }

  /**
   * Validate metrics filters
   */
  static validateFilters(filters: MetricsFilters): { isValid: boolean; errors?: string[] } {
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
