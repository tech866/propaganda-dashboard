#!/usr/bin/env node

/**
 * Development Environment Setup Script
 * This script sets up the environment for local development
 */

const fs = require('fs');
const path = require('path');

const envContent = `# Propaganda Dashboard Environment Variables
# Development configuration

# Supabase Configuration (placeholder values - replace with real ones)
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder_anon_key
SUPABASE_SERVICE_ROLE_KEY=placeholder_service_role_key

# Clerk Configuration - Disabled for development
# Set these to empty to use MockAuthProvider
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development_secret_key_32_chars

# Application Configuration
NODE_ENV=development
PORT=3000

# Meta Marketing API Configuration (optional)
META_APP_ID=placeholder_app_id
META_APP_SECRET=placeholder_app_secret
META_REDIRECT_URI=http://localhost:3000/api/meta/auth

# Database Configuration (if using direct PostgreSQL)
DATABASE_URL=postgresql://postgres:password@localhost:5432/propaganda_dashboard

# Development flags
ENABLE_DEBUG_ROUTES=true
ENABLE_TEST_DATA=true
`;

const envPath = path.join(process.cwd(), '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Development environment configured successfully!');
  console.log('📝 Clerk authentication is disabled for development');
  console.log('🔧 Using MockAuthProvider for local development');
  console.log('🚀 Run "npm run dev" to start the development server');
} catch (error) {
  console.error('❌ Error setting up environment:', error.message);
  process.exit(1);
}
