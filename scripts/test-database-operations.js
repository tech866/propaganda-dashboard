#!/usr/bin/env node

/**
 * Comprehensive Database Operations Test Suite
 * 
 * This script tests all database operations to ensure
 * the Supabase migration was successful and all functionality works correctly.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🧪 Testing Database Operations...\n');

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Create clients
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
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

// Test 1: Basic Connection and Authentication
async function testBasicConnection() {
  try {
    console.log('🔌 Testing Basic Connection...');
    
    // Test admin connection
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);
    
    if (adminError) {
      logTest('Admin Connection', false, adminError.message);
      return false;
    }
    logTest('Admin Connection', true, 'Service role key working');
    
    // Test anon connection (should work but with limited access)
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('users')
      .select('count')
      .limit(1);
    
    if (anonError) {
      logTest('Anon Connection', false, anonError.message);
    } else {
      logTest('Anon Connection', true, 'Anon key working');
    }
    
    return true;
  } catch (error) {
    logTest('Basic Connection', false, error.message);
    return false;
  }
}

// Test 2: Data Integrity and Schema
async function testDataIntegrity() {
  try {
    console.log('\n📊 Testing Data Integrity...');
    
    // Test users table
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role, client_id, is_active, created_at');
    
    if (usersError) {
      logTest('Users Table Access', false, usersError.message);
      return false;
    }
    
    logTest('Users Table Access', true, `${users.length} users found`);
    
    // Validate user data structure
    const validUsers = users.filter(user => 
      user.id && user.name && user.email && user.role && user.client_id
    );
    
    if (validUsers.length === users.length) {
      logTest('Users Data Structure', true, 'All users have required fields');
    } else {
      logTest('Users Data Structure', false, `${users.length - validUsers.length} users missing required fields`);
    }
    
    // Test clients table
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select('id, name, email, created_at');
    
    if (clientsError) {
      logTest('Clients Table Access', false, clientsError.message);
    } else {
      logTest('Clients Table Access', true, `${clients.length} clients found`);
    }
    
    // Test calls table
    const { data: calls, error: callsError } = await supabaseAdmin
      .from('calls')
      .select('id, prospect_name, outcome, client_id, created_at');
    
    if (callsError) {
      logTest('Calls Table Access', false, callsError.message);
    } else {
      logTest('Calls Table Access', true, `${calls.length} calls found`);
    }
    
    return true;
  } catch (error) {
    logTest('Data Integrity', false, error.message);
    return false;
  }
}

// Test 3: CRUD Operations
async function testCRUDOperations() {
  try {
    console.log('\n🔄 Testing CRUD Operations...');
    
    // Get a valid client ID first
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select('id')
      .limit(1);
    
    if (clientsError || !clients || clients.length === 0) {
      logTest('CREATE Operation', false, 'No valid client ID found');
      return false;
    }
    
    // Test CREATE operation
    const testUser = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      role: 'sales',
      client_id: clients[0].id, // Use existing client ID
      is_active: true
    };
    
    const { data: createdUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert(testUser)
      .select()
      .single();
    
    if (createError) {
      logTest('CREATE Operation', false, createError.message);
      return false;
    }
    
    logTest('CREATE Operation', true, `Created user: ${createdUser.name}`);
    
    // Test READ operation
    const { data: readUser, error: readError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', createdUser.id)
      .single();
    
    if (readError) {
      logTest('READ Operation', false, readError.message);
    } else {
      logTest('READ Operation', true, `Read user: ${readUser.name}`);
    }
    
    // Test UPDATE operation
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ name: 'Updated Test User' })
      .eq('id', createdUser.id)
      .select()
      .single();
    
    if (updateError) {
      logTest('UPDATE Operation', false, updateError.message);
    } else {
      logTest('UPDATE Operation', true, `Updated user: ${updatedUser.name}`);
    }
    
    // Test DELETE operation
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', createdUser.id);
    
    if (deleteError) {
      logTest('DELETE Operation', false, deleteError.message);
    } else {
      logTest('DELETE Operation', true, 'User deleted successfully');
    }
    
    return true;
  } catch (error) {
    logTest('CRUD Operations', false, error.message);
    return false;
  }
}

// Test 4: Relationships and Joins
async function testRelationships() {
  try {
    console.log('\n🔗 Testing Relationships and Joins...');
    
    // Test user-client relationship
    const { data: userClientData, error: userClientError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        name,
        role,
        client_id,
        clients!inner(
          id,
          name,
          email
        )
      `)
      .limit(5);
    
    if (userClientError) {
      logTest('User-Client Relationship', false, userClientError.message);
    } else {
      logTest('User-Client Relationship', true, `${userClientData.length} user-client relationships found`);
    }
    
    // Test call-client relationship
    const { data: callClientData, error: callClientError } = await supabaseAdmin
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
      .limit(5);
    
    if (callClientError) {
      logTest('Call-Client Relationship', false, callClientError.message);
    } else {
      logTest('Call-Client Relationship', true, `${callClientData.length} call-client relationships found`);
    }
    
    // Test call-user relationship
    const { data: callUserData, error: callUserError } = await supabaseAdmin
      .from('calls')
      .select(`
        id,
        prospect_name,
        outcome,
        user_id,
        users!inner(
          id,
          name,
          role
        )
      `)
      .not('user_id', 'is', null)
      .limit(5);
    
    if (callUserError) {
      logTest('Call-User Relationship', false, callUserError.message);
    } else {
      logTest('Call-User Relationship', true, `${callUserData.length} call-user relationships found`);
    }
    
    return true;
  } catch (error) {
    logTest('Relationships', false, error.message);
    return false;
  }
}

// Test 5: API Endpoints
async function testAPIEndpoints() {
  try {
    console.log('\n🌐 Testing API Endpoints...');
    
    // Test database connection endpoint
    const testDbResponse = await fetch('http://localhost:3003/api/test-db');
    const testDbData = await testDbResponse.json();
    
    if (testDbData.success && testDbData.connected) {
      logTest('API: Database Connection', true, `Database: ${testDbData.database}`);
    } else {
      logTest('API: Database Connection', false, testDbData.error || 'Connection failed');
    }
    
    // Test users endpoint (will fail without auth, but should return proper error)
    const usersResponse = await fetch('http://localhost:3003/api/users');
    const usersData = await usersResponse.json();
    
    if (usersResponse.status === 401 || usersResponse.status === 403) {
      logTest('API: Users Endpoint', true, 'Properly requires authentication');
    } else if (usersData.success) {
      logTest('API: Users Endpoint', true, `${usersData.data?.length || 0} users returned`);
    } else {
      logTest('API: Users Endpoint', false, usersData.message || 'Unexpected response');
    }
    
    // Test clients endpoint
    const clientsResponse = await fetch('http://localhost:3003/api/clients');
    const clientsData = await clientsResponse.json();
    
    if (clientsResponse.status === 401 || clientsResponse.status === 403) {
      logTest('API: Clients Endpoint', true, 'Properly requires authentication');
    } else if (clientsData.success) {
      logTest('API: Clients Endpoint', true, `${clientsData.data?.length || 0} clients returned`);
    } else {
      logTest('API: Clients Endpoint', false, clientsData.message || 'Unexpected response');
    }
    
    return true;
  } catch (error) {
    logTest('API Endpoints', false, error.message);
    return false;
  }
}

// Test 6: Performance and Queries
async function testPerformance() {
  try {
    console.log('\n⚡ Testing Performance and Queries...');
    
    // Test simple query performance
    const startTime = Date.now();
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, name, role')
      .limit(100);
    const endTime = Date.now();
    
    if (usersError) {
      logTest('Simple Query Performance', false, usersError.message);
    } else {
      const queryTime = endTime - startTime;
      logTest('Simple Query Performance', true, `${queryTime}ms for ${users.length} users`);
    }
    
    // Test complex query with joins
    const startTime2 = Date.now();
    const { data: complexData, error: complexError } = await supabaseAdmin
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
      .limit(50);
    const endTime2 = Date.now();
    
    if (complexError) {
      logTest('Complex Query Performance', false, complexError.message);
    } else {
      const queryTime2 = endTime2 - startTime2;
      logTest('Complex Query Performance', true, `${queryTime2}ms for ${complexData.length} calls with joins`);
    }
    
    // Test filtering performance
    const startTime3 = Date.now();
    const { data: filteredData, error: filteredError } = await supabaseAdmin
      .from('calls')
      .select('id, prospect_name, outcome')
      .eq('outcome', 'won')
      .limit(100);
    const endTime3 = Date.now();
    
    if (filteredError) {
      logTest('Filtered Query Performance', false, filteredError.message);
    } else {
      const queryTime3 = endTime3 - startTime3;
      logTest('Filtered Query Performance', true, `${queryTime3}ms for ${filteredData.length} won calls`);
    }
    
    return true;
  } catch (error) {
    logTest('Performance', false, error.message);
    return false;
  }
}

// Test 7: Error Handling
async function testErrorHandling() {
  try {
    console.log('\n⚠️  Testing Error Handling...');
    
    // Test invalid table access
    const { data: invalidData, error: invalidError } = await supabaseAdmin
      .from('nonexistent_table')
      .select('*')
      .limit(1);
    
    if (invalidError) {
      logTest('Invalid Table Error Handling', true, 'Properly rejected invalid table');
    } else {
      logTest('Invalid Table Error Handling', false, 'Should have rejected invalid table');
    }
    
    // Test invalid column access
    const { data: invalidColumnData, error: invalidColumnError } = await supabaseAdmin
      .from('users')
      .select('nonexistent_column')
      .limit(1);
    
    if (invalidColumnError) {
      logTest('Invalid Column Error Handling', true, 'Properly rejected invalid column');
    } else {
      logTest('Invalid Column Error Handling', false, 'Should have rejected invalid column');
    }
    
    // Test constraint violations
    const { data: constraintData, error: constraintError } = await supabaseAdmin
      .from('users')
      .insert({
        name: 'Test User',
        email: 'invalid-email', // Invalid email format
        role: 'invalid_role', // Invalid role
        client_id: 'invalid-uuid' // Invalid UUID
      });
    
    if (constraintError) {
      logTest('Constraint Violation Error Handling', true, 'Properly rejected invalid data');
    } else {
      logTest('Constraint Violation Error Handling', false, 'Should have rejected invalid data');
    }
    
    return true;
  } catch (error) {
    logTest('Error Handling', false, error.message);
    return false;
  }
}

// Test 8: Data Consistency
async function testDataConsistency() {
  try {
    console.log('\n🔍 Testing Data Consistency...');
    
    // Test referential integrity - check for orphaned calls
    const { data: allCalls, error: allCallsError } = await supabaseAdmin
      .from('calls')
      .select('id, prospect_name, client_id');
    
    const { data: allClients, error: allClientsError } = await supabaseAdmin
      .from('clients')
      .select('id');
    
    if (allCallsError || allClientsError) {
      logTest('Referential Integrity Check', false, 'Failed to fetch data for integrity check');
    } else {
      const clientIds = new Set(allClients.map(c => c.id));
      const orphanedCalls = allCalls.filter(call => !clientIds.has(call.client_id));
      
      if (orphanedCalls.length === 0) {
        logTest('Referential Integrity Check', true, 'No orphaned calls found');
      } else {
        logTest('Referential Integrity Check', false, `${orphanedCalls.length} orphaned calls found`);
      }
    }
    
    // Test data types consistency
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role, client_id, is_active, created_at');
    
    if (usersError) {
      logTest('Data Types Consistency', false, usersError.message);
    } else {
      const validUsers = users.filter(user => 
        typeof user.name === 'string' &&
        typeof user.email === 'string' &&
        typeof user.role === 'string' &&
        typeof user.is_active === 'boolean' &&
        user.created_at
      );
      
      if (validUsers.length === users.length) {
        logTest('Data Types Consistency', true, 'All users have correct data types');
      } else {
        logTest('Data Types Consistency', false, `${users.length - validUsers.length} users have incorrect data types`);
      }
    }
    
    return true;
  } catch (error) {
    logTest('Data Consistency', false, error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting comprehensive database operations tests...\n');
  
  const tests = [
    { name: 'Basic Connection', fn: testBasicConnection },
    { name: 'Data Integrity', fn: testDataIntegrity },
    { name: 'CRUD Operations', fn: testCRUDOperations },
    { name: 'Relationships', fn: testRelationships },
    { name: 'API Endpoints', fn: testAPIEndpoints },
    { name: 'Performance', fn: testPerformance },
    { name: 'Error Handling', fn: testErrorHandling },
    { name: 'Data Consistency', fn: testDataConsistency }
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
    console.log('\n🎉 All database operations tests passed!');
    console.log('✅ Database migration is successful and all functionality is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
    console.log('❌ Database operations may not be working correctly.');
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
