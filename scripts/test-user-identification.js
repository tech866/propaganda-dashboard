/**
 * Test Enhanced User Identification
 * Comprehensive testing script for the enhanced user identification system
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: 'john.doe@example.com',
  password: 'password123'
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test function
async function runTest(testName, testFunction) {
  console.log(`\n🧪 Running test: ${testName}`);
  try {
    await testFunction();
    console.log(`✅ ${testName} - PASSED`);
    testResults.passed++;
  } catch (error) {
    console.log(`❌ ${testName} - FAILED: ${error.message}`);
    testResults.failed++;
    testResults.errors.push({ test: testName, error: error.message });
  }
}

// Test 1: Login and get JWT token
async function testLogin() {
  const response = await makeRequest(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: TEST_USER
  });

  if (response.status !== 200) {
    throw new Error(`Login failed with status ${response.status}: ${JSON.stringify(response.data)}`);
  }

  if (!response.data.token) {
    throw new Error('No JWT token received from login');
  }

  return response.data.token;
}

// Test 2: Test enhanced user identification
async function testEnhancedUserIdentification() {
  const token = await testLogin();
  
  const response = await makeRequest(`${BASE_URL}/api/test-user-identification?type=user`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status !== 200) {
    throw new Error(`User identification test failed with status ${response.status}`);
  }

  const userTest = response.data.results.find(r => r.test === 'extract_enhanced_user');
  if (!userTest) {
    throw new Error('User identification test result not found');
  }

  if (!userTest.data.id || !userTest.data.email) {
    throw new Error('Enhanced user data incomplete');
  }

  console.log('   Enhanced user data:', JSON.stringify(userTest.data, null, 2));
}

// Test 3: Test audit context creation
async function testAuditContextCreation() {
  const token = await testLogin();
  
  const response = await makeRequest(`${BASE_URL}/api/test-user-identification?type=context`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status !== 200) {
    throw new Error(`Audit context test failed with status ${response.status}`);
  }

  const contextTest = response.data.results.find(r => r.test === 'create_audit_context');
  if (!contextTest) {
    throw new Error('Audit context test result not found');
  }

  if (!contextTest.data.clientId || !contextTest.data.userId) {
    throw new Error('Audit context data incomplete');
  }

  console.log('   Audit context data:', JSON.stringify(contextTest.data, null, 2));
}

// Test 4: Test session tracking
async function testSessionTracking() {
  const token = await testLogin();
  
  const response = await makeRequest(`${BASE_URL}/api/test-user-identification?type=session`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status !== 200) {
    throw new Error(`Session tracking test failed with status ${response.status}`);
  }

  const sessionTest = response.data.results.find(r => r.test === 'session_tracking');
  if (!sessionTest) {
    throw new Error('Session tracking test result not found');
  }

  if (!sessionTest.data.sessionId || !sessionTest.data.loginTime) {
    throw new Error('Session tracking data incomplete');
  }

  console.log('   Session tracking data:', JSON.stringify(sessionTest.data, null, 2));
}

// Test 5: Test user activity summary
async function testUserActivitySummary() {
  const token = await testLogin();
  
  const response = await makeRequest(`${BASE_URL}/api/test-user-identification?type=activity`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status !== 200) {
    throw new Error(`User activity summary test failed with status ${response.status}`);
  }

  const activityTest = response.data.results.find(r => r.test === 'user_activity_summary');
  if (!activityTest) {
    throw new Error('User activity summary test result not found');
  }

  console.log('   User activity summary:', JSON.stringify(activityTest.data, null, 2));
}

// Test 6: Test enhanced audited database
async function testEnhancedAuditedDatabase() {
  const token = await testLogin();
  
  const response = await makeRequest(`${BASE_URL}/api/test-user-identification?type=database`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status !== 200) {
    throw new Error(`Enhanced audited database test failed with status ${response.status}`);
  }

  const dbTest = response.data.results.find(r => r.test === 'enhanced_audited_database');
  if (!dbTest) {
    throw new Error('Enhanced audited database test result not found');
  }

  if (!dbTest.data.queryResult || !dbTest.data.userInfo) {
    throw new Error('Enhanced audited database data incomplete');
  }

  console.log('   Enhanced audited database data:', JSON.stringify(dbTest.data, null, 2));
}

// Test 7: Test permission validation
async function testPermissionValidation() {
  const token = await testLogin();
  
  const response = await makeRequest(`${BASE_URL}/api/test-user-identification?type=permissions`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status !== 200) {
    throw new Error(`Permission validation test failed with status ${response.status}`);
  }

  const permissionTest = response.data.results.find(r => r.test === 'permission_validation');
  if (!permissionTest) {
    throw new Error('Permission validation test result not found');
  }

  if (!permissionTest.data.userRole || !permissionTest.data.permissionResults) {
    throw new Error('Permission validation data incomplete');
  }

  console.log('   Permission validation data:', JSON.stringify(permissionTest.data, null, 2));
}

// Test 8: Test session management
async function testSessionManagement() {
  const token = await testLogin();
  
  const response = await makeRequest(`${BASE_URL}/api/test-user-identification?type=sessions`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status !== 200) {
    throw new Error(`Session management test failed with status ${response.status}`);
  }

  const sessionTest = response.data.results.find(r => r.test === 'session_management');
  if (!sessionTest) {
    throw new Error('Session management test result not found');
  }

  console.log('   Session management data:', JSON.stringify(sessionTest.data, null, 2));
}

// Test 9: Test comprehensive user identification
async function testComprehensiveUserIdentification() {
  const token = await testLogin();
  
  const response = await makeRequest(`${BASE_URL}/api/test-user-identification?type=all`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status !== 200) {
    throw new Error(`Comprehensive test failed with status ${response.status}`);
  }

  if (response.data.results.length < 7) {
    throw new Error(`Expected 7 test results, got ${response.data.results.length}`);
  }

  console.log('   Comprehensive test results:', response.data.results.length, 'tests completed');
}

// Test 10: Test audit logging with enhanced user identification
async function testAuditLoggingWithEnhancedUser() {
  const token = await testLogin();
  
  const response = await makeRequest(`${BASE_URL}/api/test-audit?type=all`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status !== 200) {
    throw new Error(`Audit logging test failed with status ${response.status}`);
  }

  if (!response.data.success) {
    throw new Error('Audit logging test was not successful');
  }

  console.log('   Audit logging with enhanced user identification completed');
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Enhanced User Identification Tests');
  console.log('=' .repeat(60));

  await runTest('Login and JWT Token', testLogin);
  await runTest('Enhanced User Identification', testEnhancedUserIdentification);
  await runTest('Audit Context Creation', testAuditContextCreation);
  await runTest('Session Tracking', testSessionTracking);
  await runTest('User Activity Summary', testUserActivitySummary);
  await runTest('Enhanced Audited Database', testEnhancedAuditedDatabase);
  await runTest('Permission Validation', testPermissionValidation);
  await runTest('Session Management', testSessionManagement);
  await runTest('Comprehensive User Identification', testComprehensiveUserIdentification);
  await runTest('Audit Logging with Enhanced User', testAuditLoggingWithEnhancedUser);

  console.log('\n' + '=' .repeat(60));
  console.log('📊 Test Results Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

  if (testResults.errors.length > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.errors.forEach(error => {
      console.log(`   - ${error.test}: ${error.error}`);
    });
  }

  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Enhanced user identification is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('💥 Test runner error:', error);
  process.exit(1);
});
