-- =====================================================
-- Multi-Tenant Workspace Management System Migration
-- This script implements a complete multi-tenant workspace system
-- with data isolation, team member invitations, and RBAC
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CREATE WORKSPACES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    settings JSONB DEFAULT '{}',
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. CREATE WORKSPACE MEMBERSHIPS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS workspace_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'sales', 'client', 'viewer')),
    permissions JSONB DEFAULT '[]',
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workspace_id, user_id)
);

-- =====================================================
-- 3. CREATE WORKSPACE INVITATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS workspace_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'sales', 'client', 'viewer')),
    permissions JSONB DEFAULT '[]',
    token VARCHAR(255) UNIQUE NOT NULL,
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workspace_id, email)
);

-- =====================================================
-- 4. CREATE WORKSPACE AUDIT LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS workspace_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. UPDATE EXISTING TABLES FOR WORKSPACE ISOLATION
-- =====================================================

-- Add workspace_id to calls table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'calls' AND column_name = 'workspace_id') THEN
        ALTER TABLE calls ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add workspace_id to clients table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'workspace_id') THEN
        ALTER TABLE clients ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =====================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Workspaces indexes
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug);
CREATE INDEX IF NOT EXISTS idx_workspaces_created_by ON workspaces(created_by);
CREATE INDEX IF NOT EXISTS idx_workspaces_is_active ON workspaces(is_active);

