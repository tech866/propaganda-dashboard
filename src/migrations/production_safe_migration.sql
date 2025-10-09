-- =====================================================
-- Production Safe Migration
-- Propaganda Dashboard - Safe Migration for Existing Database
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CREATE MISSING TABLES (IF NOT EXISTS)
-- =====================================================

-- Create clients table (if not exists)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create users table (if not exists)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    clerk_user_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) DEFAULT '',
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'USER', 'PROFESSIONAL', 'ceo', 'admin', 'sales')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    clerk_metadata JSONB,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create loss reasons table (if not exists)
CREATE TABLE IF NOT EXISTS loss_reasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create calls table (if not exists)
CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    prospect_name VARCHAR(255),
    prospect_email VARCHAR(255),
    prospect_phone VARCHAR(50),
    call_type VARCHAR(50) CHECK (call_type IN ('inbound', 'outbound', 'callback')),
    status VARCHAR(50) CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled')),
    call_duration INTEGER DEFAULT 0,
    call_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    outcome VARCHAR(50) CHECK (outcome IN ('qualified', 'not_qualified', 'callback_requested', 'no_answer', 'busy')),
    lead_source VARCHAR(100),
    source_of_set_appointment VARCHAR(100),
    traffic_source VARCHAR(100),
    crm_stage VARCHAR(50),
    loss_reason_id UUID REFERENCES loss_reasons(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table (if not exists)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create meta_tokens table (if not exists)
CREATE TABLE IF NOT EXISTS meta_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type VARCHAR(50) DEFAULT 'Bearer',
    expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create workspaces table (if not exists)
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create workspace_memberships table (if not exists)
CREATE TABLE IF NOT EXISTS workspace_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workspace_id, user_id)
);

-- Create workspace_invitations table (if not exists)
CREATE TABLE IF NOT EXISTS workspace_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
    token VARCHAR(255) UNIQUE NOT NULL,
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create workspace_audit_logs table (if not exists)
CREATE TABLE IF NOT EXISTS workspace_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. ADD MISSING COLUMNS TO EXISTING TABLES
-- =====================================================

-- Add workspace_id to clients table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'clients' AND column_name = 'workspace_id') THEN
        ALTER TABLE clients ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add workspace_id to calls table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'calls' AND column_name = 'workspace_id') THEN
        ALTER TABLE calls ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =====================================================
