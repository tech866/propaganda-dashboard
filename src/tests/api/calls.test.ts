import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/calls/route';
import { PATCH, DELETE } from '@/app/api/calls/[id]/route';

// Mock dependencies
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => ({
    userId: 'user-123',
    sessionClaims: {
      publicMetadata: {
        agency_id: 'client-123',
        agency_name: 'Test Agency'
      }
    }
  }))
}));

jest.mock('@/lib/services/salesCallService', () => ({
  SalesCallService: {
    createSalesCall: jest.fn(),
    getSalesCalls: jest.fn(),
    updateSalesCall: jest.fn(),
    deleteSalesCall: jest.fn(),
  }
}));

describe('Calls API Endpoints', () => {
  const mockCallData = {
    client_id: '123e4567-e89b-12d3-a456-426614174000',
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

  describe('POST /api/calls', () => {
    it('should create a new call with valid data', async () => {
      const { SalesCallService } = require('@/lib/services/salesCallService');
      const mockCreatedCall = { id: 'call-123', ...mockCallData };
      SalesCallService.createSalesCall.mockResolvedValue(mockCreatedCall);

      const request = new NextRequest('http://localhost:3000/api/calls', {
        method: 'POST',
        body: JSON.stringify(mockCallData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCreatedCall);
      expect(SalesCallService.createSalesCall).toHaveBeenCalledWith(
        expect.objectContaining(mockCallData),
        expect.any(Object)
      );
    });

    it('should handle SDR booked call validation', async () => {
      const sdrCallData = {
        ...mockCallData,
        source_of_set_appointment: 'sdr_booked_call',
        sdr_type: 'dialer',
        sdr_first_name: 'Jane',
        sdr_last_name: 'Smith',
      };

      const { SalesCallService } = require('@/lib/services/salesCallService');
      const mockCreatedCall = { id: 'call-123', ...sdrCallData };
      SalesCallService.createSalesCall.mockResolvedValue(mockCreatedCall);

      const request = new NextRequest('http://localhost:3000/api/calls', {
        method: 'POST',
        body: JSON.stringify(sdrCallData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
    });

    it('should handle non-SDR booked call validation', async () => {
      const nonSdrCallData = {
        ...mockCallData,
        source_of_set_appointment: 'non_sdr_booked_call',
        non_sdr_source: 'vsl_booking',
        sdr_type: undefined,
        sdr_first_name: undefined,
        sdr_last_name: undefined,
      };

      const { SalesCallService } = require('@/lib/services/salesCallService');
      const mockCreatedCall = { id: 'call-123', ...nonSdrCallData };
      SalesCallService.createSalesCall.mockResolvedValue(mockCreatedCall);

      const request = new NextRequest('http://localhost:3000/api/calls', {
        method: 'POST',
        body: JSON.stringify(nonSdrCallData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
    });

    it('should validate traffic source field', async () => {
      const organicCallData = { ...mockCallData, traffic_source: 'organic' };
      const metaCallData = { ...mockCallData, traffic_source: 'meta' };

      const { SalesCallService } = require('@/lib/services/salesCallService');
      SalesCallService.createSalesCall.mockResolvedValue({ id: 'call-123' });

      // Test organic traffic source
      const organicRequest = new NextRequest('http://localhost:3000/api/calls', {
        method: 'POST',
        body: JSON.stringify(organicCallData),
        headers: { 'Content-Type': 'application/json' }
      });

      const organicResponse = await POST(organicRequest);
      expect(organicResponse.status).toBe(201);

      // Test meta traffic source
      const metaRequest = new NextRequest('http://localhost:3000/api/calls', {
        method: 'POST',
        body: JSON.stringify(metaCallData),
        headers: { 'Content-Type': 'application/json' }
      });

      const metaResponse = await POST(metaRequest);
      expect(metaResponse.status).toBe(201);
    });

    it('should reject invalid traffic source', async () => {
      const invalidData = { ...mockCallData, traffic_source: 'invalid' };

      const request = new NextRequest('http://localhost:3000/api/calls', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should validate CRM stage field', async () => {
      const validStages = ['scheduled', 'in_progress', 'completed', 'no_show', 'closed_won', 'lost'];
      const { SalesCallService } = require('@/lib/services/salesCallService');
      SalesCallService.createSalesCall.mockResolvedValue({ id: 'call-123' });

      for (const stage of validStages) {
        const data = { ...mockCallData, crm_stage: stage };
        const request = new NextRequest('http://localhost:3000/api/calls', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' }
        });

        const response = await POST(request);
        expect(response.status).toBe(201);
      }
    });

    it('should reject invalid CRM stage', async () => {
      const invalidData = { ...mockCallData, crm_stage: 'invalid' };

      const request = new NextRequest('http://localhost:3000/api/calls', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should handle validation errors', async () => {
      const invalidData = { ...mockCallData };
      delete invalidData.prospect_first_name; // Remove required field

      const request = new NextRequest('http://localhost:3000/api/calls', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should handle service errors', async () => {
      const { SalesCallService } = require('@/lib/services/salesCallService');
      SalesCallService.createSalesCall.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/calls', {
        method: 'POST',
        body: JSON.stringify(mockCallData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /api/calls/[id]', () => {
    it('should update call CRM stage', async () => {
      const { SalesCallService } = require('@/lib/services/salesCallService');
      const updatedCall = { id: 'call-123', ...mockCallData, crm_stage: 'completed' };
      SalesCallService.updateSalesCall.mockResolvedValue(updatedCall);

      const updateData = { crm_stage: 'completed' };
      const request = new NextRequest('http://localhost:3000/api/calls/call-123', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await PATCH(request, { params: { id: 'call-123' } });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.crm_stage).toBe('completed');
    });

    it('should update call traffic source', async () => {
      const { SalesCallService } = require('@/lib/services/salesCallService');
      const updatedCall = { id: 'call-123', ...mockCallData, traffic_source: 'meta' };
      SalesCallService.updateSalesCall.mockResolvedValue(updatedCall);

      const updateData = { traffic_source: 'meta' };
      const request = new NextRequest('http://localhost:3000/api/calls/call-123', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await PATCH(request, { params: { id: 'call-123' } });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.traffic_source).toBe('meta');
    });

    it('should validate update data', async () => {
      const invalidData = { crm_stage: 'invalid' };
      const request = new NextRequest('http://localhost:3000/api/calls/call-123', {
        method: 'PATCH',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await PATCH(request, { params: { id: 'call-123' } });
      expect(response.status).toBe(400);
    });

    it('should handle call not found', async () => {
      const { SalesCallService } = require('@/lib/services/salesCallService');
      SalesCallService.updateSalesCall.mockResolvedValue(null);

      const updateData = { crm_stage: 'completed' };
      const request = new NextRequest('http://localhost:3000/api/calls/nonexistent', {
        method: 'PATCH',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await PATCH(request, { params: { id: 'nonexistent' } });
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/calls', () => {
    it('should retrieve calls with proper filtering', async () => {
      const { SalesCallService } = require('@/lib/services/salesCallService');
      const mockCalls = [
        { id: 'call-1', ...mockCallData, traffic_source: 'organic' },
        { id: 'call-2', ...mockCallData, traffic_source: 'meta' }
      ];
      SalesCallService.getSalesCalls.mockResolvedValue(mockCalls);

      const request = new NextRequest('http://localhost:3000/api/calls');
      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCalls);
    });
  });
});
