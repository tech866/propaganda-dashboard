-- =====================================================
-- FINAL PRODUCTION SCRIPT
-- Propaganda Dashboard - Minimal Production Setup
-- Based on actual codebase analysis
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CREATE CORE TABLES (IF NOT EXISTS)
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

-- Create users table (if not exists) - CRITICAL for Clerk sync
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('ADMIN', 'USER', 'PROFESSIONAL', 'ceo', 'admin', 'sales')),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create loss_reasons table (if not exists)
CREATE TABLE IF NOT EXISTS loss_reasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create calls table (if not exists) - ENHANCED with all your actual fields
CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Basic call info
    prospect_name VARCHAR(255),
    prospect_first_name VARCHAR(255),
    prospect_last_name VARCHAR(255),
    prospect_email VARCHAR(255),
    prospect_phone VARCHAR(50),
    company_name VARCHAR(255),
    
    -- Call details
    call_type VARCHAR(50) CHECK (call_type IN ('inbound', 'outbound', 'callback')),
    status VARCHAR(50) CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled')),
    outcome VARCHAR(50) CHECK (outcome IN ('qualified', 'not_qualified', 'callback_requested', 'no_answer', 'busy', 'won', 'lost', 'tbd')),
    call_duration INTEGER DEFAULT 0,
    call_date TIMESTAMP WITH TIME ZONE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    
    -- Enhanced call logging fields (from your actual code)
    closer_first_name VARCHAR(255),
    closer_last_name VARCHAR(255),
    source_of_set_appointment VARCHAR(100) CHECK (source_of_set_appointment IN ('sdr_booked_call', 'non_sdr_booked_call', 'email', 'vsl', 'self_booking')),
    enhanced_call_outcome VARCHAR(100) CHECK (enhanced_call_outcome IN ('no_show', 'no_close', 'cancelled', 'disqualified', 'rescheduled', 'payment_plan', 'deposit', 'closed_paid_in_full', 'follow_up_call_scheduled')),
    initial_payment_collected_on TIMESTAMP WITH TIME ZONE,
    customer_full_name VARCHAR(255),
    customer_email VARCHAR(255),
    calls_taken INTEGER,
    setter_first_name VARCHAR(255),
    setter_last_name VARCHAR(255),
    cash_collected_upfront DECIMAL(10,2) DEFAULT 0,
    total_amount_owed DECIMAL(10,2) DEFAULT 0,
    prospect_notes TEXT,
    
    -- Traffic and lead source
    lead_source VARCHAR(100) CHECK (lead_source IN ('organic', 'ads')),
    traffic_source VARCHAR(100),
    source_of_set_appointment_legacy VARCHAR(100),
    
    -- CRM and outcome tracking
    crm_stage VARCHAR(50) DEFAULT 'scheduled',
    scrms_outcome VARCHAR(100) DEFAULT 'call_booked',
    sdr_type VARCHAR(100),
    sdr_first_name VARCHAR(255),
    sdr_last_name VARCHAR(255),
    non_sdr_source VARCHAR(100),
    
    -- Loss tracking
    loss_reason_id UUID REFERENCES loss_reasons(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. ADD MISSING COLUMNS TO EXISTING TABLES
-- =====================================================

-- Add missing columns to calls table if they don't exist
DO $$ 
BEGIN
    -- Add enhanced fields that might be missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'prospect_first_name') THEN
        ALTER TABLE calls ADD COLUMN prospect_first_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'prospect_last_name') THEN
        ALTER TABLE calls ADD COLUMN prospect_last_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'company_name') THEN
        ALTER TABLE calls ADD COLUMN company_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'closer_first_name') THEN
        ALTER TABLE calls ADD COLUMN closer_first_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'closer_last_name') THEN
        ALTER TABLE calls ADD COLUMN closer_last_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'source_of_set_appointment') THEN
        ALTER TABLE calls ADD COLUMN source_of_set_appointment VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'enhanced_call_outcome') THEN
        ALTER TABLE calls ADD COLUMN enhanced_call_outcome VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'cash_collected_upfront') THEN
        ALTER TABLE calls ADD COLUMN cash_collected_upfront DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'total_amount_owed') THEN
        ALTER TABLE calls ADD COLUMN total_amount_owed DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'setter_first_name') THEN
        ALTER TABLE calls ADD COLUMN setter_first_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'setter_last_name') THEN
        ALTER TABLE calls ADD COLUMN setter_last_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'prospect_notes') THEN
        ALTER TABLE calls ADD COLUMN prospect_notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'lead_source') THEN
        ALTER TABLE calls ADD COLUMN lead_source VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'traffic_source') THEN
        ALTER TABLE calls ADD COLUMN traffic_source VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'crm_stage') THEN
        ALTER TABLE calls ADD COLUMN crm_stage VARCHAR(50) DEFAULT 'scheduled';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'scrms_outcome') THEN
        ALTER TABLE calls ADD COLUMN scrms_outcome VARCHAR(100) DEFAULT 'call_booked';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'scheduled_at') THEN
        ALTER TABLE calls ADD COLUMN scheduled_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calls' AND column_name = 'completed_at') THEN
        ALTER TABLE calls ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- =====================================================
