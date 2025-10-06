// =====================================================
// Quick Fix User Script
// Simple script to create a user with admin role
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

async function quickFixUser() {
  console.log('🚀 Quick Fix: Creating Admin User...\n');

  // Use a common development email
  const email = 'admin@propaganda.com';
  const role = 'admin';

  try {
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.log('✅ User already exists:');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Role: ${existingUser.role}`);
      
      if (existingUser.role !== role) {
        console.log(`\n🔄 Updating role to '${role}'...`);
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
      }
    } else {
      console.log('👤 Creating new admin user...');
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: email,
          role: role,
          client_id: 'default-client',
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
      console.log(`   Email: ${newUser.email}`);
      console.log(`   Role: ${newUser.role}`);
    }

    console.log('\n🎉 Setup Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Sign in with email:', email);
    console.log('2. Refresh your browser');
    console.log('3. You should now see the "Create Workspace" option');
    console.log('\n💡 If you need to use a different email:');
    console.log('   node scripts/fix-current-user.js your-email@gmail.com admin');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickFixUser();
