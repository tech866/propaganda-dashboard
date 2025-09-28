#!/usr/bin/env node

/**
 * Simple Validation Testing Script
 * Tests validation endpoints that don't require authentication
 */

const BASE_URL = 'http://localhost:3001';

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      data = { error: 'Invalid JSON response', raw: await response.text() };
    }
    
    return {
      status: response.status,
      data,
      success: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      data: { error: error.message },
      success: false
    };
  }
}

// Test validation endpoint with various schemas
async function testValidationEndpoint() {
  console.log('\n🧪 Testing Validation Endpoint...');
  
  const testCases = [
    {
      name: 'Valid Login Data',
      schema: 'login',
      data: { email: 'test@example.com', password: 'Password123' },
      shouldPass: true
    },
    {
      name: 'Invalid Login Data',
      schema: 'login',
      data: { email: 'invalid-email', password: '123' },
      shouldPass: false
    },
    {
      name: 'Valid Registration Data',
      schema: 'register',
      data: {
        email: 'newuser@example.com',
        password: 'Password123',
        name: 'John Doe',
        clientId: '550e8400-e29b-41d4-a716-446655440001'
      },
      shouldPass: true
    },
    {
      name: 'Invalid Registration Data',
      schema: 'register',
      data: {
        email: 'invalid-email',
        password: '123',
        name: 'J',
        clientId: 'invalid-uuid'
      },
      shouldPass: false
    },
    {
      name: 'Valid Call Data',
      schema: 'createCall',
      data: {
        client_id: '550e8400-e29b-41d4-a716-446655440001',
        prospect_name: 'Jane Smith',
        call_type: 'outbound',
        status: 'completed'
      },
      shouldPass: true
    },
    {
      name: 'Invalid Call Data',
      schema: 'createCall',
      data: {
        client_id: 'invalid-uuid',
        prospect_name: 'J',
        call_type: 'invalid-type',
        status: 'invalid-status'
      },
      shouldPass: false
    },
    {
      name: 'Valid User Data',
      schema: 'createUser',
      data: {
        email: 'admin@example.com',
        password: 'AdminPassword123',
        name: 'Admin User',
        role: 'admin',
        clientId: '550e8400-e29b-41d4-a716-446655440001'
      },
      shouldPass: true
    },
    {
      name: 'Invalid User Data',
      schema: 'createUser',
      data: {
        email: 'invalid-email',
        password: '123',
        name: 'J',
        role: 'invalid-role',
        clientId: 'invalid-uuid'
      },
      shouldPass: false
    },
    {
      name: 'Valid Call Filter',
      schema: 'callFilter',
      data: {
        clientId: '550e8400-e29b-41d4-a716-446655440001',
        limit: 50,
        offset: 0
      },
      shouldPass: true
    },
    {
      name: 'Invalid Call Filter',
      schema: 'callFilter',
      data: {
        clientId: 'invalid-uuid',
        limit: -10,
        offset: -5
      },
      shouldPass: false
    },
    {
      name: 'Valid Metrics Filter',
      schema: 'metricsFilter',
      data: {
        clientId: '550e8400-e29b-41d4-a716-446655440001',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      },
      shouldPass: true
    },
    {
      name: 'Invalid Metrics Filter',
      schema: 'metricsFilter',
      data: {
        clientId: 'invalid-uuid',
        dateFrom: 'invalid-date',
        dateTo: 'invalid-date'
      },
      shouldPass: false
    }
  ];

  let passed = 0;
  let total = testCases.length;

  for (const testCase of testCases) {
    console.log(`  Testing ${testCase.name}...`);
    
    const result = await makeRequest(`${BASE_URL}/api/test-validation`, {
      method: 'POST',
      body: JSON.stringify({
        schema: testCase.schema,
        data: testCase.data
      })
    });

    if (result.success && testCase.shouldPass) {
      if (result.data.validation?.isValid) {
        console.log(`    ✅ PASSED - Valid data accepted`);
        passed++;
      } else {
        console.log(`    ❌ FAILED - Valid data rejected:`, result.data.validation?.errors);
      }
    } else if (!result.success && !testCase.shouldPass) {
      console.log(`    ✅ PASSED - Invalid data rejected`);
      passed++;
    } else if (result.success && !testCase.shouldPass) {
      if (!result.data.validation?.isValid) {
        console.log(`    ✅ PASSED - Invalid data rejected`);
        console.log(`    📝 Errors:`, result.data.validation?.errors);
        passed++;
      } else {
        console.log(`    ❌ FAILED - Invalid data accepted`);
      }
    } else {
      console.log(`    ❌ FAILED - Unexpected result:`, result.data);
    }
  }

  return { passed, total };
}

