# Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

# Meta Marketing API Configuration (Optional)
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_REDIRECT_URI=http://localhost:3000/api/meta/auth

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Application Configuration
NODE_ENV=development
PORT=3000

# Database Configuration (Legacy - if using direct PostgreSQL)
DATABASE_URL=your_database_url
```

## How to Get Supabase Credentials

1. **Go to your Supabase project dashboard**
2. **Navigate to Settings → API**
3. **Copy the following values:**
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## How to Get Clerk Credentials

1. **Go to your Clerk dashboard**
2. **Navigate to API Keys**
3. **Copy the following values:**
   - **Publishable Key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret Key** → `CLERK_SECRET_KEY`

## JWT Template Configuration (for RLS)

1. **Go to Clerk Dashboard → JWT Templates**
2. **Create a new template named "supabase"**
3. **Configure the template with:**
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
4. **Copy the JWT secret for Supabase configuration**

## Security Notes

- Never commit `.env.local` to version control
- The `SUPABASE_SERVICE_ROLE_KEY` has admin privileges - keep it secure
- The `CLERK_SECRET_KEY` has admin privileges - keep it secure
- Use different keys for development and production
- Configure JWT template in Clerk for Row Level Security
- Set up proper user metadata in Clerk for role-based access