-- 3. CREATE INDEXES (IF NOT EXISTS)
-- =====================================================

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_client_id ON users(client_id);
CREATE INDEX IF NOT EXISTS idx_calls_client_id ON calls(client_id);
CREATE INDEX IF NOT EXISTS idx_calls_workspace_id ON calls(workspace_id);
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON calls(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_call_date ON calls(call_date);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_outcome ON calls(outcome);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_workspace_memberships_workspace_id ON workspace_memberships(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_memberships_user_id ON workspace_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_workspace_id ON workspace_invitations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_token ON workspace_invitations(token);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_email ON workspace_invitations(email);

-- =====================================================
-- 4. CREATE ANALYTICS VIEWS (IF NOT EXISTS)
-- =====================================================

-- Create enhanced_call_analytics view (if not exists)
CREATE OR REPLACE VIEW enhanced_call_analytics AS
SELECT 
    c.id,
    c.client_id,
    c.workspace_id,
    c.user_id,
    c.prospect_name,
    c.prospect_email,
    c.prospect_phone,
    c.call_type,
    c.status,
    c.call_duration,
    c.call_date,
    c.notes,
    c.outcome,
    c.lead_source,
    c.source_of_set_appointment,
    c.traffic_source,
    c.crm_stage,
    c.loss_reason_id,
    c.created_at,
    c.updated_at,
    cl.name as client_name,
    u.name as user_name,
    u.email as user_email,
    lr.name as loss_reason_name,
    w.name as workspace_name
FROM calls c
LEFT JOIN clients cl ON c.client_id = cl.id
LEFT JOIN users u ON c.user_id = u.id
LEFT JOIN loss_reasons lr ON c.loss_reason_id = lr.id
LEFT JOIN workspaces w ON c.workspace_id = w.id;

-- Create users_with_clerk view (if not exists)
CREATE OR REPLACE VIEW users_with_clerk AS
SELECT 
    u.*,
    cl.name as client_name,
    cl.email as client_email,
    cl.phone as client_phone,
    cl.address as client_address,
    cl.is_active as client_is_active,
    cl.created_at as client_created_at,
    cl.updated_at as client_updated_at
FROM users u
LEFT JOIN clients cl ON u.client_id = cl.id;

-- =====================================================
-- 5. CREATE HELPER FUNCTIONS (IF NOT EXISTS)
-- =====================================================

-- Function to calculate close rate
CREATE OR REPLACE FUNCTION calculate_close_rate(
    p_client_id UUID DEFAULT NULL,
    p_workspace_id UUID DEFAULT NULL,
    p_date_from TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_date_to TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_completed INTEGER;
    total_won INTEGER;
    close_rate DECIMAL(5,2);
BEGIN
    SELECT 
        COUNT(*) FILTER (WHERE status = 'completed'),
        COUNT(*) FILTER (WHERE status = 'completed' AND outcome = 'qualified')
    INTO total_completed, total_won
    FROM calls
    WHERE (p_client_id IS NULL OR client_id = p_client_id)
      AND (p_workspace_id IS NULL OR workspace_id = p_workspace_id)
      AND (p_date_from IS NULL OR call_date >= p_date_from)
      AND (p_date_to IS NULL OR call_date <= p_date_to);
    
    IF total_completed = 0 THEN
        RETURN 0.00;
    END IF;
    
    close_rate := (total_won::DECIMAL / total_completed::DECIMAL) * 100;
    RETURN ROUND(close_rate, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate show rate
CREATE OR REPLACE FUNCTION calculate_show_rate(
    p_client_id UUID DEFAULT NULL,
    p_workspace_id UUID DEFAULT NULL,
    p_date_from TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_date_to TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_scheduled INTEGER;
    total_showed INTEGER;
    show_rate DECIMAL(5,2);
BEGIN
    SELECT 
        COUNT(*) FILTER (WHERE status IN ('scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled')),
        COUNT(*) FILTER (WHERE status = 'completed')
    INTO total_scheduled, total_showed
    FROM calls
    WHERE (p_client_id IS NULL OR client_id = p_client_id)
      AND (p_workspace_id IS NULL OR workspace_id = p_workspace_id)
      AND (p_date_from IS NULL OR call_date >= p_date_from)
      AND (p_date_to IS NULL OR call_date <= p_date_to);
    
    IF total_scheduled = 0 THEN
        RETURN 0.00;
    END IF;
    
    show_rate := (total_showed::DECIMAL / total_scheduled::DECIMAL) * 100;
    RETURN ROUND(show_rate, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate AOV
CREATE OR REPLACE FUNCTION calculate_aov(
    p_client_id UUID DEFAULT NULL,
    p_workspace_id UUID DEFAULT NULL,
    p_date_from TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_date_to TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total_revenue DECIMAL(10,2);
    total_deals INTEGER;
    aov DECIMAL(10,2);
BEGIN
    -- This is a placeholder - you'll need to implement based on your revenue tracking
    SELECT 
        COALESCE(SUM(0), 0), -- Replace with actual revenue calculation
        COUNT(*) FILTER (WHERE outcome = 'qualified')
    INTO total_revenue, total_deals
    FROM calls
    WHERE (p_client_id IS NULL OR client_id = p_client_id)
      AND (p_workspace_id IS NULL OR workspace_id = p_workspace_id)
      AND (p_date_from IS NULL OR call_date >= p_date_from)
      AND (p_date_to IS NULL OR call_date <= p_date_to);
    
    IF total_deals = 0 THEN
        RETURN 0.00;
    END IF;
    
    aov := total_revenue / total_deals;
    RETURN ROUND(aov, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to sync Clerk user
CREATE OR REPLACE FUNCTION sync_clerk_user(
    p_clerk_user_id VARCHAR(255),
    p_email VARCHAR(255),
    p_name VARCHAR(255),
    p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Try to find existing user
    SELECT id INTO user_id FROM users WHERE clerk_user_id = p_clerk_user_id;
    
    IF user_id IS NOT NULL THEN
        -- Update existing user
        UPDATE users 
        SET 
            email = p_email,
            name = p_name,
            clerk_metadata = p_metadata,
            last_sync_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = user_id;
    ELSE
        -- Create new user (you may need to adjust this based on your requirements)
        INSERT INTO users (clerk_user_id, email, name, clerk_metadata, last_sync_at, role)
        VALUES (p_clerk_user_id, p_email, p_name, p_metadata, CURRENT_TIMESTAMP, 'USER')
        RETURNING id INTO user_id;
    END IF;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create workspace
CREATE OR REPLACE FUNCTION create_workspace(
    p_name VARCHAR(255),
    p_slug VARCHAR(100),
    p_description TEXT DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    workspace_id UUID;
BEGIN
    INSERT INTO workspaces (name, slug, description, created_by)
    VALUES (p_name, p_slug, p_description, p_created_by)
    RETURNING id INTO workspace_id;
    
    RETURN workspace_id;
END;
$$ LANGUAGE plpgsql;

-- Function to invite user to workspace
CREATE OR REPLACE FUNCTION invite_user_to_workspace(
    p_workspace_id UUID,
    p_email VARCHAR(255),
    p_role VARCHAR(50),
    p_invited_by UUID
)
RETURNS UUID AS $$
DECLARE
    invitation_id UUID;
    invitation_token VARCHAR(255);
BEGIN
    -- Generate a unique token
    invitation_token := encode(gen_random_bytes(32), 'hex');
    
    INSERT INTO workspace_invitations (workspace_id, email, role, token, invited_by, expires_at)
    VALUES (p_workspace_id, p_email, p_role, invitation_token, p_invited_by, CURRENT_TIMESTAMP + INTERVAL '7 days')
    RETURNING id INTO invitation_id;
    
    RETURN invitation_id;
END;
$$ LANGUAGE plpgsql;

-- Function to accept workspace invitation
CREATE OR REPLACE FUNCTION accept_workspace_invitation(
    p_token VARCHAR(255),
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    invitation_record RECORD;
BEGIN
    -- Get invitation details
    SELECT * INTO invitation_record
    FROM workspace_invitations
    WHERE token = p_token 
      AND status = 'pending' 
      AND expires_at > CURRENT_TIMESTAMP;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Add user to workspace
    INSERT INTO workspace_memberships (workspace_id, user_id, role)
    VALUES (invitation_record.workspace_id, p_user_id, invitation_record.role)
    ON CONFLICT (workspace_id, user_id) DO UPDATE SET
        role = invitation_record.role,
        is_active = TRUE,
        updated_at = CURRENT_TIMESTAMP;
    
    -- Update invitation status
    UPDATE workspace_invitations
    SET status = 'accepted', accepted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = invitation_record.id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. CREATE TRIGGERS (IF NOT EXISTS)
-- =====================================================

-- Create triggers for updated_at columns
DO $$ 
BEGIN
    -- Clients table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_clients_updated_at') THEN
        CREATE TRIGGER update_clients_updated_at
            BEFORE UPDATE ON clients
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Users table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Calls table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_calls_updated_at') THEN
        CREATE TRIGGER update_calls_updated_at
            BEFORE UPDATE ON calls
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Workspaces table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_workspaces_updated_at') THEN
        CREATE TRIGGER update_workspaces_updated_at
            BEFORE UPDATE ON workspaces
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Workspace memberships table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_workspace_memberships_updated_at') THEN
        CREATE TRIGGER update_workspace_memberships_updated_at
            BEFORE UPDATE ON workspace_memberships
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Workspace invitations table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_workspace_invitations_updated_at') THEN
        CREATE TRIGGER update_workspace_invitations_updated_at
            BEFORE UPDATE ON workspace_invitations
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Meta tokens table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_meta_tokens_updated_at') THEN
        CREATE TRIGGER update_meta_tokens_updated_at
            BEFORE UPDATE ON meta_tokens
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =====================================================
-- 7. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE loss_reasons ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. CREATE RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

DROP POLICY IF EXISTS "Users can view their client data" ON clients;
DROP POLICY IF EXISTS "Users can update their client data" ON clients;
DROP POLICY IF EXISTS "Admins can view all clients" ON clients;
DROP POLICY IF EXISTS "Admins can update all clients" ON clients;

DROP POLICY IF EXISTS "Users can view their calls" ON calls;
DROP POLICY IF EXISTS "Users can create calls" ON calls;
DROP POLICY IF EXISTS "Users can update their calls" ON calls;
DROP POLICY IF EXISTS "Admins can view all calls" ON calls;
DROP POLICY IF EXISTS "Admins can create calls" ON calls;
DROP POLICY IF EXISTS "Admins can update all calls" ON calls;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.clerk_user_id = auth.uid()::text 
            AND u.role IN ('ADMIN', 'admin', 'ceo')
        )
    );

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.clerk_user_id = auth.uid()::text 
            AND u.role IN ('ADMIN', 'admin', 'ceo')
        )
    );

-- Create RLS policies for clients table
CREATE POLICY "Users can view their client data" ON clients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.client_id = clients.id 
            AND u.clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update their client data" ON clients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.client_id = clients.id 
            AND u.clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Admins can view all clients" ON clients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.clerk_user_id = auth.uid()::text 
            AND u.role IN ('ADMIN', 'admin', 'ceo')
        )
    );

CREATE POLICY "Admins can update all clients" ON clients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.clerk_user_id = auth.uid()::text 
            AND u.role IN ('ADMIN', 'admin', 'ceo')
        )
    );

-- Create RLS policies for calls table
CREATE POLICY "Users can view their calls" ON calls
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = calls.user_id 
            AND u.clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can create calls" ON calls
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = calls.user_id 
            AND u.clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Users can update their calls" ON calls
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = calls.user_id 
            AND u.clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Admins can view all calls" ON calls
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.clerk_user_id = auth.uid()::text 
            AND u.role IN ('ADMIN', 'admin', 'ceo')
        )
    );

CREATE POLICY "Admins can create calls" ON calls
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.clerk_user_id = auth.uid()::text 
            AND u.role IN ('ADMIN', 'admin', 'ceo')
        )
    );

