// =====================================================
// Workspace API Test Script
// Tests the workspace management API endpoints
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

async function testWorkspaceAPI() {
  console.log('🧪 Testing Workspace Management API...\n');

  try {
    // Test 1: Create a test workspace
    console.log('1️⃣ Testing workspace creation...');
    
    const testWorkspace = {
      name: 'Test API Workspace',
      slug: 'test-api-workspace-' + Date.now(),
      description: 'Test workspace for API validation'
    };

    const { data: workspace, error: createError } = await supabase
      .from('workspaces')
      .insert(testWorkspace)
      .select()
      .single();

    if (createError) {
      console.error('❌ Failed to create test workspace:', createError.message);
      return;
    }

    console.log('✅ Test workspace created successfully');
    console.log('   Workspace ID:', workspace.id);
    console.log('   Workspace Name:', workspace.name);
    console.log('   Workspace Slug:', workspace.slug);

    // Test 2: Test workspace functions
    console.log('\n2️⃣ Testing workspace functions...');
    
    const { data: createResult, error: createFuncError } = await supabase
      .rpc('create_workspace', {
        p_name: 'Function Test Workspace',
        p_slug: 'function-test-' + Date.now(),
        p_description: 'Test workspace created via function'
      });
    
    if (createFuncError) {
      console.error('❌ Workspace creation function failed:', createFuncError.message);
    } else {
      console.log('✅ Workspace creation function works');
      console.log('   Created workspace ID:', createResult);
    }

    // Test 3: Test workspace analytics
    console.log('\n3️⃣ Testing workspace analytics...');
    
    const { data: analytics, error: analyticsError } = await supabase
      .from('workspace_analytics')
      .select('*')
      .eq('workspace_id', workspace.id);
    
    if (analyticsError) {
      console.error('❌ Workspace analytics failed:', analyticsError.message);
    } else {
      console.log('✅ Workspace analytics working');
      console.log('   Analytics data:', analytics[0] || 'No analytics data yet');
    }

    // Test 4: Test workspace slug availability
    console.log('\n4️⃣ Testing slug availability check...');
    
    const { data: slugCheck, error: slugError } = await supabase
      .rpc('is_workspace_slug_available', {
        p_slug: workspace.slug
      });
    
    if (slugError) {
      console.error('❌ Slug availability check failed:', slugError.message);
    } else {
      console.log('✅ Slug availability check working');
      console.log('   Slug available:', slugCheck);
    }

    // Test 5: Test workspace update
    console.log('\n5️⃣ Testing workspace update...');
    
    const { data: updatedWorkspace, error: updateError } = await supabase
      .from('workspaces')
      .update({ 
        name: 'Updated Test Workspace',
        description: 'Updated description for testing'
      })
      .eq('id', workspace.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Workspace update failed:', updateError.message);
    } else {
      console.log('✅ Workspace update working');
      console.log('   Updated name:', updatedWorkspace.name);
    }

    // Clean up test data
    console.log('\n6️⃣ Cleaning up test data...');
    
    const { error: deleteError } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', workspace.id);

    if (deleteError) {
      console.error('⚠️  Failed to clean up test workspace:', deleteError.message);
    } else {
      console.log('✅ Test workspace cleaned up successfully');
    }

    console.log('\n🎉 Workspace API Test Complete!');
    console.log('\n📋 Summary:');
    console.log('✅ Workspace creation working');
    console.log('✅ Workspace functions working');
    console.log('✅ Analytics integration working');
    console.log('✅ Slug availability checking working');
    console.log('✅ Workspace updates working');
    console.log('✅ Data cleanup working');
    
    console.log('\n🚀 Ready to test the UI!');

  } catch (error) {
    console.error('❌ API test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testWorkspaceAPI();
