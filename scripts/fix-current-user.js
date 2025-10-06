// =====================================================
// Fix Current User Script
// Quickly syncs your current Clerk user to the database
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

async function fixCurrentUser() {
  console.log('🔧 Fixing Current User Setup...\n');

  try {
    // Get your email from the command line
    const args = process.argv.slice(2);
    const email = args[0];
    const role = args[1] || 'admin';

    if (!email) {
      console.log('❌ Usage: node scripts/fix-current-user.js <your-email> [role]');
      console.log('\n💡 Example: node scripts/fix-current-user.js your-email@gmail.com admin');
      console.log('\n📋 Available roles: client_user, sales, agency_user, admin, ceo');
      return;
    }

    console.log(`📧 Email: ${email}`);
    console.log(`👤 Role: ${role}\n`);

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log('✅ User already exists in database:');
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Role: ${existingUser.role || 'No role assigned'}`);
      console.log(`   Clerk ID: ${existingUser.clerk_user_id || 'Not connected to Clerk'}`);

      if (existingUser.role !== role) {
        console.log(`\n🔄 Updating role from '${existingUser.role}' to '${role}'...`);
        
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({ role: role })
          .eq('id', existingUser.id)
          .select('*')
          .single();

        if (updateError) {
          console.error('❌ Failed to update role:', updateError.message);
          return;
        }

        console.log('✅ Role updated successfully!');
        console.log(`   New Role: ${updatedUser.role}`);
      } else {
        console.log('✅ User already has the correct role!');
      }
    } else {
      console.log('👤 Creating new user in database...');
      
      // Create a new user record
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: email,
          role: role,
          client_id: 'default-client', // Add required client_id
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (createError) {
        console.error('❌ Failed to create user:', createError.message);
        return;
      }

      console.log('✅ User created successfully!');
      console.log(`   ID: ${newUser.id}`);
      console.log(`   Email: ${newUser.email}`);
      console.log(`   Role: ${newUser.role}`);
    }

    console.log('\n🎉 Setup Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Make sure you\'re signed in with the email:', email);
    console.log('2. Refresh your browser');
    console.log('3. You should now see the "Create Workspace" option in your sidebar');
    console.log('\n💡 If you\'re still not seeing it, check:');
    console.log('   - Are you signed in with the correct email?');
    console.log('   - Did you refresh the browser?');
    console.log('   - Check the browser console for any errors');

    // Test the API endpoint
    console.log('\n🧪 Testing API endpoint...');
    try {
      const response = await fetch('http://localhost:3000/api/sync-user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API endpoint working:', data.user?.email || 'No user data');
      } else {
        console.log('⚠️  API endpoint returned:', response.status, response.statusText);
      }
    } catch (apiError) {
      console.log('⚠️  Could not test API endpoint (make sure server is running)');
    }

  } catch (error) {
    console.error('❌ Error fixing current user:', error.message);
  }
}

// Run the script
fixCurrentUser();
