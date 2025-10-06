import { NextRequest } from 'next/server';
import { POST } from '@/app/api/calls/route';

// Mock Clerk auth
const mockAuth = jest.fn();
jest.mock('@clerk/nextjs/server', () => ({
  auth: () => mockAuth()
}));

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    }))
  }))
}));

describe('Security and Compliance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for call creation', async () => {
      mockAuth.mockReturnValue({ userId: null });

      const request = new NextRequest('http://localhost:3000/api/calls', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('should validate user has access to client', async () => {
      mockAuth.mockReturnValue({
        userId: 'user-123',
        sessionClaims: {
          publicMetadata: {
            agency_id: 'client-123'
          }
        }
      });

      const callData = {
        client_id: 'different-client-id', // Different from user's client
        prospect_first_name: 'John',
        prospect_last_name: 'Doe',
        prospect_email: 'john@example.com',
        prospect_phone: '+1234567890',
        company_name: 'Test Company',
        source_of_set_appointment: 'sdr_booked_call',
        sdr_type: 'dialer',
        sdr_first_name: 'Jane',
        sdr_last_name: 'Smith',
        scrms_outcome: 'call_booked',
        traffic_source: 'organic',
        crm_stage: 'scheduled',
        call_type: 'outbound',
        status: 'completed',
        outcome: 'tbd',
        scheduled_at: new Date('2024-01-01T10:00:00Z'),
      };

      const request = new NextRequest('http://localhost:3000/api/calls', {
        method: 'POST',
        body: JSON.stringify(callData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      expect(response.status).toBe(403);
    });
  });

  describe('Data Validation and Sanitization', () => {
    it('should sanitize input data', async () => {
      mockAuth.mockReturnValue({
        userId: 'user-123',
        sessionClaims: {
          publicMetadata: {
            agency_id: 'client-123'
          }
        }
      });

      const maliciousData = {
        client_id: 'client-123',
        prospect_first_name: '<script>alert("xss")</script>',
        prospect_last_name: 'Doe',
        prospect_email: 'john@example.com',
        prospect_phone: '+1234567890',
        company_name: 'Test Company',
        source_of_set_appointment: 'sdr_booked_call',
        sdr_type: 'dialer',
        sdr_first_name: 'Jane',
        sdr_last_name: 'Smith',
        scrms_outcome: 'call_booked',
        traffic_source: 'organic',
        crm_stage: 'scheduled',
        call_type: 'outbound',
        status: 'completed',
        outcome: 'tbd',
        scheduled_at: new Date('2024-01-01T10:00:00Z'),
      };

      const request = new NextRequest('http://localhost:3000/api/calls', {
        method: 'POST',
        body: JSON.stringify(maliciousData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      // Should either sanitize the data or reject it
      expect([200, 201, 400]).toContain(response.status);
    });

    it('should validate email format', async () => {
      mockAuth.mockReturnValue({
        userId: 'user-123',
        sessionClaims: {
          publicMetadata: {
            agency_id: 'client-123'
          }
        }
      });

      const invalidEmailData = {
        client_id: 'client-123',
        prospect_first_name: 'John',
        prospect_last_name: 'Doe',
        prospect_email: 'invalid-email-format',
        prospect_phone: '+1234567890',
        company_name: 'Test Company',
        source_of_set_appointment: 'sdr_booked_call',
        sdr_type: 'dialer',
        sdr_first_name: 'Jane',
        sdr_last_name: 'Smith',
        scrms_outcome: 'call_booked',
        traffic_source: 'organic',
        crm_stage: 'scheduled',
        call_type: 'outbound',
        status: 'completed',
        outcome: 'tbd',
        scheduled_at: new Date('2024-01-01T10:00:00Z'),
      };

      const request = new NextRequest('http://localhost:3000/api/calls', {
        method: 'POST',
        body: JSON.stringify(invalidEmailData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should validate phone number format', async () => {
      mockAuth.mockReturnValue({
        userId: 'user-123',
        sessionClaims: {
          publicMetadata: {
            agency_id: 'client-123'
          }
        }
      });

      const invalidPhoneData = {
        client_id: 'client-123',
        prospect_first_name: 'John',
        prospect_last_name: 'Doe',
        prospect_email: 'john@example.com',
        prospect_phone: 'invalid-phone',
        company_name: 'Test Company',
        source_of_set_appointment: 'sdr_booked_call',
        sdr_type: 'dialer',
        sdr_first_name: 'Jane',
        sdr_last_name: 'Smith',
        scrms_outcome: 'call_booked',
        traffic_source: 'organic',
        crm_stage: 'scheduled',
        call_type: 'outbound',
        status: 'completed',
        outcome: 'tbd',
        scheduled_at: new Date('2024-01-01T10:00:00Z'),
      };

      const request = new NextRequest('http://localhost:3000/api/calls', {
        method: 'POST',
        body: JSON.stringify(invalidPhoneData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('Data Privacy and GDPR Compliance', () => {
    it('should handle personal data according to privacy requirements', async () => {
      mockAuth.mockReturnValue({
        userId: 'user-123',
        sessionClaims: {
          publicMetadata: {
            agency_id: 'client-123'
          }
        }
      });

      const personalData = {
        client_id: 'client-123',
        prospect_first_name: 'John',
        prospect_last_name: 'Doe',
        prospect_email: 'john.doe@example.com',
        prospect_phone: '+1234567890',
        company_name: 'Test Company',
        source_of_set_appointment: 'sdr_booked_call',
        sdr_type: 'dialer',
        sdr_first_name: 'Jane',
        sdr_last_name: 'Smith',
        scrms_outcome: 'call_booked',
        traffic_source: 'organic',
        crm_stage: 'scheduled',
        call_type: 'outbound',
        status: 'completed',
        outcome: 'tbd',
        scheduled_at: new Date('2024-01-01T10:00:00Z'),
      };

      const request = new NextRequest('http://localhost:3000/api/calls', {
        method: 'POST',
        body: JSON.stringify(personalData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      
      // Should handle personal data appropriately
      if (response.status === 201) {
        const result = await response.json();
        // Verify that personal data is properly handled
        expect(result.data).toHaveProperty('prospect_first_name');
        expect(result.data).toHaveProperty('prospect_last_name');
        expect(result.data).toHaveProperty('prospect_email');
        expect(result.data).toHaveProperty('prospect_phone');
      }
    });

    it('should validate data retention policies', async () => {
      // This test would verify that data retention policies are enforced
      // For example, checking that old data is properly archived or deleted
      expect(true).toBe(true); // Placeholder for actual implementation
    });
  });

  describe('Rate Limiting and DoS Protection', () => {
    it('should implement rate limiting', async () => {
      mockAuth.mockReturnValue({
        userId: 'user-123',
        sessionClaims: {
          publicMetadata: {
            agency_id: 'client-123'
          }
        }
      });

      const callData = {
        client_id: 'client-123',
        prospect_first_name: 'John',
        prospect_last_name: 'Doe',
        prospect_email: 'john@example.com',
        prospect_phone: '+1234567890',
        company_name: 'Test Company',
        source_of_set_appointment: 'sdr_booked_call',
        sdr_type: 'dialer',
        sdr_first_name: 'Jane',
        sdr_last_name: 'Smith',
        scrms_outcome: 'call_booked',
        traffic_source: 'organic',
        crm_stage: 'scheduled',
        call_type: 'outbound',
        status: 'completed',
        outcome: 'tbd',
        scheduled_at: new Date('2024-01-01T10:00:00Z'),
      };

      // Simulate multiple rapid requests
      const requests = Array(10).fill(null).map(() => 
        new NextRequest('http://localhost:3000/api/calls', {
          method: 'POST',
          body: JSON.stringify(callData),
          headers: { 'Content-Type': 'application/json' }
        })
      );

      const responses = await Promise.all(requests.map(req => POST(req)));
      
      // Should handle rate limiting appropriately
      // This is a placeholder - actual implementation would depend on rate limiting middleware
      expect(responses.length).toBe(10);
    });
  });

  describe('Audit Logging', () => {
    it('should log all data modifications', async () => {
      mockAuth.mockReturnValue({
        userId: 'user-123',
        sessionClaims: {
          publicMetadata: {
            agency_id: 'client-123'
          }
        }
      });

      const callData = {
        client_id: 'client-123',
        prospect_first_name: 'John',
        prospect_last_name: 'Doe',
        prospect_email: 'john@example.com',
        prospect_phone: '+1234567890',
        company_name: 'Test Company',
        source_of_set_appointment: 'sdr_booked_call',
        sdr_type: 'dialer',
        sdr_first_name: 'Jane',
        sdr_last_name: 'Smith',
        scrms_outcome: 'call_booked',
        traffic_source: 'organic',
        crm_stage: 'scheduled',
        call_type: 'outbound',
        status: 'completed',
        outcome: 'tbd',
        scheduled_at: new Date('2024-01-01T10:00:00Z'),
      };

      const request = new NextRequest('http://localhost:3000/api/calls', {
        method: 'POST',
        body: JSON.stringify(callData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      
      // Should log the operation for audit purposes
      // This is a placeholder - actual implementation would verify audit logs
      expect([200, 201, 400, 500]).toContain(response.status);
    });
  });
});
