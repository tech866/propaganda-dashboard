import { db } from '@/lib/database';

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
      // For now, return mock data - replace with actual database queries
      const mockData: PerformanceMetrics = {
        totalRevenue: 125000,
        totalAdSpend: 45000,
        totalProfit: 80000,
        roas: 2.78,
        conversionRate: 3.2,
        costPerLead: 45.50,
        leadValue: 1250.00,
        monthlyGrowth: 12.5
      };

      return mockData;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw new Error('Failed to fetch performance metrics');
    }
  }

  // Get trend data for charts
  async getTrendData(filters: PerformanceFilters): Promise<TrendData[]> {
    try {
      // Mock trend data - replace with actual database queries
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
      // Mock funnel data - replace with actual database queries
      const mockFunnelData: ConversionFunnelData[] = [
        { stage: 'Impressions', count: 100000, percentage: 100, dropOffRate: 0 },
        { stage: 'Clicks', count: 3500, percentage: 3.5, dropOffRate: 96.5 },
        { stage: 'Landing Page Views', count: 3200, percentage: 3.2, dropOffRate: 8.6 },
        { stage: 'Form Starts', count: 800, percentage: 0.8, dropOffRate: 75 },
        { stage: 'Form Completions', count: 240, percentage: 0.24, dropOffRate: 70 },
        { stage: 'Qualified Leads', count: 180, percentage: 0.18, dropOffRate: 25 },
        { stage: 'Conversions', count: 54, percentage: 0.054, dropOffRate: 70 }
      ];

      return mockFunnelData;
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
      // Mock breakdown data - replace with actual database queries
      const mockBreakdownData: PerformanceBreakdown[] = [
        {
          id: '1',
          name: dimension === 'client' ? 'Acme Corp' : dimension === 'user' ? 'John Smith' : dimension === 'campaign' ? 'Q1 Lead Gen' : 'January 2024',
          revenue: 25000,
          adSpend: 9000,
          profit: 16000,
          roas: 2.78,
          conversions: 45,
          conversionRate: 3.2,
          trend: 'up'
        },
        {
          id: '2',
          name: dimension === 'client' ? 'TechStart Inc' : dimension === 'user' ? 'Sarah Johnson' : dimension === 'campaign' ? 'Brand Awareness' : 'February 2024',
          revenue: 18000,
          adSpend: 6500,
          profit: 11500,
          roas: 2.77,
          conversions: 32,
          conversionRate: 2.8,
          trend: 'stable'
        },
        {
          id: '3',
          name: dimension === 'client' ? 'Global Solutions' : dimension === 'user' ? 'Mike Chen' : dimension === 'campaign' ? 'Retargeting' : 'March 2024',
          revenue: 22000,
          adSpend: 8000,
          profit: 14000,
          roas: 2.75,
          conversions: 38,
          conversionRate: 3.1,
          trend: 'down'
        }
      ];

      return mockBreakdownData;
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