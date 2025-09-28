#!/usr/bin/env node

/**
 * Environment Setup Script for Propaganda Dashboard
 * Creates .env.local file with all required environment variables
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate secure random strings
function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generateJWTSecret() {
  return crypto.randomBytes(64).toString('hex');
}

// Environment variables template
const envTemplate = `# Propaganda Dashboard Environment Variables
# Generated on ${new Date().toISOString()}

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=propaganda_dashboard
DB_USER=postgres
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=${generateJWTSecret()}

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=${generateSecret(32)}

# Application Configuration
NODE_ENV=development
PORT=3002

# Audit Configuration
AUDIT_ENABLED=true
AUDIT_RETENTION_DAYS=365

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_TIMEOUT=3600000

# API Configuration
API_RATE_LIMIT=100
API_RATE_WINDOW=900000

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json

# Feature Flags
ENABLE_AUDIT_LOGGING=true
ENABLE_RATE_LIMITING=true
ENABLE_CORS=true

# CORS Configuration
CORS_ORIGIN=http://localhost:3002
CORS_CREDENTIALS=true

# Performance Configuration
CACHE_TTL=300000
MAX_CONNECTIONS=20
CONNECTION_TIMEOUT=30000

# Monitoring Configuration
ENABLE_METRICS=true
METRICS_PORT=9090

# Development Configuration
ENABLE_DEBUG_ROUTES=true
ENABLE_TEST_DATA=true
`;

// Create .env.local file
const envPath = path.join(process.cwd(), '.env.local');

try {
  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists. Creating backup...');
    const backupPath = `${envPath}.backup.${Date.now()}`;
    fs.copyFileSync(envPath, backupPath);
    console.log(`✅ Backup created: ${backupPath}`);
  }
  
  // Write new environment file
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Environment file created: .env.local');
  
  // Create .env.example for reference
  const examplePath = path.join(process.cwd(), '.env.example');
  const exampleTemplate = envTemplate.replace(/=.*$/gm, '=your_value_here');
  fs.writeFileSync(examplePath, exampleTemplate);
  console.log('✅ Example environment file created: .env.example');
  
  console.log('\n📋 Environment Setup Complete!');
  console.log('🔧 Next steps:');
  console.log('1. Update database credentials in .env.local');
  console.log('2. Configure your PostgreSQL database');
  console.log('3. Run database migrations');
  console.log('4. Start the development server: npm run dev');
  
} catch (error) {
  console.error('❌ Failed to create environment file:', error.message);
  process.exit(1);
}
