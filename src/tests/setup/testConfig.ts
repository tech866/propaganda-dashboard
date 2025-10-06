import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

// Test configuration and setup
export const testConfig = {
  // Database configuration for testing
  database: {
    url: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db',
    resetOnEachTest: true,
  },
  
  // API configuration
  api: {
    baseUrl: process.env.TEST_API_URL || 'http://localhost:3000',
    timeout: 10000,
  },
  
  // Authentication configuration
  auth: {
    testUserId: 'test-user-123',
    testClientId: 'test-client-123',
    testAgencyId: 'test-agency-123',
  },
  
  // Test data templates
  templates: {
    validCallData: {
      client_id: 'test-client-123',
      prospect_first_name: 'John',
      prospect_last_name: 'Doe',
      prospect_email: 'john.doe@test.com',
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
    },
    
    validNonSdrCallData: {
      client_id: 'test-client-123',
      prospect_first_name: 'Jane',
      prospect_last_name: 'Smith',
      prospect_email: 'jane.smith@test.com',
      prospect_phone: '+0987654321',
      company_name: 'Test Company',
      source_of_set_appointment: 'non_sdr_booked_call',
      non_sdr_source: 'vsl_booking',
      scrms_outcome: 'call_booked',
      traffic_source: 'meta',
      crm_stage: 'scheduled',
      call_type: 'inbound',
      status: 'completed',
      outcome: 'tbd',
      scheduled_at: new Date('2024-01-01T14:00:00Z'),
    }
  }
};

// Global test setup
beforeAll(async () => {
  // Setup test database
  console.log('Setting up test environment...');
  
  // Initialize test database if needed
  // await setupTestDatabase();
  
  // Setup test authentication
  // await setupTestAuth();
});

afterAll(async () => {
  // Cleanup test environment
  console.log('Cleaning up test environment...');
  
  // Cleanup test database
  // await cleanupTestDatabase();
});

beforeEach(async () => {
  // Reset test data before each test
  if (testConfig.database.resetOnEachTest) {
    // await resetTestData();
  }
});

afterEach(async () => {
  // Cleanup after each test
  // await cleanupTestData();
});

// Helper functions for tests
export const testHelpers = {
  // Create a valid call data object
  createValidCallData: (overrides = {}) => ({
    ...testConfig.templates.validCallData,
    ...overrides
  }),
  
  // Create a valid non-SDR call data object
  createValidNonSdrCallData: (overrides = {}) => ({
    ...testConfig.templates.validNonSdrCallData,
    ...overrides
  }),
  
  // Generate test UUID
  generateTestUuid: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
  
  // Create test date
  createTestDate: (daysFromNow = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
  },
  
  // Validate response structure
  validateApiResponse: (response: any, expectedStatus: number) => {
    expect(response).toHaveProperty('status');
    expect(response.status).toBe(expectedStatus);
    
    if (expectedStatus >= 200 && expectedStatus < 300) {
      expect(response).toHaveProperty('success');
      expect(response.success).toBe(true);
      expect(response).toHaveProperty('data');
    } else {
      expect(response).toHaveProperty('error');
    }
  },
  
  // Validate call data structure
  validateCallData: (callData: any) => {
    expect(callData).toHaveProperty('id');
    expect(callData).toHaveProperty('client_id');
    expect(callData).toHaveProperty('prospect_first_name');
    expect(callData).toHaveProperty('prospect_last_name');
    expect(callData).toHaveProperty('prospect_email');
    expect(callData).toHaveProperty('prospect_phone');
    expect(callData).toHaveProperty('company_name');
    expect(callData).toHaveProperty('source_of_set_appointment');
    expect(callData).toHaveProperty('scrms_outcome');
    expect(callData).toHaveProperty('traffic_source');
    expect(callData).toHaveProperty('crm_stage');
    expect(callData).toHaveProperty('call_type');
    expect(callData).toHaveProperty('status');
    expect(callData).toHaveProperty('outcome');
    expect(callData).toHaveProperty('scheduled_at');
    expect(callData).toHaveProperty('created_at');
    expect(callData).toHaveProperty('updated_at');
  },
  
  // Validate traffic source
  validateTrafficSource: (trafficSource: string) => {
    expect(['organic', 'meta']).toContain(trafficSource);
  },
  
  // Validate CRM stage
  validateCrmStage: (crmStage: string) => {
    expect(['scheduled', 'in_progress', 'completed', 'no_show', 'closed_won', 'lost']).toContain(crmStage);
  },
  
  // Validate SCRM outcome
  validateScrmOutcome: (outcome: string) => {
    const validOutcomes = [
      'call_booked', 'no_show', 'no_close', 'cancelled', 'disqualified',
      'rescheduled', 'payment_plan', 'deposit', 'closed_paid_in_full', 'follow_up_call_scheduled'
    ];
    expect(validOutcomes).toContain(outcome);
  }
};

// Mock data generators
export const mockDataGenerators = {
  // Generate mock call data
  generateMockCall: (overrides = {}) => ({
    id: testHelpers.generateTestUuid(),
    client_id: testConfig.auth.testClientId,
    user_id: testConfig.auth.testUserId,
    prospect_first_name: 'Test',
    prospect_last_name: 'User',
    prospect_email: 'test@example.com',
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
    scheduled_at: testHelpers.createTestDate(1),
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides
  }),
  
  // Generate mock analytics data
  generateMockAnalytics: () => ({
    overall: {
      totalCalls: 100,
      showRate: 75.5,
      closeRate: 45.2,
      callsByStage: {
        scheduled: 20,
        in_progress: 10,
        completed: 30,
        no_show: 15,
        closed_won: 20,
        lost: 5
      }
    },
    organic: {
      totalCalls: 60,
      showRate: 80.0,
      closeRate: 50.0,
      callsByStage: {
        scheduled: 12,
        in_progress: 6,
        completed: 18,
        no_show: 9,
        closed_won: 12,
        lost: 3
      }
    },
    meta: {
      totalCalls: 40,
      showRate: 67.5,
      closeRate: 37.5,
      callsByStage: {
        scheduled: 8,
        in_progress: 4,
        completed: 12,
        no_show: 6,
        closed_won: 8,
        lost: 2
      }
    }
  })
};

export default testConfig;
