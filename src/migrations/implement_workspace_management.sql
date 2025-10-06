-- =====================================================
-- Multi-Tenant Workspace Management Implementation
-- Task 20.1: Design and Implement Multi-Tenant Data Isolation
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CREATE WORKSPACES TABLE (Primary Tenant Container)
-- =====================================================

CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. CREATE WORKSPACE MEMBERSHIPS TABLE (User-Workspace Association)
-- =====================================================

CREATE TABLE IF NOT EXISTS workspace_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'sales_rep', 'client', 'viewer')),
    permissions JSONB DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended', 'removed')),
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workspace_id, user_id)
);

-- =====================================================
-- 3. CREATE INVITATIONS TABLE (Email Invitation System)
-- =====================================================

CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'sales_rep', 'client', 'viewer')),
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. ADD WORKSPACE_ID TO EXISTING TABLES
-- =====================================================

-- Add workspace_id to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- Add workspace_id to calls table
ALTER TABLE calls ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- Add workspace_id to audit_logs table
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- Add workspace_id to meta_tokens table
ALTER TABLE meta_tokens ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- =====================================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Workspaces table indexes
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug);
CREATE INDEX IF NOT EXISTS idx_workspaces_is_active ON workspaces(is_active);
CREATE INDEX IF NOT EXISTS idx_workspaces_created_at ON workspaces(created_at);

