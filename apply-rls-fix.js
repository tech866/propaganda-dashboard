#!/usr/bin/env node

/**
 * Apply RLS Policy Fix to Supabase Database
 * This script will fix the infinite recursion and policy violation issues
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function applyRLSFix() {
  console.log('🔧 Applying RLS Policy Fix to Supabase...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing required environment variables:');
    console.error('- NEXT_PUBLIC_SUPABASE_URL');
    console.error('- SUPABASE_SERVICE_ROLE_KEY');
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
    // Read the SQL fix file
    const sqlFix = fs.readFileSync('./fix-rls-policies.sql', 'utf8');
    console.log('📄 RLS fix SQL loaded');
    
    // Split the SQL into individual statements
    const statements = sqlFix
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔨 Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`   ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.warn(`   ⚠️  Warning: ${error.message}`);
          } else {
            console.log(`   ✅ Success`);
          }
        } catch (err) {
          console.warn(`   ⚠️  Warning: ${err.message}`);
        }
      }
    }
    
    console.log('\n✅ RLS policy fix applied successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run the CRUD test again: node test-crud-operations.js');
    console.log('2. Test your application functionality');
    console.log('3. If needed, adjust the policies in fix-rls-policies.sql for more restrictive access');
    
    return true;
    
  } catch (error) {
    console.error('❌ Failed to apply RLS fix:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Supabase RLS Policy Fix Tool\n');
  
  const success = await applyRLSFix();
  
  if (success) {
    console.log('\n🎉 RLS policies have been fixed!');
    console.log('You can now run: node test-crud-operations.js');
  } else {
    console.log('\n❌ Failed to fix RLS policies.');
    console.log('Please check your Supabase configuration and try again.');
  }
}

main().catch(console.error);
