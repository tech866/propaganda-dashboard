#!/usr/bin/env node

/**
 * Comprehensive Validation Testing Script
 * Tests all API endpoints with various validation scenarios
 */

const BASE_URL = 'http://localhost:3001';

// Test data
const testData = {
  validLogin: {
    email: 'test@example.com',
    password: 'password123'
  },
  invalidLogin: {
    email: 'invalid-email',
    password: '123'
  },
  validRegister: {
    email: 'newuser@example.com',
    password: 'password123',
    name: 'John Doe',
    clientId: '550e8400-e29b-41d4-a716-446655440001'
  },
  invalidRegister: {
    email: 'invalid-email',
    password: '123',
    name: 'J',
    clientId: 'invalid-uuid'
  },
  validCall: {
    client_id: '550e8400-e29b-41d4-a716-446655440001',
    prospect_name: 'Jane Smith',
    prospect_email: 'jane@example.com',
    call_type: 'outbound',
    status: 'completed',
    outcome: 'won'
  },
  invalidCall: {
    client_id: 'invalid-uuid',
    prospect_name: 'J',
    call_type: 'invalid-type',
    status: 'invalid-status',
    outcome: 'invalid-outcome'
  },
  validUser: {
    email: 'admin@example.com',
    password: 'adminpassword',
    name: 'Admin User',
    role: 'admin',
    clientId: '550e8400-e29b-41d4-a716-446655440001'
  },
  invalidUser: {
    email: 'invalid-email',
    password: '123',
    name: 'J',
    role: 'invalid-role',
    clientId: 'invalid-uuid'
  }
};

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

// Test functions
async function testHealthEndpoint() {
  console.log('\n🏥 Testing Health Endpoint...');
  const result = await makeRequest(`${BASE_URL}/api/health`);
  
  if (result.success) {
    console.log('✅ Health endpoint working');
  } else {
    console.log('❌ Health endpoint failed:', result.data);
  }
  
  return result.success;
}

async function testLoginValidation() {
  console.log('\n🔐 Testing Login Validation...');
  
  // Test valid login
  console.log('  Testing valid login...');
  const validResult = await makeRequest(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify(testData.validLogin)
  });
  
  if (validResult.success) {
    console.log('  ✅ Valid login accepted');
  } else {
    console.log('  ❌ Valid login rejected:', validResult.data);
  }
  
  // Test invalid login
  console.log('  Testing invalid login...');
  const invalidResult = await makeRequest(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify(testData.invalidLogin)
  });
  
  if (!invalidResult.success && invalidResult.status === 400) {
    console.log('  ✅ Invalid login properly rejected with 400 status');
    console.log('  📝 Validation errors:', invalidResult.data.error?.details);
  } else {
    console.log('  ❌ Invalid login not properly handled:', invalidResult.data);
  }
  
  return validResult.success && !invalidResult.success;
}

async function testRegisterValidation() {
  console.log('\n📝 Testing Registration Validation...');
  
  // Test valid registration
  console.log('  Testing valid registration...');
  const validResult = await makeRequest(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify(testData.validRegister)
  });
  
  if (validResult.success) {
    console.log('  ✅ Valid registration accepted');
  } else {
    console.log('  ❌ Valid registration rejected:', validResult.data);
  }
  
  // Test invalid registration
  console.log('  Testing invalid registration...');
  const invalidResult = await makeRequest(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify(testData.invalidRegister)
  });
  
  if (!invalidResult.success && invalidResult.status === 400) {
    console.log('  ✅ Invalid registration properly rejected with 400 status');
    console.log('  📝 Validation errors:', invalidResult.data.error?.details);
  } else {
    console.log('  ❌ Invalid registration not properly handled:', invalidResult.data);
  }
  
  return validResult.success && !invalidResult.success;
}

async function testCallValidation() {
  console.log('\n📞 Testing Call Validation...');
  
  // Test valid call creation
  console.log('  Testing valid call creation...');
  const validResult = await makeRequest(`${BASE_URL}/api/calls`, {
    method: 'POST',
    body: JSON.stringify(testData.validCall)
  });
  
  if (validResult.success) {
    console.log('  ✅ Valid call creation accepted');
  } else {
    console.log('  ❌ Valid call creation rejected:', validResult.data);
  }
  
  // Test invalid call creation
  console.log('  Testing invalid call creation...');
  const invalidResult = await makeRequest(`${BASE_URL}/api/calls`, {
    method: 'POST',
    body: JSON.stringify(testData.invalidCall)
  });
  
  if (!invalidResult.success && invalidResult.status === 400) {
    console.log('  ✅ Invalid call creation properly rejected with 400 status');
    console.log('  📝 Validation errors:', invalidResult.data.error?.details);
  } else {
    console.log('  ❌ Invalid call creation not properly handled:', invalidResult.data);
  }
  
  return validResult.success && !invalidResult.success;
}