-- Workspace memberships table indexes
CREATE INDEX IF NOT EXISTS idx_workspace_memberships_workspace_id ON workspace_memberships(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_memberships_user_id ON workspace_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_memberships_role ON workspace_memberships(role);
CREATE INDEX IF NOT EXISTS idx_workspace_memberships_status ON workspace_memberships(status);
CREATE INDEX IF NOT EXISTS idx_workspace_memberships_workspace_user ON workspace_memberships(workspace_id, user_id);

-- Invitations table indexes
CREATE INDEX IF NOT EXISTS idx_invitations_workspace_id ON invitations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_invitations_invited_by ON invitations(invited_by);

-- Workspace-scoped indexes for existing tables
CREATE INDEX IF NOT EXISTS idx_clients_workspace_id ON clients(workspace_id);
CREATE INDEX IF NOT EXISTS idx_calls_workspace_id ON calls(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace_id ON audit_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_meta_tokens_workspace_id ON meta_tokens(workspace_id);

-- Composite indexes for workspace-scoped queries
CREATE INDEX IF NOT EXISTS idx_calls_workspace_client_user ON calls(workspace_id, client_id, user_id);
CREATE INDEX IF NOT EXISTS idx_calls_workspace_created_at ON calls(workspace_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace_created_at ON audit_logs(workspace_id, created_at);

-- =====================================================
-- 6. CREATE WORKSPACE MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to create a new workspace with default admin
CREATE OR REPLACE FUNCTION create_workspace(
    p_name VARCHAR(255),
    p_slug VARCHAR(255),
    p_description TEXT DEFAULT NULL,
    p_admin_user_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    workspace_id UUID;
BEGIN
    -- Create the workspace
    INSERT INTO workspaces (name, slug, description)
    VALUES (p_name, p_slug, p_description)
    RETURNING id INTO workspace_id;
    
    -- If admin user is provided, add them as admin
    IF p_admin_user_id IS NOT NULL THEN
        INSERT INTO workspace_memberships (workspace_id, user_id, role, status, joined_at)
        VALUES (workspace_id, p_admin_user_id, 'admin', 'active', CURRENT_TIMESTAMP);
    END IF;
    
    RETURN workspace_id;
END;
$$ LANGUAGE plpgsql;

-- Function to invite a user to a workspace
CREATE OR REPLACE FUNCTION invite_user_to_workspace(
    p_workspace_id UUID,
    p_email VARCHAR(255),
    p_role VARCHAR(50),
    p_invited_by UUID,
    p_expires_in_hours INTEGER DEFAULT 168 -- 7 days default
) RETURNS VARCHAR(255) AS $$
DECLARE
    invitation_token VARCHAR(255);
BEGIN
    -- Generate a secure token
    invitation_token := encode(gen_random_bytes(32), 'hex');
    
    -- Create the invitation
    INSERT INTO invitations (workspace_id, email, role, token, expires_at, invited_by)
    VALUES (
        p_workspace_id, 
        p_email, 
        p_role, 
        invitation_token, 
        CURRENT_TIMESTAMP + (p_expires_in_hours || ' hours')::INTERVAL,
        p_invited_by
    );
    
    RETURN invitation_token;
END;
$$ LANGUAGE plpgsql;

-- Function to accept an invitation
CREATE OR REPLACE FUNCTION accept_workspace_invitation(
    p_token VARCHAR(255),
    p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    invitation_record RECORD;
BEGIN
    -- Get the invitation
    SELECT * INTO invitation_record
    FROM invitations
    WHERE token = p_token 
    AND status = 'pending' 
    AND expires_at > CURRENT_TIMESTAMP;
    
    -- Check if invitation exists and is valid
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user already exists in workspace
    IF EXISTS (
        SELECT 1 FROM workspace_memberships 
        WHERE workspace_id = invitation_record.workspace_id 
        AND user_id = p_user_id
    ) THEN
        -- Update existing membership to active
        UPDATE workspace_memberships 
        SET status = 'active', joined_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE workspace_id = invitation_record.workspace_id AND user_id = p_user_id;
    ELSE
        -- Create new membership
        INSERT INTO workspace_memberships (workspace_id, user_id, role, status, invited_by, invited_at, joined_at)
        VALUES (
            invitation_record.workspace_id, 
            p_user_id, 
            invitation_record.role, 
            'active', 
            invitation_record.invited_by,
            invitation_record.created_at,
            CURRENT_TIMESTAMP
        );
    END IF;
    
    -- Mark invitation as accepted
    UPDATE invitations 
    SET status = 'accepted', accepted_by = p_user_id, accepted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = invitation_record.id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's workspaces
CREATE OR REPLACE FUNCTION get_user_workspaces(p_user_id UUID)
RETURNS TABLE (
    workspace_id UUID,
    workspace_name VARCHAR(255),
    workspace_slug VARCHAR(255),
    user_role VARCHAR(50),
    membership_status VARCHAR(20),
    joined_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id,
        w.name,
        w.slug,
        wm.role,
        wm.status,
        wm.joined_at
    FROM workspaces w
    JOIN workspace_memberships wm ON w.id = wm.workspace_id
    WHERE wm.user_id = p_user_id
    AND wm.status = 'active'
    AND w.is_active = true
    ORDER BY wm.joined_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Apply updated_at triggers to new tables
CREATE TRIGGER update_workspaces_updated_at 
    BEFORE UPDATE ON workspaces 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_memberships_updated_at 
    BEFORE UPDATE ON workspace_memberships 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invitations_updated_at 
    BEFORE UPDATE ON invitations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 9. CREATE WORKSPACE-SCOPED RLS POLICIES
-- =====================================================

-- Workspaces policies
CREATE POLICY "Users can view workspaces they belong to" ON workspaces
    FOR SELECT USING (
        id IN (
            SELECT workspace_id FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
            AND wm.status = 'active'
        )
    );

CREATE POLICY "Admins can manage workspaces they belong to" ON workspaces
    FOR ALL USING (
        id IN (
            SELECT workspace_id FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
            AND wm.role = 'admin'
            AND wm.status = 'active'
        )
    );

-- Workspace memberships policies
CREATE POLICY "Users can view memberships in their workspaces" ON workspace_memberships
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
            AND wm.status = 'active'
        )
    );

CREATE POLICY "Admins can manage memberships in their workspaces" ON workspace_memberships
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
            AND wm.role = 'admin'
            AND wm.status = 'active'
        )
    );

-- Invitations policies
CREATE POLICY "Users can view invitations for their workspaces" ON invitations
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
            AND wm.role IN ('admin', 'manager')
            AND wm.status = 'active'
        )
    );

CREATE POLICY "Admins can manage invitations for their workspaces" ON invitations
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
            AND wm.role = 'admin'
            AND wm.status = 'active'
        )
    );

