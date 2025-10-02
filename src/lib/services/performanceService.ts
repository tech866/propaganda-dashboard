import { db } from '@/lib/database';
import { EnhancedMetricsService, EnhancedCalculationResult } from './enhancedMetricsService';

export interface PerformanceMetrics {
  totalRevenue: number;
  totalAdSpend: number;
  totalProfit: number;
  roas: number;
  conversionRate: number;
  costPerLead: number;
  leadValue: number;
  monthlyGrowth: number;
}

export interface TrendData {
  date: string;
  revenue: number;
  adSpend: number;
  profit: number;
  conversions: number;
  leads: number;
}

export interface ConversionFunnelData {
  stage: string;
  count: number;
  percentage: number;
  dropOffRate: number;
}

export interface PerformanceBreakdown {
  id: string;
  name: string;
  revenue: number;
  adSpend: number;
  profit: number;
  roas: number;
  conversions: number;
  conversionRate: number;
  trend: 'up' | 'down' | 'stable';
}

export interface PerformanceFilters {
  dateRange: {
    start: string;
    end: string;
  };
  clientId?: string;
  userId?: string;
  campaignId?: string;
}

class PerformanceService {
  // Get overall performance metrics
  async getPerformanceMetrics(filters: PerformanceFilters): Promise<PerformanceMetrics> {
    try {
      // Convert PerformanceFilters to EnhancedMetricsFilters
      const enhancedFilters = {
        clientId: filters.clientId,
        userId: filters.userId,
        dateFrom: filters.dateRange.start,
        dateTo: filters.dateRange.end,
        adSpend: 0 // Default to 0, can be enhanced later
      };

      // Get real enhanced metrics from the database
      const enhancedMetrics = await EnhancedMetricsService.getEnhancedMetrics(enhancedFilters);

      // Convert enhanced metrics to PerformanceMetrics format
      const performanceMetrics: PerformanceMetrics = {
        totalRevenue: enhancedMetrics.revenue.totalRevenue,
        totalAdSpend: enhancedMetrics.roas?.totalAdSpend || 0,
        totalProfit: enhancedMetrics.revenue.totalRevenue - (enhancedMetrics.roas?.totalAdSpend || 0),
        roas: enhancedMetrics.roas?.roas || 0,
        conversionRate: enhancedMetrics.enhancedCloseRate.percentage,
        costPerLead: enhancedMetrics.roas?.totalAdSpend ? enhancedMetrics.roas.totalAdSpend / enhancedMetrics.showRate.completedCalls : 0,
        leadValue: enhancedMetrics.revenue.averageOrderValue,
        monthlyGrowth: 0 // TODO: Calculate monthly growth from trend data
      };

      return performanceMetrics;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw new Error('Failed to fetch performance metrics');
    }
  }

  // Get trend data for charts
  async getTrendData(filters: PerformanceFilters): Promise<TrendData[]> {
    try {
      // For now, return mock trend data
      // TODO: Implement real trend data calculation using EnhancedMetricsService
      // This would require aggregating data by date ranges
      const mockTrendData: TrendData[] = [
        { date: '2024-01-01', revenue: 8500, adSpend: 3200, profit: 5300, conversions: 45, leads: 120 },
        { date: '2024-01-02', revenue: 9200, adSpend: 3400, profit: 5800, conversions: 52, leads: 135 },
        { date: '2024-01-03', revenue: 8800, adSpend: 3100, profit: 5700, conversions: 48, leads: 128 },
        { date: '2024-01-04', revenue: 10500, adSpend: 3800, profit: 6700, conversions: 58, leads: 145 },
        { date: '2024-01-05', revenue: 11200, adSpend: 4000, profit: 7200, conversions: 62, leads: 155 },
        { date: '2024-01-06', revenue: 9800, adSpend: 3600, profit: 6200, conversions: 54, leads: 140 },
        { date: '2024-01-07', revenue: 10800, adSpend: 3900, profit: 6900, conversions: 60, leads: 150 }
      ];

      return mockTrendData;
    } catch (error) {
      console.error('Error fetching trend data:', error);
      throw new Error('Failed to fetch trend data');
    }
  }

