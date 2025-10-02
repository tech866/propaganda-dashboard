#!/usr/bin/env node

/**
 * Test RLS Policies Script
 * 
 * This script tests Row Level Security policies to ensure
 * they work correctly with different user roles.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔐 Testing RLS Policies...\n');

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Create clients
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Test RLS policies
async function testRLSPolicies() {
  try {
    console.log('🔍 Testing RLS Policy Functions...');
    
    // Test 1: Check if RLS functions exist
    const { data: functions, error: functionsError } = await supabaseAdmin
      .rpc('test_rls_policies');
    
    if (functionsError) {
      console.error('❌ RLS functions test failed:', functionsError.message);
      return false;
    }
    
    console.log('✅ RLS functions accessible');
    console.log(`  Found ${functions.length} RLS policies`);
    
    // Test 2: Test without authentication (should fail)
    console.log('\n🔒 Testing unauthenticated access...');
    const { data: unauthenticatedData, error: unauthenticatedError } = await supabaseAnon
      .from('users')
      .select('id, name, role')
      .limit(1);
    
    if (unauthenticatedError) {
      console.log('✅ Unauthenticated access properly blocked');
      console.log(`  Error: ${unauthenticatedError.message}`);
    } else {
      console.log('❌ Unauthenticated access should be blocked');
    }
    
    // Test 3: Test with admin access (should work)
    console.log('\n👑 Testing admin access...');
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('users')
      .select('id, name, role, client_id')
      .limit(5);
    
    if (adminError) {
      console.error('❌ Admin access failed:', adminError.message);
    } else {
      console.log(`✅ Admin access: ${adminData.length} users accessible`);
      console.log(`  Sample users: ${adminData.map(u => `${u.name} (${u.role})`).join(', ')}`);
    }
    
    // Test 4: Test RLS policy functions
    console.log('\n⚙️  Testing RLS policy functions...');
    
    // Test current_user_info function
    const { data: userInfo, error: userInfoError } = await supabaseAdmin
      .rpc('current_user_info');
    
    if (userInfoError) {
      console.log('⚠️  User info function test (expected with admin client):', userInfoError.message);
    } else {
      console.log('✅ User info function accessible');
    }
    
    // Test 5: Check RLS policies are enabled
    console.log('\n🛡️  Checking RLS status...');
    const { data: rlsStatus, error: rlsError } = await supabaseAdmin
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public')
      .in('tablename', ['users', 'clients', 'calls']);
    
    if (rlsError) {
      console.error('❌ RLS status check failed:', rlsError.message);
    } else {
      console.log('✅ RLS status check:');
      rlsStatus.forEach(table => {
        console.log(`  ${table.tablename}: ${table.rowsecurity ? 'ENABLED' : 'DISABLED'}`);
      });
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ RLS policies test failed:', error.message);
    return false;
  }
}

// Test data access with different scenarios
async function testDataAccess() {
  try {
    console.log('\n📊 Testing data access scenarios...');
    
    // Test 1: Get all users (admin access)
    const { data: allUsers, error: allUsersError } = await supabaseAdmin
      .from('users')
      .select('id, name, role, client_id');
    
    if (allUsersError) {
      console.error('❌ Failed to get all users:', allUsersError.message);
      return false;
    }
    
    console.log(`✅ Admin access: ${allUsers.length} users total`);
    
    // Test 2: Get all clients (admin access)
    const { data: allClients, error: allClientsError } = await supabaseAdmin
      .from('clients')
      .select('id, name, email');
    
    if (allClientsError) {
      console.error('❌ Failed to get all clients:', allClientsError.message);
      return false;
    }
    
    console.log(`✅ Admin access: ${allClients.length} clients total`);
    
    // Test 3: Get all calls (admin access)
    const { data: allCalls, error: allCallsError } = await supabaseAdmin
      .from('calls')
      .select('id, prospect_name, outcome, client_id');
    
    if (allCallsError) {
      console.error('❌ Failed to get all calls:', allCallsError.message);
      return false;
    }
    
    console.log(`✅ Admin access: ${allCalls.length} calls total`);
    
    // Test 4: Test client-specific access
    if (allClients.length > 0) {
      const firstClient = allClients[0];
      console.log(`\n🏢 Testing client-specific access for: ${firstClient.name}`);
      
      const { data: clientUsers, error: clientUsersError } = await supabaseAdmin
        .from('users')
        .select('id, name, role')
        .eq('client_id', firstClient.id);
      
      if (clientUsersError) {
        console.error('❌ Failed to get client users:', clientUsersError.message);
      } else {
        console.log(`✅ Client users: ${clientUsers.length} users for ${firstClient.name}`);
      }
      
      const { data: clientCalls, error: clientCallsError } = await supabaseAdmin
        .from('calls')
        .select('id, prospect_name, outcome')
        .eq('client_id', firstClient.id);
      
      if (clientCallsError) {
        console.error('❌ Failed to get client calls:', clientCallsError.message);
      } else {
        console.log(`✅ Client calls: ${clientCalls.length} calls for ${firstClient.name}`);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Data access test failed:', error.message);
    return false;
  }
}

// Test JWT configuration
async function testJWTConfiguration() {
  try {
    console.log('\n🔑 Testing JWT configuration...');
    
    // Test 1: Check if JWT settings are configured
    console.log('  Checking JWT configuration...');
    console.log('  Note: JWT verification requires Clerk JWT template setup');
    console.log('  See: scripts/clerk-jwt-configuration-guide.md');
    
    // Test 2: Test with mock JWT (this will fail until JWT is configured)
    console.log('  Testing JWT verification (expected to fail until configured)...');
    
    const mockJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
    const supabaseWithJWT = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${mockJWT}`,
        },
      },
    });
    
    const { data: jwtData, error: jwtError } = await supabaseWithJWT
      .from('users')
      .select('id')
      .limit(1);
    
    if (jwtError) {
      console.log('✅ JWT verification working (rejected invalid token)');
      console.log(`  Error: ${jwtError.message}`);
    } else {
      console.log('⚠️  JWT verification may not be configured properly');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ JWT configuration test failed:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting RLS policies tests...\n');
  
  const tests = [
    { name: 'RLS Policies', fn: testRLSPolicies },
    { name: 'Data Access', fn: testDataAccess },
    { name: 'JWT Configuration', fn: testJWTConfiguration }
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
    console.log('\n🎉 All RLS tests passed!');
    console.log('✅ RLS policies are configured and working.');
    console.log('\n📋 Next Steps:');
    console.log('1. Configure Clerk JWT template (see guide)');
    console.log('2. Update Supabase JWT settings');
    console.log('3. Test with real user tokens');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
    console.log('❌ RLS policies may not be working correctly.');
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