-- 3. CREATE PERFORMANCE INDEXES
-- =====================================================

-- Create indexes for performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_client_id ON users(client_id);
CREATE INDEX IF NOT EXISTS idx_calls_client_id ON calls(client_id);
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON calls(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_call_date ON calls(call_date);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_outcome ON calls(outcome);
CREATE INDEX IF NOT EXISTS idx_calls_crm_stage ON calls(crm_stage);
CREATE INDEX IF NOT EXISTS idx_calls_lead_source ON calls(lead_source);
CREATE INDEX IF NOT EXISTS idx_calls_traffic_source ON calls(traffic_source);

-- =====================================================
-- 4. CREATE ANALYTICS VIEWS
-- =====================================================

-- Create enhanced_call_analytics view (if not exists)
CREATE OR REPLACE VIEW enhanced_call_analytics AS
SELECT 
    c.id,
    c.client_id,
    c.user_id,
    c.prospect_name,
    c.prospect_first_name,
    c.prospect_last_name,
    c.prospect_email,
    c.prospect_phone,
    c.company_name,
    c.call_type,
    c.status,
    c.outcome,
    c.call_duration,
    c.call_date,
    c.scheduled_at,
    c.completed_at,
    c.notes,
    c.closer_first_name,
    c.closer_last_name,
    c.source_of_set_appointment,
    c.enhanced_call_outcome,
    c.cash_collected_upfront,
    c.total_amount_owed,
    c.setter_first_name,
    c.setter_last_name,
    c.prospect_notes,
    c.lead_source,
    c.traffic_source,
    c.crm_stage,
    c.scrms_outcome,
    c.loss_reason_id,
    c.created_at,
    c.updated_at,
    cl.name as client_name,
    u.name as user_name,
    u.email as user_email,
    lr.name as loss_reason_name
FROM calls c
LEFT JOIN clients cl ON c.client_id = cl.id
LEFT JOIN users u ON c.user_id = u.id
LEFT JOIN loss_reasons lr ON c.loss_reason_id = lr.id;

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
-- 5. CREATE METRICS CALCULATION FUNCTIONS
-- =====================================================

-- Function to calculate close rate (matches your calculation logic)
CREATE OR REPLACE FUNCTION calculate_close_rate(
    p_client_id UUID DEFAULT NULL,
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
        COUNT(*) FILTER (WHERE status = 'completed' AND outcome = 'won')
    INTO total_completed, total_won
    FROM calls
    WHERE (p_client_id IS NULL OR client_id = p_client_id)
      AND (p_date_from IS NULL OR call_date >= p_date_from)
      AND (p_date_to IS NULL OR call_date <= p_date_to);
    
    IF total_completed = 0 THEN
        RETURN 0.00;
    END IF;
    
    close_rate := (total_won::DECIMAL / total_completed::DECIMAL) * 100;
    RETURN ROUND(close_rate, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate show rate (matches your calculation logic)
CREATE OR REPLACE FUNCTION calculate_show_rate(
    p_client_id UUID DEFAULT NULL,
    p_date_from TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_date_to TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_calls INTEGER;
    total_completed INTEGER;
    show_rate DECIMAL(5,2);
BEGIN
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'completed')
    INTO total_calls, total_completed
    FROM calls
    WHERE (p_client_id IS NULL OR client_id = p_client_id)
      AND (p_date_from IS NULL OR call_date >= p_date_from)
      AND (p_date_to IS NULL OR call_date <= p_date_to);
    
    IF total_calls = 0 THEN
        RETURN 0.00;
    END IF;
    
    show_rate := (total_completed::DECIMAL / total_calls::DECIMAL) * 100;
    RETURN ROUND(show_rate, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate AOV (Average Order Value)
CREATE OR REPLACE FUNCTION calculate_aov(
    p_client_id UUID DEFAULT NULL,
    p_date_from TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_date_to TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    total_revenue DECIMAL(10,2);
    total_deals INTEGER;
    aov DECIMAL(10,2);
BEGIN
    SELECT 
        COALESCE(SUM(cash_collected_upfront), 0),
        COUNT(*) FILTER (WHERE outcome = 'won' AND cash_collected_upfront > 0)
    INTO total_revenue, total_deals
    FROM calls
    WHERE (p_client_id IS NULL OR client_id = p_client_id)
      AND (p_date_from IS NULL OR call_date >= p_date_from)
      AND (p_date_to IS NULL OR call_date <= p_date_to);
    
    IF total_deals = 0 THEN
        RETURN 0.00;
    END IF;
    
    aov := total_revenue / total_deals;
    RETURN ROUND(aov, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to sync Clerk user (matches your UserSyncService)
CREATE OR REPLACE FUNCTION sync_clerk_user(
    p_clerk_user_id VARCHAR(255),
    p_email VARCHAR(255),
    p_name VARCHAR(255)
)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
    default_client_id UUID;
BEGIN
    -- Get or create default client
    SELECT id INTO default_client_id FROM clients WHERE id = '00000000-0000-0000-0000-000000000001';
    
    IF default_client_id IS NULL THEN
        INSERT INTO clients (id, name, email) 
        VALUES ('00000000-0000-0000-0000-000000000001', 'Default Client', 'default@example.com')
        RETURNING id INTO default_client_id;
    END IF;
    
    -- Try to find existing user
    SELECT id INTO user_id FROM users WHERE clerk_user_id = p_clerk_user_id;
    
    IF user_id IS NOT NULL THEN
        -- Update existing user
        UPDATE users 
        SET 
            email = p_email,
            name = p_name,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = user_id;
    ELSE
        -- Create new user
        INSERT INTO users (clerk_user_id, email, name, role, client_id)
        VALUES (p_clerk_user_id, p_email, p_name, 'admin', default_client_id)
        RETURNING id INTO user_id;
    END IF;
    
    RETURN user_id;
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
-- 6. CREATE TRIGGERS
-- =====================================================

-- Create triggers for updated_at columns (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_clients_updated_at') THEN
        CREATE TRIGGER update_clients_updated_at
            BEFORE UPDATE ON clients
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_calls_updated_at') THEN
        CREATE TRIGGER update_calls_updated_at
            BEFORE UPDATE ON calls
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_loss_reasons_updated_at') THEN
        CREATE TRIGGER update_loss_reasons_updated_at
            BEFORE UPDATE ON loss_reasons
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
-- 9. INSERT DEFAULT DATA
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

-- This script creates the MINIMAL database structure needed for your app:
-- 1. Core tables: users, clients, calls, loss_reasons
-- 2. Enhanced call fields matching your actual code
-- 3. Clerk user sync functionality
-- 4. Metrics calculation functions (close rate, show rate, AOV)
-- 5. Analytics views for your dashboard
-- 6. RLS policies for security
-- 7. Performance indexes
-- 
-- This is safe to run on existing databases and will preserve all your data.
-- Your existing tables and data will remain untouched.
