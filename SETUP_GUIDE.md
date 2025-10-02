# Propaganda Dashboard - Complete Setup Guide

## 🚀 Quick Setup (5 minutes)

### Prerequisites
- Node.js 18+ installed
- Git installed
- Supabase account (free tier available)
- Clerk account (free tier available)

### 1. Clone and Install
```bash
git clone <repository-url>
cd propaganda-dashboard
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env.local
```

### 3. Supabase Setup
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Copy your project URL and anon key
4. Update `.env.local` with your Supabase credentials

### 4. Clerk Setup
1. Go to [Clerk Dashboard](https://clerk.com/dashboard)
2. Create a new application
3. Copy your publishable key and secret key
4. Update `.env.local` with your Clerk credentials

### 5. Database Schema
1. Go to Supabase SQL Editor
2. Copy and paste the contents of `supabase_schema_setup_fixed.sql`
3. Run the script

### 6. Start Development
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application!

---

## 📋 Detailed Setup Instructions

## 1. Environment Variables

Create `.env.local` with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_32_character_secret_here
NODE_ENV=development
PORT=3000

# Optional: Meta Marketing API
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_REDIRECT_URI=http://localhost:3000/api/meta/auth
```

## 2. Supabase Project Setup

### Create New Project
1. Visit [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project name: `propaganda-dashboard`
5. Enter database password (save this securely)
6. Choose region closest to your users
7. Click "Create new project"

### Get Project Credentials
1. Go to Settings → API
2. Copy the following:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Set Up Database Schema
1. Go to SQL Editor in Supabase Dashboard
2. Create a new query
3. Copy the entire contents of `supabase_schema_setup_fixed.sql`
4. Paste and run the script
5. Verify tables are created in the Table Editor

## 3. Clerk Authentication Setup

### Create New Application
1. Visit [Clerk Dashboard](https://clerk.com/dashboard)
2. Click "Add application"
3. Enter application name: `Propaganda Dashboard`
4. Choose authentication methods (Email recommended)
5. Click "Create application"

### Configure Application
1. Go to "API Keys" section
2. Copy the following:
   - **Publishable Key**: `pk_test_...`
   - **Secret Key**: `sk_test_...`

### Set Up JWT Template (for RLS)
1. Go to "JWT Templates" in Clerk Dashboard
2. Click "New template"
3. Name it: `supabase`
4. Configure the template:
```json
{
  "aud": "authenticated",
  "exp": "{{exp}}",
  "iat": "{{iat}}",
  "iss": "https://your-clerk-domain.clerk.accounts.dev",
  "sub": "{{user.id}}",
  "user_id": "{{user.id}}",
  "role": "{{user.public_metadata.role}}",
  "client_id": "{{user.public_metadata.client_id}}",
  "email": "{{user.primary_email_address.email_address}}",
  "name": "{{user.first_name}} {{user.last_name}}"
}
```
5. Copy the JWT secret for Supabase configuration

## 4. Supabase JWT Configuration

### Configure JWT Settings
1. Go to Supabase Dashboard → Settings → API
2. Scroll to "JWT Settings"
3. Update the following:
   - **JWT Secret**: Paste the JWT secret from Clerk
   - **JWT URL**: `https://your-clerk-domain.clerk.accounts.dev`
   - **JWT Issuer**: `https://your-clerk-domain.clerk.accounts.dev`

## 5. Database Data Setup

### Option A: Start with Sample Data
1. Go to Supabase SQL Editor
2. Run the following to create sample data:

```sql
-- Insert sample clients
INSERT INTO clients (id, name, email, phone, address) VALUES
('850e8400-e29b-41d4-a716-446655440000', 'Propaganda Inc', 'contact@propaganda.com', '555-0123', '123 Business St, City, State 12345'),
('850e8400-e29b-41d4-a716-446655440001', 'Marketing Solutions', 'info@marketingsolutions.com', '555-0456', '456 Marketing Ave, City, State 12345');

-- Insert sample users
INSERT INTO users (id, name, email, role, client_id, is_active) VALUES
('850e8400-e29b-41d4-a716-446655440010', 'John CEO', 'ceo@propaganda.com', 'ceo', '850e8400-e29b-41d4-a716-446655440000', true),
('850e8400-e29b-41d4-a716-446655440011', 'Jane Admin', 'admin@propaganda.com', 'admin', '850e8400-e29b-41d4-a716-446655440000', true),
('850e8400-e29b-41d4-a716-446655440012', 'Bob Sales', 'sales@propaganda.com', 'sales', '850e8400-e29b-41d4-a716-446655440000', true);
```

### Option B: Import Existing Data
If you have existing data to migrate:

1. Export from your current database:
```bash
npm run export-data
```

2. Import the generated SQL file in Supabase SQL Editor

## 6. User Setup in Clerk

### Create Users
1. Go to Clerk Dashboard → Users
2. Click "Add user"
3. Enter user details
4. Add to **Public Metadata**:
```json
{
  "role": "ceo|admin|sales",
  "client_id": "uuid-of-client"
}
```

### User Roles
- **CEO**: Full access to all data
- **Admin**: Access to their client's data only
- **Sales**: Access to their client's data only

## 7. Testing Your Setup

### Run Test Scripts
```bash
# Test Supabase connection
npm run test-supabase

# Test database operations
npm run test-database-operations

# Test service layer
npm run test-service-layer

# Test API routes
npm run test-api-routes

# Test RLS policies
npm run test-rls
```

### Verify Application
1. Start the development server: `npm run dev`
2. Visit [http://localhost:3000](http://localhost:3000)
3. Sign in with a Clerk user
4. Verify you can access the dashboard
5. Test creating/editing data

## 8. Production Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_production_clerk_publishable_key
CLERK_SECRET_KEY=your_production_clerk_secret_key
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_production_nextauth_secret
NODE_ENV=production
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Supabase Connection Failed
- Verify your project URL and keys are correct
- Check if your Supabase project is active
- Ensure you're using the correct region

#### 2. Clerk Authentication Not Working
- Verify your publishable and secret keys
- Check if your Clerk application is active
- Ensure JWT template is configured correctly

#### 3. RLS Policies Not Working
- Verify JWT configuration in Supabase
- Check user metadata in Clerk
- Run `npm run test-rls` to diagnose issues

#### 4. Database Schema Issues
- Ensure you ran the complete schema setup script
- Check for any SQL errors in Supabase logs
- Verify all tables and relationships are created

#### 5. Environment Variables Not Loading
- Ensure `.env.local` is in the project root
- Restart the development server after changes
- Check for typos in variable names

### Getting Help
1. Check the [documentation](README.md)
2. Run the test scripts to identify issues
3. Review Supabase and Clerk logs
4. Open an issue on GitHub

## ✅ Verification Checklist

- [ ] Supabase project created and configured
- [ ] Database schema set up successfully
- [ ] Clerk application created and configured
- [ ] JWT template configured in Clerk
- [ ] JWT settings configured in Supabase
- [ ] Environment variables set correctly
- [ ] Sample data created (or existing data imported)
- [ ] Users created in Clerk with proper metadata
- [ ] All test scripts pass
- [ ] Application runs without errors
- [ ] Authentication works correctly
- [ ] Data access is properly restricted by role

## 🎉 You're All Set!

Your Propaganda Dashboard is now ready for development and production use. The application includes:

- ✅ **Secure Authentication** with Clerk
- ✅ **Database Security** with Supabase RLS
- ✅ **Role-Based Access Control**
- ✅ **Modern UI** with dark theme
- ✅ **Comprehensive Testing** suite
- ✅ **Production-Ready** deployment

Happy coding! 🚀
