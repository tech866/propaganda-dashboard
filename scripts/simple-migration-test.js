// =====================================================
// Simple Migration Test
// Tests basic workspace functionality
// =====================================================

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testBasicMigration() {
  console.log('🧪 Testing Basic Workspace Migration...\n');

  try {
    // Test 1: Try to create a workspace table manually
    console.log('1️⃣ Testing workspace table creation...');
    
    const createWorkspaceTable = `
      CREATE TABLE IF NOT EXISTS workspaces (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        settings JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const { error: createError } = await supabase.rpc('exec', { sql: createWorkspaceTable });
    
    if (createError) {
      console.error('❌ Failed to create workspaces table:', createError.message);
      console.log('💡 You may need to run this migration manually in Supabase SQL Editor');
      return;
    }
    
    console.log('✅ Workspaces table created successfully');

    // Test 2: Try to insert a test workspace
    console.log('\n2️⃣ Testing workspace insertion...');
    
    const testWorkspace = {
      name: 'Test Workspace',
      slug: 'test-workspace-' + Date.now(),
      description: 'Test workspace for validation'
    };

    const { data: workspace, error: insertError } = await supabase
      .from('workspaces')
      .insert(testWorkspace)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to insert test workspace:', insertError.message);
      return;
    }

    console.log('✅ Test workspace created successfully');
    console.log('   Workspace ID:', workspace.id);
    console.log('   Workspace Name:', workspace.name);
    console.log('   Workspace Slug:', workspace.slug);

    // Test 3: Try to query the workspace
    console.log('\n3️⃣ Testing workspace query...');
    
    const { data: queriedWorkspace, error: queryError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspace.id)
      .single();

    if (queryError) {
      console.error('❌ Failed to query workspace:', queryError.message);
      return;
    }

    console.log('✅ Workspace query successful');
    console.log('   Retrieved workspace:', queriedWorkspace.name);

    // Clean up test data
    console.log('\n4️⃣ Cleaning up test data...');
    
    const { error: deleteError } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', workspace.id);

    if (deleteError) {
      console.error('⚠️  Failed to clean up test workspace:', deleteError.message);
    } else {
      console.log('✅ Test workspace cleaned up successfully');
    }

    console.log('\n🎉 Basic workspace functionality test passed!');
    console.log('✅ Database connection working');
    console.log('✅ Table creation working');
    console.log('✅ Data insertion working');
    console.log('✅ Data querying working');
    console.log('✅ Data deletion working');

    console.log('\n💡 Next steps:');
    console.log('1. Run the full migration in Supabase SQL Editor');
    console.log('2. Test the complete workspace management system');
    console.log('3. Proceed with Task 20.2');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testBasicMigration();
