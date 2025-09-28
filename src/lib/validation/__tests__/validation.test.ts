import { describe, it, expect } from '@jest/globals';
import {
  validateLogin,
  validateRegister,
  validateCreateCall,
  validateUpdateCall,
  validateCreateUser,
  validateCallFilter,
  validateMetricsFilter,
} from '../index';

describe('Validation Schemas', () => {
  describe('Login Validation', () => {
    it('should validate correct login data', async () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const result = await validateLogin(validData);
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validData);
    });

    it('should reject invalid email format', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const result = await validateLogin(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors?.email).toBe('Invalid email format');
    });

    it('should reject short password', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123'
      };

      const result = await validateLogin(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors?.password).toBe('Password must be at least 6 characters');
    });

    it('should reject missing required fields', async () => {
      const invalidData = {
        email: 'test@example.com'
        // missing password
      };

      const result = await validateLogin(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors?.password).toBe('Password is required');
    });
  });

  describe('Register Validation', () => {
    it('should validate correct registration data', async () => {
      const validData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'John Doe',
        clientId: '550e8400-e29b-41d4-a716-446655440001'
      };

      const result = await validateRegister(validData);
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validData);
    });

    it('should reject invalid UUID format for clientId', async () => {
      const invalidData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'John Doe',
        clientId: 'invalid-uuid'
      };

      const result = await validateRegister(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors?.clientId).toBe('Client ID must be a valid UUID');
    });

    it('should reject short name', async () => {
      const invalidData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'J',
        clientId: '550e8400-e29b-41d4-a716-446655440001'
      };

      const result = await validateRegister(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors?.name).toBe('Name must be at least 2 characters');
    });
  });

  describe('Create Call Validation', () => {
    it('should validate correct call data', async () => {
      const validData = {
        client_id: '550e8400-e29b-41d4-a716-446655440001',
        prospect_name: 'Jane Smith',
        prospect_email: 'jane@example.com',
        call_type: 'outbound',
        status: 'completed',
        outcome: 'won'
      };

      const result = await validateCreateCall(validData);
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validData);
    });

    it('should reject invalid call type', async () => {
      const invalidData = {
        client_id: '550e8400-e29b-41d4-a716-446655440001',
        prospect_name: 'Jane Smith',
        call_type: 'invalid-type',
        status: 'completed'
      };

      const result = await validateCreateCall(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors?.call_type).toBe('Call type must be either inbound or outbound');
    });

    it('should reject invalid status', async () => {
      const invalidData = {
        client_id: '550e8400-e29b-41d4-a716-446655440001',
        prospect_name: 'Jane Smith',
        call_type: 'outbound',
        status: 'invalid-status'
      };

      const result = await validateCreateCall(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors?.status).toBe('Status must be completed, no-show, or rescheduled');
    });

    it('should reject invalid outcome', async () => {
      const invalidData = {
        client_id: '550e8400-e29b-41d4-a716-446655440001',
        prospect_name: 'Jane Smith',
        call_type: 'outbound',
        status: 'completed',
        outcome: 'invalid-outcome'
      };

      const result = await validateCreateCall(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors?.outcome).toBe('Outcome must be won, lost, or tbd');
    });

    it('should reject negative call duration', async () => {
      const invalidData = {
        client_id: '550e8400-e29b-41d4-a716-446655440001',
        prospect_name: 'Jane Smith',
        call_type: 'outbound',
        status: 'completed',
        call_duration: -10
      };

      const result = await validateCreateCall(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors?.call_duration).toBe('Call duration cannot be negative');
    });
  });

  describe('Update Call Validation', () => {
    it('should validate partial update data', async () => {
      const validData = {
        prospect_name: 'Updated Name',
        notes: 'Updated notes'
      };

      const result = await validateUpdateCall(validData);
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validData);
    });

    it('should allow empty update', async () => {
      const validData = {};

      const result = await validateUpdateCall(validData);
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validData);
    });
  });

  describe('Create User Validation', () => {
    it('should validate correct user data', async () => {
      const validData = {
        email: 'admin@example.com',
        password: 'adminpassword',
        name: 'Admin User',
        role: 'admin',
        clientId: '550e8400-e29b-41d4-a716-446655440001'
      };

      const result = await validateCreateUser(validData);
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validData);
    });

    it('should reject invalid role', async () => {
      const invalidData = {
        email: 'user@example.com',
        password: 'password123',
        name: 'User Name',
        role: 'invalid-role',
        clientId: '550e8400-e29b-41d4-a716-446655440001'
      };

      const result = await validateCreateUser(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors?.role).toBe('Invalid role. Must be one of: sales, admin, ceo');
    });
  });

  describe('Call Filter Validation', () => {
    it('should validate correct filter data', async () => {
      const validData = {
        clientId: '550e8400-e29b-41d4-a716-446655440001',
        userId: '650e8400-e29b-41d4-a716-446655440003',
        dateFrom: new Date('2024-01-01'),
        dateTo: new Date('2024-12-31'),
        limit: 50,
        offset: 0
      };

      const result = await validateCallFilter(validData);
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validData);
    });

    it('should reject negative limit', async () => {
      const invalidData = {
        limit: -10
      };

      const result = await validateCallFilter(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors?.limit).toBe('Limit must be at least 1');
    });

    it('should reject negative offset', async () => {
      const invalidData = {
        offset: -5
      };

      const result = await validateCallFilter(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors?.offset).toBe('Offset cannot be negative');
    });
  });

  describe('Metrics Filter Validation', () => {
    it('should validate correct metrics filter data', async () => {
      const validData = {
        clientId: '550e8400-e29b-41d4-a716-446655440001',
        userId: '650e8400-e29b-41d4-a716-446655440003',
        dateFrom: new Date('2024-01-01'),
        dateTo: new Date('2024-12-31')
      };

      const result = await validateMetricsFilter(validData);
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validData);
    });

    it('should allow empty filter', async () => {
      const validData = {};

      const result = await validateMetricsFilter(validData);
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validData);
    });
  });
});
