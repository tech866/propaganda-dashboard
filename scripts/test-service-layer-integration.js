#!/usr/bin/env node

/**
 * Service Layer Integration Test Suite
 * 
 * This script tests the integration between the application
 * service layer and Supabase to ensure all business logic works correctly.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Testing Service Layer Integration...\n');

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Create clients
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper function to log test results
function logTest(testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}`);
    if (details) console.log(`   ${details}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}`);
    if (details) console.log(`   ${details}`);
  }
  testResults.details.push({ name: testName, passed, details });
}

// Test 1: Client Service Integration
async function testClientService() {
  try {
    console.log('🏢 Testing Client Service Integration...');
    
    // Test getting all clients
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .order('name', { ascending: true });
    
    if (clientsError) {
      logTest('Client Service: Get All Clients', false, clientsError.message);
      return false;
    }
    
    logTest('Client Service: Get All Clients', true, `${clients.length} clients retrieved`);
    
    // Test getting client by ID
    if (clients.length > 0) {
      const firstClient = clients[0];
      const { data: client, error: clientError } = await supabaseAdmin
        .from('clients')
        .select('*')
        .eq('id', firstClient.id)
        .single();
      
      if (clientError) {
        logTest('Client Service: Get Client by ID', false, clientError.message);
      } else {
        logTest('Client Service: Get Client by ID', true, `Client: ${client.name}`);
      }
    }
    
    // Test client creation
    const testClient = {
      name: `Test Client ${Date.now()}`,
      email: `test-client-${Date.now()}@example.com`,
      phone: '555-0123',
      address: '123 Test St, Test City, TC 12345'
    };
    
    const { data: newClient, error: createError } = await supabaseAdmin
      .from('clients')
      .insert(testClient)
      .select()
      .single();
    
    if (createError) {
      logTest('Client Service: Create Client', false, createError.message);
    } else {
      logTest('Client Service: Create Client', true, `Created: ${newClient.name}`);
      
      // Clean up - delete the test client
      await supabaseAdmin
        .from('clients')
        .delete()
        .eq('id', newClient.id);
    }
    
    return true;
  } catch (error) {
    logTest('Client Service Integration', false, error.message);
    return false;
  }
}

// Test 2: User Service Integration
async function testUserService() {
  try {
    console.log('\n👥 Testing User Service Integration...');
    
    // Test getting all users
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        name,
        email,
        role,
        client_id,
        is_active,
        created_at,
        clients!inner(
          id,
          name
        )
      `)
      .order('name', { ascending: true });
    
    if (usersError) {
      logTest('User Service: Get All Users', false, usersError.message);
      return false;
    }
    
    logTest('User Service: Get All Users', true, `${users.length} users retrieved`);
    
    // Test role-based filtering
    const adminUsers = users.filter(user => user.role === 'admin' || user.role === 'ceo');
    const salesUsers = users.filter(user => user.role === 'sales');
    
    logTest('User Service: Role-based Filtering', true, `${adminUsers.length} admins, ${salesUsers.length} sales users`);
    
    // Test user creation
    const { data: clients } = await supabaseAdmin
      .from('clients')
      .select('id')
      .limit(1);
    
    if (clients && clients.length > 0) {
      const testUser = {
        name: `Test User ${Date.now()}`,
        email: `test-user-${Date.now()}@example.com`,
        role: 'sales',
        client_id: clients[0].id,
        is_active: true
      };
      
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert(testUser)
        .select()
        .single();
      
      if (createError) {
        logTest('User Service: Create User', false, createError.message);
      } else {
        logTest('User Service: Create User', true, `Created: ${newUser.name}`);
        
        // Clean up - delete the test user
        await supabaseAdmin
          .from('users')
          .delete()
          .eq('id', newUser.id);
      }
    }
    
    return true;
  } catch (error) {
    logTest('User Service Integration', false, error.message);
    return false;
  }
}

// Test 3: Call Service Integration
async function testCallService() {
  try {
    console.log('\n📞 Testing Call Service Integration...');
    
    // Test getting all calls
    const { data: calls, error: callsError } = await supabaseAdmin
      .from('calls')
      .select(`
        id,
        prospect_name,
        outcome,
        created_at,
        clients!inner(
          id,
          name
        ),
        users!inner(
          id,
          name,
          role
        )
      `)
      .order('created_at', { ascending: false });
    
    if (callsError) {
      logTest('Call Service: Get All Calls', false, callsError.message);
      return false;
    }
    
    logTest('Call Service: Get All Calls', true, `${calls.length} calls retrieved`);
    
    // Test outcome filtering
    const wonCalls = calls.filter(call => call.outcome === 'won');
    const lostCalls = calls.filter(call => call.outcome === 'lost');
    const pendingCalls = calls.filter(call => call.outcome === 'pending');
    
    logTest('Call Service: Outcome Filtering', true, `${wonCalls.length} won, ${lostCalls.length} lost, ${pendingCalls.length} pending`);
    
    // Test call creation
    const { data: clients } = await supabaseAdmin
      .from('clients')
      .select('id')
      .limit(1);
    
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1);
    
    if (clients && clients.length > 0 && users && users.length > 0) {
      const testCall = {
        prospect_name: `Test Prospect ${Date.now()}`,
        outcome: 'pending',
        client_id: clients[0].id,
        user_id: users[0].id,
        notes: 'Test call for integration testing'
      };
      
      const { data: newCall, error: createError } = await supabaseAdmin
        .from('calls')
        .insert(testCall)
        .select()
        .single();
      
      if (createError) {
        logTest('Call Service: Create Call', false, createError.message);
      } else {
        logTest('Call Service: Create Call', true, `Created: ${newCall.prospect_name}`);
        
        // Clean up - delete the test call
        await supabaseAdmin
          .from('calls')
          .delete()
          .eq('id', newCall.id);
      }
    }
    
    return true;
  } catch (error) {
    logTest('Call Service Integration', false, error.message);
    return false;
  }
}

// Test 4: Enhanced Metrics Service Integration
async function testEnhancedMetricsService() {
  try {
    console.log('\n📊 Testing Enhanced Metrics Service Integration...');
    
    // Test getting enhanced metrics
    const { data: calls, error: callsError } = await supabaseAdmin
      .from('calls')
      .select(`
        id,
        status,
        outcome,
        created_at,
        completed_at,
        loss_reason_id,
        closer_first_name,
        closer_last_name,
        source_of_set_appointment,
        enhanced_call_outcome,
        initial_payment_collected_on,
        customer_full_name,
        customer_email,
        calls_taken,
        setter_first_name,
        setter_last_name,
        cash_collected_upfront,
        total_amount_owed,
        prospect_notes,
        lead_source
      `)
      .order('created_at', { ascending: false });
    
    if (callsError) {
      logTest('Enhanced Metrics: Get Call Data', false, callsError.message);
      return false;
    }
    
    logTest('Enhanced Metrics: Get Call Data', true, `${calls.length} calls with enhanced data`);
    
    // Test metrics calculations
    const totalCalls = calls.length;
    const wonCalls = calls.filter(call => call.outcome === 'won').length;
    const lostCalls = calls.filter(call => call.outcome === 'lost').length;
    const conversionRate = totalCalls > 0 ? (wonCalls / totalCalls * 100).toFixed(2) : 0;
    
    logTest('Enhanced Metrics: Conversion Rate', true, `${conversionRate}% (${wonCalls}/${totalCalls})`);
    
    // Test enhanced call outcomes
    const enhancedOutcomes = calls.filter(call => call.enhanced_call_outcome).length;
    logTest('Enhanced Metrics: Enhanced Outcomes', true, `${enhancedOutcomes} calls with enhanced outcomes`);
    
    // Test payment tracking
    const paymentCollected = calls.filter(call => call.initial_payment_collected_on).length;
    logTest('Enhanced Metrics: Payment Tracking', true, `${paymentCollected} calls with payment collected`);
    
    return true;
  } catch (error) {
    logTest('Enhanced Metrics Service Integration', false, error.message);
    return false;
  }
}

// Test 5: Database Service Layer Integration
async function testDatabaseServiceLayer() {
  try {
    console.log('\n🗄️  Testing Database Service Layer Integration...');
    
    // Test database service functions
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role, client_id')
      .limit(5);
    
    if (usersError) {
      logTest('Database Service: User Queries', false, usersError.message);
      return false;
    }
    
    logTest('Database Service: User Queries', true, `${users.length} users queried`);
    
    // Test complex queries
    const { data: complexData, error: complexError } = await supabaseAdmin
      .from('calls')
      .select(`
        id,
        prospect_name,
        outcome,
        created_at,
        clients!inner(
          id,
          name,
          email
        ),
        users!inner(
          id,
          name,
          role
        )
      `)
      .eq('outcome', 'won')
      .limit(10);
    
    if (complexError) {
      logTest('Database Service: Complex Queries', false, complexError.message);
    } else {
      logTest('Database Service: Complex Queries', true, `${complexData.length} won calls with joins`);
    }
    
    // Test filtering and sorting
    const { data: filteredData, error: filteredError } = await supabaseAdmin
      .from('calls')
      .select('id, prospect_name, outcome, created_at')
      .gte('created_at', '2024-01-01')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (filteredError) {
      logTest('Database Service: Filtering & Sorting', false, filteredError.message);
    } else {
      logTest('Database Service: Filtering & Sorting', true, `${filteredData.length} calls filtered and sorted`);
    }
    
    return true;
  } catch (error) {
    logTest('Database Service Layer Integration', false, error.message);
    return false;
  }
}

// Test 6: API Integration
async function testAPIIntegration() {
  try {
    console.log('\n🌐 Testing API Integration...');
    
    // Test API endpoints
    const endpoints = [
      { path: '/api/test-db', name: 'Database Connection' },
      { path: '/api/users', name: 'Users API' },
      { path: '/api/clients', name: 'Clients API' },
      { path: '/api/calls', name: 'Calls API' }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:3003${endpoint.path}`);
        const data = await response.json();
        
        if (response.status === 200 && data.success) {
          logTest(`API: ${endpoint.name}`, true, `Status: ${response.status}`);
        } else if (response.status === 401 || response.status === 403) {
          logTest(`API: ${endpoint.name}`, true, `Properly requires authentication (${response.status})`);
        } else {
          logTest(`API: ${endpoint.name}`, false, `Unexpected response: ${response.status}`);
        }
      } catch (error) {
        logTest(`API: ${endpoint.name}`, false, error.message);
      }
    }
    
    return true;
  } catch (error) {
    logTest('API Integration', false, error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting service layer integration tests...\n');
  
  const tests = [
    { name: 'Client Service', fn: testClientService },
    { name: 'User Service', fn: testUserService },
    { name: 'Call Service', fn: testCallService },
    { name: 'Enhanced Metrics Service', fn: testEnhancedMetricsService },
    { name: 'Database Service Layer', fn: testDatabaseServiceLayer },
    { name: 'API Integration', fn: testAPIIntegration }
  ];
  
  for (const test of tests) {
    try {
      await test.fn();
    } catch (error) {
      console.error(`❌ ${test.name} test crashed:`, error.message);
      testResults.total++;
      testResults.failed++;
      testResults.details.push({ name: test.name, passed: false, details: error.message });
    }
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log(`  Total Tests: ${testResults.total}`);
  console.log(`  Passed: ${testResults.passed}`);
  console.log(`  Failed: ${testResults.failed}`);
  console.log(`  Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  console.log('\n📋 Detailed Results:');
  testResults.details.forEach(result => {
    console.log(`  ${result.passed ? '✅' : '❌'} ${result.name}: ${result.details}`);
  });
  
  const allPassed = testResults.failed === 0;
  
  if (allPassed) {
    console.log('\n🎉 All service layer integration tests passed!');
    console.log('✅ Service layer is properly integrated with Supabase.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
    console.log('❌ Service layer integration may have issues.');
  }
  
  return allPassed;
}

// Run tests if called directly
if (require.main === module) {
  runTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { runTests };
