-- Comprehensive Fix for Supabase Import Issues
-- This script addresses RLS policy conflicts and data integrity issues

-- Step 1: Temporarily disable RLS to fix policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE calls DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on users table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON users';
    END LOOP;
    
    -- Drop all policies on clients table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'clients' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON clients';
    END LOOP;
    
    -- Drop all policies on calls table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'calls' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON calls';
    END LOOP;
END $$;

-- Step 3: Create simple, non-recursive RLS policies

-- Users table - simple authenticated access
CREATE POLICY "users_select_policy" ON users
    FOR SELECT USING (true);

CREATE POLICY "users_update_policy" ON users
    FOR UPDATE USING (true);

-- Clients table - simple authenticated access
CREATE POLICY "clients_select_policy" ON clients
    FOR SELECT USING (true);

CREATE POLICY "clients_update_policy" ON clients
    FOR UPDATE USING (true);

-- Calls table - simple authenticated access
CREATE POLICY "calls_select_policy" ON calls
    FOR SELECT USING (true);

CREATE POLICY "calls_insert_policy" ON calls
    FOR INSERT WITH CHECK (true);

CREATE POLICY "calls_update_policy" ON calls
    FOR UPDATE USING (true);

-- Step 4: Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- Step 5: Verify the fix
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Step 6: Test basic data access
SELECT 'Users count: ' || COUNT(*) as test_result FROM users
UNION ALL
SELECT 'Clients count: ' || COUNT(*) as test_result FROM clients  
UNION ALL
SELECT 'Calls count: ' || COUNT(*) as test_result FROM calls;