// Test error handling endpoints
async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...');
  
  const errorTests = [
    { type: 'validation', expectedStatus: 400 },
    { type: 'not-found', expectedStatus: 404 },
    { type: 'conflict', expectedStatus: 409 },
    { type: 'database', expectedStatus: 500 },
    { type: 'internal', expectedStatus: 500 }
  ];
  
  let passed = 0;
  let total = errorTests.length;
  
  for (const test of errorTests) {
    console.log(`  Testing ${test.type} error...`);
    const result = await makeRequest(`${BASE_URL}/api/test-errors?type=${test.type}`);
    
    if (result.status === test.expectedStatus) {
      console.log(`    ✅ PASSED - ${test.type} error handled correctly (${result.status})`);
      passed++;
    } else {
      console.log(`    ❌ FAILED - ${test.type} error not handled correctly (expected ${test.expectedStatus}, got ${result.status})`);
    }
  }
  
  return { passed, total };
}

// Test health endpoint
async function testHealthEndpoint() {
  console.log('\n🏥 Testing Health Endpoint...');
  const result = await makeRequest(`${BASE_URL}/api/health`);
  
  if (result.success) {
    console.log('  ✅ Health endpoint working');
    return { passed: 1, total: 1 };
  } else {
    console.log('  ❌ Health endpoint failed:', result.data);
    return { passed: 0, total: 1 };
  }
}

// Test validation error endpoint
async function testValidationErrorEndpoint() {
  console.log('\n🔍 Testing Validation Error Endpoint...');
  const result = await makeRequest(`${BASE_URL}/api/test-validation-error`);
  
  if (!result.success && result.status === 400) {
    console.log('  ✅ Validation error endpoint working');
    return { passed: 1, total: 1 };
  } else {
    console.log('  ❌ Validation error endpoint failed:', result.data);
    return { passed: 0, total: 1 };
  }
}

// Main test runner
async function runSimpleValidationTests() {
  console.log('🚀 Starting Simple Validation Tests...');
  console.log('=' .repeat(60));
  
  const healthResult = await testHealthEndpoint();
  const validationResult = await testValidationEndpoint();
  const errorResult = await testErrorHandling();
  const validationErrorResult = await testValidationErrorEndpoint();
  
  const totalPassed = healthResult.passed + validationResult.passed + errorResult.passed + validationErrorResult.passed;
  const totalTests = healthResult.total + validationResult.total + errorResult.total + validationErrorResult.total;
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 Simple Validation Test Results:');
  console.log('=' .repeat(60));
  console.log(`🏥 Health Endpoint: ${healthResult.passed}/${healthResult.total} passed`);
  console.log(`🧪 Validation Endpoint: ${validationResult.passed}/${validationResult.total} passed`);
  console.log(`🚨 Error Handling: ${errorResult.passed}/${errorResult.total} passed`);
  console.log(`🔍 Validation Error: ${validationErrorResult.passed}/${validationErrorResult.total} passed`);
  console.log('=' .repeat(60));
  console.log(`🎯 Overall Result: ${totalPassed}/${totalTests} tests passed (${Math.round(totalPassed/totalTests*100)}%)`);
  
  if (totalPassed === totalTests) {
    console.log('🎉 All validation tests passed! The validation system is working correctly.');
  } else {
    console.log('⚠️  Some validation tests failed. Please review the implementation.');
  }
  
  return totalPassed === totalTests;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runSimpleValidationTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Simple validation test runner failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runSimpleValidationTests,
  testValidationEndpoint,
  testErrorHandling,
  testHealthEndpoint,
  testValidationErrorEndpoint
};
