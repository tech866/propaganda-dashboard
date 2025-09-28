import { MetricsService, type MetricsFilters } from '../metricsService';
import { query } from '@/lib/database';

// Mock the database module
jest.mock('@/lib/database', () => ({
  query: jest.fn()
}));

const mockQuery = query as jest.MockedFunction<typeof query>;

describe('MetricsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MetricsService.clearCache();
  });

  describe('getMetrics', () => {
    it('should return metrics with caching', async () => {
      const mockCalls = [
        {
          id: '1',
          status: 'completed',
          outcome: 'won',
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          loss_reason_id: null
        }
      ];

      const mockLossReasons = [
        { id: 'reason-1', reason: 'Price too high' }
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: mockCalls })
        .mockResolvedValueOnce({ rows: mockLossReasons });

      const filters: MetricsFilters = { clientId: 'test-client' };
      
      // First call should hit database
      const result1 = await MetricsService.getMetrics(filters);
      
      // Second call should use cache
      const result2 = await MetricsService.getMetrics(filters);

      expect(result1).toEqual(result2);
      expect(mockQuery).toHaveBeenCalledTimes(2); // Once for calls, once for loss reasons
    });

    it('should bypass cache when useCache is false', async () => {
      const mockCalls = [
        {
          id: '1',
          status: 'completed',
          outcome: 'won',
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          loss_reason_id: null
        }
      ];

      const mockLossReasons = [
        { id: 'reason-1', reason: 'Price too high' }
      ];

      mockQuery
        .mockResolvedValue({ rows: mockCalls })
        .mockResolvedValue({ rows: mockLossReasons });

      const filters: MetricsFilters = { clientId: 'test-client' };
      
      // Both calls should hit database
      await MetricsService.getMetrics(filters, false);
      await MetricsService.getMetrics(filters, false);

      expect(mockQuery).toHaveBeenCalledTimes(4); // 2 calls × 2 queries each
    });
  });

  describe('getMetricsSummary', () => {
    it('should return comprehensive metrics summary', async () => {
      const mockCalls = [
        {
          id: '1',
          status: 'completed',
          outcome: 'won',
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          loss_reason_id: null
        }
      ];

      const mockLossReasons = [
        { id: 'reason-1', reason: 'Price too high' }
      ];

      const mockDurationData = {
        avg_duration: 30,
        no_show_count: '2',
        rescheduled_count: '1'
      };

      const mockLossReasonsData = [
        { reason: 'Price too high', count: '5' }
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: mockCalls })
        .mockResolvedValueOnce({ rows: mockLossReasons })
        .mockResolvedValueOnce({ rows: [mockDurationData] })
        .mockResolvedValueOnce({ rows: mockLossReasonsData });

      const filters: MetricsFilters = { clientId: 'test-client' };
      const summary = await MetricsService.getMetricsSummary(filters);

      expect(summary).toHaveProperty('totalCalls');
      expect(summary).toHaveProperty('completedCalls');
      expect(summary).toHaveProperty('wonCalls');
      expect(summary).toHaveProperty('lostCalls');
      expect(summary).toHaveProperty('noShowCalls');
      expect(summary).toHaveProperty('rescheduledCalls');
      expect(summary).toHaveProperty('showRate');
      expect(summary).toHaveProperty('closeRate');
      expect(summary).toHaveProperty('averageCallDuration');
      expect(summary).toHaveProperty('topLossReasons');
      expect(summary.topLossReasons).toBeInstanceOf(Array);
    });
  });

  describe('getMetricsComparison', () => {
    it('should compare metrics between two periods', async () => {
      const mockCalls = [
        {
          id: '1',
          status: 'completed',
          outcome: 'won',
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          loss_reason_id: null
        }
      ];

      const mockLossReasons = [
        { id: 'reason-1', reason: 'Price too high' }
      ];

      // Mock multiple calls for current and previous periods
      mockQuery
        .mockResolvedValue({ rows: mockCalls })
        .mockResolvedValue({ rows: mockLossReasons });

      const currentFilters: MetricsFilters = { 
        clientId: 'test-client',
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31'
      };
      
      const previousFilters: MetricsFilters = { 
        clientId: 'test-client',
        dateFrom: '2023-12-01',
        dateTo: '2023-12-31'
      };

      const comparison = await MetricsService.getMetricsComparison(
        currentFilters,
        previousFilters
      );

      expect(comparison).toHaveProperty('current');
      expect(comparison).toHaveProperty('previous');
      expect(comparison).toHaveProperty('change');
      expect(comparison.change).toHaveProperty('showRate');
      expect(comparison.change).toHaveProperty('closeRate');
      expect(comparison.change).toHaveProperty('totalCalls');
      expect(comparison.change).toHaveProperty('wonCalls');
    });
  });

  describe('getRealTimeMetrics', () => {
    it('should return real-time metrics for last 24 hours', async () => {
      const mockCalls = [
        {
          id: '1',
          status: 'completed',
          outcome: 'won',
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          loss_reason_id: null
        }
      ];

      const mockLossReasons = [
        { id: 'reason-1', reason: 'Price too high' }
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: mockCalls })
        .mockResolvedValueOnce({ rows: mockLossReasons });

      const realTimeMetrics = await MetricsService.getRealTimeMetrics('test-client', 'test-user');

      expect(realTimeMetrics).toHaveProperty('showRate');
      expect(realTimeMetrics).toHaveProperty('closeRate');
      expect(realTimeMetrics).toHaveProperty('totalCalls');
      expect(realTimeMetrics).toHaveProperty('wonCalls');
    });
  });

  describe('getWeeklyMetrics', () => {
    it('should return weekly metrics for last 7 days', async () => {
      const mockCalls = [
        {
          id: '1',
          status: 'completed',
          outcome: 'won',
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          loss_reason_id: null
        }
      ];

      const mockLossReasons = [
        { id: 'reason-1', reason: 'Price too high' }
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: mockCalls })
        .mockResolvedValueOnce({ rows: mockLossReasons });

      const weeklyMetrics = await MetricsService.getWeeklyMetrics('test-client', 'test-user');

      expect(weeklyMetrics).toHaveProperty('showRate');
      expect(weeklyMetrics).toHaveProperty('closeRate');
      expect(weeklyMetrics).toHaveProperty('totalCalls');
      expect(weeklyMetrics).toHaveProperty('wonCalls');
    });
  });

  describe('getMonthlyMetrics', () => {
    it('should return monthly metrics for last 30 days', async () => {
      const mockCalls = [
        {
          id: '1',
          status: 'completed',
          outcome: 'won',
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          loss_reason_id: null
        }
      ];

      const mockLossReasons = [
        { id: 'reason-1', reason: 'Price too high' }
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: mockCalls })
        .mockResolvedValueOnce({ rows: mockLossReasons });

      const monthlyMetrics = await MetricsService.getMonthlyMetrics('test-client', 'test-user');

      expect(monthlyMetrics).toHaveProperty('showRate');
      expect(monthlyMetrics).toHaveProperty('closeRate');
      expect(monthlyMetrics).toHaveProperty('totalCalls');
      expect(monthlyMetrics).toHaveProperty('wonCalls');
    });
  });

  describe('validateFilters', () => {
    it('should validate correct filters', () => {
      const validFilters: MetricsFilters = {
        clientId: '550e8400-e29b-41d4-a716-446655440001',
        userId: '550e8400-e29b-41d4-a716-446655440002',
        dateFrom: '2024-01-01T00:00:00Z',
        dateTo: '2024-01-31T23:59:59Z'
      };

      const result = MetricsService.validateFilters(validFilters);
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should reject invalid UUID format', () => {
      const invalidFilters: MetricsFilters = {
        clientId: 'invalid-uuid',
        userId: '550e8400-e29b-41d4-a716-446655440002'
      };

      const result = MetricsService.validateFilters(invalidFilters);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid clientId format');
    });

    it('should reject invalid date format', () => {
      const invalidFilters: MetricsFilters = {
        clientId: '550e8400-e29b-41d4-a716-446655440001',
        dateFrom: 'invalid-date'
      };

      const result = MetricsService.validateFilters(invalidFilters);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid dateFrom format');
    });

    it('should reject dateFrom after dateTo', () => {
      const invalidFilters: MetricsFilters = {
        clientId: '550e8400-e29b-41d4-a716-446655440001',
        dateFrom: '2024-01-31T00:00:00Z',
        dateTo: '2024-01-01T00:00:00Z'
      };

      const result = MetricsService.validateFilters(invalidFilters);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('dateFrom cannot be after dateTo');
    });
  });

  describe('clearCache', () => {
    it('should clear all cached metrics', async () => {
      const mockCalls = [
        {
          id: '1',
          status: 'completed',
          outcome: 'won',
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          loss_reason_id: null
        }
      ];

      const mockLossReasons = [
        { id: 'reason-1', reason: 'Price too high' }
      ];

      mockQuery
        .mockResolvedValueOnce({ rows: mockCalls })
        .mockResolvedValueOnce({ rows: mockLossReasons });

      const filters: MetricsFilters = { clientId: 'test-client' };
      
      // Cache some data
      await MetricsService.getMetrics(filters);
      
      // Clear cache
      MetricsService.clearCache();
      
      // Next call should hit database again
      await MetricsService.getMetrics(filters);

      expect(mockQuery).toHaveBeenCalledTimes(4); // 2 calls × 2 queries each
    });
  });
});
