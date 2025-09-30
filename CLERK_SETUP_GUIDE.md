# 🔐 Clerk Authentication Setup Guide

## Step 1: Create Clerk Account & Application

1. **Go to [clerk.com](https://clerk.com)** and sign up for a free account
2. **Create a new application**:
   - Name: "Propaganda Dashboard"
   - Choose "Next.js" as your framework
   - Select "Email" as your sign-in method
3. **Copy your API keys** from the dashboard

## Step 2: Environment Variables

Create a `.env.local` file in your project root with these variables:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase (use your existing keys)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## Step 3: Configure Clerk Organizations

In your Clerk dashboard:

1. **Go to "Organizations"** in the sidebar
2. **Enable Organizations** for your application
3. **Set up organization settings**:
   - Allow users to create organizations: ✅
   - Allow users to join multiple organizations: ❌ (one agency per user)
   - Require organization membership: ✅

## Step 4: Set up User Metadata

In Clerk dashboard:

1. **Go to "User & Authentication" > "User metadata"**
2. **Add custom fields**:
   - `agency_id` (string) - Links user to their agency
   - `role` (string) - User role (ceo, admin, sales, agency_user, client_user)
   - `subscription_plan` (string) - Agency subscription tier

## Step 5: Configure Webhooks

1. **Go to "Webhooks"** in Clerk dashboard
2. **Create a new webhook**:
   - Endpoint: `https://your-domain.com/api/webhooks/clerk`
   - Events to subscribe to:
     - `user.created`
     - `user.updated`
     - `user.deleted`
     - `organization.created`
     - `organization.updated`
     - `organization.deleted`
     - `organizationMembership.created`
     - `organizationMembership.updated`
     - `organizationMembership.deleted`

## Step 6: Test the Setup

1. **Start your development server**: `npm run dev`
2. **Visit**: `http://localhost:3000`
3. **Test sign-up flow**
4. **Test organization creation**
5. **Verify user metadata is saved**

## Next Steps

Once Clerk is set up, we'll:
1. Replace NextAuth with Clerk in the codebase
2. Set up user sync with Supabase
3. Implement role-based access control
4. Create team invitation system

## Important Notes

- **Organizations = Agencies** in our system
- **One user = One agency** (no multi-agency users)
- **Roles are stored in user metadata**
- **Webhooks will sync users to Supabase**
- **RLS policies will use Clerk user IDs**

## Troubleshooting

- **CORS issues**: Make sure your domain is added to Clerk's allowed origins
- **Webhook failures**: Check your webhook endpoint is accessible
- **User sync issues**: Verify Supabase connection and RLS policies
- **Organization issues**: Ensure organizations are enabled in Clerk dashboard
