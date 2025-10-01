-- =====================================================
-- Create Calls Table for Enhanced Call Logging
-- This script creates the calls table with all required fields
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CREATE CALLS TABLE
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
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_calls_client_id ON calls(client_id);
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON calls(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_outcome ON calls(outcome);

-- Enhanced field indexes
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

-- =====================================================
-- 3. CREATE ANALYTICS VIEW FOR ENHANCED METRICS
-- =====================================================

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

-- =====================================================
-- 4. CREATE HELPER FUNCTIONS FOR METRICS CALCULATIONS
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

-- =====================================================
-- 5. ADD COMMENTS ON COLUMNS
-- =====================================================

COMMENT ON TABLE calls IS 'Enhanced call logging table with comprehensive tracking fields';
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

-- =====================================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view calls for their client" ON calls
    FOR SELECT USING (
        client_id IN (
            SELECT id FROM clients WHERE id = client_id
        )
    );

CREATE POLICY "Users can insert calls for their client" ON calls
    FOR INSERT WITH CHECK (
        client_id IN (
            SELECT id FROM clients WHERE id = client_id
        )
    );

CREATE POLICY "Users can update calls for their client" ON calls
    FOR UPDATE USING (
        client_id IN (
            SELECT id FROM clients WHERE id = client_id
        )
    );

CREATE POLICY "Users can delete calls for their client" ON calls
    FOR DELETE USING (
        client_id IN (
            SELECT id FROM clients WHERE id = client_id
        )
    );

-- =====================================================
-- 7. CREATE TRIGGER FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_calls_updated_at 
    BEFORE UPDATE ON calls 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'Calls table created successfully with enhanced call logging fields!' as status,
       'All required fields for comprehensive call logging have been added' as message;
