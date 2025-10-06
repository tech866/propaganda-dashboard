// =====================================================
// Check User Role Script
// Helps diagnose and fix user role issues for development
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

async function checkUserRole() {
  console.log('🔍 Checking User Roles in Database...\n');

  try {
    // Get all users from the database
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role, clerk_user_id, created_at')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('❌ Failed to fetch users:', usersError.message);
      return;
    }

    console.log(`📊 Found ${users.length} users in database:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. User ID: ${user.id}`);
      console.log(`   Email: ${user.email || 'No email'}`);
      console.log(`   Role: ${user.role || 'No role assigned'}`);
      console.log(`   Clerk ID: ${user.clerk_user_id || 'No Clerk ID'}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('');
    });

    // Check for users with admin/ceo roles
    const adminUsers = users.filter(user => user.role === 'admin' || user.role === 'ceo');
    
    if (adminUsers.length === 0) {
      console.log('⚠️  No users with admin or ceo roles found!');
      console.log('\n💡 To fix this for development:');
      console.log('1. Find your user in the list above');
      console.log('2. Note the user ID');
      console.log('3. Run: node scripts/set-user-role.js <user-id> admin');
    } else {
      console.log(`✅ Found ${adminUsers.length} admin/ceo users:`);
      adminUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    }

    // Show role hierarchy
    console.log('\n📋 Available Roles (in hierarchy order):');
    console.log('   1. client_user - Basic client access');
    console.log('   2. sales - Sales rep access');
    console.log('   3. agency_user - Agency user access');
    console.log('   4. admin - Full admin access (can create workspaces)');
    console.log('   5. ceo - CEO access (highest level)');

  } catch (error) {
    console.error('❌ Error checking user roles:', error.message);
  }
}

// Run the check
checkUserRole();