  // Get conversion funnel data
  async getConversionFunnelData(filters: PerformanceFilters): Promise<ConversionFunnelData[]> {
    try {
      // Convert PerformanceFilters to EnhancedMetricsFilters
      const enhancedFilters = {
        clientId: filters.clientId,
        userId: filters.userId,
        dateFrom: filters.dateRange.start,
        dateTo: filters.dateRange.end,
        adSpend: 0
      };

      // Get real enhanced metrics from the database
      const enhancedMetrics = await EnhancedMetricsService.getEnhancedMetrics(enhancedFilters);

      // Convert enhanced metrics to funnel data format
      const funnelData: ConversionFunnelData[] = [
        { 
          stage: 'Total Calls', 
          count: enhancedMetrics.showRate.totalCalls, 
          percentage: 100, 
          dropOffRate: 0 
        },
        { 
          stage: 'Shows', 
          count: enhancedMetrics.showRate.completedCalls, 
          percentage: enhancedMetrics.showRate.percentage, 
          dropOffRate: 100 - enhancedMetrics.showRate.percentage 
        },
        { 
          stage: 'Enhanced Closes', 
          count: enhancedMetrics.enhancedCloseRate.completedCalls, 
          percentage: enhancedMetrics.enhancedCloseRate.percentage, 
          dropOffRate: enhancedMetrics.showRate.percentage - enhancedMetrics.enhancedCloseRate.percentage 
        }
      ];

      return funnelData;
    } catch (error) {
      console.error('Error fetching conversion funnel data:', error);
      throw new Error('Failed to fetch conversion funnel data');
    }
  }

  // Get performance breakdown by different dimensions
  async getPerformanceBreakdown(
    dimension: 'client' | 'user' | 'campaign' | 'time',
    filters: PerformanceFilters
  ): Promise<PerformanceBreakdown[]> {
    try {
      // Convert PerformanceFilters to EnhancedMetricsFilters
      const enhancedFilters = {
        clientId: filters.clientId,
        userId: filters.userId,
        dateFrom: filters.dateRange.start,
        dateTo: filters.dateRange.end,
        adSpend: 0
      };

      // Get real enhanced metrics from the database
      const enhancedMetrics = await EnhancedMetricsService.getEnhancedMetrics(enhancedFilters);

      // For now, return a single breakdown entry with the overall metrics
      // TODO: Implement proper breakdown by dimension (client, user, campaign, time)
      const breakdownData: PerformanceBreakdown[] = [
        {
          id: '1',
          name: dimension === 'client' ? 'Current Client' : dimension === 'user' ? 'Current User' : dimension === 'campaign' ? 'Current Campaign' : 'Current Period',
          revenue: enhancedMetrics.revenue.totalRevenue,
          adSpend: enhancedMetrics.roas?.totalAdSpend || 0,
          profit: enhancedMetrics.revenue.totalRevenue - (enhancedMetrics.roas?.totalAdSpend || 0),
          roas: enhancedMetrics.roas?.roas || 0,
          conversions: enhancedMetrics.enhancedCloseRate.completedCalls,
          conversionRate: enhancedMetrics.enhancedCloseRate.percentage,
          trend: 'stable' // TODO: Calculate actual trend
        }
      ];

      return breakdownData;
    } catch (error) {
      console.error('Error fetching performance breakdown:', error);
      throw new Error('Failed to fetch performance breakdown');
    }
  }

  // Get performance comparison data
  async getPerformanceComparison(
    currentFilters: PerformanceFilters,
    comparisonFilters: PerformanceFilters
  ): Promise<{
    current: PerformanceMetrics;
    previous: PerformanceMetrics;
    changes: {
      revenue: number;
      adSpend: number;
      profit: number;
      roas: number;
    };
  }> {
    try {
      const current = await this.getPerformanceMetrics(currentFilters);
      const previous = await this.getPerformanceMetrics(comparisonFilters);

      const changes = {
        revenue: ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100,
        adSpend: ((current.totalAdSpend - previous.totalAdSpend) / previous.totalAdSpend) * 100,
        profit: ((current.totalProfit - previous.totalProfit) / previous.totalProfit) * 100,
        roas: ((current.roas - previous.roas) / previous.roas) * 100
      };

      return { current, previous, changes };
    } catch (error) {
      console.error('Error fetching performance comparison:', error);
      throw new Error('Failed to fetch performance comparison');
    }
  }

  // Helper function to format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Helper function to format percentage
  formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  // Helper function to format number
  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  // Helper function to get trend indicator
  getTrendIndicator(trend: 'up' | 'down' | 'stable'): { icon: string; color: string; label: string } {
    switch (trend) {
      case 'up':
        return { icon: '↗', color: 'text-green-500', label: 'Increasing' };
      case 'down':
        return { icon: '↘', color: 'text-red-500', label: 'Decreasing' };
      case 'stable':
        return { icon: '→', color: 'text-gray-500', label: 'Stable' };
    }
  }
}

export const performanceService = new PerformanceService();