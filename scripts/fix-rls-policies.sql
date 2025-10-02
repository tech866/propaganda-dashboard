-- Fix RLS Policies to Prevent Infinite Recursion
-- This script addresses the infinite recursion issues in RLS policies

-- First, let's disable RLS temporarily to fix the policies
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE calls DISABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can view clients they belong to" ON clients;
DROP POLICY IF EXISTS "Users can view calls for their client" ON calls;
DROP POLICY IF EXISTS "Users can create calls for their client" ON calls;
DROP POLICY IF EXISTS "Users can update calls for their client" ON calls;

-- Create simplified, non-recursive RLS policies

-- Users table policies
CREATE POLICY "Enable read access for authenticated users" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON users
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Clients table policies  
CREATE POLICY "Enable read access for authenticated users" ON clients
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON clients
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Calls table policies
CREATE POLICY "Enable read access for authenticated users" ON calls
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON calls
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON calls
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- Verify policies are working
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
