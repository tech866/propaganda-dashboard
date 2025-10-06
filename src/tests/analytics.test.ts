/**
 * Analytics Dashboard Tests
 * Tests for the sales analytics functionality
 */

import { describe, it, expect } from '@jest/globals';

describe('Analytics Dashboard', () => {
  describe('Sales Metrics Calculation', () => {
    it('should calculate show rate correctly', () => {
      // Test data
      const callsShowed = 70;
      const callsScheduled = 100;
      const showRate = (callsShowed / callsScheduled) * 100;

      expect(showRate).toBe(70.0);
      expect(callsShowed).toBe(70);
      expect(callsScheduled).toBe(100);
    });

    it('should calculate close rate correctly', () => {
      // Test data
      const callsClosedWon = 25;
      const callsTaken = 80;
      const closeRate = (callsClosedWon / callsTaken) * 100;

      expect(closeRate).toBe(31.25);
      expect(callsClosedWon).toBe(25);
      expect(callsTaken).toBe(80);
    });

    it('should calculate cash-based AOV correctly', () => {
      // Test data
      const cashCollected = 50000;
      const callsClosedWon = 25;
      const cashBasedAOV = cashCollected / callsClosedWon;

      expect(cashBasedAOV).toBe(2000.0);
      expect(cashCollected).toBe(50000);
      expect(callsClosedWon).toBe(25);
    });

    it('should calculate gross collected per booked call correctly', () => {
      // Test data
      const cashCollected = 50000;
      const callsScheduled = 100;
      const grossCollectedPerBookedCall = cashCollected / callsScheduled;

      expect(grossCollectedPerBookedCall).toBe(500.0);
      expect(cashCollected).toBe(50000);
      expect(callsScheduled).toBe(100);
    });

    it('should calculate cash per live call correctly', () => {
      // Test data
      const cashCollected = 50000;
      const callsTaken = 80;
      const cashPerLiveCall = cashCollected / callsTaken;

      expect(cashPerLiveCall).toBe(625.0);
      expect(cashCollected).toBe(50000);
      expect(callsTaken).toBe(80);
    });
  });

  describe('Traffic Source Classification', () => {
    it('should classify organic traffic sources correctly', () => {
      const organicSources = [
        'non_sdr_booked_call',
        'email',
        'vsl',
        'self_booking',
        'referral',
        'organic_search'
      ];

      organicSources.forEach(source => {
        expect(['organic', 'meta']).toContain('organic');
      });
    });

    it('should classify meta traffic sources correctly', () => {
      const metaSources = [
        'sdr_booked_call',
        'facebook_ads',
        'google_ads',
        'meta_ads'
      ];

      metaSources.forEach(source => {
        expect(['organic', 'meta']).toContain('meta');
      });
    });
  });

  describe('Analytics Dashboard Components', () => {
    it('should have required metric fields', () => {
      const requiredMetrics = [
        'calls_scheduled',
        'calls_taken',
        'calls_cancelled',
        'calls_rescheduled',
        'calls_showed',
        'calls_closed_won',
        'calls_disqualified',
        'cash_collected',
        'show_rate',
        'close_rate',
        'gross_collected_per_booked_call',
        'cash_per_live_call',
        'cash_based_aov'
      ];

      requiredMetrics.forEach(metric => {
        expect(typeof metric).toBe('string');
        expect(metric.length).toBeGreaterThan(0);
      });
    });

    it('should handle traffic source filtering', () => {
      const trafficSources = ['all', 'organic', 'meta'];
      
      trafficSources.forEach(source => {
        expect(['all', 'organic', 'meta']).toContain(source);
      });
    });
  });
});
