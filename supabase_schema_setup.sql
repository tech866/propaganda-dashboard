-- =====================================================
-- Supabase Database Schema Setup
-- Propaganda Dashboard - Complete Schema Migration
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CREATE CLIENTS TABLE
-- =====================================================

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

-- =====================================================
-- 2. CREATE USERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
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

-- =====================================================
-- 3. CREATE LOSS REASONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS loss_reasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. CREATE CALLS TABLE (Enhanced Call Logging)
-- =====================================================

CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic call information
    prospect_name VARCHAR(255) NOT NULL,
    prospect_email VARCHAR(255),
    prospect_phone VARCHAR(50),
    call_type VARCHAR(20) NOT NULL CHECK (call_type IN ('inbound', 'outbound')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('completed', 'no-show', 'rescheduled')),
    outcome VARCHAR(20) DEFAULT 'tbd' CHECK (outcome IN ('won', 'lost', 'tbd')),
    loss_reason_id UUID REFERENCES loss_reasons(id) ON DELETE SET NULL,
    notes TEXT,
    call_duration INTEGER, -- in minutes
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Enhanced call logging form fields
    closer_first_name VARCHAR(255),
    closer_last_name VARCHAR(255),
    source_of_set_appointment VARCHAR(50) CHECK (source_of_set_appointment IN ('sdr_booked_call', 'non_sdr_booked_call', 'email', 'vsl', 'self_booking')),
    enhanced_call_outcome VARCHAR(50) CHECK (enhanced_call_outcome IN (
        'no_show', 'no_close', 'cancelled', 'disqualified', 'rescheduled', 
        'payment_plan', 'deposit', 'closed_paid_in_full', 'follow_up_call_scheduled'
    )),
    initial_payment_collected_on DATE,
    customer_full_name VARCHAR(255),
    customer_email VARCHAR(255),
    calls_taken INTEGER DEFAULT 1,
    setter_first_name VARCHAR(255),
    setter_last_name VARCHAR(255),
    cash_collected_upfront DECIMAL(10,2) DEFAULT 0,
    total_amount_owed DECIMAL(10,2) DEFAULT 0,
    prospect_notes TEXT,
    lead_source VARCHAR(20) CHECK (lead_source IN ('organic', 'ads')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. CREATE AUDIT LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. CREATE META TOKENS TABLE (for Meta API integration)
-- =====================================================

CREATE TABLE IF NOT EXISTS meta_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type VARCHAR(50) DEFAULT 'bearer',
    expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Clients table indexes
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_is_active ON clients(is_active);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_client_id ON users(client_id);
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Loss reasons table indexes
CREATE INDEX IF NOT EXISTS idx_loss_reasons_name ON loss_reasons(name);
CREATE INDEX IF NOT EXISTS idx_loss_reasons_is_active ON loss_reasons(is_active);

-- Calls table indexes
CREATE INDEX IF NOT EXISTS idx_calls_client_id ON calls(client_id);
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON calls(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_outcome ON calls(outcome);
CREATE INDEX IF NOT EXISTS idx_calls_closer_name ON calls(closer_first_name, closer_last_name);
CREATE INDEX IF NOT EXISTS idx_calls_source_of_set_appointment ON calls(source_of_set_appointment);
CREATE INDEX IF NOT EXISTS idx_calls_enhanced_outcome ON calls(enhanced_call_outcome);
CREATE INDEX IF NOT EXISTS idx_calls_initial_payment_date ON calls(initial_payment_collected_on);
CREATE INDEX IF NOT EXISTS idx_calls_customer_email ON calls(customer_email);
CREATE INDEX IF NOT EXISTS idx_calls_setter_name ON calls(setter_first_name, setter_last_name);
CREATE INDEX IF NOT EXISTS idx_calls_cash_collected ON calls(cash_collected_upfront);
CREATE INDEX IF NOT EXISTS idx_calls_total_owed ON calls(total_amount_owed);
CREATE INDEX IF NOT EXISTS idx_calls_lead_source ON calls(lead_source);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_calls_client_user_date ON calls(client_id, user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_calls_status_outcome ON calls(status, outcome);
CREATE INDEX IF NOT EXISTS idx_calls_enhanced_outcome_lead_source ON calls(enhanced_call_outcome, lead_source);

-- Audit logs table indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Meta tokens table indexes
CREATE INDEX IF NOT EXISTS idx_meta_tokens_client_id ON meta_tokens(client_id);
CREATE INDEX IF NOT EXISTS idx_meta_tokens_user_id ON meta_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_meta_tokens_is_active ON meta_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_meta_tokens_expires_at ON meta_tokens(expires_at);

-- =====================================================
-- 8. CREATE ANALYTICS VIEWS
-- =====================================================

-- Enhanced call analytics view
CREATE OR REPLACE VIEW enhanced_call_analytics AS
SELECT 
    c.client_id,
    c.user_id,
    DATE_TRUNC('month', c.created_at) as month,
    COUNT(*) as total_calls,
    COUNT(CASE WHEN c.status = 'completed' THEN 1 END) as total_shows,
    COUNT(CASE WHEN c.enhanced_call_outcome = 'closed_paid_in_full' OR c.enhanced_call_outcome = 'deposit' THEN 1 END) as total_closes,
    COUNT(CASE WHEN c.lead_source = 'ads' THEN 1 END) as ads_calls,
    COUNT(CASE WHEN c.lead_source = 'organic' THEN 1 END) as organic_calls,
    COUNT(CASE WHEN c.source_of_set_appointment = 'sdr_booked_call' THEN 1 END) as sdr_booked_calls,
    COUNT(CASE WHEN c.source_of_set_appointment = 'non_sdr_booked_call' THEN 1 END) as non_sdr_booked_calls,
    SUM(COALESCE(c.cash_collected_upfront, 0)) as total_cash_collected,
    SUM(COALESCE(c.total_amount_owed, 0)) as total_revenue,
    AVG(COALESCE(c.total_amount_owed, 0)) as average_order_value,
    ROUND(
        CASE 
            WHEN COUNT(*) > 0 THEN COUNT(CASE WHEN c.status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL * 100
            ELSE 0 
        END, 2
    ) as show_rate_percentage,
    ROUND(
        CASE 
            WHEN COUNT(CASE WHEN c.status = 'completed' THEN 1 END) > 0 THEN 
                COUNT(CASE WHEN c.enhanced_call_outcome = 'closed_paid_in_full' OR c.enhanced_call_outcome = 'deposit' THEN 1 END)::DECIMAL / 
                COUNT(CASE WHEN c.status = 'completed' THEN 1 END)::DECIMAL * 100
            ELSE 0 
        END, 2
    ) as close_rate_percentage,
    ROUND(
        CASE 
            WHEN COUNT(CASE WHEN c.lead_source = 'ads' THEN 1 END) > 0 THEN 
                SUM(COALESCE(c.total_amount_owed, 0))::DECIMAL / COUNT(CASE WHEN c.lead_source = 'ads' THEN 1 END)::DECIMAL
            ELSE 0 
        END, 2
    ) as roas_per_call
FROM calls c
GROUP BY c.client_id, c.user_id, DATE_TRUNC('month', c.created_at);

-- Users with Clerk data view
CREATE OR REPLACE VIEW users_with_clerk AS
SELECT 
    u.id,
    u.client_id,
    u.clerk_user_id,
    u.email,
    u.name,
    u.role,
    u.is_active,
    u.last_login,
    u.clerk_metadata,
    u.last_sync_at,
    u.created_at,
    u.updated_at,
    c.name as client_name
FROM users u
LEFT JOIN clients c ON u.client_id = c.id;

-- =====================================================
-- 9. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to calculate close rate for a given period
CREATE OR REPLACE FUNCTION calculate_close_rate(
    p_client_id UUID,
    p_date_from DATE DEFAULT NULL,
    p_date_to DATE DEFAULT NULL
) RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_shows INTEGER;
    total_closes INTEGER;
    close_rate DECIMAL(5,2);
BEGIN
    SELECT 
        COUNT(CASE WHEN status = 'completed' THEN 1 END),
        COUNT(CASE WHEN enhanced_call_outcome = 'closed_paid_in_full' OR enhanced_call_outcome = 'deposit' THEN 1 END)
    INTO total_shows, total_closes
    FROM calls 
    WHERE client_id = p_client_id
    AND (p_date_from IS NULL OR created_at >= p_date_from)
    AND (p_date_to IS NULL OR created_at <= p_date_to);
    
    IF total_shows > 0 THEN
        close_rate := (total_closes::DECIMAL / total_shows::DECIMAL) * 100;
    ELSE
        close_rate := 0;
    END IF;
    
    RETURN ROUND(close_rate, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate show rate for a given period
CREATE OR REPLACE FUNCTION calculate_show_rate(
    p_client_id UUID,
    p_date_from DATE DEFAULT NULL,
    p_date_to DATE DEFAULT NULL
) RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_calls INTEGER;
    total_shows INTEGER;
    show_rate DECIMAL(5,2);
BEGIN
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN status = 'completed' THEN 1 END)
    INTO total_calls, total_shows
    FROM calls 
    WHERE client_id = p_client_id
    AND (p_date_from IS NULL OR created_at >= p_date_from)
    AND (p_date_to IS NULL OR created_at <= p_date_to);
    
    IF total_calls > 0 THEN
        show_rate := (total_shows::DECIMAL / total_calls::DECIMAL) * 100;
    ELSE
        show_rate := 0;
    END IF;
    
    RETURN ROUND(show_rate, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate Average Order Value (AOV)
CREATE OR REPLACE FUNCTION calculate_aov(
    p_client_id UUID,
    p_date_from DATE DEFAULT NULL,
    p_date_to DATE DEFAULT NULL
) RETURNS DECIMAL(10,2) AS $$
DECLARE
    total_revenue DECIMAL(10,2);
    total_closes INTEGER;
    aov DECIMAL(10,2);
BEGIN
    SELECT 
        SUM(COALESCE(total_amount_owed, 0)),
        COUNT(CASE WHEN enhanced_call_outcome = 'closed_paid_in_full' OR enhanced_call_outcome = 'deposit' THEN 1 END)
    INTO total_revenue, total_closes
    FROM calls 
    WHERE client_id = p_client_id
    AND (p_date_from IS NULL OR created_at >= p_date_from)
    AND (p_date_to IS NULL OR created_at <= p_date_to);
    
    IF total_closes > 0 THEN
        aov := total_revenue / total_closes;
    ELSE
        aov := 0;
    END IF;
    
    RETURN ROUND(aov, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to sync Clerk user data
CREATE OR REPLACE FUNCTION sync_clerk_user(
    p_clerk_user_id VARCHAR(255),
    p_email VARCHAR(255),
    p_name VARCHAR(255),
    p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    user_id UUID;
    client_id UUID;
BEGIN
    -- Find or create a default client for Clerk users
    SELECT id INTO client_id FROM clients WHERE name = 'Default Agency' LIMIT 1;
    
    IF client_id IS NULL THEN
        INSERT INTO clients (name, email) 
        VALUES ('Default Agency', 'admin@default-agency.com')
        RETURNING id INTO client_id;
    END IF;
    
    -- Check if user already exists by Clerk ID
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
        -- Create new user
        INSERT INTO users (
            client_id,
            clerk_user_id,
            email,
            name,
            password_hash,
            role,
            clerk_metadata,
            last_sync_at
        ) VALUES (
            client_id,
            p_clerk_user_id,
            p_email,
            p_name,
            '',
            COALESCE((p_metadata->>'role')::VARCHAR, 'USER'),
            p_metadata,
            CURRENT_TIMESTAMP
        ) RETURNING id INTO user_id;
    END IF;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 10. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loss_reasons_updated_at 
    BEFORE UPDATE ON loss_reasons 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calls_updated_at 
    BEFORE UPDATE ON calls 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meta_tokens_updated_at 
    BEFORE UPDATE ON meta_tokens 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE loss_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clients
CREATE POLICY "Users can view their own client" ON clients
    FOR SELECT USING (
        id IN (
            SELECT client_id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Admins can manage all clients" ON clients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_user_id = auth.jwt() ->> 'sub' 
            AND role IN ('ADMIN', 'admin', 'ceo')
        )
    );

-- Create RLS policies for users
CREATE POLICY "Users can view users in their client" ON users
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (
        clerk_user_id = auth.jwt() ->> 'sub'
    );

CREATE POLICY "Admins can manage all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_user_id = auth.jwt() ->> 'sub' 
            AND role IN ('ADMIN', 'admin', 'ceo')
        )
    );

-- Create RLS policies for calls
CREATE POLICY "Users can view calls for their client" ON calls
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can insert calls for their client" ON calls
    FOR INSERT WITH CHECK (
        client_id IN (
            SELECT client_id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can update calls for their client" ON calls
    FOR UPDATE USING (
        client_id IN (
            SELECT client_id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can delete calls for their client" ON calls
    FOR DELETE USING (
        client_id IN (
            SELECT client_id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

-- Create RLS policies for audit logs
CREATE POLICY "Users can view audit logs for their client" ON audit_logs
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

-- Create RLS policies for meta tokens
CREATE POLICY "Users can view meta tokens for their client" ON meta_tokens
    FOR SELECT USING (
        client_id IN (
            SELECT client_id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

CREATE POLICY "Users can manage meta tokens for their client" ON meta_tokens
    FOR ALL USING (
        client_id IN (
            SELECT client_id FROM users WHERE clerk_user_id = auth.jwt() ->> 'sub'
        )
    );

-- Create RLS policies for loss reasons (admin only)
CREATE POLICY "Admins can manage loss reasons" ON loss_reasons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE clerk_user_id = auth.jwt() ->> 'sub' 
            AND role IN ('ADMIN', 'admin', 'ceo')
        )
    );

-- =====================================================
-- 12. ADD COMMENTS ON TABLES AND COLUMNS
-- =====================================================

COMMENT ON TABLE clients IS 'Client/agency management table';
COMMENT ON TABLE users IS 'User management table with Clerk integration';
COMMENT ON TABLE loss_reasons IS 'Loss reasons for call outcomes';
COMMENT ON TABLE calls IS 'Enhanced call logging table with comprehensive tracking fields';
COMMENT ON TABLE audit_logs IS 'Audit trail for all data changes';
COMMENT ON TABLE meta_tokens IS 'Meta Marketing API access tokens';

COMMENT ON COLUMN users.clerk_user_id IS 'Clerk user ID for authentication integration';
COMMENT ON COLUMN users.clerk_metadata IS 'Additional metadata from Clerk (roles, custom fields, etc.)';
COMMENT ON COLUMN users.last_sync_at IS 'Last time user data was synced with Clerk';

COMMENT ON COLUMN calls.closer_first_name IS 'First name of the closer (logged-in user)';
COMMENT ON COLUMN calls.closer_last_name IS 'Last name of the closer (logged-in user)';
COMMENT ON COLUMN calls.source_of_set_appointment IS 'Source of the set appointment: sdr_booked_call, non_sdr_booked_call, email, vsl, or self_booking';
COMMENT ON COLUMN calls.enhanced_call_outcome IS 'Enhanced call outcome with specific options: no_show, no_close, cancelled, disqualified, rescheduled, payment_plan, deposit, closed_paid_in_full, follow_up_call_scheduled';
COMMENT ON COLUMN calls.initial_payment_collected_on IS 'Date when the initial payment was collected';
COMMENT ON COLUMN calls.customer_full_name IS 'Full name of the customer/prospect';
COMMENT ON COLUMN calls.customer_email IS 'Email address of the customer/prospect';
COMMENT ON COLUMN calls.calls_taken IS 'Number of calls taken for this prospect';
COMMENT ON COLUMN calls.setter_first_name IS 'First name of the setter who booked the call';
COMMENT ON COLUMN calls.setter_last_name IS 'Last name of the setter who booked the call';
COMMENT ON COLUMN calls.cash_collected_upfront IS 'Amount of cash collected upfront';
COMMENT ON COLUMN calls.total_amount_owed IS 'Total amount the customer owes';
COMMENT ON COLUMN calls.prospect_notes IS 'Additional notes about the prospect';
COMMENT ON COLUMN calls.lead_source IS 'Source of the lead: organic or ads';

COMMENT ON VIEW enhanced_call_analytics IS 'Enhanced analytics view with comprehensive metrics including show rate, close rate, AOV, and ROAS calculations';
COMMENT ON VIEW users_with_clerk IS 'Users with Clerk integration data and client information';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'Supabase database schema created successfully!' as status,
       'All tables, indexes, views, functions, triggers, and RLS policies have been set up' as message;
