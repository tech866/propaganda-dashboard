import { createCallSchema, updateCallSchema } from '@/lib/validation/clientSchemas';

describe('Call Validation Schemas', () => {
  describe('createCallSchema', () => {
    const validCallData = {
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

    it('should validate a complete SDR booked call', async () => {
      await expect(createCallSchema.validate(validCallData)).resolves.toBeDefined();
    });

    it('should validate a non-SDR booked call', async () => {
      const nonSdrData = {
        ...validCallData,
        source_of_set_appointment: 'non_sdr_booked_call',
        non_sdr_source: 'vsl_booking',
        sdr_type: undefined,
        sdr_first_name: undefined,
        sdr_last_name: undefined,
      };
      await expect(createCallSchema.validate(nonSdrData)).resolves.toBeDefined();
    });

    it('should require SDR fields when source is sdr_booked_call', async () => {
      const invalidData = {
        ...validCallData,
        sdr_type: undefined,
        sdr_first_name: undefined,
        sdr_last_name: undefined,
      };
      await expect(createCallSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should require non_sdr_source when source is non_sdr_booked_call', async () => {
      const invalidData = {
        ...validCallData,
        source_of_set_appointment: 'non_sdr_booked_call',
        non_sdr_source: undefined,
      };
      await expect(createCallSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should validate traffic source field', async () => {
      const organicData = { ...validCallData, traffic_source: 'organic' };
      const metaData = { ...validCallData, traffic_source: 'meta' };
      
      await expect(createCallSchema.validate(organicData)).resolves.toBeDefined();
      await expect(createCallSchema.validate(metaData)).resolves.toBeDefined();
    });

    it('should reject invalid traffic source', async () => {
      const invalidData = { ...validCallData, traffic_source: 'invalid' };
      await expect(createCallSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should validate CRM stage field', async () => {
      const validStages = ['scheduled', 'in_progress', 'completed', 'no_show', 'closed_won', 'lost'];
      
      for (const stage of validStages) {
        const data = { ...validCallData, crm_stage: stage };
        await expect(createCallSchema.validate(data)).resolves.toBeDefined();
      }
    });

    it('should reject invalid CRM stage', async () => {
      const invalidData = { ...validCallData, crm_stage: 'invalid' };
      await expect(createCallSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should validate SCRM outcome field', async () => {
      const validOutcomes = [
        'call_booked', 'no_show', 'no_close', 'cancelled', 'disqualified',
        'rescheduled', 'payment_plan', 'deposit', 'closed_paid_in_full', 'follow_up_call_scheduled'
      ];
      
      for (const outcome of validOutcomes) {
        const data = { ...validCallData, scrms_outcome: outcome };
        await expect(createCallSchema.validate(data)).resolves.toBeDefined();
      }
    });

    it('should reject invalid SCRM outcome', async () => {
      const invalidData = { ...validCallData, scrms_outcome: 'invalid' };
      await expect(createCallSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should validate email format', async () => {
      const invalidEmailData = { ...validCallData, prospect_email: 'invalid-email' };
      await expect(createCallSchema.validate(invalidEmailData)).rejects.toThrow();
    });

    it('should validate UUID format for client_id', async () => {
      const invalidUuidData = { ...validCallData, client_id: 'invalid-uuid' };
      await expect(createCallSchema.validate(invalidUuidData)).rejects.toThrow();
    });

    it('should validate required fields', async () => {
      const requiredFields = [
        'client_id', 'prospect_first_name', 'prospect_last_name', 'prospect_email',
        'prospect_phone', 'company_name', 'source_of_set_appointment', 'traffic_source',
        'call_type', 'status', 'scheduled_at'
      ];

      for (const field of requiredFields) {
        const data = { ...validCallData };
        delete data[field as keyof typeof data];
        await expect(createCallSchema.validate(data)).rejects.toThrow();
      }
    });
  });

  describe('updateCallSchema', () => {
    it('should allow partial updates', async () => {
      const partialData = {
        crm_stage: 'completed',
        traffic_source: 'meta',
      };
      await expect(updateCallSchema.validate(partialData)).resolves.toBeDefined();
    });

    it('should validate traffic source in updates', async () => {
      const validData = { traffic_source: 'organic' };
      const invalidData = { traffic_source: 'invalid' };
      
      await expect(updateCallSchema.validate(validData)).resolves.toBeDefined();
      await expect(updateCallSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should validate CRM stage in updates', async () => {
      const validData = { crm_stage: 'closed_won' };
      const invalidData = { crm_stage: 'invalid' };
      
      await expect(updateCallSchema.validate(validData)).resolves.toBeDefined();
      await expect(updateCallSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should allow null values for optional fields', async () => {
      const dataWithNulls = {
        notes: null,
        call_duration: null,
        completed_at: null,
        traffic_source: null,
        crm_stage: null,
      };
      await expect(updateCallSchema.validate(dataWithNulls)).resolves.toBeDefined();
    });
  });
});
