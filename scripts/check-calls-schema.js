// =====================================================
// Check Calls Table Schema
// Task 21.3: Update Supabase Schema and Implement Backend APIs
// =====================================================

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCallsSchema() {
  try {
    console.log('🔍 Checking calls table schema...');
    
    // Check if the calls table exists and get its structure
    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error checking calls table:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Calls table exists and has data');
      console.log('📋 Current columns:', Object.keys(data[0]));
      
      // Check for specific fields we need
      const hasTrafficSource = 'traffic_source' in data[0];
      const hasCrmStage = 'crm_stage' in data[0];
      const hasWorkspaceId = 'workspace_id' in data[0];
      
      console.log('\n🔍 Field Check:');
      console.log(`- traffic_source: ${hasTrafficSource ? '✅' : '❌'}`);
      console.log(`- crm_stage: ${hasCrmStage ? '✅' : '❌'}`);
      console.log(`- workspace_id: ${hasWorkspaceId ? '✅' : '❌'}`);
      
      if (!hasTrafficSource || !hasCrmStage || !hasWorkspaceId) {
        console.log('\n⚠️  Missing required fields. Need to run migration.');
        return false;
      } else {
        console.log('\n✅ All required fields are present!');
        return true;
      }
    } else {
      console.log('⚠️  Calls table exists but has no data');
      return true; // Table exists, just no data
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

async function addMissingFields() {
  try {
    console.log('\n🔧 Adding missing fields...');
    
    // Add traffic_source field
    const { error: trafficSourceError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE calls ADD COLUMN IF NOT EXISTS traffic_source VARCHAR(50) DEFAULT 'organic' CHECK (traffic_source IN ('organic', 'meta'));
      `
    });
    
    if (trafficSourceError) {
      console.log('⚠️  traffic_source field might already exist or RPC not available');
    } else {
      console.log('✅ Added traffic_source field');
    }
    
    // Add crm_stage field
    const { error: crmStageError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE calls ADD COLUMN IF NOT EXISTS crm_stage VARCHAR(50) DEFAULT 'scheduled' CHECK (crm_stage IN ('scheduled', 'in_progress', 'completed', 'no_show', 'closed_won', 'lost'));
      `
    });
    
    if (crmStageError) {
      console.log('⚠️  crm_stage field might already exist or RPC not available');
    } else {
      console.log('✅ Added crm_stage field');
    }
    
    // Add workspace_id field if it doesn't exist
    const { error: workspaceIdError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE calls ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id);
      `
    });
    
    if (workspaceIdError) {
      console.log('⚠️  workspace_id field might already exist or RPC not available');
    } else {
      console.log('✅ Added workspace_id field');
    }
    
    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_calls_traffic_source ON calls(traffic_source);
        CREATE INDEX IF NOT EXISTS idx_calls_crm_stage ON calls(crm_stage);
        CREATE INDEX IF NOT EXISTS idx_calls_workspace_traffic_source ON calls(workspace_id, traffic_source);
        CREATE INDEX IF NOT EXISTS idx_calls_workspace_crm_stage ON calls(workspace_id, crm_stage);
      `
    });
    
    if (indexError) {
      console.log('⚠️  Indexes might already exist or RPC not available');
    } else {
      console.log('✅ Created indexes');
    }
    
  } catch (error) {
    console.error('❌ Error adding fields:', error);
  }
}

async function main() {
  console.log('🚀 Checking Calls Table Schema...\n');
  
  const schemaComplete = await checkCallsSchema();
  
  if (!schemaComplete) {
    console.log('\n🔧 Attempting to add missing fields...');
    await addMissingFields();
    
    // Check again
    console.log('\n🔍 Re-checking schema...');
    await checkCallsSchema();
  }
  
  console.log('\n✅ Schema check complete!');
}

main().catch(console.error);
