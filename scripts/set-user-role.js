// =====================================================
// Set User Role Script
// Updates a user's role in the database for development
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

// Valid roles
const VALID_ROLES = ['client_user', 'sales', 'agency_user', 'admin', 'ceo'];

async function setUserRole() {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.log('❌ Usage: node scripts/set-user-role.js <user-id> <role>');
    console.log('\n📋 Available roles:');
    VALID_ROLES.forEach(role => {
      console.log(`   - ${role}`);
    });
    console.log('\n💡 Example: node scripts/set-user-role.js 123e4567-e89b-12d3-a456-426614174000 admin');
    process.exit(1);
  }

  const [userId, newRole] = args;

  if (!VALID_ROLES.includes(newRole)) {
    console.error(`❌ Invalid role: ${newRole}`);
    console.log('📋 Valid roles:', VALID_ROLES.join(', '));
    process.exit(1);
  }

  console.log(`🔧 Setting user role...`);
  console.log(`   User ID: ${userId}`);
  console.log(`   New Role: ${newRole}\n`);

  try {
    // First, check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('❌ User not found:', fetchError.message);
      console.log('\n💡 Run "node scripts/check-user-role.js" to see available users');
      return;
    }

    console.log('✅ User found:');
    console.log(`   Email: ${existingUser.email}`);
    console.log(`   Current Role: ${existingUser.role || 'No role assigned'}`);

    // Update the user's role
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)
      .select('id, email, role')
      .single();

    if (updateError) {
      console.error('❌ Failed to update user role:', updateError.message);
      return;
    }

    console.log('\n🎉 User role updated successfully!');
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   New Role: ${updatedUser.role}`);

    // Show what permissions this role has
    const rolePermissions = {
      client_user: ['view_own_calls', 'view_own_metrics', 'view_own_dashboard'],
      sales: ['view_own_calls', 'create_calls', 'update_own_calls', 'view_own_metrics', 'view_own_dashboard'],
      agency_user: ['view_own_calls', 'create_calls', 'update_own_calls', 'view_own_metrics', 'view_own_dashboard'],
      admin: ['All permissions including workspace creation, user management, audit logs'],
      ceo: ['All permissions including financial data and company settings']
    };

    console.log(`\n📋 Permissions for ${newRole} role:`);
    if (Array.isArray(rolePermissions[newRole])) {
      rolePermissions[newRole].forEach(permission => {
        console.log(`   - ${permission}`);
      });
    } else {
      console.log(`   - ${rolePermissions[newRole]}`);
    }

    console.log('\n🔄 You may need to refresh your browser to see the changes.');

  } catch (error) {
    console.error('❌ Error updating user role:', error.message);
  }
}

// Run the script
setUserRole();
