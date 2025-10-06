// =====================================================
// Connect Clerk User Script
// Connects your current Clerk user to the database with admin role
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

async function connectClerkUser() {
  console.log('🔗 Connecting Clerk User to Database...\n');

  try {
    // Get your email from the command line or use a default
    const args = process.argv.slice(2);
    const email = args[0] || 'your-email@example.com';
    const role = args[1] || 'admin';

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

  } catch (error) {
    console.error('❌ Error connecting Clerk user:', error.message);
  }
}

// Show usage if no arguments
if (process.argv.length < 3) {
  console.log('🔗 Connect Clerk User to Database');
  console.log('\n📋 Usage:');
  console.log('   node scripts/connect-clerk-user.js <your-email> [role]');
  console.log('\n💡 Examples:');
  console.log('   node scripts/connect-clerk-user.js your-email@gmail.com admin');
  console.log('   node scripts/connect-clerk-user.js your-email@gmail.com ceo');
  console.log('\n📋 Available roles: client_user, sales, agency_user, admin, ceo');
  console.log('\n🔍 To find your current email, check your browser\'s developer tools or Clerk dashboard');
} else {
  connectClerkUser();
}
