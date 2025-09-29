#!/usr/bin/env node

/**
 * Setup Vercel Environment Variables
 * This script sets up all required environment variables for the Vercel deployment
 */

const { execSync } = require('child_process');
const crypto = require('crypto');

// Generate secure random strings
function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generateJWTSecret() {
  return crypto.randomBytes(64).toString('hex');
}

// Environment variables to set
const envVars = {
  NEXTAUTH_URL: 'https://propaganda-dashboard.vercel.app',
  NEXTAUTH_SECRET: generateSecret(32),
  JWT_SECRET: generateJWTSecret(),
  NODE_ENV: 'production',
  AUDIT_ENABLED: 'true',
  AUDIT_RETENTION_DAYS: '365',
  BCRYPT_ROUNDS: '12',
  SESSION_TIMEOUT: '3600000',
  API_RATE_LIMIT: '100',
  API_RATE_WINDOW: '900000',
  LOG_LEVEL: 'info',
  LOG_FORMAT: 'json',
  ENABLE_AUDIT_LOGGING: 'true',
  ENABLE_RATE_LIMITING: 'true',
  ENABLE_CORS: 'true',
  CORS_ORIGIN: 'https://propaganda-dashboard.vercel.app',
  CORS_CREDENTIALS: 'true',
  CACHE_TTL: '300000',
  MAX_CONNECTIONS: '20',
  CONNECTION_TIMEOUT: '30000',
  ENABLE_METRICS: 'true',
  METRICS_PORT: '9090',
  ENABLE_DEBUG_ROUTES: 'false',
  ENABLE_TEST_DATA: 'false'
};

console.log('🔧 Setting up Vercel environment variables...\n');

// Set each environment variable
for (const [key, value] of Object.entries(envVars)) {
  try {
    console.log(`Setting ${key}...`);
    execSync(`npx vercel env add ${key} production`, {
      input: value,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log(`✅ ${key} set successfully`);
  } catch (error) {
    console.log(`⚠️  ${key} might already be set or failed to set`);
  }
}

console.log('\n🎉 Environment variables setup complete!');
console.log('📋 Next steps:');
console.log('1. Redeploy the application: npx vercel --prod');
console.log('2. Test the production URL: https://propaganda-dashboard.vercel.app');