CREATE POLICY "Admins can update all calls" ON calls
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.clerk_user_id = auth.uid()::text 
            AND u.role IN ('ADMIN', 'admin', 'ceo')
        )
    );

-- Create RLS policies for workspaces
CREATE POLICY "Workspace members can view workspace" ON workspaces
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE wm.workspace_id = workspaces.id
            AND u.clerk_user_id = auth.uid()::text
            AND wm.is_active = true
        )
    );

CREATE POLICY "Workspace owners can update workspace" ON workspaces
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE wm.workspace_id = workspaces.id
            AND u.clerk_user_id = auth.uid()::text
            AND wm.role = 'owner'
            AND wm.is_active = true
        )
    );

-- Create RLS policies for workspace memberships
CREATE POLICY "Workspace members can view memberships" ON workspace_memberships
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE wm.workspace_id = workspace_memberships.workspace_id
            AND u.clerk_user_id = auth.uid()::text
            AND wm.is_active = true
        )
    );

-- Create RLS policies for workspace invitations
CREATE POLICY "Workspace members can view invitations" ON workspace_invitations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE wm.workspace_id = workspace_invitations.workspace_id
            AND u.clerk_user_id = auth.uid()::text
            AND wm.is_active = true
        )
    );

-- Create RLS policies for audit logs
CREATE POLICY "Users can view their own audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = audit_logs.user_id 
            AND u.clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Admins can view all audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.clerk_user_id = auth.uid()::text 
            AND u.role IN ('ADMIN', 'admin', 'ceo')
        )
    );

