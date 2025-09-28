#!/usr/bin/env node

/**
 * Comprehensive Functional Testing Script for Propaganda Dashboard
 * Tests all features including role-based access control, audit logging, and admin management
 */

const BASE_URL = 'http://localhost:3002'; // Next.js dev server port

// Test data - using the actual credentials from the login route
const testUsers = {
  ceo: {
    email: 'ceo@example.com',
    password: 'ceopassword',
    role: 'ceo',
    clientId: '550e8400-e29b-41d4-a716-446655440001'
  },
  admin: {
    email: 'admin@example.com', 
    password: 'adminpassword',
    role: 'admin',
    clientId: '550e8400-e29b-41d4-a716-446655440001'
  },
  sales: {
    email: 'test@example.com',
    password: 'password123', 
    role: 'sales',
    clientId: '550e8400-e29b-41d4-a716-446655440001'
  }
};

let authTokens = {};

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    // Try to parse JSON, but handle non-JSON responses
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // If it's not JSON, just return the status
      data = { message: 'Non-JSON response' };
    }
    
    return { status: response.status, data, headers: response.headers };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

async function loginUser(userType) {
  console.log(`\n🔐 Logging in ${userType} user...`);
  
  const user = testUsers[userType];
  const result = await makeRequest(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: user.email,
      password: user.password
    })
  });
  
  if (result.status === 200 && result.data.success) {
    authTokens[userType] = result.data.token;
    console.log(`✅ ${userType} user logged in successfully`);
    return true;
  } else {
    console.log(`❌ ${userType} user login failed:`, result.data?.message || result.error);
    return false;
  }
}

async function testHealthEndpoint() {
  console.log('\n🏥 Testing health endpoint...');
  
  const result = await makeRequest(`${BASE_URL}/api/health`);
  
  if (result.status === 200) {
    console.log('✅ Health endpoint is working');
    console.log(`   Status: ${result.data.status}`);
    return true;
  } else {
    console.log('❌ Health endpoint failed');
    console.log(`   Status: ${result.status}, Error: ${result.error || JSON.stringify(result.data)}`);
    return false;
  }
}

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication System...');
  
  // Test login for all user types
  const loginResults = await Promise.all([
    loginUser('ceo'),
    loginUser('admin'), 
    loginUser('sales')
  ]);
  
  const successCount = loginResults.filter(Boolean).length;
  console.log(`\n📊 Authentication Results: ${successCount}/3 users logged in successfully`);
  
  return successCount === 3;
}