-- =====================================================
-- 10. UPDATE EXISTING RLS POLICIES FOR WORKSPACE ISOLATION
-- =====================================================

-- Drop existing policies that need workspace context
DROP POLICY IF EXISTS "Users can view calls for their client" ON calls;
DROP POLICY IF EXISTS "Users can insert calls for their client" ON calls;
DROP POLICY IF EXISTS "Users can update calls for their client" ON calls;
DROP POLICY IF EXISTS "Users can delete calls for their client" ON calls;

-- Create new workspace-scoped policies for calls
CREATE POLICY "Users can view calls in their workspaces" ON calls
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
            AND wm.status = 'active'
        )
    );

CREATE POLICY "Users can insert calls in their workspaces" ON calls
    FOR INSERT WITH CHECK (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
            AND wm.status = 'active'
        )
    );

CREATE POLICY "Users can update calls in their workspaces" ON calls
    FOR UPDATE USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
            AND wm.status = 'active'
        )
    );

CREATE POLICY "Users can delete calls in their workspaces" ON calls
    FOR DELETE USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
            AND wm.status = 'active'
        )
    );

-- Update clients policies for workspace isolation
DROP POLICY IF EXISTS "Users can view their own client" ON clients;
DROP POLICY IF EXISTS "Admins can manage all clients" ON clients;

CREATE POLICY "Users can view clients in their workspaces" ON clients
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
            AND wm.status = 'active'
        )
    );

CREATE POLICY "Admins can manage clients in their workspaces" ON clients
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
            AND wm.role = 'admin'
            AND wm.status = 'active'
        )
    );

-- Update audit logs policies for workspace isolation
DROP POLICY IF EXISTS "Users can view audit logs for their client" ON audit_logs;

CREATE POLICY "Users can view audit logs in their workspaces" ON audit_logs
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
            AND wm.status = 'active'
        )
    );

-- Update meta tokens policies for workspace isolation
DROP POLICY IF EXISTS "Users can view meta tokens for their client" ON meta_tokens;
DROP POLICY IF EXISTS "Users can manage meta tokens for their client" ON meta_tokens;

CREATE POLICY "Users can view meta tokens in their workspaces" ON meta_tokens
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
            AND wm.status = 'active'
        )
    );

CREATE POLICY "Users can manage meta tokens in their workspaces" ON meta_tokens
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
            AND wm.status = 'active'
        )
    );

-- =====================================================
-- 11. CREATE WORKSPACE ANALYTICS VIEW
-- =====================================================

CREATE OR REPLACE VIEW workspace_analytics AS
SELECT 
    w.id as workspace_id,
    w.name as workspace_name,
    w.slug as workspace_slug,
    COUNT(DISTINCT wm.user_id) as total_members,
    COUNT(DISTINCT CASE WHEN wm.role = 'admin' THEN wm.user_id END) as admin_count,
    COUNT(DISTINCT CASE WHEN wm.role = 'manager' THEN wm.user_id END) as manager_count,
    COUNT(DISTINCT CASE WHEN wm.role = 'sales_rep' THEN wm.user_id END) as sales_rep_count,
    COUNT(DISTINCT CASE WHEN wm.role = 'client' THEN wm.user_id END) as client_count,
    COUNT(DISTINCT c.id) as total_clients,
    COUNT(DISTINCT cl.id) as total_calls,
    COUNT(DISTINCT CASE WHEN cl.status = 'completed' THEN cl.id END) as completed_calls,
    COUNT(DISTINCT CASE WHEN cl.enhanced_call_outcome = 'closed_paid_in_full' OR cl.enhanced_call_outcome = 'deposit' THEN cl.id END) as closed_calls,
    SUM(COALESCE(cl.cash_collected_upfront, 0)) as total_cash_collected,
    SUM(COALESCE(cl.total_amount_owed, 0)) as total_revenue,
    w.created_at as workspace_created_at
FROM workspaces w
LEFT JOIN workspace_memberships wm ON w.id = wm.workspace_id AND wm.status = 'active'
LEFT JOIN clients c ON w.id = c.workspace_id
LEFT JOIN calls cl ON w.id = cl.workspace_id
WHERE w.is_active = true
GROUP BY w.id, w.name, w.slug, w.created_at;

