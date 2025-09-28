#!/usr/bin/env node

/**
 * Client-Side Validation Testing Script
 * Tests all client-side validation scenarios
 */

const BASE_URL = 'http://localhost:3001';

// Test scenarios for client-side validation
const testScenarios = {
  login: {
    valid: {
      email: 'test@example.com',
      password: 'password123'
    },
    invalid: [
      { email: 'invalid-email', password: 'password123', expectedError: 'email' },
      { email: 'test@example.com', password: '123', expectedError: 'password' },
      { email: '', password: 'password123', expectedError: 'email' },
      { email: 'test@example.com', password: '', expectedError: 'password' }
    ]
  },
  register: {
    valid: {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'John Doe',
      clientId: '550e8400-e29b-41d4-a716-446655440001'
    },
    invalid: [
      { email: 'invalid-email', password: 'password123', name: 'John Doe', clientId: '550e8400-e29b-41d4-a716-446655440001', expectedError: 'email' },
      { email: 'newuser@example.com', password: '123', name: 'John Doe', clientId: '550e8400-e29b-41d4-a716-446655440001', expectedError: 'password' },
      { email: 'newuser@example.com', password: 'password123', name: 'J', clientId: '550e8400-e29b-41d4-a716-446655440001', expectedError: 'name' },
      { email: 'newuser@example.com', password: 'password123', name: 'John Doe', clientId: 'invalid-uuid', expectedError: 'clientId' }
    ]
  },
  call: {
    valid: {
      client_id: '550e8400-e29b-41d4-a716-446655440001',
      prospect_name: 'Jane Smith',
      prospect_email: 'jane@example.com',
      call_type: 'outbound',
      status: 'completed',
      outcome: 'won'
    },
    invalid: [
      { client_id: 'invalid-uuid', prospect_name: 'Jane Smith', call_type: 'outbound', status: 'completed', expectedError: 'client_id' },
      { client_id: '550e8400-e29b-41d4-a716-446655440001', prospect_name: 'J', call_type: 'outbound', status: 'completed', expectedError: 'prospect_name' },
      { client_id: '550e8400-e29b-41d4-a716-446655440001', prospect_name: 'Jane Smith', call_type: 'invalid-type', status: 'completed', expectedError: 'call_type' },
      { client_id: '550e8400-e29b-41d4-a716-446655440001', prospect_name: 'Jane Smith', call_type: 'outbound', status: 'invalid-status', expectedError: 'status' }
    ]
  },
  user: {
    valid: {
      email: 'admin@example.com',
      password: 'adminpassword',
      name: 'Admin User',
      role: 'admin',
      clientId: '550e8400-e29b-41d4-a716-446655440001'
    },
    invalid: [
      { email: 'invalid-email', password: 'adminpassword', name: 'Admin User', role: 'admin', clientId: '550e8400-e29b-41d4-a716-446655440001', expectedError: 'email' },
      { email: 'admin@example.com', password: '123', name: 'Admin User', role: 'admin', clientId: '550e8400-e29b-41d4-a716-446655440001', expectedError: 'password' },
      { email: 'admin@example.com', password: 'adminpassword', name: 'A', role: 'admin', clientId: '550e8400-e29b-41d4-a716-446655440001', expectedError: 'name' },
      { email: 'admin@example.com', password: 'adminpassword', name: 'Admin User', role: 'invalid-role', clientId: '550e8400-e29b-41d4-a716-446655440001', expectedError: 'role' },
      { email: 'admin@example.com', password: 'adminpassword', name: 'Admin User', role: 'admin', clientId: 'invalid-uuid', expectedError: 'clientId' }
    ]
  }
};

