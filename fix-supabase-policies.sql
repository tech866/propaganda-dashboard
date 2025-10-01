-- =====================================================
-- Fix Supabase RLS Policy Infinite Recursion Issue
-- =====================================================

-- First, let's drop the problematic policies
DROP POLICY IF EXISTS "Users can view users from their agency" ON users;
DROP POLICY IF EXISTS "Users can manage users from their agency" ON users;

-- =====================================================
-- SOLUTION 1: Use a Security Definer Function
-- =====================================================

-- Create a function that bypasses RLS to get user's agency_id
CREATE OR REPLACE FUNCTION get_user_agency_id(user_id UUID)
RETURNS UUID AS $$
DECLARE
    agency_id UUID;
BEGIN
    -- This function runs with SECURITY DEFINER, so it bypasses RLS
    SELECT u.agency_id INTO agency_id 
    FROM users u 
    WHERE u.id = user_id;
    
    RETURN agency_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_agency_id(UUID) TO authenticated;

-- =====================================================
-- SOLUTION 2: Alternative - Use auth.jwt() for Clerk Integration
-- =====================================================

-- If you're using Clerk, you can also use this approach:
-- Create a function to get agency_id from Clerk metadata
CREATE OR REPLACE FUNCTION get_agency_id_from_clerk()
RETURNS UUID AS $$
DECLARE
    agency_id UUID;
    clerk_user_id TEXT;
BEGIN
    -- Get Clerk user ID from JWT token
    clerk_user_id := auth.jwt() ->> 'sub';
    
    -- Get agency_id from users table (bypasses RLS with SECURITY DEFINER)
    SELECT u.agency_id INTO agency_id 
    FROM users u 
    WHERE u.clerk_user_id = clerk_user_id;
    
    RETURN agency_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_agency_id_from_clerk() TO authenticated;

-- =====================================================
-- Create Fixed RLS Policies
-- =====================================================

-- Option A: Using the security definer function
CREATE POLICY "Users can view users from their agency" ON users
    FOR SELECT USING (
        agency_id = get_user_agency_id(auth.uid())
    );

CREATE POLICY "Users can manage users from their agency" ON users
    FOR ALL USING (
        agency_id = get_user_agency_id(auth.uid())
    );

-- Option B: For Clerk integration (uncomment if using Clerk)
-- CREATE POLICY "Users can view users from their agency" ON users
--     FOR SELECT USING (
--         agency_id = get_agency_id_from_clerk()
--     );

-- CREATE POLICY "Users can manage users from their agency" ON users
--     FOR ALL USING (
--         agency_id = get_agency_id_from_clerk()
--     );

-- =====================================================
-- Additional Policies for Other Tables
-- =====================================================

-- Fix similar issues in other tables if they exist
-- Agencies table
DROP POLICY IF EXISTS "Users can view their own agency" ON agencies;
CREATE POLICY "Users can view their own agency" ON agencies
    FOR SELECT USING (
        id = get_user_agency_id(auth.uid())
    );

DROP POLICY IF EXISTS "Users can update their own agency" ON agencies;
CREATE POLICY "Users can update their own agency" ON agencies
    FOR UPDATE USING (
        id = get_user_agency_id(auth.uid())
    );

-- Clients table
DROP POLICY IF EXISTS "Users can view clients from their agency" ON clients;
CREATE POLICY "Users can view clients from their agency" ON clients
    FOR SELECT USING (
        agency_id = get_user_agency_id(auth.uid())
    );

DROP POLICY IF EXISTS "Users can manage clients from their agency" ON clients;
CREATE POLICY "Users can manage clients from their agency" ON clients
    FOR ALL USING (
        agency_id = get_user_agency_id(auth.uid())
    );

-- =====================================================
-- Test the Fix
-- =====================================================

-- You can test this by running:
-- SELECT * FROM users; -- Should now work without infinite recursion

-- =====================================================
-- Comments and Documentation
-- =====================================================

COMMENT ON FUNCTION get_user_agency_id(UUID) IS 'Security definer function to get user agency_id without RLS recursion';
COMMENT ON FUNCTION get_agency_id_from_clerk() IS 'Function to get agency_id from Clerk JWT token for RLS policies';
