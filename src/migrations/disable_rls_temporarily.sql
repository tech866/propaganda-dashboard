-- =====================================================
-- TEMPORARILY DISABLE RLS TO GET RUNNING
-- =====================================================

-- Disable RLS on all tables temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE calls DISABLE ROW LEVEL SECURITY;
ALTER TABLE loss_reasons DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY "Allow authenticated users to view users" ON users;
DROP POLICY "Allow authenticated users to insert users" ON users;
DROP POLICY "Allow authenticated users to update users" ON users;

DROP POLICY IF EXISTS "Users can view their client data" ON clients;
DROP POLICY IF EXISTS "Users can update their client data" ON clients;
DROP POLICY IF EXISTS "Admins can view all clients" ON clients;
DROP POLICY IF EXISTS "Admins can update all clients" ON clients;
DROP POLICY "Allow authenticated users to view clients" ON clients;
DROP POLICY "Allow authenticated users to insert clients" ON clients;
DROP POLICY "Allow authenticated users to update clients" ON clients;

DROP POLICY IF EXISTS "Users can view their calls" ON calls;
DROP POLICY IF EXISTS "Users can create calls" ON calls;
DROP POLICY IF EXISTS "Users can update their calls" ON calls;
DROP POLICY IF EXISTS "Admins can view all calls" ON calls;
DROP POLICY IF EXISTS "Admins can create calls" ON calls;
DROP POLICY IF EXISTS "Admins can update all calls" ON calls;
DROP POLICY "Allow authenticated users to view calls" ON calls;
DROP POLICY "Allow authenticated users to insert calls" ON calls;
DROP POLICY "Allow authenticated users to update calls" ON calls;

DROP POLICY IF EXISTS "All authenticated users can view loss reasons" ON loss_reasons;
DROP POLICY IF EXISTS "Admins can manage loss reasons" ON loss_reasons;
DROP POLICY "Allow authenticated users to view loss reasons" ON loss_reasons;
DROP POLICY "Allow authenticated users to insert loss reasons" ON loss_reasons;
DROP POLICY "Allow authenticated users to update loss reasons" ON loss_reasons;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

-- ✅ RLS temporarily disabled!
-- Your application should now work without RLS policy conflicts.
-- You can re-enable RLS later with proper policies once everything is working.
