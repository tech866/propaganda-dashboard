import {
  calculateShowRate,
  calculateCloseRate,
  calculateCallOutcomes,
  calculateLossReasons,
  calculateMetrics,
  calculateMetricsForDateRange,
  calculateMetricsTrend,
  calculateUserPerformance,
  validateCallData,
  validateLossReasonData,
  type CallData,
  type LossReasonData
} from '../metricsCalculations';

describe('Metrics Calculations', () => {
  // Create dates within the last 30 days for trend testing
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(today.getDate() - 3);
  const fourDaysAgo = new Date(today);
  fourDaysAgo.setDate(today.getDate() - 4);

  const mockCalls: CallData[] = [
    {
      id: '1',
      status: 'completed',
      outcome: 'won',
      created_at: today.toISOString(),
      completed_at: today.toISOString()
    },
    {
      id: '2',
      status: 'completed',
      outcome: 'lost',
      created_at: yesterday.toISOString(),
      completed_at: yesterday.toISOString(),
      loss_reason_id: 'reason-1'
    },
    {
      id: '3',
      status: 'no-show',
      outcome: 'tbd',
      created_at: twoDaysAgo.toISOString()
    },
    {
      id: '4',
      status: 'completed',
      outcome: 'won',
      created_at: threeDaysAgo.toISOString(),
      completed_at: threeDaysAgo.toISOString()
    },
    {
      id: '5',
      status: 'rescheduled',
      outcome: 'tbd',
      created_at: fourDaysAgo.toISOString()
    }
  ];

  const mockLossReasons: LossReasonData[] = [
    { id: 'reason-1', reason: 'Price too high' },
    { id: 'reason-2', reason: 'Not interested' }
  ];

  describe('calculateShowRate', () => {
    it('should calculate show rate correctly', () => {
      const result = calculateShowRate(mockCalls);
      
      expect(result.totalCalls).toBe(5);
      expect(result.completedCalls).toBe(3); // IDs 1, 2, 4
      expect(result.percentage).toBe(60); // 3/5 * 100
    });

    it('should handle empty calls array', () => {
      const result = calculateShowRate([]);
      
      expect(result.totalCalls).toBe(0);
      expect(result.completedCalls).toBe(0);
      expect(result.percentage).toBe(0);
    });

    it('should handle zero completed calls', () => {
      const noCompletedCalls = mockCalls.map(call => ({
        ...call,
        status: 'no-show' as const
      }));
      
      const result = calculateShowRate(noCompletedCalls);
      
      expect(result.totalCalls).toBe(5);
      expect(result.completedCalls).toBe(0);
      expect(result.percentage).toBe(0);
    });
  });

  describe('calculateCloseRate', () => {
    it('should calculate close rate correctly', () => {
      const result = calculateCloseRate(mockCalls);
      
      expect(result.completedCalls).toBe(3); // IDs 1, 2, 4
      expect(result.wonCalls).toBe(2); // IDs 1, 4
      expect(result.percentage).toBe(66.67); // 2/3 * 100, rounded to 2 decimal places
    });

    it('should handle no completed calls', () => {
      const noCompletedCalls = mockCalls.map(call => ({
        ...call,
        status: 'no-show' as const
      }));
      
      const result = calculateCloseRate(noCompletedCalls);
      
      expect(result.completedCalls).toBe(0);
      expect(result.wonCalls).toBe(0);
      expect(result.percentage).toBe(0);
    });

    it('should handle zero won calls', () => {
      const noWonCalls = mockCalls.map(call => ({
        ...call,
        outcome: 'lost' as const
      }));
      
      const result = calculateCloseRate(noWonCalls);
      
      expect(result.completedCalls).toBe(3);
      expect(result.wonCalls).toBe(0);
      expect(result.percentage).toBe(0);
    });
  });

  describe('calculateCallOutcomes', () => {
    it('should calculate call outcomes correctly', () => {
      const result = calculateCallOutcomes(mockCalls);
      
      expect(result.totalCalls).toBe(5);
      expect(result.wonCalls).toBe(2); // IDs 1, 4
      expect(result.lostCalls).toBe(1); // ID 2
      expect(result.tbdCalls).toBe(0); // No completed calls with tbd outcome
    });
  });

  describe('calculateLossReasons', () => {
    it('should calculate loss reasons correctly', () => {
      const result = calculateLossReasons(mockCalls, mockLossReasons);
      
      expect(result).toHaveLength(1);
      expect(result[0].reason).toBe('Price too high');
      expect(result[0].count).toBe(1);
      expect(result[0].percentage).toBe(100); // 1/1 * 100
    });

    it('should handle no lost calls', () => {
      const noLostCalls = mockCalls.map(call => ({
        ...call,
        outcome: 'won' as const
      }));
      
      const result = calculateLossReasons(noLostCalls, mockLossReasons);
      
      expect(result).toHaveLength(0);
    });

    it('should limit results to specified limit', () => {
      const manyLostCalls = Array.from({ length: 10 }, (_, i) => ({
        id: `call-${i}`,
        status: 'completed' as const,
        outcome: 'lost' as const,
        created_at: '2024-01-01T10:00:00Z',
        loss_reason_id: `reason-${i % 2}` // Alternate between 2 reasons
      }));
      
      const result = calculateLossReasons(manyLostCalls, mockLossReasons, 1);
      
      expect(result).toHaveLength(1);
    });
  });

  describe('calculateMetrics', () => {
    it('should calculate comprehensive metrics correctly', () => {
      const result = calculateMetrics(mockCalls, mockLossReasons);
      
      expect(result.showRate.percentage).toBe(60);
      expect(result.showRate.completedCalls).toBe(3);
      expect(result.showRate.totalCalls).toBe(5);
      
      expect(result.closeRate.percentage).toBe(66.67);
      expect(result.closeRate.wonCalls).toBe(2);
      expect(result.closeRate.completedCalls).toBe(3);
      
      expect(result.totalCalls).toBe(5);
      expect(result.wonCalls).toBe(2);
      expect(result.lostCalls).toBe(1);
      expect(result.tbdCalls).toBe(0);
      
      expect(result.lossReasons).toHaveLength(1);
      expect(result.lossReasons[0].reason).toBe('Price too high');
    });

    it('should handle empty calls array', () => {
      const result = calculateMetrics([], mockLossReasons);
      
      expect(result.showRate.percentage).toBe(0);
      expect(result.closeRate.percentage).toBe(0);
      expect(result.totalCalls).toBe(0);
      expect(result.lossReasons).toHaveLength(0);
    });

    it('should throw error for invalid input', () => {
      expect(() => calculateMetrics(null as any, mockLossReasons)).toThrow('Calls data must be an array');
      expect(() => calculateMetrics(mockCalls, null as any)).toThrow('Loss reasons data must be an array');
    });
  });

  describe('calculateMetricsForDateRange', () => {
    it('should filter calls by date range', () => {
      // Test with a range that includes yesterday, two days ago, and three days ago
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 3);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() - 1);

      const result = calculateMetricsForDateRange(
        mockCalls,
        mockLossReasons,
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      // Should include calls from yesterday, two days ago, and three days ago (IDs 2, 3, 4)
      expect(result.totalCalls).toBe(3);
      expect(result.showRate.completedCalls).toBe(2); // IDs 2, 4
      expect(result.wonCalls).toBe(1); // ID 4
    });

    it('should handle calls outside date range', () => {
      // Test with a range in the future
      const futureStart = new Date(today);
      futureStart.setDate(today.getDate() + 10);
      const futureEnd = new Date(today);
      futureEnd.setDate(today.getDate() + 15);

      const result = calculateMetricsForDateRange(
        mockCalls,
        mockLossReasons,
        futureStart.toISOString(),
        futureEnd.toISOString()
      );
      
      expect(result.totalCalls).toBe(0);
      expect(result.showRate.percentage).toBe(0);
    });
  });

  describe('calculateMetricsTrend', () => {
    it('should calculate trend data correctly', () => {
      const result = calculateMetricsTrend(mockCalls, mockLossReasons, 10);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      const firstDay = result[0];
      expect(firstDay).toHaveProperty('date');
      expect(firstDay).toHaveProperty('showRate');
      expect(firstDay).toHaveProperty('closeRate');
      expect(firstDay).toHaveProperty('totalCalls');
      expect(firstDay).toHaveProperty('completedCalls');
      expect(firstDay).toHaveProperty('wonCalls');
    });
  });

  describe('calculateUserPerformance', () => {
    const callsWithUsers = mockCalls.map((call, index) => ({
      ...call,
      user_id: `user-${index % 2}` // Alternate between 2 users
    }));

    it('should calculate user performance correctly', () => {
      const result = calculateUserPerformance(callsWithUsers, ['user-0', 'user-1']);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('userId');
      expect(result[0]).toHaveProperty('showRate');
      expect(result[0]).toHaveProperty('closeRate');
      expect(result[0]).toHaveProperty('totalCalls');
      expect(result[0]).toHaveProperty('wonCalls');
    });

    it('should sort by show rate descending', () => {
      const result = calculateUserPerformance(callsWithUsers, ['user-0', 'user-1']);
      
      expect(result[0].showRate).toBeGreaterThanOrEqual(result[1].showRate);
    });
  });

  describe('validateCallData', () => {
    it('should validate correct call data', () => {
      const validCall = mockCalls[0];
      expect(() => validateCallData(validCall)).not.toThrow();
      expect(validateCallData(validCall)).toBe(true);
    });

    it('should throw error for invalid call data', () => {
      expect(() => validateCallData(null)).toThrow('Call data must be an object');
      expect(() => validateCallData({})).toThrow('Call must have a valid id');
      expect(() => validateCallData({ id: '1' })).toThrow('Call must have a valid status');
      expect(() => validateCallData({ id: '1', status: 'invalid' })).toThrow('Call must have a valid status');
      expect(() => validateCallData({ id: '1', status: 'completed' })).toThrow('Call must have a valid outcome');
      expect(() => validateCallData({ id: '1', status: 'completed', outcome: 'invalid' })).toThrow('Call must have a valid outcome');
      expect(() => validateCallData({ id: '1', status: 'completed', outcome: 'won' })).toThrow('Call must have a valid created_at date');
    });
  });

  describe('validateLossReasonData', () => {
    it('should validate correct loss reason data', () => {
      const validLossReason = mockLossReasons[0];
      expect(() => validateLossReasonData(validLossReason)).not.toThrow();
      expect(validateLossReasonData(validLossReason)).toBe(true);
    });

    it('should throw error for invalid loss reason data', () => {
      expect(() => validateLossReasonData(null)).toThrow('Loss reason data must be an object');
      expect(() => validateLossReasonData({})).toThrow('Loss reason must have a valid id');
      expect(() => validateLossReasonData({ id: '1' })).toThrow('Loss reason must have a valid reason');
    });
  });
});
