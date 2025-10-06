const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Running Traffic Source Tracking Migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../src/migrations/add_traffic_source_tracking.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded successfully');
    console.log('📊 Migration size:', (migrationSQL.length / 1024).toFixed(2), 'KB');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement using direct SQL execution
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        console.log(statement.substring(0, 100) + '...');
        
        try {
          const { data, error } = await supabase
            .from('_migrations')
            .select('*')
            .limit(1); // This is just to test connection
          
          if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist" which is fine
            console.error(`❌ Connection test failed:`, error);
            continue;
          }
          
          // For now, let's just log what we would execute
          console.log(`✅ Statement ${i + 1} would be executed successfully`);
          
        } catch (err) {
          console.error(`❌ Error executing statement ${i + 1}:`, err.message);
          // Continue with other statements
        }
      }
    }
    
    console.log('✅ Migration simulation completed!');
    console.log('📝 Note: This was a simulation. To actually run the migration, you need to execute the SQL directly in your Supabase dashboard or use a proper migration tool.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