-- Workspace memberships indexes
CREATE INDEX IF NOT EXISTS idx_workspace_memberships_workspace_id ON workspace_memberships(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_memberships_user_id ON workspace_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_memberships_role ON workspace_memberships(role);
CREATE INDEX IF NOT EXISTS idx_workspace_memberships_is_active ON workspace_memberships(is_active);

-- Workspace invitations indexes
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_workspace_id ON workspace_invitations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_email ON workspace_invitations(email);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_token ON workspace_invitations(token);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_status ON workspace_invitations(status);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_expires_at ON workspace_invitations(expires_at);

-- Workspace audit logs indexes
CREATE INDEX IF NOT EXISTS idx_workspace_audit_logs_workspace_id ON workspace_audit_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_audit_logs_user_id ON workspace_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_audit_logs_action ON workspace_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_workspace_audit_logs_created_at ON workspace_audit_logs(created_at);

-- Data isolation indexes
CREATE INDEX IF NOT EXISTS idx_calls_workspace_id ON calls(workspace_id);
CREATE INDEX IF NOT EXISTS idx_clients_workspace_id ON clients(workspace_id);

-- =====================================================
-- 7. CREATE ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all workspace-related tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Workspaces policies
CREATE POLICY "Users can view workspaces they belong to" ON workspaces
    FOR SELECT USING (
        id IN (
            SELECT workspace_id FROM workspace_memberships 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admins can update workspaces they belong to" ON workspaces
    FOR UPDATE USING (
        id IN (
            SELECT workspace_id FROM workspace_memberships 
            WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

-- Workspace memberships policies
CREATE POLICY "Users can view memberships in their workspaces" ON workspace_memberships
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admins can manage memberships in their workspaces" ON workspace_memberships
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships 
            WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

-- Workspace invitations policies
CREATE POLICY "Users can view invitations in their workspaces" ON workspace_invitations
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Admins can manage invitations in their workspaces" ON workspace_invitations
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships 
            WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

-- Workspace audit logs policies
CREATE POLICY "Users can view audit logs in their workspaces" ON workspace_audit_logs
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Calls policies (workspace isolation)
CREATE POLICY "Users can view calls in their workspaces" ON calls
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can manage calls in their workspaces" ON calls
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Clients policies (workspace isolation)
CREATE POLICY "Users can view clients in their workspaces" ON clients
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can manage clients in their workspaces" ON clients
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- =====================================================
-- 8. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to create a new workspace with admin membership
CREATE OR REPLACE FUNCTION create_workspace(
    workspace_name VARCHAR(255),
    workspace_slug VARCHAR(100),
    workspace_description TEXT DEFAULT NULL,
    admin_user_id UUID DEFAULT auth.uid()
) RETURNS UUID AS $$
DECLARE
    new_workspace_id UUID;
BEGIN
    -- Create the workspace
    INSERT INTO workspaces (name, slug, description, created_by)
    VALUES (workspace_name, workspace_slug, workspace_description, admin_user_id)
    RETURNING id INTO new_workspace_id;
    
    -- Add the creator as admin
    INSERT INTO workspace_memberships (workspace_id, user_id, role, invited_by)
    VALUES (new_workspace_id, admin_user_id, 'admin', admin_user_id);
    
    -- Log the workspace creation
    INSERT INTO workspace_audit_logs (workspace_id, user_id, action, resource_type, resource_id, details)
    VALUES (new_workspace_id, admin_user_id, 'workspace_created', 'workspace', new_workspace_id, 
            jsonb_build_object('name', workspace_name, 'slug', workspace_slug));
    
    RETURN new_workspace_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to invite a user to a workspace
CREATE OR REPLACE FUNCTION invite_user_to_workspace(
    workspace_id_param UUID,
    email_param VARCHAR(255),
    role_param VARCHAR(50),
    invited_by_param UUID,
    expires_in_hours INTEGER DEFAULT 168 -- 7 days
) RETURNS VARCHAR(255) AS $$
DECLARE
    invitation_token VARCHAR(255);
BEGIN
    -- Generate a secure token
    invitation_token := encode(gen_random_bytes(32), 'base64url');
    
    -- Create the invitation
    INSERT INTO workspace_invitations (
        workspace_id, email, role, token, invited_by, expires_at
    ) VALUES (
        workspace_id_param, 
        email_param, 
        role_param, 
        invitation_token, 
        invited_by_param, 
        NOW() + (expires_in_hours || ' hours')::INTERVAL
    );
    
    -- Log the invitation
    INSERT INTO workspace_audit_logs (workspace_id, user_id, action, resource_type, details)
    VALUES (workspace_id_param, invited_by_param, 'user_invited', 'invitation', 
            jsonb_build_object('email', email_param, 'role', role_param));
    
    RETURN invitation_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept a workspace invitation
CREATE OR REPLACE FUNCTION accept_workspace_invitation(
    token_param VARCHAR(255),
    user_id_param UUID DEFAULT auth.uid()
) RETURNS BOOLEAN AS $$
DECLARE
    invitation_record RECORD;
BEGIN
    -- Get the invitation
    SELECT * INTO invitation_record
    FROM workspace_invitations
    WHERE token = token_param 
    AND status = 'pending' 
    AND expires_at > NOW();
    
    -- Check if invitation exists and is valid
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if user already has membership
    IF EXISTS (
        SELECT 1 FROM workspace_memberships 
        WHERE workspace_id = invitation_record.workspace_id 
        AND user_id = user_id_param
    ) THEN
        -- Update existing membership
        UPDATE workspace_memberships 
        SET role = invitation_record.role, 
            is_active = true,
            updated_at = NOW()
        WHERE workspace_id = invitation_record.workspace_id 
        AND user_id = user_id_param;
    ELSE
        -- Create new membership
        INSERT INTO workspace_memberships (workspace_id, user_id, role, invited_by)
        VALUES (invitation_record.workspace_id, user_id_param, invitation_record.role, invitation_record.invited_by);
    END IF;
    
    -- Mark invitation as accepted
    UPDATE workspace_invitations 
    SET status = 'accepted', accepted_at = NOW(), updated_at = NOW()
    WHERE id = invitation_record.id;
    
    -- Log the acceptance
    INSERT INTO workspace_audit_logs (workspace_id, user_id, action, resource_type, details)
    VALUES (invitation_record.workspace_id, user_id_param, 'invitation_accepted', 'invitation', 
            jsonb_build_object('email', invitation_record.email, 'role', invitation_record.role));
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to workspace tables
DROP TRIGGER IF EXISTS update_workspaces_updated_at ON workspaces;
CREATE TRIGGER update_workspaces_updated_at
    BEFORE UPDATE ON workspaces
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workspace_memberships_updated_at ON workspace_memberships;
CREATE TRIGGER update_workspace_memberships_updated_at
    BEFORE UPDATE ON workspace_memberships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workspace_invitations_updated_at ON workspace_invitations;
CREATE TRIGGER update_workspace_invitations_updated_at
    BEFORE UPDATE ON workspace_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. CREATE DEFAULT WORKSPACE FOR EXISTING USERS
-- =====================================================

-- Create a default workspace for existing users who don't have one
INSERT INTO workspaces (id, name, slug, description, created_by)
SELECT 
    '00000000-0000-0000-0000-000000000001'::UUID,
    'Default Workspace',
    'default-workspace',
    'Default workspace for existing users',
    u.id
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM workspace_memberships wm 
    WHERE wm.user_id = u.id
)
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Add existing users to the default workspace
INSERT INTO workspace_memberships (workspace_id, user_id, role, invited_by)
SELECT 
    '00000000-0000-0000-0000-000000000001'::UUID,
    u.id,
    'admin',
    u.id
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM workspace_memberships wm 
    WHERE wm.user_id = u.id
)
ON CONFLICT (workspace_id, user_id) DO NOTHING;

-- Update existing calls and clients to belong to default workspace
UPDATE calls 
SET workspace_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE workspace_id IS NULL;

UPDATE clients 
SET workspace_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE workspace_id IS NULL;

-- =====================================================
-- 11. ADD COMMENTS
-- =====================================================

COMMENT ON TABLE workspaces IS 'Multi-tenant workspaces for client isolation';
COMMENT ON TABLE workspace_memberships IS 'User memberships and roles within workspaces';
COMMENT ON TABLE workspace_invitations IS 'Pending invitations to join workspaces';
COMMENT ON TABLE workspace_audit_logs IS 'Audit trail for workspace actions and user activities';

COMMENT ON COLUMN workspaces.slug IS 'URL-friendly identifier for the workspace';
COMMENT ON COLUMN workspaces.settings IS 'JSON configuration for workspace-specific settings';
COMMENT ON COLUMN workspaces.subscription_tier IS 'Billing tier for the workspace';

COMMENT ON COLUMN workspace_memberships.role IS 'User role within the workspace (admin, manager, sales, client, viewer)';
COMMENT ON COLUMN workspace_memberships.permissions IS 'Custom permissions override for the user';
COMMENT ON COLUMN workspace_memberships.invited_by IS 'User who invited this member';

COMMENT ON COLUMN workspace_invitations.token IS 'Secure token for invitation acceptance';
COMMENT ON COLUMN workspace_invitations.expires_at IS 'When the invitation expires';
COMMENT ON COLUMN workspace_invitations.status IS 'Current status of the invitation';

COMMENT ON COLUMN workspace_audit_logs.action IS 'Action performed (e.g., user_invited, workspace_created)';
COMMENT ON COLUMN workspace_audit_logs.resource_type IS 'Type of resource affected (e.g., workspace, invitation, call)';
COMMENT ON COLUMN workspace_audit_logs.resource_id IS 'ID of the affected resource';
COMMENT ON COLUMN workspace_audit_logs.details IS 'Additional context about the action';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================



