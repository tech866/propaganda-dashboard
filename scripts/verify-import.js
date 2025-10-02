#!/usr/bin/env node

/**
 * Supabase Import Verification Script
 * 
 * This script verifies that the data import was successful
 * by checking table counts, data integrity, and relationships.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Expected data counts
const EXPECTED_COUNTS = {
  users: 6,
  clients: 2,
  calls: 12
};

// Verification functions
async function verifyTableCounts() {
  console.log('🔍 Verifying table counts...');
  
  try {
    // Check users count
    const { count: userCount, error: userError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (userError) throw userError;
    
    // Check clients count
    const { count: clientCount, error: clientError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });
    
    if (clientError) throw clientError;
    
    // Check calls count
    const { count: callCount, error: callError } = await supabase
      .from('calls')
      .select('*', { count: 'exact', head: true });
    
    if (callError) throw callError;
    
    console.log(`  Users: ${userCount}/${EXPECTED_COUNTS.users} ${userCount === EXPECTED_COUNTS.users ? '✅' : '❌'}`);
    console.log(`  Clients: ${clientCount}/${EXPECTED_COUNTS.clients} ${clientCount === EXPECTED_COUNTS.clients ? '✅' : '❌'}`);
    console.log(`  Calls: ${callCount}/${EXPECTED_COUNTS.calls} ${callCount === EXPECTED_COUNTS.calls ? '✅' : '❌'}`);
    
    return {
      users: userCount === EXPECTED_COUNTS.users,
      clients: clientCount === EXPECTED_COUNTS.clients,
      calls: callCount === EXPECTED_COUNTS.calls
    };
    
  } catch (error) {
    console.error('❌ Error verifying table counts:', error.message);
    return { users: false, clients: false, calls: false };
  }
}

async function verifyDataIntegrity() {
  console.log('🔍 Verifying data integrity...');
  
  try {
    // Check user roles distribution
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('role');
    
    if (userError) throw userError;
    
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    console.log('  User roles:', roleCounts);
    
    // Check call outcomes
    const { data: calls, error: callError } = await supabase
      .from('calls')
      .select('outcome');
    
    if (callError) throw callError;
    
    const outcomeCounts = calls.reduce((acc, call) => {
      acc[call.outcome] = (acc[call.outcome] || 0) + 1;
      return acc;
    }, {});
    
    console.log('  Call outcomes:', outcomeCounts);
    
    // Check client-user relationships
    const { data: clientUsers, error: relError } = await supabase
      .from('users')
      .select('client_id, clients(name)')
      .not('client_id', 'is', null);
    
    if (relError) throw relError;
    
    const clientUserCounts = clientUsers.reduce((acc, user) => {
      const clientName = user.clients?.name || 'Unknown';
      acc[clientName] = (acc[clientName] || 0) + 1;
      return acc;
    }, {});
    
    console.log('  Client-user relationships:', clientUserCounts);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error verifying data integrity:', error.message);
    return false;
  }
}

async function verifyRLSPolicies() {
  console.log('🔍 Verifying RLS policies...');
  
  try {
    // Test basic data access
    const { data: testCalls, error: testError } = await supabase
      .from('calls')
      .select('id, client_id, prospect_name')
      .limit(5);
    
    if (testError) {
      console.log('  RLS test result:', testError.message);
      return false;
    }
    
    console.log(`  ✅ Successfully accessed ${testCalls.length} call records`);
    console.log('  Sample calls:', testCalls.map(c => `${c.prospect_name} (${c.client_id})`));
    
    return true;
    
  } catch (error) {
    console.error('❌ Error verifying RLS policies:', error.message);
    return false;
  }
}

async function verifySpecificData() {
  console.log('🔍 Verifying specific expected data...');
  
  try {
    // Check for specific clients
    const { data: clients, error: clientError } = await supabase
      .from('clients')
      .select('name, email')
      .in('name', ['Propaganda Inc', 'Tech Solutions LLC']);
    
    if (clientError) throw clientError;
    
    console.log('  Expected clients found:', clients.map(c => c.name));
    
    // Check for specific user roles
    const { data: ceoUsers, error: ceoError } = await supabase
      .from('users')
      .select('name, role')
      .eq('role', 'ceo');
    
    if (ceoError) throw ceoError;
    
    console.log('  CEO users found:', ceoUsers.map(u => u.name));
    
    return clients.length === 2 && ceoUsers.length >= 1;
    
  } catch (error) {
    console.error('❌ Error verifying specific data:', error.message);
    return false;
  }
}

// Main verification function
async function verifyImport() {
  console.log('🚀 Starting Supabase import verification...\n');
  
  const results = {
    tableCounts: await verifyTableCounts(),
    dataIntegrity: await verifyDataIntegrity(),
    rlsPolicies: await verifyRLSPolicies(),
    specificData: await verifySpecificData()
  };
  
  console.log('\n📊 Verification Summary:');
  console.log(`  Table Counts: ${results.tableCounts ? '✅' : '❌'}`);
  console.log(`  Data Integrity: ${results.dataIntegrity ? '✅' : '❌'}`);
  console.log(`  RLS Policies: ${results.rlsPolicies ? '✅' : '❌'}`);
  console.log(`  Specific Data: ${results.specificData ? '✅' : '❌'}`);
  
  const allPassed = Object.values(results).every(result => 
    typeof result === 'boolean' ? result : Object.values(result).every(Boolean)
  );
  
  if (allPassed) {
    console.log('\n🎉 Import verification PASSED! All data imported successfully.');
    console.log('✅ Your Supabase database is ready for use.');
  } else {
    console.log('\n⚠️  Import verification FAILED! Please check the issues above.');
    console.log('❌ Some data may not have imported correctly.');
  }
  
  return allPassed;
}

// Run verification if called directly
if (require.main === module) {
  verifyImport()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Verification failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyImport };
