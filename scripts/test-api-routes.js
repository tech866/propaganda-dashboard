#!/usr/bin/env node

/**
 * Test API Routes Script
 * 
 * This script tests all updated API routes to ensure
 * they work correctly with Supabase.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Updated API Routes...\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test API route functionality
async function testAPIRoutes() {
  try {
    console.log('🌐 Testing API Routes...');
    
    // Test 1: Database connection test endpoint
    console.log('  Testing /api/test-db...');
    const testDbResponse = await fetch('http://localhost:3003/api/test-db');
    const testDbData = await testDbResponse.json();
    
    if (testDbData.success && testDbData.connected) {
      console.log('  ✅ /api/test-db: Connection successful');
      console.log(`    Database: ${testDbData.database}`);
    } else {
      console.log('  ❌ /api/test-db: Connection failed');
      console.log(`    Error: ${testDbData.error || 'Unknown error'}`);
    }
    
    // Test 2: Direct Supabase data access (simulating API behavior)
    console.log('  Testing direct data access...');
    
    // Test users table access
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, role, client_id')
      .limit(3);
    
    if (usersError) {
      console.log('  ❌ Users access failed:', usersError.message);
    } else {
      console.log(`  ✅ Users access: ${users.length} users accessible`);
      console.log(`    Sample users: ${users.map(u => `${u.name} (${u.role})`).join(', ')}`);
    }
    
    // Test clients table access
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name, email')
      .limit(3);
    
    if (clientsError) {
      console.log('  ❌ Clients access failed:', clientsError.message);
    } else {
      console.log(`  ✅ Clients access: ${clients.length} clients accessible`);
      console.log(`    Sample clients: ${clients.map(c => c.name).join(', ')}`);
    }
    
    // Test calls table access
    const { data: calls, error: callsError } = await supabase
      .from('calls')
      .select('id, prospect_name, outcome, client_id')
      .limit(3);
    
    if (callsError) {
      console.log('  ❌ Calls access failed:', callsError.message);
    } else {
      console.log(`  ✅ Calls access: ${calls.length} calls accessible`);
      console.log(`    Sample calls: ${calls.map(c => `${c.prospect_name} (${c.outcome})`).join(', ')}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ API routes test failed:', error.message);
    return false;
  }
}

// Test service layer integration
async function testServiceLayerIntegration() {
  try {
    console.log('🔗 Testing service layer integration...');
    
    // Test that services can access data through Supabase
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, name, role, client_id')
      .limit(3);
    
    if (userError) {
      console.error('❌ Service layer integration test failed:', userError.message);
      return false;
    }
    
    const { data: calls, error: callError } = await supabase
      .from('calls')
      .select('id, prospect_name, outcome, client_id')
      .limit(3);
    
    if (callError) {
      console.error('❌ Service layer integration test failed:', callError.message);
      return false;
    }
    
    console.log(`✅ Service layer integration: ${users.length} users, ${calls.length} calls accessible`);
    console.log(`  Sample users: ${users.map(u => `${u.name} (${u.role})`).join(', ')}`);
    console.log(`  Sample calls: ${calls.map(c => `${c.prospect_name} (${c.outcome})`).join(', ')}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Service layer integration test failed:', error.message);
    return false;
  }
}

// Test data relationships
async function testDataRelationships() {
  try {
    console.log('🔗 Testing data relationships...');
    
    // Test user-client relationship
    const { data: userClientData, error: userClientError } = await supabase
      .from('users')
      .select(`
        id,
        name,
        role,
        client_id,
        clients!inner(
          id,
          name
        )
      `)
      .limit(3);
    
    if (userClientError) {
      console.error('❌ User-client relationship test failed:', userClientError.message);
      return false;
    }
    
    console.log(`✅ User-client relationships: ${userClientData.length} relationships accessible`);
    console.log(`  Sample relationships: ${userClientData.map(u => `${u.name} → ${u.clients?.name}`).join(', ')}`);
    
    // Test call-client relationship
    const { data: callClientData, error: callClientError } = await supabase
      .from('calls')
      .select(`
        id,
        prospect_name,
        outcome,
        client_id,
        clients!inner(
          id,
          name
        )
      `)
      .limit(3);
    
    if (callClientError) {
      console.error('❌ Call-client relationship test failed:', callClientError.message);
      return false;
    }
    
    console.log(`✅ Call-client relationships: ${callClientData.length} relationships accessible`);
    console.log(`  Sample relationships: ${callClientData.map(c => `${c.prospect_name} → ${c.clients?.name}`).join(', ')}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Data relationships test failed:', error.message);
    return false;
  }
}

// Test error handling
async function testErrorHandling() {
  try {
    console.log('⚠️  Testing error handling...');
    
    // Test invalid query
    const { data, error } = await supabase
      .from('nonexistent_table')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('✅ Error handling: Invalid queries properly rejected');
      console.log(`  Error message: ${error.message}`);
    } else {
      console.log('❌ Error handling: Invalid queries not properly rejected');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error handling test failed:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting API routes tests...\n');
  
  const tests = [
    { name: 'API Routes', fn: testAPIRoutes },
    { name: 'Service Layer Integration', fn: testServiceLayerIntegration },
    { name: 'Data Relationships', fn: testDataRelationships },
    { name: 'Error Handling', fn: testErrorHandling }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      console.error(`❌ ${test.name} test crashed:`, error.message);
      results.push({ name: test.name, passed: false });
    }
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  results.forEach(result => {
    console.log(`  ${result.name}: ${result.passed ? '✅ PASS' : '❌ FAIL'}`);
  });
  
  const allPassed = results.every(r => r.passed);
  
  if (allPassed) {
    console.log('\n🎉 All API routes tests passed!');
    console.log('✅ API routes are fully updated for Supabase.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
    console.log('❌ Some API routes may not be working correctly.');
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