-- =====================================================
-- 12. ADD COMMENTS ON NEW TABLES AND COLUMNS
-- =====================================================

COMMENT ON TABLE workspaces IS 'Multi-tenant workspace management - primary tenant container';
COMMENT ON TABLE workspace_memberships IS 'User-workspace associations with roles and permissions';
COMMENT ON TABLE invitations IS 'Email invitation system for workspace access';

COMMENT ON COLUMN workspaces.slug IS 'URL-friendly identifier for workspace routing';
COMMENT ON COLUMN workspaces.settings IS 'Workspace-specific configuration and preferences';
COMMENT ON COLUMN workspace_memberships.role IS 'User role within the workspace: admin, manager, sales_rep, client, viewer';
COMMENT ON COLUMN workspace_memberships.permissions IS 'Granular permissions for the user within the workspace';
COMMENT ON COLUMN workspace_memberships.status IS 'Membership status: active, pending, suspended, removed';
COMMENT ON COLUMN invitations.token IS 'Secure token for invitation acceptance';
COMMENT ON COLUMN invitations.expires_at IS 'Invitation expiration timestamp';

COMMENT ON COLUMN clients.workspace_id IS 'Workspace this client belongs to';
COMMENT ON COLUMN calls.workspace_id IS 'Workspace this call belongs to';
COMMENT ON COLUMN audit_logs.workspace_id IS 'Workspace this audit log belongs to';
COMMENT ON COLUMN meta_tokens.workspace_id IS 'Workspace this meta token belongs to';

COMMENT ON VIEW workspace_analytics IS 'Comprehensive analytics for workspace management and reporting';

-- =====================================================
-- 13. MIGRATION HELPER FUNCTIONS
-- =====================================================

-- Function to migrate existing data to workspace structure
CREATE OR REPLACE FUNCTION migrate_to_workspace_structure()
RETURNS TEXT AS $$
DECLARE
    default_workspace_id UUID;
    client_record RECORD;
    user_record RECORD;
BEGIN
    -- Create a default workspace for existing data
    INSERT INTO workspaces (name, slug, description)
    VALUES ('Default Workspace', 'default', 'Migrated workspace for existing data')
    RETURNING id INTO default_workspace_id;
    
    -- Update existing clients to belong to default workspace
    UPDATE clients SET workspace_id = default_workspace_id WHERE workspace_id IS NULL;
    
    -- Update existing calls to belong to default workspace
    UPDATE calls SET workspace_id = default_workspace_id WHERE workspace_id IS NULL;
    
    -- Update existing audit logs to belong to default workspace
    UPDATE audit_logs SET workspace_id = default_workspace_id WHERE workspace_id IS NULL;
    
    -- Update existing meta tokens to belong to default workspace
    UPDATE meta_tokens SET workspace_id = default_workspace_id WHERE workspace_id IS NULL;
    
    -- Create workspace memberships for existing users
    FOR user_record IN SELECT DISTINCT u.id, u.client_id FROM users u LOOP
        -- Find the workspace for this user's client
        SELECT c.workspace_id INTO default_workspace_id
        FROM clients c
        WHERE c.id = user_record.client_id;
        
        -- Create workspace membership
        INSERT INTO workspace_memberships (workspace_id, user_id, role, status, joined_at)
        VALUES (
            default_workspace_id,
            user_record.id,
            CASE 
                WHEN user_record.id IN (SELECT id FROM users WHERE role IN ('ADMIN', 'admin', 'ceo')) THEN 'admin'
                WHEN user_record.id IN (SELECT id FROM users WHERE role = 'sales') THEN 'sales_rep'
                ELSE 'viewer'
            END,
            'active',
            CURRENT_TIMESTAMP
        )
        ON CONFLICT (workspace_id, user_id) DO NOTHING;
    END LOOP;
    
    RETURN 'Migration completed successfully. Created default workspace and migrated all existing data.';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'Multi-tenant workspace management system implemented successfully!' as status,
       'Workspaces, memberships, invitations, and enhanced RLS policies have been created' as message,
       'Run migrate_to_workspace_structure() to migrate existing data' as next_step;
