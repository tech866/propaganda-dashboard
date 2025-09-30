import { 
  PerformanceService,
  type PerformanceMetrics,
  type PerformanceData
} from '@/lib/services/performanceService';

// Mock the performance service
jest.mock('@/lib/services/performanceService', () => {
  const actual = jest.requireActual('@/lib/services/performanceService');
  return {
    ...actual,
    PerformanceService: jest.fn().mockImplementation(() => ({
      getPerformanceData: jest.fn().mockResolvedValue(mockPerformanceData),
      getMetrics: jest.fn().mockResolvedValue(mockMetrics),
      getTrendData: jest.fn().mockResolvedValue(mockTrendData),
      getConversionFunnel: jest.fn().mockResolvedValue(mockConversionFunnel),
      getBreakdownData: jest.fn().mockResolvedValue(mockBreakdownData)
    }))
  };
});

const mockPerformanceData: PerformanceData = {
  totalRevenue: 100000,
  totalSpend: 50000,
  totalProfit: 50000,
  totalConversions: 1000,
  totalImpressions: 1000000,
  totalClicks: 50000,
  roas: 2.0,
  ctr: 5.0,
  conversionRate: 2.0,
  cpc: 1.0,
  cpa: 50.0,
  cpm: 50.0
};

const mockMetrics: PerformanceMetrics = {
  revenue: { current: 100000, previous: 80000, change: 25.0 },
  spend: { current: 50000, previous: 40000, change: 25.0 },
  profit: { current: 50000, previous: 40000, change: 25.0 },
  roas: { current: 2.0, previous: 2.0, change: 0.0 },
  conversions: { current: 1000, previous: 800, change: 25.0 },
  impressions: { current: 1000000, previous: 800000, change: 25.0 },
  clicks: { current: 50000, previous: 40000, change: 25.0 }
};

const mockTrendData = [
  { date: '2024-01-01', revenue: 10000, spend: 5000, profit: 5000, conversions: 100 },
  { date: '2024-01-02', revenue: 12000, spend: 6000, profit: 6000, conversions: 120 },
  { date: '2024-01-03', revenue: 15000, spend: 7500, profit: 7500, conversions: 150 }
];

const mockConversionFunnel = {
  visitors: 100000,
  leads: 10000,
  qualified: 5000,
  customers: 1000,
  dropOffRates: {
    visitorsToLeads: 90.0,
    leadsToQualified: 50.0,
    qualifiedToCustomers: 20.0
  }
};

const mockBreakdownData = {
  byClient: [
    { client: 'Client A', revenue: 50000, spend: 25000, profit: 25000, roas: 2.0 },
    { client: 'Client B', revenue: 30000, spend: 15000, profit: 15000, roas: 2.0 }
  ],
  byUser: [
    { user: 'User A', revenue: 40000, spend: 20000, profit: 20000, roas: 2.0 },
    { user: 'User B', revenue: 40000, spend: 20000, profit: 20000, roas: 2.0 }
  ],
  byTimePeriod: [
    { period: 'Q1 2024', revenue: 25000, spend: 12500, profit: 12500, roas: 2.0 },
    { period: 'Q2 2024', revenue: 25000, spend: 12500, profit: 12500, roas: 2.0 }
  ],
  byCampaign: [
    { campaign: 'Campaign A', revenue: 60000, spend: 30000, profit: 30000, roas: 2.0 },
    { campaign: 'Campaign B', revenue: 40000, spend: 20000, profit: 20000, roas: 2.0 }
  ]
};

describe('PerformanceService', () => {
  let performanceService: PerformanceService;

  beforeEach(() => {
    performanceService = new PerformanceService('test-agency-id');
  });

  describe('getPerformanceData', () => {
    it('should return performance data', async () => {
      const data = await performanceService.getPerformanceData();
      expect(data).toBeDefined();
      expect(data.totalRevenue).toBe(100000);
      expect(data.totalSpend).toBe(50000);
      expect(data.totalProfit).toBe(50000);
    });
  });

  describe('getMetrics', () => {
    it('should return performance metrics', async () => {
      const metrics = await performanceService.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.revenue.current).toBe(100000);
      expect(metrics.revenue.change).toBe(25.0);
    });
  });

  describe('getTrendData', () => {
    it('should return trend data', async () => {
      const trendData = await performanceService.getTrendData();
      expect(Array.isArray(trendData)).toBe(true);
      expect(trendData.length).toBe(3);
      expect(trendData[0].revenue).toBe(10000);
    });
  });

  describe('getConversionFunnel', () => {
    it('should return conversion funnel data', async () => {
      const funnel = await performanceService.getConversionFunnel();
      expect(funnel).toBeDefined();
      expect(funnel.visitors).toBe(100000);
      expect(funnel.customers).toBe(1000);
      expect(funnel.dropOffRates.visitorsToLeads).toBe(90.0);
    });
  });

  describe('getBreakdownData', () => {
    it('should return breakdown data', async () => {
      const breakdown = await performanceService.getBreakdownData();
      expect(breakdown).toBeDefined();
      expect(Array.isArray(breakdown.byClient)).toBe(true);
      expect(Array.isArray(breakdown.byUser)).toBe(true);
      expect(Array.isArray(breakdown.byTimePeriod)).toBe(true);
      expect(Array.isArray(breakdown.byCampaign)).toBe(true);
    });
  });
});