-- Create RLS policies for meta tokens
CREATE POLICY "Users can view their client tokens" ON meta_tokens
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.client_id = meta_tokens.client_id 
            AND u.clerk_user_id = auth.uid()::text
        )
    );

CREATE POLICY "Admins can view all tokens" ON meta_tokens
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.clerk_user_id = auth.uid()::text 
            AND u.role IN ('ADMIN', 'admin', 'ceo')
        )
    );

-- Create RLS policies for loss reasons
CREATE POLICY "All authenticated users can view loss reasons" ON loss_reasons
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage loss reasons" ON loss_reasons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.clerk_user_id = auth.uid()::text 
            AND u.role IN ('ADMIN', 'admin', 'ceo')
        )
    );

-- =====================================================
-- 9. CREATE DEFAULT DATA (IF NEEDED)
-- =====================================================

-- Insert default loss reasons if they don't exist
INSERT INTO loss_reasons (name, description) VALUES
    ('Not Interested', 'Prospect expressed no interest in the service'),
    ('Price Too High', 'Prospect found the pricing too expensive'),
    ('Timing Not Right', 'Prospect is not ready to make a decision at this time'),
    ('Competitor Chosen', 'Prospect chose a competitor'),
    ('No Budget', 'Prospect does not have budget allocated'),
    ('Wrong Contact', 'Contacted person is not the decision maker'),
    ('No Answer', 'Could not reach the prospect'),
    ('Busy', 'Prospect was too busy to talk'),
    ('Callback Requested', 'Prospect requested a callback at a later time')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 10. FINAL COMMENTS
-- =====================================================

-- This migration script is safe to run on existing databases
-- It will:
-- 1. Create missing tables without dropping existing ones
-- 2. Add missing columns to existing tables
-- 3. Create indexes for performance
-- 4. Create or replace views and functions
-- 5. Set up RLS policies for security
-- 6. Add default data where needed
-- 
-- Your existing data will be preserved and the database will be
-- enhanced with the new multi-tenant workspace functionality.
