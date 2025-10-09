#!/usr/bin/env node

/**
 * Check Database Schema and Tables
 * This script will list all tables and their RLS status
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkDatabaseSchema() {
  console.log('🔍 Checking Supabase Database Schema...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing required environment variables');
    return false;
  }
  
  // Create admin client with service role key
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    // Get all tables
    console.log('\n📋 Listing all tables in the database...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (tablesError) {
      console.error('❌ Error fetching tables:', tablesError.message);
      return false;
    }
    
    console.log(`Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`  - ${table.table_name} (${table.table_type})`);
    });
    
    // Check RLS status for each table
    console.log('\n🔒 Checking RLS status for each table...');
    for (const table of tables) {
      if (table.table_type === 'BASE TABLE') {
        try {
          const { data: rlsStatus, error: rlsError } = await supabase
            .from('pg_class')
            .select('relrowsecurity')
            .eq('relname', table.table_name);
          
          if (!rlsError && rlsStatus && rlsStatus.length > 0) {
            const isEnabled = rlsStatus[0].relrowsecurity;
            console.log(`  - ${table.table_name}: RLS ${isEnabled ? 'ENABLED' : 'DISABLED'}`);
          }
        } catch (err) {
          console.log(`  - ${table.table_name}: Could not check RLS status`);
        }
      }
    }
    
    // Check for policies
    console.log('\n🛡️ Checking existing policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('tablename, policyname, permissive, roles, cmd, qual, with_check')
      .order('tablename, policyname');
    
    if (policiesError) {
      console.error('❌ Error fetching policies:', policiesError.message);
    } else {
      console.log(`Found ${policies.length} policies:`);
      policies.forEach(policy => {
        console.log(`  - ${policy.tablename}.${policy.policyname} (${policy.cmd})`);
      });
    }
    
    // Test basic operations on each table
    console.log('\n🧪 Testing basic operations on each table...');
    for (const table of tables) {
      if (table.table_type === 'BASE TABLE') {
        try {
          // Test SELECT
          const { data, error } = await supabase
            .from(table.table_name)
            .select('*')
            .limit(1);
          
          if (error) {
            console.log(`  - ${table.table_name}: SELECT ❌ (${error.message})`);
          } else {
            console.log(`  - ${table.table_name}: SELECT ✅`);
          }
        } catch (err) {
          console.log(`  - ${table.table_name}: SELECT ❌ (${err.message})`);
        }
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Supabase Database Schema Checker\n');
  
  const success = await checkDatabaseSchema();
  
  if (success) {
    console.log('\n✅ Schema check completed!');
  } else {
    console.log('\n❌ Schema check failed.');
  }
}

main().catch(console.error);
