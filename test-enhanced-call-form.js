#!/usr/bin/env node

/**
 * Test script to verify the enhanced call form integration with Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testEnhancedCallForm() {
  console.log('🧪 Testing Enhanced Call Form Integration...');
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return false;
  }
  
  console.log('✅ Supabase environment variables found');
  
  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test 1: Check if enhanced call tables exist
    console.log('\n📋 Testing database schema...');
    
    const { data: salesCalls, error: salesCallsError } = await supabase
      .from('sales_calls')
      .select('*')
      .limit(1);
    
    if (salesCallsError) {
      console.error('❌ sales_calls table error:', salesCallsError.message);
      return false;
    }
    console.log('✅ sales_calls table accessible');
    
    // Test 2: Check payment_schedules table
    const { data: paymentSchedules, error: paymentSchedulesError } = await supabase
      .from('payment_schedules')
      .select('*')
      .limit(1);
    
    if (paymentSchedulesError) {
      console.error('❌ payment_schedules table error:', paymentSchedulesError.message);
      return false;
    }
    console.log('✅ payment_schedules table accessible');
    
    // Test 3: Check ad_spend table
    const { data: adSpend, error: adSpendError } = await supabase
      .from('ad_spend')
      .select('*')
      .limit(1);
    
    if (adSpendError) {
      console.error('❌ ad_spend table error:', adSpendError.message);
      return false;
    }
    console.log('✅ ad_spend table accessible');
    
    // Test 4: Check offers table
    const { data: offers, error: offersError } = await supabase
      .from('offers')
      .select('*')
      .limit(1);
    
    if (offersError) {
      console.error('❌ offers table error:', offersError.message);
      return false;
    }
    console.log('✅ offers table accessible');
    
    // Test 5: Check setters table
    const { data: setters, error: settersError } = await supabase
      .from('setters')
      .select('*')
      .limit(1);
    
    if (settersError) {
      console.error('❌ setters table error:', settersError.message);
      return false;
    }
    console.log('✅ setters table accessible');
    
    console.log('\n🎉 All database tables are accessible!');
    console.log('\n📝 Next steps:');
    console.log('1. Run the Supabase migration: supabase_enhanced_call_logging.sql');
    console.log('2. Test the form at: http://localhost:3000/calls/enhanced');
    console.log('3. Verify data is being stored correctly');
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
testEnhancedCallForm().then(success => {
  if (success) {
    console.log('\n✅ Enhanced Call Form integration test completed successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Enhanced Call Form integration test failed!');
    process.exit(1);
  }
});