async function testRoleBasedAccess() {
  console.log('\n👥 Testing Role-Based Access Control...');
  
  const endpoints = [
    { path: '/api/metrics', method: 'GET', allowedRoles: ['ceo', 'admin', 'sales'] },
    { path: '/api/calls', method: 'GET', allowedRoles: ['ceo', 'admin', 'sales'] },
    { path: '/api/calls', method: 'POST', allowedRoles: ['ceo', 'admin', 'sales'] },
    { path: '/api/users', method: 'GET', allowedRoles: ['ceo', 'admin'] },
    { path: '/api/users', method: 'POST', allowedRoles: ['ceo', 'admin'] },
    { path: '/api/audit', method: 'GET', allowedRoles: ['ceo', 'admin'] },
    { path: '/api/clients', method: 'GET', allowedRoles: ['ceo', 'admin', 'sales'] }
  ];
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const endpoint of endpoints) {
    for (const [userType, token] of Object.entries(authTokens)) {
      totalTests++;
      
      const result = await makeRequest(`${BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const isAllowed = endpoint.allowedRoles.includes(userType);
      const hasAccess = result.status === 200 || result.status === 201;
      
      if (isAllowed && hasAccess) {
        console.log(`✅ ${userType} can access ${endpoint.method} ${endpoint.path}`);
        passedTests++;
      } else if (!isAllowed && result.status === 403) {
        console.log(`✅ ${userType} correctly denied access to ${endpoint.method} ${endpoint.path}`);
        passedTests++;
      } else {
        console.log(`❌ ${userType} access test failed for ${endpoint.method} ${endpoint.path} (Status: ${result.status})`);
      }
    }
  }
  
  console.log(`\n📊 RBAC Results: ${passedTests}/${totalTests} tests passed`);
  return passedTests === totalTests;
}

async function testDashboardFeatures() {
  console.log('\n📊 Testing Dashboard Features...');
  
  const dashboardTests = [
    { name: 'Dashboard Page Access', path: '/dashboard', method: 'GET' },
    { name: 'Metrics API', path: '/api/metrics', method: 'GET' },
    { name: 'Calls API', path: '/api/calls', method: 'GET' },
    { name: 'Clients API', path: '/api/clients', method: 'GET' }
  ];
  
  let passedTests = 0;
  
  for (const test of dashboardTests) {
    const result = await makeRequest(`${BASE_URL}${test.path}`, {
      method: test.method,
      headers: {
        'Authorization': `Bearer ${authTokens.ceo}`
      }
    });
    
    if (result.status === 200 || result.status === 201) {
      console.log(`✅ ${test.name} is working`);
      passedTests++;
    } else {
      console.log(`❌ ${test.name} failed (Status: ${result.status})`);
    }
  }
  
  console.log(`\n📊 Dashboard Results: ${passedTests}/${dashboardTests.length} tests passed`);
  return passedTests === dashboardTests.length;
}

async function testAdminFeatures() {
  console.log('\n⚙️ Testing Admin Management Features...');
  
  const adminTests = [
    { name: 'Admin Dashboard', path: '/admin', method: 'GET' },
    { name: 'User Management', path: '/admin/users', method: 'GET' },
    { name: 'New User Form', path: '/admin/users/new', method: 'GET' },
    { name: 'Loss Reasons Management', path: '/admin/loss-reasons', method: 'GET' },
    { name: 'New Loss Reason Form', path: '/admin/loss-reasons/new', method: 'GET' }
  ];
  
  let passedTests = 0;
  
  for (const test of adminTests) {
    const result = await makeRequest(`${BASE_URL}${test.path}`, {
      method: test.method,
      headers: {
        'Authorization': `Bearer ${authTokens.admin}`
      }
    });
    
    if (result.status === 200) {
      console.log(`✅ ${test.name} is accessible`);
      passedTests++;
    } else {
      console.log(`❌ ${test.name} failed (Status: ${result.status})`);
    }
  }
  
  console.log(`\n📊 Admin Features Results: ${passedTests}/${adminTests.length} tests passed`);
  return passedTests === adminTests.length;
}

async function testDataOperations() {
  console.log('\n💾 Testing Data Operations...');
  
  // Test creating a new call
  const callData = {
    prospect_name: 'QA Test Prospect',
    prospect_email: 'test@example.com',
    prospect_phone: '+1234567890',
    call_type: 'outbound',
    status: 'completed',
    outcome: 'won',
    call_duration: 30,
    notes: 'Testing call creation functionality'
  };
  
  const createCallResult = await makeRequest(`${BASE_URL}/api/calls`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authTokens.sales}`
    },
    body: JSON.stringify(callData)
  });
  
  if (createCallResult.status === 201) {
    console.log('✅ Call creation is working');
    
    // Test creating a new user (admin only)
    const userData = {
      email: 'testuser@propaganda.com',
      name: 'Test User',
      role: 'sales',
      clientId: '550e8400-e29b-41d4-a716-446655440001'
    };
    
    const createUserResult = await makeRequest(`${BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authTokens.admin}`
      },
      body: JSON.stringify(userData)
    });
    
    if (createUserResult.status === 201) {
      console.log('✅ User creation is working');
      return true;
    } else {
      console.log('❌ User creation failed (Status: ${createUserResult.status})');
      return false;
    }
  } else {
    console.log(`❌ Call creation failed (Status: ${createCallResult.status})`);
    return false;
  }
}

async function testAuditLogging() {
  console.log('\n📝 Testing Audit Logging...');
  
  // Make some API calls to generate audit logs
  await makeRequest(`${BASE_URL}/api/metrics`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authTokens.ceo}`
    }
  });
  
  await makeRequest(`${BASE_URL}/api/calls`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authTokens.admin}`
    }
  });
  
  // Check if audit logs are being created
  const auditResult = await makeRequest(`${BASE_URL}/api/audit`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authTokens.admin}`
    }
  });
  
  if (auditResult.status === 200) {
    console.log('✅ Audit logging is working');
    console.log(`   Found ${auditResult.data?.data?.length || 0} audit log entries`);
    return true;
  } else {
    console.log(`❌ Audit logging failed (Status: ${auditResult.status})`);
    return false;
  }
}

async function runFunctionalTests() {
  console.log('🚀 Starting Comprehensive Functional Testing for Propaganda Dashboard\n');
  console.log('=' * 60);
  
  const testResults = {
    health: await testHealthEndpoint(),
    authentication: await testAuthentication(),
    rbac: await testRoleBasedAccess(),
    dashboard: await testDashboardFeatures(),
    admin: await testAdminFeatures(),
    dataOps: await testDataOperations(),
    audit: await testAuditLogging()
  };
  
  console.log('\n' + '=' * 60);
  console.log('📊 FUNCTIONAL TESTING SUMMARY');
  console.log('=' * 60);
  
  const totalTests = Object.keys(testResults).length;
  const passedTests = Object.values(testResults).filter(Boolean).length;
  
  console.log(`Health Check: ${testResults.health ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Authentication: ${testResults.authentication ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Role-Based Access: ${testResults.rbac ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Dashboard Features: ${testResults.dashboard ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Admin Features: ${testResults.admin ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Data Operations: ${testResults.dataOps ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Audit Logging: ${testResults.audit ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} test suites passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All functional tests passed! Application is ready for deployment.');
    return true;
  } else {
    console.log('⚠️  Some tests failed. Please review and fix issues before deployment.');
    return false;
  }
}

// Run the tests
runFunctionalTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
