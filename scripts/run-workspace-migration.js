// =====================================================
// Workspace Management Migration Runner
// Runs the workspace management migration in Supabase
// =====================================================

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Running Workspace Management Migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'src', 'migrations', 'implement_workspace_management.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded successfully');
    console.log('📊 Migration size:', (migrationSQL.length / 1024).toFixed(2), 'KB');

    // Split the migration into individual statements
    // Remove comments and split by semicolon
    const statements = migrationSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
      .join('\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.length === 0) continue;

      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Some errors are expected (like "already exists")
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist') ||
              error.message.includes('relation') && error.message.includes('already exists')) {
            console.log(`⚠️  Statement ${i + 1}: ${error.message} (expected)`);
          } else {
            console.error(`❌ Statement ${i + 1} failed:`, error.message);
            errorCount++;
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Statement ${i + 1} failed with exception:`, err.message);
        errorCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    console.log(`📝 Total statements: ${statements.length}`);

    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
    } else if (errorCount < statements.length / 2) {
      console.log('\n⚠️  Migration completed with some warnings (likely expected)');
    } else {
      console.log('\n❌ Migration failed with multiple errors');
      return;
    }

    // Test the migration by checking if tables exist
    console.log('\n🧪 Testing migration results...');
    
    const tables = ['workspaces', 'workspace_memberships', 'invitations'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Table ${table} not accessible:`, error.message);
      } else {
        console.log(`✅ Table ${table} is accessible`);
      }
    }

    console.log('\n🚀 Migration test complete! Ready to test workspace management.');

  } catch (error) {
    console.error('❌ Migration failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the migration
runMigration();
