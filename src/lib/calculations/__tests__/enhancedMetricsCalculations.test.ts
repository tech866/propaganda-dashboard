import {
  calculateAOV,
  calculateEnhancedCloseRate,
  calculateLeadSourcePerformance,
  calculateROAS,
  calculateAppointmentSourcePerformance,
  calculateTeamPerformance,
  calculateEnhancedMetrics,
  type EnhancedCallData
} from '../enhancedMetricsCalculations';

describe('Enhanced Metrics Calculations', () => {
  const mockCalls: EnhancedCallData[] = [
    {
      id: '1',
      status: 'completed',
      outcome: 'won',
      created_at: '2024-01-01T10:00:00Z',
      completed_at: '2024-01-01T10:30:00Z',
      closer_first_name: 'John',
      closer_last_name: 'Doe',
      source_of_set_appointment: 'sdr_booked_call',
      enhanced_call_outcome: 'closed_paid_in_full',
      customer_full_name: 'Jane Smith',
      customer_email: 'jane@example.com',
      cash_collected_upfront: 1000,
      total_amount_owed: 5000,
      lead_source: 'ads',
      setter_first_name: 'Alice',
      setter_last_name: 'Johnson'
    },
    {
      id: '2',
      status: 'completed',
      outcome: 'won',
      created_at: '2024-01-02T10:00:00Z',
      completed_at: '2024-01-02T10:30:00Z',
      closer_first_name: 'John',
      closer_last_name: 'Doe',
      source_of_set_appointment: 'email',
      enhanced_call_outcome: 'deposit',
      customer_full_name: 'Bob Wilson',
      customer_email: 'bob@example.com',
      cash_collected_upfront: 500,
      total_amount_owed: 3000,
      lead_source: 'organic',
      setter_first_name: 'Bob',
      setter_last_name: 'Smith'
    },
    {
      id: '3',
      status: 'completed',
      outcome: 'tbd',
      created_at: '2024-01-03T10:00:00Z',
      completed_at: '2024-01-03T10:30:00Z',
      closer_first_name: 'Jane',
      closer_last_name: 'Smith',
      source_of_set_appointment: 'self_booking',
      enhanced_call_outcome: 'no_show',
      lead_source: 'ads'
    },
    {
      id: '4',
      status: 'completed',
      outcome: 'lost',
      created_at: '2024-01-04T10:00:00Z',
      completed_at: '2024-01-04T10:30:00Z',
      closer_first_name: 'Jane',
      closer_last_name: 'Smith',
      source_of_set_appointment: 'vsl',
      enhanced_call_outcome: 'no_close',
      lead_source: 'organic'
    }
  ];

  describe('calculateAOV', () => {
    it('should calculate correct AOV for closed deals', () => {
      const result = calculateAOV(mockCalls);
      
      expect(result.totalDeals).toBe(2); // 2 closed deals
      expect(result.totalRevenue).toBe(8000); // 5000 + 3000
      expect(result.averageOrderValue).toBe(4000); // 8000 / 2
    });

    it('should return zero values for no closed deals', () => {
      const noClosedCalls = mockCalls.map(call => ({
        ...call,
        enhanced_call_outcome: 'no_show' as const
      }));
      
      const result = calculateAOV(noClosedCalls);
      
      expect(result.totalDeals).toBe(0);
      expect(result.totalRevenue).toBe(0);
      expect(result.averageOrderValue).toBe(0);
    });
  });

  describe('calculateEnhancedCloseRate', () => {
    it('should calculate correct enhanced close rate', () => {
      const result = calculateEnhancedCloseRate(mockCalls);
      
      expect(result.completedCalls).toBe(4); // 4 completed calls
      expect(result.closedCalls).toBe(2); // 2 closed deals
      expect(result.percentage).toBe(50); // 2/4 * 100
    });

    it('should return zero for no completed calls', () => {
      const noCompletedCalls = mockCalls.map(call => ({
        ...call,
        status: 'no-show' as const
      }));
      
      const result = calculateEnhancedCloseRate(noCompletedCalls);
      
      expect(result.completedCalls).toBe(0);
      expect(result.closedCalls).toBe(0);
      expect(result.percentage).toBe(0);
    });
  });

  describe('calculateLeadSourcePerformance', () => {
    it('should calculate correct lead source performance', () => {
      const result = calculateLeadSourcePerformance(mockCalls);
      
      // Organic performance
      expect(result.organic.calls).toBe(2);
      expect(result.organic.shows).toBe(2);
      expect(result.organic.closes).toBe(1);
      expect(result.organic.revenue).toBe(3000);
      expect(result.organic.showRate).toBe(100);
      expect(result.organic.closeRate).toBe(50);
      
      // Ads performance
      expect(result.ads.calls).toBe(2);
      expect(result.ads.shows).toBe(2);
      expect(result.ads.closes).toBe(1);
      expect(result.ads.revenue).toBe(5000);
      expect(result.ads.showRate).toBe(100);
      expect(result.ads.closeRate).toBe(50);
    });
  });

  describe('calculateROAS', () => {
    it('should calculate correct ROAS', () => {
      const adSpend = 2000;
      const result = calculateROAS(mockCalls, adSpend);
      
      expect(result.totalAdSpend).toBe(2000);
      expect(result.totalRevenue).toBe(5000); // Only ads revenue
      expect(result.roas).toBe(2.5); // 5000 / 2000
    });

    it('should return zero ROAS for zero ad spend', () => {
      const result = calculateROAS(mockCalls, 0);
      
      expect(result.totalAdSpend).toBe(0);
      expect(result.totalRevenue).toBe(5000);
      expect(result.roas).toBe(0);
    });
  });

  describe('calculateAppointmentSourcePerformance', () => {
    it('should calculate correct appointment source performance', () => {
      const result = calculateAppointmentSourcePerformance(mockCalls);
      
      expect(result.sdr_booked_call).toBe(1);
      expect(result.non_sdr_booked_call).toBe(0);
      expect(result.email).toBe(1);
      expect(result.vsl).toBe(1);
      expect(result.self_booking).toBe(1);
    });
  });

  describe('calculateTeamPerformance', () => {
    it('should calculate correct team performance', () => {
      const result = calculateTeamPerformance(mockCalls);
      
      // Closers
      expect(result.closers).toHaveLength(2);
      const johnDoe = result.closers.find(c => c.name === 'John Doe');
      expect(johnDoe?.calls).toBe(2);
      expect(johnDoe?.shows).toBe(2);
      expect(johnDoe?.closes).toBe(2);
      expect(johnDoe?.revenue).toBe(8000);
      expect(johnDoe?.showRate).toBe(100);
      expect(johnDoe?.closeRate).toBe(100);
      
      // Setters
      expect(result.setters).toHaveLength(2);
      const aliceJohnson = result.setters.find(s => s.name === 'Alice Johnson');
      expect(aliceJohnson?.appointments).toBe(1);
      expect(aliceJohnson?.shows).toBe(1);
      expect(aliceJohnson?.closes).toBe(1);
      expect(aliceJohnson?.showRate).toBe(100);
      expect(aliceJohnson?.closeRate).toBe(100);
    });
  });

  describe('calculateEnhancedMetrics', () => {
    it('should calculate comprehensive enhanced metrics', () => {
      const result = calculateEnhancedMetrics(mockCalls, 2000);
      
      // Basic metrics
      expect(result.totalCalls).toBe(4);
      expect(result.wonCalls).toBe(2);
      expect(result.lostCalls).toBe(1);
      expect(result.tbdCalls).toBe(1);
      
      // Show rate
      expect(result.showRate.totalCalls).toBe(4);
      expect(result.showRate.completedCalls).toBe(4);
      expect(result.showRate.percentage).toBe(100);
      
      // Close rate
      expect(result.closeRate.completedCalls).toBe(4);
      expect(result.closeRate.wonCalls).toBe(2);
      expect(result.closeRate.percentage).toBe(50);
      
      // Enhanced close rate
      expect(result.enhancedCloseRate.completedCalls).toBe(4);
      expect(result.enhancedCloseRate.closedCalls).toBe(2);
      expect(result.enhancedCloseRate.percentage).toBe(50);
      
      // Revenue
      expect(result.revenue.totalCashCollected).toBe(1500);
      expect(result.revenue.totalRevenue).toBe(8000);
      expect(result.revenue.averageOrderValue).toBe(4000);
      expect(result.revenue.totalDeals).toBe(2);
      
      // ROAS
      expect(result.roas?.totalAdSpend).toBe(2000);
      expect(result.roas?.totalRevenue).toBe(5000);
      expect(result.roas?.roas).toBe(2.5);
      
      // Lead source performance
      expect(result.leadSourcePerformance.organic.calls).toBe(2);
      expect(result.leadSourcePerformance.ads.calls).toBe(2);
      
      // Team performance
      expect(result.teamPerformance.closers).toHaveLength(2);
      expect(result.teamPerformance.setters).toHaveLength(2);
    });
  });
});