async function testUserValidation() {
  console.log('\n👥 Testing User Validation...');
  
  // Test valid user creation
  console.log('  Testing valid user creation...');
  const validResult = await makeRequest(`${BASE_URL}/api/users`, {
    method: 'POST',
    body: JSON.stringify(testData.validUser)
  });
  
  if (validResult.success) {
    console.log('  ✅ Valid user creation accepted');
  } else {
    console.log('  ❌ Valid user creation rejected:', validResult.data);
  }
  
  // Test invalid user creation
  console.log('  Testing invalid user creation...');
  const invalidResult = await makeRequest(`${BASE_URL}/api/users`, {
    method: 'POST',
    body: JSON.stringify(testData.invalidUser)
  });
  
  if (!invalidResult.success && invalidResult.status === 400) {
    console.log('  ✅ Invalid user creation properly rejected with 400 status');
    console.log('  📝 Validation errors:', invalidResult.data.error?.details);
  } else {
    console.log('  ❌ Invalid user creation not properly handled:', invalidResult.data);
  }
  
  return validResult.success && !invalidResult.success;
}

async function testMetricsValidation() {
  console.log('\n📊 Testing Metrics Validation...');
  
  // Test valid metrics filter
  console.log('  Testing valid metrics filter...');
  const validResult = await makeRequest(`${BASE_URL}/api/metrics?clientId=550e8400-e29b-41d4-a716-446655440001&dateFrom=2024-01-01&dateTo=2024-12-31`);
  
  if (validResult.success) {
    console.log('  ✅ Valid metrics filter accepted');
  } else {
    console.log('  ❌ Valid metrics filter rejected:', validResult.data);
  }
  
  // Test invalid metrics filter
  console.log('  Testing invalid metrics filter...');
  const invalidResult = await makeRequest(`${BASE_URL}/api/metrics?clientId=invalid-uuid&dateFrom=invalid-date&dateTo=invalid-date`);
  
  if (!invalidResult.success && invalidResult.status === 400) {
    console.log('  ✅ Invalid metrics filter properly rejected with 400 status');
    console.log('  📝 Validation errors:', invalidResult.data.error?.details);
  } else {
    console.log('  ❌ Invalid metrics filter not properly handled:', invalidResult.data);
  }
  
  return validResult.success && !invalidResult.success;
}

async function testValidationEndpoints() {
  console.log('\n🧪 Testing Validation Endpoints...');
  
  // Test validation endpoint
  console.log('  Testing validation endpoint...');
  const validationResult = await makeRequest(`${BASE_URL}/api/test-validation`, {
    method: 'POST',
    body: JSON.stringify({
      schema: 'login',
      data: testData.validLogin
    })
  });
  
  if (validationResult.success) {
    console.log('  ✅ Validation endpoint working');
  } else {
    console.log('  ❌ Validation endpoint failed:', validationResult.data);
  }
  
  // Test validation error endpoint
  console.log('  Testing validation error endpoint...');
  const errorResult = await makeRequest(`${BASE_URL}/api/test-validation-error`);
  
  if (!errorResult.success && errorResult.status === 400) {
    console.log('  ✅ Validation error endpoint working');
  } else {
    console.log('  ❌ Validation error endpoint failed:', errorResult.data);
  }
  
  return validationResult.success && !errorResult.success;
}

async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...');
  
  const errorTests = [
    { type: 'validation', expectedStatus: 400 },
    { type: 'not-found', expectedStatus: 404 },
    { type: 'conflict', expectedStatus: 409 },
    { type: 'database', expectedStatus: 500 },
    { type: 'internal', expectedStatus: 500 },
    { type: 'bad-request', expectedStatus: 400 }
  ];
  
  let allPassed = true;
  
  for (const test of errorTests) {
    console.log(`  Testing ${test.type} error...`);
    const result = await makeRequest(`${BASE_URL}/api/test-errors?type=${test.type}`);
    
    if (result.status === test.expectedStatus) {
      console.log(`  ✅ ${test.type} error handled correctly (${result.status})`);
    } else {
      console.log(`  ❌ ${test.type} error not handled correctly (expected ${test.expectedStatus}, got ${result.status})`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Validation Tests...');
  console.log('=' .repeat(60));
  
  const results = {
    health: await testHealthEndpoint(),
    login: await testLoginValidation(),
    register: await testRegisterValidation(),
    calls: await testCallValidation(),
    users: await testUserValidation(),
    metrics: await testMetricsValidation(),
    validation: await testValidationEndpoints(),
    errors: await testErrorHandling()
  };
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 Test Results Summary:');
  console.log('=' .repeat(60));
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test.toUpperCase()}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  console.log('=' .repeat(60));
  console.log(`🎯 Overall Result: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
  
  if (passed === total) {
    console.log('🎉 All validation tests passed! The validation system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please review the validation implementation.');
  }
  
  return passed === total;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testHealthEndpoint,
  testLoginValidation,
  testRegisterValidation,
  testCallValidation,
  testUserValidation,
  testMetricsValidation,
  testValidationEndpoints,
  testErrorHandling
};
