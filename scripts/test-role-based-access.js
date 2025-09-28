const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001';

// Test users with different roles
const TEST_USERS = [
  {
    email: 'test@example.com',
    password: 'password123',
    role: 'sales',
    name: 'John Doe'
  },
  {
    email: 'admin@example.com',
    password: 'adminpassword',
    role: 'admin',
    name: 'Admin User'
  },
  {
    email: 'ceo@example.com',
    password: 'ceopassword',
    role: 'ceo',
    name: 'CEO User'
  }
];

// Test results storage
const testResults = {
  sales: { passed: 0, failed: 0, tests: [] },
  admin: { passed: 0, failed: 0, tests: [] },
  ceo: { passed: 0, failed: 0, tests: [] }
};

// Helper function to make authenticated requests
async function makeAuthenticatedRequest(url, token, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status 
    };
  }
}

// Test function
async function runTest(testName, testFunction, userRole) {
  try {
    console.log(`\n🧪 Testing ${testName} for ${userRole} user...`);
    const result = await testFunction();
    
    if (result.success) {
      console.log(`✅ ${testName} - PASSED`);
      testResults[userRole].passed++;
      testResults[userRole].tests.push({ name: testName, status: 'PASSED', details: result.data });
    } else {
      console.log(`❌ ${testName} - FAILED: ${result.error}`);
      testResults[userRole].failed++;
      testResults[userRole].tests.push({ name: testName, status: 'FAILED', details: result.error });
    }
  } catch (error) {
    console.log(`❌ ${testName} - ERROR: ${error.message}`);
    testResults[userRole].failed++;
    testResults[userRole].tests.push({ name: testName, status: 'ERROR', details: error.message });
  }
}

// Test authentication and get token
async function testAuthentication(user) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: user.email,
      password: user.password
    });
    
    if (response.data.token) {
      return { success: true, token: response.data.token, user: response.data.user };
    } else {
      return { success: false, error: 'No token received' };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
}

// Test dashboard access
async function testDashboardAccess(token) {
  return await makeAuthenticatedRequest('/dashboard', token);
}

// Test metrics access
async function testMetricsAccess(token) {
  return await makeAuthenticatedRequest('/api/metrics', token);
}

// Test calls access
async function testCallsAccess(token) {
  return await makeAuthenticatedRequest('/api/calls', token);
}

// Test user management access (admin/ceo only)
async function testUserManagementAccess(token) {
  return await makeAuthenticatedRequest('/api/users', token);
}

// Test audit logs access (admin/ceo only)
async function testAuditLogsAccess(token) {
  return await makeAuthenticatedRequest('/api/audit', token);
}

// Test creating a new call
async function testCreateCall(token) {
  const callData = {
    prospect_name: 'Test Prospect',
    prospect_email: 'test@prospect.com',
    call_type: 'outbound',
    status: 'completed',
    outcome: 'won',
    notes: 'Test call for role-based access control'
  };
  
  return await makeAuthenticatedRequest('/api/calls', token, 'POST', callData);
}

// Test creating a new user (admin/ceo only)
async function testCreateUser(token) {
  const userData = {
    email: 'newuser@example.com',
    password: 'newpassword123',
    name: 'New User',
    role: 'sales'
  };
  
  return await makeAuthenticatedRequest('/api/users', token, 'POST', userData);
}

// Main test function
async function testRoleBasedAccess() {
  console.log('🚀 Starting Role-Based Access Control Tests');
  console.log('============================================================\n');

  for (const user of TEST_USERS) {
    console.log(`\n👤 Testing with ${user.role.toUpperCase()} user: ${user.name}`);
    console.log('------------------------------------------------------------');

    // Test authentication
    const authResult = await testAuthentication(user);
    if (!authResult.success) {
      console.log(`❌ Authentication failed: ${authResult.error}`);
      testResults[user.role].failed++;
      testResults[user.role].tests.push({ 
        name: 'Authentication', 
        status: 'FAILED', 
        details: authResult.error 
      });
      continue;
    }

    const token = authResult.token;
    console.log(`✅ Authentication successful for ${user.role} user`);

    // Run tests based on user role
    await runTest('Dashboard Access', () => testDashboardAccess(token), user.role);
    await runTest('Metrics Access', () => testMetricsAccess(token), user.role);
    await runTest('Calls Access', () => testCallsAccess(token), user.role);
    await runTest('Create Call', () => testCreateCall(token), user.role);

    // Admin and CEO specific tests
    if (user.role === 'admin' || user.role === 'ceo') {
      await runTest('User Management Access', () => testUserManagementAccess(token), user.role);
      await runTest('Audit Logs Access', () => testAuditLogsAccess(token), user.role);
      await runTest('Create User', () => testCreateUser(token), user.role);
    } else {
      // Sales users should not have access to admin features
      await runTest('User Management Access (Should Fail)', async () => {
        const result = await testUserManagementAccess(token);
        return { success: !result.success, data: result };
      }, user.role);
      
      await runTest('Audit Logs Access (Should Fail)', async () => {
        const result = await testAuditLogsAccess(token);
        return { success: !result.success, data: result };
      }, user.role);
    }
  }

  // Print summary
  console.log('\n📊 Test Results Summary');
  console.log('============================================================\n');

  for (const [role, results] of Object.entries(testResults)) {
    console.log(`\n${role.toUpperCase()} User Tests:`);
    console.log(`  ✅ Passed: ${results.passed}`);
    console.log(`  ❌ Failed: ${results.failed}`);
    console.log(`  📊 Total: ${results.passed + results.failed}`);
    
    if (results.tests.length > 0) {
      console.log('\n  Test Details:');
      results.tests.forEach(test => {
        const status = test.status === 'PASSED' ? '✅' : '❌';
        console.log(`    ${status} ${test.name}`);
      });
    }
  }

  // Overall summary
  const totalPassed = Object.values(testResults).reduce((sum, result) => sum + result.passed, 0);
  const totalFailed = Object.values(testResults).reduce((sum, result) => sum + result.failed, 0);
  const totalTests = totalPassed + totalFailed;

  console.log('\n🎯 Overall Results:');
  console.log(`  ✅ Total Passed: ${totalPassed}`);
  console.log(`  ❌ Total Failed: ${totalFailed}`);
  console.log(`  📊 Total Tests: ${totalTests}`);
  console.log(`  📈 Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);

  if (totalFailed === 0) {
    console.log('\n🎉 All tests passed! Role-based access control is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.');
  }

  console.log('\n============================================================');
  console.log('🏁 Role-based access control testing completed!\n');
}

// Run the tests
testRoleBasedAccess().catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
