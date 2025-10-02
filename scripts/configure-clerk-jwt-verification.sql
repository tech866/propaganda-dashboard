-- Configure Supabase for Clerk JWT Verification
-- This script sets up Supabase to verify Clerk JWTs for RLS

-- Step 1: Configure JWT settings for Clerk
-- Note: You'll need to get your Clerk JWT secret from Clerk Dashboard
-- Go to: Clerk Dashboard > JWT Templates > Create Template > Copy the secret

-- Update the JWT settings in Supabase
-- This needs to be done in Supabase Dashboard > Settings > API > JWT Settings
-- Or via Supabase CLI if you have it configured

-- For now, we'll create the RLS policies that will work once JWT is configured

-- Step 2: Create a function to get current user from JWT
CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claims', true)::json->>'user_id'
  )::uuid
$$;

-- Step 3: Create a function to get user role from JWT
CREATE OR REPLACE FUNCTION auth.current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    current_setting('request.jwt.claims', true)::json->>'user_role'
  )::text
$$;

-- Step 4: Create a function to get user client_id from JWT
CREATE OR REPLACE FUNCTION auth.current_user_client_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'client_id',
    current_setting('request.jwt.claims', true)::json->>'clientId'
  )::uuid
$$;

-- Step 5: Create a function to check if user is admin or CEO
CREATE OR REPLACE FUNCTION auth.is_admin_or_ceo()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT auth.current_user_role() IN ('admin', 'ceo', 'ADMIN', 'CEO')
$$;

-- Step 6: Create a function to check if user can access client data
CREATE OR REPLACE FUNCTION auth.can_access_client(client_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    auth.is_admin_or_ceo() OR 
    auth.current_user_client_id() = client_id_param
$$;

-- Step 7: Drop existing simple policies
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "clients_select_policy" ON clients;
DROP POLICY IF EXISTS "clients_update_policy" ON clients;
DROP POLICY IF EXISTS "calls_select_policy" ON calls;
DROP POLICY IF EXISTS "calls_update_policy" ON calls;

-- Step 8: Create comprehensive RLS policies

-- Users table policies
CREATE POLICY "users_select_own_client" ON users
    FOR SELECT USING (
        auth.can_access_client(client_id)
    );

CREATE POLICY "users_select_admin_ceo" ON users
    FOR SELECT USING (
        auth.is_admin_or_ceo()
    );

CREATE POLICY "users_update_own_client" ON users
    FOR UPDATE USING (
        auth.can_access_client(client_id)
    );

CREATE POLICY "users_update_admin_ceo" ON users
    FOR UPDATE USING (
        auth.is_admin_or_ceo()
    );

CREATE POLICY "users_insert_admin_ceo" ON users
    FOR INSERT WITH CHECK (
        auth.is_admin_or_ceo()
    );

-- Clients table policies
CREATE POLICY "clients_select_own" ON clients
    FOR SELECT USING (
        auth.can_access_client(id)
    );

CREATE POLICY "clients_select_admin_ceo" ON clients
    FOR SELECT USING (
        auth.is_admin_or_ceo()
    );

CREATE POLICY "clients_update_admin_ceo" ON clients
    FOR UPDATE USING (
        auth.is_admin_or_ceo()
    );

CREATE POLICY "clients_insert_admin_ceo" ON clients
    FOR INSERT WITH CHECK (
        auth.is_admin_or_ceo()
    );

-- Calls table policies
CREATE POLICY "calls_select_own_client" ON calls
    FOR SELECT USING (
        auth.can_access_client(client_id)
    );

CREATE POLICY "calls_select_admin_ceo" ON calls
    FOR SELECT USING (
        auth.is_admin_or_ceo()
    );

CREATE POLICY "calls_update_own_client" ON calls
    FOR UPDATE USING (
        auth.can_access_client(client_id)
    );

CREATE POLICY "calls_update_admin_ceo" ON calls
    FOR UPDATE USING (
        auth.is_admin_or_ceo()
    );

CREATE POLICY "calls_insert_own_client" ON calls
    FOR INSERT WITH CHECK (
        auth.can_access_client(client_id)
    );

CREATE POLICY "calls_insert_admin_ceo" ON calls
    FOR INSERT WITH CHECK (
        auth.is_admin_or_ceo()
    );

-- Step 9: Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- Step 10: Create a test function to verify RLS is working
CREATE OR REPLACE FUNCTION test_rls_policies()
RETURNS TABLE (
    table_name text,
    policy_name text,
    policy_type text,
    policy_definition text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        schemaname||'.'||tablename as table_name,
        policyname as policy_name,
        cmd as policy_type,
        qual as policy_definition
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('users', 'clients', 'calls')
    ORDER BY tablename, policyname;
$$;

-- Step 11: Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT EXECUTE ON FUNCTION auth.current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.current_user_client_id() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_admin_or_ceo() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.can_access_client(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION test_rls_policies() TO authenticated;

-- Step 12: Create a function to get current user info for debugging
CREATE OR REPLACE FUNCTION auth.current_user_info()
RETURNS TABLE (
    user_id text,
    role text,
    client_id text,
    is_admin boolean
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        auth.current_user_id()::text as user_id,
        auth.current_user_role() as role,
        auth.current_user_client_id()::text as client_id,
        auth.is_admin_or_ceo() as is_admin;
$$;

GRANT EXECUTE ON FUNCTION auth.current_user_info() TO authenticated;

-- Success message
SELECT 'RLS policies configured successfully! Next: Configure JWT verification in Supabase Dashboard.' as status;
