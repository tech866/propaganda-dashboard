/**
 * Migration Verification Script
 * 
 * This script verifies that the traffic source tracking migration was successful.
 * Run this after manually executing the migration in Supabase dashboard.
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyMigration() {
  console.log('🔍 Verifying Traffic Source Tracking Migration...\n');

  try {
    // 1. Check if new columns exist
    console.log('1. Checking for new columns...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'calls')
      .in('column_name', ['traffic_source', 'crm_stage']);

    if (columnsError) {
      console.error('❌ Error checking columns:', columnsError.message);
      return false;
    }

    const trafficSourceColumn = columns.find(col => col.column_name === 'traffic_source');
    const crmStageColumn = columns.find(col => col.column_name === 'crm_stage');

    if (trafficSourceColumn) {
      console.log('✅ traffic_source column exists:', trafficSourceColumn);
    } else {
      console.log('❌ traffic_source column missing');
    }

    if (crmStageColumn) {
      console.log('✅ crm_stage column exists:', crmStageColumn);
    } else {
      console.log('❌ crm_stage column missing');
    }

    // 2. Test inserting a call with new fields
    console.log('\n2. Testing call insertion with new fields...');
    const testCall = {
      client_id: 'test-client-' + Date.now(),
      user_id: 'test-user-' + Date.now(),
      workspace_id: 'test-workspace-' + Date.now(),
      prospect_name: 'Test Prospect ' + Date.now(),
      traffic_source: 'organic',
      crm_stage: 'scheduled'
    };

    const { data: insertedCall, error: insertError } = await supabase
      .from('calls')
      .insert(testCall)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error inserting test call:', insertError.message);
      return false;
    }

    console.log('✅ Test call inserted successfully:', {
      id: insertedCall.id,
      traffic_source: insertedCall.traffic_source,
      crm_stage: insertedCall.crm_stage
    });

    // 3. Test updating the call
    console.log('\n3. Testing call update with new fields...');
    const { data: updatedCall, error: updateError } = await supabase
      .from('calls')
      .update({ 
        traffic_source: 'meta',
        crm_stage: 'in_progress'
      })
      .eq('id', insertedCall.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating test call:', updateError.message);
      return false;
    }

    console.log('✅ Test call updated successfully:', {
      id: updatedCall.id,
      traffic_source: updatedCall.traffic_source,
      crm_stage: updatedCall.crm_stage
    });

    // 4. Test analytics query
    console.log('\n4. Testing analytics query...');
    const { data: analyticsData, error: analyticsError } = await supabase
      .from('calls')
      .select('traffic_source, crm_stage')
      .eq('workspace_id', testCall.workspace_id);

    if (analyticsError) {
      console.error('❌ Error running analytics query:', analyticsError.message);
      return false;
    }

    console.log('✅ Analytics query successful:', analyticsData);

    // 5. Clean up test data
    console.log('\n5. Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('calls')
      .delete()
      .eq('id', insertedCall.id);

    if (deleteError) {
      console.error('❌ Error cleaning up test data:', deleteError.message);
    } else {
      console.log('✅ Test data cleaned up successfully');
    }

    // 6. Check if analytics view exists
    console.log('\n6. Checking for analytics materialized view...');
    const { data: views, error: viewsError } = await supabase
      .from('information_schema.views')
      .select('table_name')
      .eq('table_name', 'call_analytics_summary');

    if (viewsError) {
      console.log('⚠️  Could not check for analytics view (this is normal if using RLS)');
    } else if (views && views.length > 0) {
      console.log('✅ Analytics materialized view exists');
    } else {
      console.log('⚠️  Analytics materialized view not found (may be normal)');
    }

    console.log('\n🎉 Migration verification completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test the call logging forms in the application');
    console.log('2. Verify the Kanban board displays calls correctly');
    console.log('3. Check that analytics dashboard shows traffic source data');
    
    return true;

  } catch (error) {
    console.error('❌ Unexpected error during verification:', error.message);
    return false;
  }
}

// Run verification
verifyMigration()
  .then(success => {
    if (success) {
      console.log('\n✅ All verification tests passed!');
      process.exit(0);
    } else {
      console.log('\n❌ Some verification tests failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Verification script crashed:', error.message);
    process.exit(1);
  });
