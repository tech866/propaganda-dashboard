# Supabase Environment Setup Guide

This guide will help you set up your Supabase environment for the Propaganda Dashboard project.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Node.js**: Version 18 or higher
3. **Git**: For version control

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in the project details:
   - **Name**: Propaganda Dashboard
   - **Database Password**: Choose a strong password
   - **Region**: Select the closest region to your users
4. Click "Create new project"
5. Wait for the project to be created (usually takes 1-2 minutes)

## Step 2: Get Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...`)

## Step 3: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Meta Marketing API Configuration (Optional)
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_REDIRECT_URI=http://localhost:3000/api/meta/auth

# Clerk Authentication (Already configured)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/register
```

## Step 4: Set Up Database Schema

### Option A: Using the Setup Script (Recommended)

1. Run the setup script:
   ```bash
   node scripts/setup-supabase.js
   ```

2. Follow the instructions displayed by the script

### Option B: Manual Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `physical_mapping_sql_editor.sql`
5. Execute the SQL commands
6. Add the Meta tokens table by running `src/migrations/add_meta_tokens_table.sql`

## Step 5: Configure Row Level Security (RLS)

The schema includes RLS policies, but you should verify they're enabled:

1. Go to **Authentication** → **Policies**
2. Verify that RLS is enabled on all tables
3. Check that the policies are correctly configured

## Step 6: Set Up Sample Data (Optional)

1. Go to **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `sample_data_only.sql`
4. Execute the SQL commands
5. Verify that sample data is inserted correctly

## Step 7: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. Test the authentication flow:
   - Try signing up for a new account
   - Try signing in with an existing account
   - Verify that you can access protected routes

4. Test the API endpoints:
   - Check the dashboard loads correctly
   - Verify that data is being fetched from Supabase
   - Test the Meta integration (if configured)

## Step 8: Configure Clerk Webhooks (Optional)

If you're using Clerk for authentication:

1. Go to your Clerk dashboard
2. Navigate to **Webhooks**
3. Create a new webhook
4. Set the endpoint URL to: `https://your-domain.com/api/webhooks/clerk`
5. Select the following events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
   - `organization.created`
   - `organization.updated`
   - `organization.deleted`

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `META_APP_ID` | Meta Marketing API app ID | `1234567890123456` |
| `META_APP_SECRET` | Meta Marketing API app secret | `abcdef1234567890abcdef1234567890` |
| `META_REDIRECT_URI` | Meta OAuth redirect URI | `http://localhost:3000/api/meta/auth` |

## Troubleshooting

### Common Issues

1. **"Invalid API key" error**
   - Verify that your Supabase URL and keys are correct
   - Check that you're using the right environment (development vs production)

2. **"RLS policy violation" error**
   - Ensure that RLS policies are correctly configured
   - Check that the user is authenticated
   - Verify that the user has the correct role/permissions

3. **"Table doesn't exist" error**
   - Run the database schema setup script
   - Verify that all tables are created in Supabase
   - Check the table names match exactly

4. **Authentication not working**
   - Verify Clerk configuration
   - Check that webhooks are properly configured
   - Ensure that the user is being created in Supabase

5. **API endpoints returning errors**
   - Check the browser console for errors
   - Verify that the Supabase client is properly initialized
   - Check that the service layer is using the correct database methods

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=supabase:*
```

### Getting Help

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review the [Clerk Documentation](https://clerk.com/docs)
3. Check the project's GitHub issues
4. Contact the development team

## Security Best Practices

1. **Never commit `.env.local` to version control**
2. **Use different keys for development and production**
3. **Regularly rotate your API keys**
4. **Monitor your Supabase usage and costs**
5. **Set up proper RLS policies for data security**
6. **Use the service role key only on the server side**

## Production Deployment

When deploying to production:

1. Update environment variables with production values
2. Configure production Supabase project
3. Set up proper domain configuration
4. Configure production webhooks
5. Set up monitoring and alerting
6. Test all functionality in production environment

## Next Steps

After completing the setup:

1. **Test all features** to ensure everything works correctly
2. **Set up monitoring** to track performance and errors
3. **Configure backups** for your Supabase database
4. **Set up CI/CD** for automated deployments
5. **Document your setup** for team members
