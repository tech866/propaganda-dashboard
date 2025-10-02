#!/usr/bin/env node

/**
 * Test script to verify Supabase connection and run the enhanced call logging migration
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    console.log('Required variables:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('- SUPABASE_SERVICE_ROLE_KEY (optional)');
    return false;
  }
  
  console.log('✅ Environment variables found');
  console.log(`📡 Supabase URL: ${supabaseUrl}`);
  
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test basic connection
    console.log('🔌 Testing basic connection...');
    const { data, error } = await supabase.from('agencies').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Basic connection successful');
    
    // Test if we can read from existing tables
    console.log('📊 Testing table access...');
    
    const tables = ['agencies', 'clients', 'sales_calls', 'users'];
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1);
        if (error) {
          console.log(`⚠️  Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: accessible`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

async function runMigration() {
  console.log('\n🚀 Running enhanced call logging migration...');
  
  const fs = require('fs');
  const path = require('path');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase_enhanced_call_logging.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded');
    console.log(`📏 Migration size: ${migrationSQL.length} characters`);
    
    // Note: We can't execute SQL directly from Node.js without the service role key
    // The user will need to run this in the Supabase SQL editor
    console.log('\n📋 To complete the migration:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Create a new query');
    console.log('4. Copy and paste the contents of supabase_enhanced_call_logging.sql');
    console.log('5. Execute the SQL commands');
    
    return true;
    
  } catch (error) {
    console.error('❌ Failed to read migration file:', error.message);
    return false;
  }
}

async function main() {
  console.log('🎯 Supabase Enhanced Call Logging Setup Test\n');
  
  const connectionOk = await testSupabaseConnection();
  
  if (connectionOk) {
    await runMigration();
    console.log('\n✅ Setup test completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Run the SQL migration in Supabase dashboard');
    console.log('2. Test the enhanced call logging form at /calls/enhanced');
    console.log('3. Check analytics at /analytics');
    console.log('4. Manage ad spend at /ad-spend');
  } else {
    console.log('\n❌ Setup test failed. Please check your Supabase configuration.');
  }
}

// Run the test
main().catch(console.error);

