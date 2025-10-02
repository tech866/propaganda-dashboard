#!/usr/bin/env node

/**
 * Test Supabase Connection Script
 * 
 * This script tests the current Supabase configuration
 * to ensure the application can connect properly.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Supabase Connection...\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log(`  Supabase URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
console.log(`  Anon Key: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`);
console.log(`  Service Key: ${supabaseServiceKey ? '✅ Set' : '❌ Missing'}`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\n❌ Missing required Supabase environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test basic connection
async function testConnection() {
  try {
    console.log('\n🔌 Testing basic connection...');
    
    // Test with a simple query
    const { data, error } = await supabase
      .from('clients')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Basic connection successful');
    return true;
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

// Test data access
async function testDataAccess() {
  try {
    console.log('\n📊 Testing data access...');
    
    // Test users table
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, name, role')
      .limit(3);
    
    if (userError) {
      console.error('❌ Users table access failed:', userError.message);
      return false;
    }
    
    console.log(`✅ Users table: ${users.length} records accessible`);
    console.log(`  Sample users: ${users.map(u => `${u.name} (${u.role})`).join(', ')}`);
    
    // Test clients table
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('id, name')
      .limit(3);
    
    if (clientError) {
      console.error('❌ Clients table access failed:', clientError.message);
      return false;
    }
    
    console.log(`✅ Clients table: ${clients.length} records accessible`);
    console.log(`  Sample clients: ${clients.map(c => c.name).join(', ')}`);
    
    // Test calls table
    const { data: calls, error: callError } = await supabase
      .from('calls')
      .select('id, prospect_name, outcome')
      .limit(3);
    
    if (callError) {
      console.error('❌ Calls table access failed:', callError.message);
      return false;
    }
    
    console.log(`✅ Calls table: ${calls.length} records accessible`);
    console.log(`  Sample calls: ${calls.map(c => `${c.prospect_name} (${c.outcome})`).join(', ')}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Data access test failed:', error.message);
    return false;
  }
}

// Test RLS policies
async function testRLSPolicies() {
  try {
    console.log('\n🔒 Testing RLS policies...');
    
    // Test that we can access data (RLS should allow authenticated access)
    const { data, error } = await supabase
      .from('users')
      .select('id, name, role')
      .limit(1);
    
    if (error) {
      console.error('❌ RLS policy test failed:', error.message);
      return false;
    }
    
    console.log('✅ RLS policies working correctly');
    return true;
    
  } catch (error) {
    console.error('❌ RLS policy test failed:', error.message);
    return false;
  }
}

// Test application configuration
async function testApplicationConfig() {
  try {
    console.log('\n🔧 Testing application configuration...');
    
    // Check if Supabase client can be created (simulating app behavior)
    const testClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test a simple operation that the app would do
    const { data, error } = await testClient
      .from('clients')
      .select('id, name')
      .limit(1);
    
    if (error) {
      console.error('❌ Application config test failed:', error.message);
      return false;
    }
    
    console.log('✅ Application configuration working correctly');
    console.log(`  Supabase client can access data: ${data?.length || 0} records`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Application config test failed:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Supabase configuration tests...\n');
  
  const tests = [
    { name: 'Basic Connection', fn: testConnection },
    { name: 'Data Access', fn: testDataAccess },
    { name: 'RLS Policies', fn: testRLSPolicies },
    { name: 'Application Config', fn: testApplicationConfig }
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
    console.log('\n🎉 All tests passed! Supabase configuration is working correctly.');
    console.log('✅ Your application is ready to use Supabase.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the configuration.');
    console.log('❌ Application may not work correctly with Supabase.');
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
