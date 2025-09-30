# Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Meta Marketing API Configuration
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_REDIRECT_URI=http://localhost:3000/api/meta/auth

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Database Configuration (if using direct PostgreSQL)
DATABASE_URL=your_database_url
```

## How to Get Supabase Credentials

1. **Go to your Supabase project dashboard**
2. **Navigate to Settings → API**
3. **Copy the following values:**
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## Security Notes

- Never commit `.env.local` to version control
- The `SUPABASE_SERVICE_ROLE_KEY` has admin privileges - keep it secure
- Use different keys for development and production

