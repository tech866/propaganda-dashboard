#!/usr/bin/env node

/**
 * Supabase Database Setup Script
 * 
 * This script sets up the complete database schema in Supabase
 * Run this script after creating your Supabase project
 * 
 * Usage: node scripts/setup-supabase.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bright}${colors.blue}Step ${step}:${colors.reset} ${message}`);
}

function logSuccess(message) {
  log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
  log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logWarning(message) {
  log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logInfo(message) {
  log(`${colors.cyan}ℹ️  ${message}${colors.reset}`);
}

async function main() {
  log(`${colors.bright}${colors.magenta}🚀 Supabase Database Setup Script${colors.reset}`);
  log(`${colors.cyan}This script will help you set up your Supabase database schema${colors.reset}\n`);

  // Step 1: Check environment variables
  logStep(1, 'Checking environment variables');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logError(`Missing required environment variables: ${missingVars.join(', ')}`);
    logInfo('Please create a .env.local file with the following variables:');
    logInfo('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
    logInfo('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
    logInfo('SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key');
    process.exit(1);
  }

  logSuccess('All required environment variables are set');

  // Step 2: Read SQL schema files
  logStep(2, 'Reading SQL schema files');
  
  const schemaPath = path.join(__dirname, '..', 'physical_mapping_sql_editor.sql');
  const metaTokensPath = path.join(__dirname, '..', 'src', 'migrations', 'add_meta_tokens_table.sql');
  
  if (!fs.existsSync(schemaPath)) {
    logError(`Schema file not found: ${schemaPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(metaTokensPath)) {
    logError(`Meta tokens migration file not found: ${metaTokensPath}`);
    process.exit(1);
  }

  const mainSchema = fs.readFileSync(schemaPath, 'utf8');
  const metaTokensSchema = fs.readFileSync(metaTokensPath, 'utf8');
  
  logSuccess('SQL schema files loaded successfully');

  // Step 3: Display setup instructions
  logStep(3, 'Database setup instructions');
  
  logInfo('To complete the setup, follow these steps:');
  logInfo('');
  logInfo('1. Go to your Supabase project dashboard');
  logInfo('2. Navigate to the SQL Editor');
  logInfo('3. Create a new query');
  logInfo('4. Copy and paste the following SQL commands:');
  logInfo('');
  
  log(`${colors.bright}${colors.yellow}--- MAIN SCHEMA ---${colors.reset}`);
  log(`${colors.cyan}${mainSchema}${colors.reset}`);
  
  log(`${colors.bright}${colors.yellow}--- META TOKENS TABLE ---${colors.reset}`);
  log(`${colors.cyan}${metaTokensSchema}${colors.reset}`);
  
  logInfo('');
  logInfo('5. Execute the SQL commands');
  logInfo('6. Verify that all tables are created successfully');
  logInfo('7. Check that Row Level Security (RLS) policies are enabled');

  // Step 4: Create sample data script
  logStep(4, 'Creating sample data script');
  
  const sampleDataPath = path.join(__dirname, '..', 'sample_data_only.sql');
  if (fs.existsSync(sampleDataPath)) {
    const sampleData = fs.readFileSync(sampleDataPath, 'utf8');
    
    logInfo('Sample data file found. To populate your database with sample data:');
    logInfo('');
    logInfo('1. Go to your Supabase SQL Editor');
    logInfo('2. Create a new query');
    logInfo('3. Copy and paste the following sample data:');
    logInfo('');
    
    log(`${colors.bright}${colors.yellow}--- SAMPLE DATA ---${colors.reset}`);
    log(`${colors.cyan}${sampleData}${colors.reset}`);
    
    logInfo('');
    logInfo('4. Execute the SQL commands');
    logInfo('5. Verify that sample data is inserted correctly');
  } else {
    logWarning('Sample data file not found. You can create sample data manually.');
  }

  // Step 5: Environment configuration check
  logStep(5, 'Environment configuration check');
  
  logInfo('Make sure your .env.local file contains:');
  logInfo('');
  logInfo('# Supabase Configuration');
  logInfo(`NEXT_PUBLIC_SUPABASE_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
  logInfo('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  logInfo('SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key');
  logInfo('');
  logInfo('# Meta Marketing API (Optional)');
  logInfo('META_APP_ID=your_meta_app_id');
  logInfo('META_APP_SECRET=your_meta_app_secret');
  logInfo('META_REDIRECT_URI=http://localhost:3000/api/meta/auth');

  // Step 6: Next steps
  logStep(6, 'Next steps');
  
  logInfo('After completing the database setup:');
  logInfo('');
  logInfo('1. Run the application: npm run dev');
  logInfo('2. Test the authentication flow');
  logInfo('3. Verify that all API endpoints work correctly');
  logInfo('4. Check that multi-tenant data isolation is working');
  logInfo('5. Test the Meta Marketing API integration (if configured)');

  // Step 7: Troubleshooting
  logStep(7, 'Troubleshooting');
  
  logInfo('Common issues and solutions:');
  logInfo('');
  logInfo('• RLS policies not working: Check that RLS is enabled on all tables');
  logInfo('• Authentication errors: Verify Supabase URL and keys are correct');
  logInfo('• API errors: Check browser console and server logs');
  logInfo('• Data not loading: Verify table names and column names match');
  logInfo('• Permission errors: Check RLS policies and user roles');

  logSuccess('Setup script completed successfully!');
  logInfo('Follow the instructions above to complete your Supabase setup.');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  logError(`Unhandled rejection: ${error.message}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logError(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

// Run the script
main().catch((error) => {
  logError(`Script failed: ${error.message}`);
  process.exit(1);
});
