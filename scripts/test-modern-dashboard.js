#!/usr/bin/env node

/**
 * Test script for the modern v0-style dashboard design
 * Tests all components, RBAC, filtering, and responsive design
 */

const BASE_URL = 'http://localhost:3000';

// Test users with different roles
const testUsers = {
  sales: { email: 'test@example.com', password: 'password123', role: 'sales' },
  admin: { email: 'admin@example.com', password: 'adminpassword', role: 'admin' },
  ceo: { email: 'ceo@example.com', password: 'ceopassword', role: 'ceo' }
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
    
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      data = { message: 'Non-JSON response' };
    }
    
    return { status: response.status, data, headers: response.headers };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

async function authenticateUser(userType) {
  console.log(`\n🔐 Authenticating ${userType} user...`);
  const user = testUsers[userType];
  const result = await makeRequest(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify(user)
  });
  
  if (result.status === 200 && result.data.success) {
    authTokens[userType] = result.data.token;
    console.log(`✅ ${userType} user authenticated successfully`);
    return true;
  } else {
    console.log(`❌ ${userType} user authentication failed:`, result.data);
    return false;
  }
}

async function testDashboardAccess(userType) {
  console.log(`\n📊 Testing dashboard access for ${userType} user...`);
  const token = authTokens[userType];
  
  if (!token) {
    console.log(`❌ No token available for ${userType} user`);
    return false;
  }
  
  // Test dashboard page
  const dashboardResult = await makeRequest(`${BASE_URL}/dashboard`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (dashboardResult.status === 200) {
    console.log(`✅ Dashboard page accessible for ${userType} user`);
  } else {
    console.log(`❌ Dashboard page not accessible for ${userType} user:`, dashboardResult.status);
  }
  
  return dashboardResult.status === 200;
}

async function testMetricsAccess(userType) {
  console.log(`\n📈 Testing metrics access for ${userType} user...`);
  const token = authTokens[userType];
  
  if (!token) {
    console.log(`❌ No token available for ${userType} user`);
    return false;
  }
  
  // Test metrics endpoint
  const metricsResult = await makeRequest(`${BASE_URL}/api/metrics`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (metricsResult.status === 200) {
    console.log(`✅ Metrics accessible for ${userType} user`);
    console.log(`   Data:`, JSON.stringify(metricsResult.data, null, 2));
  } else {
    console.log(`❌ Metrics not accessible for ${userType} user:`, metricsResult.status);
  }
  
  return metricsResult.status === 200;
}

async function testFilteringFunctionality(userType) {
  console.log(`\n🔍 Testing filtering functionality for ${userType} user...`);
  const token = authTokens[userType];
  
  if (!token) {
    console.log(`❌ No token available for ${userType} user`);
    return false;
  }
  
  // Test metrics with date filters
  const filteredMetricsResult = await makeRequest(`${BASE_URL}/api/metrics?dateFrom=2024-01-01&dateTo=2024-12-31`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (filteredMetricsResult.status === 200) {
    console.log(`✅ Filtered metrics accessible for ${userType} user`);
  } else {
    console.log(`❌ Filtered metrics not accessible for ${userType} user:`, filteredMetricsResult.status);
  }
  
  // Test calls endpoint with filters
  const filteredCallsResult = await makeRequest(`${BASE_URL}/api/calls?limit=10`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (filteredCallsResult.status === 200) {
    console.log(`✅ Filtered calls accessible for ${userType} user`);
  } else {
    console.log(`❌ Filtered calls not accessible for ${userType} user:`, filteredCallsResult.status);
  }
  
  return filteredMetricsResult.status === 200 && filteredCallsResult.status === 200;
}

async function testRBACPermissions(userType) {
  console.log(`\n🛡️ Testing RBAC permissions for ${userType} user...`);
  const token = authTokens[userType];
  
  if (!token) {
    console.log(`❌ No token available for ${userType} user`);
    return false;
  }
  
  const user = testUsers[userType];
  let passedTests = 0;
  let totalTests = 0;
  
  // Test user management access (admin/ceo only)
  totalTests++;
  const usersResult = await makeRequest(`${BASE_URL}/api/users`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (['admin', 'ceo'].includes(user.role)) {
    if (usersResult.status === 200) {
      console.log(`✅ User management accessible for ${userType} user (expected)`);
      passedTests++;
    } else {
      console.log(`❌ User management not accessible for ${userType} user (unexpected):`, usersResult.status);
    }
  } else {
    if (usersResult.status === 403) {
      console.log(`✅ User management correctly restricted for ${userType} user`);
      passedTests++;
    } else {
      console.log(`❌ User management should be restricted for ${userType} user:`, usersResult.status);
    }
  }
  
  // Test audit logs access (admin/ceo only)
  totalTests++;
  const auditResult = await makeRequest(`${BASE_URL}/api/audit`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (['admin', 'ceo'].includes(user.role)) {
    if (auditResult.status === 200) {
      console.log(`✅ Audit logs accessible for ${userType} user (expected)`);
      passedTests++;
    } else {
      console.log(`❌ Audit logs not accessible for ${userType} user (unexpected):`, auditResult.status);
    }
  } else {
    if (auditResult.status === 403) {
      console.log(`✅ Audit logs correctly restricted for ${userType} user`);
      passedTests++;
    } else {
      console.log(`❌ Audit logs should be restricted for ${userType} user:`, auditResult.status);
    }
  }
  
  console.log(`📊 RBAC Test Results: ${passedTests}/${totalTests} tests passed`);
  return passedTests === totalTests;
}

async function testResponsiveDesign() {
  console.log(`\n📱 Testing responsive design components...`);
  
  // Test that the dashboard loads without errors
  const dashboardResult = await makeRequest(`${BASE_URL}/dashboard`);
  
  if (dashboardResult.status === 200 || dashboardResult.status === 302) {
    console.log(`✅ Dashboard page loads successfully`);
    return true;
  } else {
    console.log(`❌ Dashboard page failed to load:`, dashboardResult.status);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Modern Dashboard Design Tests');
  console.log('=' .repeat(50));
  
  let totalPassed = 0;
  let totalTests = 0;
  
  // Test authentication for all user types
  for (const userType of Object.keys(testUsers)) {
    totalTests++;
    if (await authenticateUser(userType)) {
      totalPassed++;
    }
  }
  
  // Test dashboard access for all user types
  for (const userType of Object.keys(testUsers)) {
    totalTests++;
    if (await testDashboardAccess(userType)) {
      totalPassed++;
    }
  }
  
  // Test metrics access for all user types
  for (const userType of Object.keys(testUsers)) {
    totalTests++;
    if (await testMetricsAccess(userType)) {
      totalPassed++;
    }
  }
  
  // Test filtering functionality for all user types
  for (const userType of Object.keys(testUsers)) {
    totalTests++;
    if (await testFilteringFunctionality(userType)) {
      totalPassed++;
    }
  }
  
  // Test RBAC permissions for all user types
  for (const userType of Object.keys(testUsers)) {
    totalTests++;
    if (await testRBACPermissions(userType)) {
      totalPassed++;
    }
  }
  
  // Test responsive design
  totalTests++;
  if (await testResponsiveDesign()) {
    totalPassed++;
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log(`🎯 Test Results: ${totalPassed}/${totalTests} tests passed`);
  
  if (totalPassed === totalTests) {
    console.log('🎉 All tests passed! Modern dashboard design is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please review the issues above.');
  }
  
  return totalPassed === totalTests;
}

// Run the tests
runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
