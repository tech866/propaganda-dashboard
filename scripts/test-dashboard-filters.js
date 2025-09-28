#!/usr/bin/env node

/**
 * Test script for dashboard filtering functionality
 * Tests the filtering capabilities of the dashboard components
 */

const BASE_URL = 'http://localhost:3000';

// Test data
const testUsers = [
  {
    email: 'sales1@test.com',
    password: 'password123',
    role: 'sales'
  },
  {
    email: 'admin1@test.com', 
    password: 'password123',
    role: 'admin'
  },
  {
    email: 'ceo1@test.com',
    password: 'password123', 
    role: 'ceo'
  }
];

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

async function loginUser(email, password) {
  console.log(`\n🔐 Logging in user: ${email}`);
  
  const result = await makeRequest(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  if (result.status === 200 && result.data.success) {
    console.log(`✅ Login successful for ${email}`);
    return result.data.token;
  } else {
    console.log(`❌ Login failed for ${email}:`, result.data?.message || result.error);
    return null;
  }
}

async function testMetricsFiltering(token, filters = {}) {
  console.log(`\n📊 Testing metrics filtering with filters:`, filters);
  
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  
  const url = `${BASE_URL}/api/metrics${params.toString() ? '?' + params.toString() : ''}`;
  
  const result = await makeRequest(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (result.status === 200 && result.data.success) {
    console.log(`✅ Metrics filtering successful`);
    console.log(`   Data:`, JSON.stringify(result.data.data, null, 2));
  } else {
    console.log(`❌ Metrics filtering failed:`, result.data?.message || result.error);
  }
  
  return result;
}

async function testCallsFiltering(token, filters = {}) {
  console.log(`\n📞 Testing calls filtering with filters:`, filters);
  
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  
  const url = `${BASE_URL}/api/calls${params.toString() ? '?' + params.toString() : ''}`;
  
  const result = await makeRequest(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (result.status === 200 && result.data.success) {
    console.log(`✅ Calls filtering successful`);
    console.log(`   Found ${result.data.data.length} calls`);
  } else {
    console.log(`❌ Calls filtering failed:`, result.data?.message || result.error);
  }
  
  return result;
}

async function testClientsEndpoint(token) {
  console.log(`\n🏢 Testing clients endpoint`);
  
  const result = await makeRequest(`${BASE_URL}/api/clients`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (result.status === 200 && result.data.success) {
    console.log(`✅ Clients endpoint successful`);
    console.log(`   Found ${result.data.data.length} clients`);
  } else {
    console.log(`❌ Clients endpoint failed:`, result.data?.message || result.error);
  }
  
  return result;
}

async function testUsersEndpoint(token) {
  console.log(`\n👥 Testing users endpoint`);
  
  const result = await makeRequest(`${BASE_URL}/api/users`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (result.status === 200 && result.data.success) {
    console.log(`✅ Users endpoint successful`);
    console.log(`   Found ${result.data.data.length} users`);
  } else {
    console.log(`❌ Users endpoint failed:`, result.data?.message || result.error);
  }
  
  return result;
}

async function runFilterTests() {
  console.log('🚀 Starting Dashboard Filtering Tests\n');
  
  // Test with different user roles
  for (const user of testUsers) {
    const token = await loginUser(user.email, user.password);
    if (!token) continue;
    
    console.log(`\n🧪 Testing filtering for ${user.role.toUpperCase()} user`);
    
    // Test basic endpoints
    await testClientsEndpoint(token);
    await testUsersEndpoint(token);
    
    // Test metrics filtering
    await testMetricsFiltering(token);
    await testMetricsFiltering(token, { 
      dateFrom: '2024-01-01', 
      dateTo: '2024-12-31' 
    });
    
    // Test calls filtering
    await testCallsFiltering(token);
    await testCallsFiltering(token, { 
      dateFrom: '2024-01-01', 
      dateTo: '2024-12-31',
      limit: 10
    });
    
    // Test role-specific filtering
    if (user.role === 'admin' || user.role === 'ceo') {
      await testMetricsFiltering(token, { 
        clientId: '550e8400-e29b-41d4-a716-446655440001' 
      });
      await testCallsFiltering(token, { 
        clientId: '550e8400-e29b-41d4-a716-446655440001' 
      });
    }
  }
  
  console.log('\n✅ Dashboard filtering tests completed!');
}

// Run the tests
runFilterTests().catch(console.error);
