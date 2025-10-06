// =====================================================
// Add Kanban Fields to Calls Table
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

async function addKanbanFields() {
  try {
    console.log('🔧 Adding Kanban fields to calls table...');
    
    // First, let's try to add the fields using direct SQL
    const sqlStatements = [
      // Add traffic_source column
      `ALTER TABLE calls ADD COLUMN IF NOT EXISTS traffic_source VARCHAR(50) DEFAULT 'organic' CHECK (traffic_source IN ('organic', 'meta'));`,
      
      // Add crm_stage column  
      `ALTER TABLE calls ADD COLUMN IF NOT EXISTS crm_stage VARCHAR(50) DEFAULT 'scheduled' CHECK (crm_stage IN ('scheduled', 'in_progress', 'completed', 'no_show', 'closed_won', 'lost'));`,
      
      // Create indexes
      `CREATE INDEX IF NOT EXISTS idx_calls_traffic_source ON calls(traffic_source);`,
      `CREATE INDEX IF NOT EXISTS idx_calls_crm_stage ON calls(crm_stage);`,
      `CREATE INDEX IF NOT EXISTS idx_calls_workspace_traffic_source ON calls(workspace_id, traffic_source);`,
      `CREATE INDEX IF NOT EXISTS idx_calls_workspace_crm_stage ON calls(workspace_id, crm_stage);`,
      
      // Add comments
      `COMMENT ON COLUMN calls.traffic_source IS 'Source of traffic: organic or meta (paid ads)';`,
      `COMMENT ON COLUMN calls.crm_stage IS 'Current CRM stage of the call: scheduled, in_progress, completed, no_show, closed_won, lost';`
    ];
    
    for (let i = 0; i < sqlStatements.length; i++) {
      const sql = sqlStatements[i];
      console.log(`⏳ Executing statement ${i + 1}/${sqlStatements.length}...`);
      console.log(`📝 ${sql.substring(0, 80)}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql });
        if (error) {
          console.log(`⚠️  Statement ${i + 1} failed (might already exist):`, error.message);
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.log(`⚠️  Statement ${i + 1} failed:`, err.message);
      }
    }
    
    // Verify the fields were added
    console.log('\n🔍 Verifying fields were added...');
    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error checking calls table:', error);
      return;
    }
    
    if (data && data.length > 0) {
      const hasTrafficSource = 'traffic_source' in data[0];
      const hasCrmStage = 'crm_stage' in data[0];
      
      console.log(`- traffic_source: ${hasTrafficSource ? '✅' : '❌'}`);
      console.log(`- crm_stage: ${hasCrmStage ? '✅' : '❌'}`);
      
      if (hasTrafficSource && hasCrmStage) {
        console.log('\n✅ All Kanban fields added successfully!');
        
        // Update existing records with default values
        console.log('\n🔄 Updating existing records with default values...');
        const { error: updateError } = await supabase
          .from('calls')
          .update({ 
            traffic_source: 'organic',
            crm_stage: 'scheduled'
          })
          .is('traffic_source', null);
        
        if (updateError) {
          console.log('⚠️  Error updating existing records:', updateError.message);
        } else {
          console.log('✅ Updated existing records with default values');
        }
        
      } else {
        console.log('\n❌ Some fields are still missing. You may need to add them manually in the Supabase dashboard.');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function main() {
  console.log('🚀 Adding Kanban Fields to Calls Table...\n');
  await addKanbanFields();
  console.log('\n✅ Migration complete!');
}

main().catch(console.error);