// Helper function to test form validation
async function testFormValidation(formType, testData, expectedError = null) {
  try {
    const response = await fetch(`${BASE_URL}/api/test-validation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        schema: formType,
        data: testData
      })
    });

    const result = await response.json();
    
    if (expectedError) {
      // We expect validation to fail
      if (!result.validation.isValid && result.validation.errors && result.validation.errors[expectedError]) {
        return {
          success: true,
          message: `✅ ${formType} validation correctly rejected invalid ${expectedError}`,
          error: result.validation.errors[expectedError]
        };
      } else {
        return {
          success: false,
          message: `❌ ${formType} validation should have rejected ${expectedError}`,
          result: result
        };
      }
    } else {
      // We expect validation to pass
      if (result.validation.isValid) {
        return {
          success: true,
          message: `✅ ${formType} validation correctly accepted valid data`,
          data: result.validation.data
        };
      } else {
        return {
          success: false,
          message: `❌ ${formType} validation should have accepted valid data`,
          errors: result.validation.errors
        };
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `❌ ${formType} validation test failed: ${error.message}`,
      error: error
    };
  }
}

// Test individual form validation
async function testLoginValidation() {
  console.log('\n🔐 Testing Login Form Validation...');
  
  // Test valid login
  const validResult = await testFormValidation('login', testScenarios.login.valid);
  console.log(`  ${validResult.message}`);
  
  // Test invalid login scenarios
  let allPassed = validResult.success;
  for (const invalidScenario of testScenarios.login.invalid) {
    const { expectedError, ...testData } = invalidScenario;
    const result = await testFormValidation('login', testData, expectedError);
    console.log(`  ${result.message}`);
    if (result.success) {
      console.log(`    📝 Error message: "${result.error}"`);
    }
    allPassed = allPassed && result.success;
  }
  
  return allPassed;
}

async function testRegisterValidation() {
  console.log('\n📝 Testing Registration Form Validation...');
  
  // Test valid registration
  const validResult = await testFormValidation('register', testScenarios.register.valid);
  console.log(`  ${validResult.message}`);
  
  // Test invalid registration scenarios
  let allPassed = validResult.success;
  for (const invalidScenario of testScenarios.register.invalid) {
    const { expectedError, ...testData } = invalidScenario;
    const result = await testFormValidation('register', testData, expectedError);
    console.log(`  ${result.message}`);
    if (result.success) {
      console.log(`    📝 Error message: "${result.error}"`);
    }
    allPassed = allPassed && result.success;
  }
  
  return allPassed;
}

async function testCallValidation() {
  console.log('\n📞 Testing Call Form Validation...');
  
  // Test valid call
  const validResult = await testFormValidation('createCall', testScenarios.call.valid);
  console.log(`  ${validResult.message}`);
  
  // Test invalid call scenarios
  let allPassed = validResult.success;
  for (const invalidScenario of testScenarios.call.invalid) {
    const { expectedError, ...testData } = invalidScenario;
    const result = await testFormValidation('createCall', testData, expectedError);
    console.log(`  ${result.message}`);
    if (result.success) {
      console.log(`    📝 Error message: "${result.error}"`);
    }
    allPassed = allPassed && result.success;
  }
  
  return allPassed;
}

async function testUserValidation() {
  console.log('\n👥 Testing User Form Validation...');
  
  // Test valid user
  const validResult = await testFormValidation('createUser', testScenarios.user.valid);
  console.log(`  ${validResult.message}`);
  
  // Test invalid user scenarios
  let allPassed = validResult.success;
  for (const invalidScenario of testScenarios.user.invalid) {
    const { expectedError, ...testData } = invalidScenario;
    const result = await testFormValidation('createUser', testData, expectedError);
    console.log(`  ${result.message}`);
    if (result.success) {
      console.log(`    📝 Error message: "${result.error}"`);
    }
    allPassed = allPassed && result.success;
  }
  
  return allPassed;
}

async function testFilterValidation() {
  console.log('\n🔍 Testing Filter Validation...');
  
  // Test valid call filter
  const validCallFilter = await testFormValidation('callFilter', {
    clientId: '550e8400-e29b-41d4-a716-446655440001',
    userId: '650e8400-e29b-41d4-a716-446655440003',
    limit: 50,
    offset: 0
  });
  console.log(`  ${validCallFilter.message}`);
  
  // Test invalid call filter
  const invalidCallFilter = await testFormValidation('callFilter', {
    clientId: 'invalid-uuid',
    limit: -10,
    offset: -5
  }, 'clientId');
  console.log(`  ${invalidCallFilter.message}`);
  
  // Test valid metrics filter
  const validMetricsFilter = await testFormValidation('metricsFilter', {
    clientId: '550e8400-e29b-41d4-a716-446655440001',
    dateFrom: '2024-01-01',
    dateTo: '2024-12-31'
  });
  console.log(`  ${validMetricsFilter.message}`);
  
  return validCallFilter.success && invalidCallFilter.success && validMetricsFilter.success;
}

async function testEdgeCases() {
  console.log('\n🔬 Testing Edge Cases...');
  
  const edgeCases = [
    {
      name: 'Empty object validation',
      schema: 'login',
      data: {},
      expectedError: 'email'
    },
    {
      name: 'Null values validation',
      schema: 'createCall',
      data: {
        client_id: '550e8400-e29b-41d4-a716-446655440001',
        prospect_name: 'Jane Smith',
        prospect_email: null,
        call_type: 'outbound',
        status: 'completed'
      },
      expectedError: null // Should pass with null email
    },
    {
      name: 'Undefined values validation',
      schema: 'register',
      data: {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
        clientId: undefined
      },
      expectedError: 'clientId'
    },
    {
      name: 'Extra fields validation',
      schema: 'login',
      data: {
        email: 'test@example.com',
        password: 'password123',
        extraField: 'should be stripped'
      },
      expectedError: null // Should pass and strip extra field
    }
  ];
  
  let allPassed = true;
  
  for (const testCase of edgeCases) {
    console.log(`  Testing ${testCase.name}...`);
    const result = await testFormValidation(testCase.schema, testCase.data, testCase.expectedError);
    console.log(`    ${result.message}`);
    allPassed = allPassed && result.success;
  }
  
  return allPassed;
}

// Main test runner
async function runClientValidationTests() {
  console.log('🚀 Starting Client-Side Validation Tests...');
  console.log('=' .repeat(60));
  
  const results = {
    login: await testLoginValidation(),
    register: await testRegisterValidation(),
    calls: await testCallValidation(),
    users: await testUserValidation(),
    filters: await testFilterValidation(),
    edgeCases: await testEdgeCases()
  };
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 Client-Side Validation Test Results:');
  console.log('=' .repeat(60));
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test.toUpperCase()}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  console.log('=' .repeat(60));
  console.log(`🎯 Overall Result: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
  
  if (passed === total) {
    console.log('🎉 All client-side validation tests passed! The validation system is working correctly.');
  } else {
    console.log('⚠️  Some client-side validation tests failed. Please review the implementation.');
  }
  
  return passed === total;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runClientValidationTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Client validation test runner failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runClientValidationTests,
  testLoginValidation,
  testRegisterValidation,
  testCallValidation,
  testUserValidation,
  testFilterValidation,
  testEdgeCases
};
