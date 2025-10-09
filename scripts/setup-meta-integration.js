#!/usr/bin/env node

/**
 * Meta Integration Setup Script
 * Helps configure the Meta Ads integration for Propaganda Dashboard
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

function log(message) {
  console.log(message);
}

function logSuccess(message) {
  log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
  log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logInfo(message) {
  log(`${colors.cyan}ℹ️  ${message}${colors.reset}`);
}

function logWarning(message) {
  log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bright}${colors.blue}Step ${step}: ${message}${colors.reset}`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  log(`${colors.bright}${colors.magenta}🚀 Meta Ads Integration Setup${colors.reset}`);
  log(`${colors.cyan}This script will help you configure the Meta Ads integration${colors.reset}\n`);

  // Step 1: Check if Meta Developer App is set up
  logStep(1, 'Meta Developer App Setup');
  
  logInfo('Before proceeding, make sure you have:');
  logInfo('1. Created a Meta Developer App at https://developers.facebook.com/');
  logInfo('2. Added the Marketing API product');
  logInfo('3. Configured OAuth redirect URIs');
  logInfo('4. Requested the required permissions (ads_read, ads_management, business_management)');
  
  const hasApp = await question('\nHave you completed the Meta Developer App setup? (y/n): ');
  
  if (hasApp.toLowerCase() !== 'y') {
    logWarning('Please complete the Meta Developer App setup first.');
    logInfo('Follow the guide in META_DEVELOPER_APP_SETUP_GUIDE.md');
    rl.close();
    return;
  }

  // Step 2: Get Meta App credentials
  logStep(2, 'Meta App Credentials');
  
  const appId = await question('Enter your Meta App ID: ');
  const appSecret = await question('Enter your Meta App Secret: ');
  
  if (!appId || !appSecret) {
    logError('App ID and App Secret are required');
    rl.close();
    return;
  }

  // Step 3: Update environment variables
  logStep(3, 'Update Environment Variables');
  
  const envPath = path.join(__dirname, '..', '.env.local');
  
  if (!fs.existsSync(envPath)) {
    logError('.env.local file not found');
    rl.close();
    return;
  }

  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Update Meta configuration
  envContent = envContent.replace(
    /META_APP_ID=.*/,
    `META_APP_ID=${appId}`
  );
  envContent = envContent.replace(
    /META_APP_SECRET=.*/,
    `META_APP_SECRET=${appSecret}`
  );
  envContent = envContent.replace(
    /META_REDIRECT_URI=.*/,
    `META_REDIRECT_URI=http://localhost:3001/api/meta/auth`
  );

  fs.writeFileSync(envPath, envContent);
  logSuccess('Environment variables updated');

  // Step 4: Database migration
  logStep(4, 'Database Migration');
  
  logInfo('The meta_tokens table migration is ready to run.');
  logInfo('Please follow these steps:');
  logInfo('1. Go to your Supabase Dashboard');
  logInfo('2. Navigate to SQL Editor');
  logInfo('3. Create a new query');
  logInfo('4. Copy and paste the contents of src/migrations/add_meta_tokens_table.sql');
  logInfo('5. Run the query');
  
  const migrationDone = await question('\nHave you run the database migration? (y/n): ');
  
  if (migrationDone.toLowerCase() !== 'y') {
    logWarning('Please run the database migration before testing the integration');
  }

  // Step 5: Test the integration
  logStep(5, 'Test Integration');
  
  logInfo('To test the integration:');
  logInfo('1. Start your development server: npm run dev');
  logInfo('2. Navigate to: http://localhost:3001/integrations');
  logInfo('3. Look for the Meta Integration card');
  logInfo('4. Click "Connect Meta Account"');
  logInfo('5. Complete the OAuth flow');
  
  const testNow = await question('\nWould you like to start the development server now? (y/n): ');
  
  if (testNow.toLowerCase() === 'y') {
    logInfo('Starting development server...');
    logInfo('Once started, visit: http://localhost:3001/integrations');
    
    // Start the dev server
    const { spawn } = require('child_process');
    const devServer = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });
    
    devServer.on('error', (error) => {
      logError(`Failed to start development server: ${error.message}`);
    });
  }

  // Summary
  log(`\n${colors.bright}${colors.green}🎉 Setup Complete!${colors.reset}`);
  logSuccess('Meta Ads integration is now configured');
  logInfo('Your integration includes:');
  logInfo('• OAuth authentication with Meta');
  logInfo('• Ad spend data retrieval');
  logInfo('• Campaign performance analytics');
  logInfo('• Multi-account support');
  logInfo('• Automatic token refresh');
  logInfo('• Beautiful data visualizations');
  
  log(`\n${colors.cyan}Next steps:${colors.reset}`);
  logInfo('1. Test the integration at /integrations');
  logInfo('2. Connect your Meta Ads account');
  logInfo('3. View your ad spend data in the dashboard');
  logInfo('4. Deploy to production when ready');

  rl.close();
}

main().catch((error) => {
  logError(`Setup failed: ${error.message}`);
  rl.close();
  process.exit(1);
});




