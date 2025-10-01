-- =====================================================
-- Enhanced Call Logging Form Fields Migration
-- Adds all required fields for the comprehensive call logging form
-- Based on the screenshots and requirements provided
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ADD NEW COLUMNS TO EXISTING CALLS TABLE
-- =====================================================

-- Add all required fields for the enhanced call logging form
ALTER TABLE calls ADD COLUMN IF NOT EXISTS closer_first_name VARCHAR(255);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS closer_last_name VARCHAR(255);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS source_of_set_appointment VARCHAR(50) CHECK (source_of_set_appointment IN ('sdr_booked_call', 'non_sdr_booked_call', 'email', 'vsl', 'self_booking'));
ALTER TABLE calls ADD COLUMN IF NOT EXISTS enhanced_call_outcome VARCHAR(50) CHECK (enhanced_call_outcome IN (
    'no_show', 'no_close', 'cancelled', 'disqualified', 'rescheduled', 
    'payment_plan', 'deposit', 'closed_paid_in_full', 'follow_up_call_scheduled'
));
ALTER TABLE calls ADD COLUMN IF NOT EXISTS initial_payment_collected_on DATE;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS customer_full_name VARCHAR(255);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS calls_taken INTEGER DEFAULT 1;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS setter_first_name VARCHAR(255);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS setter_last_name VARCHAR(255);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS cash_collected_upfront DECIMAL(10,2) DEFAULT 0;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS total_amount_owed DECIMAL(10,2) DEFAULT 0;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS prospect_notes TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS lead_source VARCHAR(20) CHECK (lead_source IN ('organic', 'ads'));

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for new columns
CREATE INDEX IF NOT EXISTS idx_calls_closer_name ON calls(closer_first_name, closer_last_name);
CREATE INDEX IF NOT EXISTS idx_calls_source_of_set_appointment ON calls(source_of_set_appointment);
CREATE INDEX IF NOT EXISTS idx_calls_enhanced_outcome ON calls(enhanced_call_outcome);
CREATE INDEX IF NOT EXISTS idx_calls_initial_payment_date ON calls(initial_payment_collected_on);
CREATE INDEX IF NOT EXISTS idx_calls_customer_email ON calls(customer_email);
CREATE INDEX IF NOT EXISTS idx_calls_setter_name ON calls(setter_first_name, setter_last_name);
CREATE INDEX IF NOT EXISTS idx_calls_cash_collected ON calls(cash_collected_upfront);
CREATE INDEX IF NOT EXISTS idx_calls_total_owed ON calls(total_amount_owed);
CREATE INDEX IF NOT EXISTS idx_calls_lead_source ON calls(lead_source);

-- =====================================================
-- 3. CREATE ANALYTICS VIEW FOR ENHANCED METRICS
-- =====================================================

-- Create enhanced analytics view with new metrics
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
-- 4. ADD COMMENTS ON NEW COLUMNS
-- =====================================================

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
-- 5. CREATE HELPER FUNCTIONS FOR METRICS CALCULATIONS
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
-- 6. SAMPLE DATA FOR TESTING (OPTIONAL)
-- =====================================================

-- Insert sample data to test the new fields (only if no data exists)
INSERT INTO calls (
    client_id, user_id, prospect_name, closer_first_name, closer_last_name,
    source_of_set_appointment, enhanced_call_outcome, customer_full_name,
    customer_email, setter_first_name, setter_last_name, cash_collected_upfront,
    total_amount_owed, lead_source, prospect_notes, status, call_type, outcome
) 
SELECT 
    c.id,
    u.id,
    'John Doe',
    'Jane',
    'Smith',
    'sdr_booked_call',
    'closed_paid_in_full',
    'John Doe',
    'john.doe@example.com',
    'Mike',
    'Johnson',
    2500.00,
    5000.00,
    'ads',
    'Great prospect, very interested in the premium package',
    'completed',
    'outbound',
    'won'
FROM clients c
CROSS JOIN users u
WHERE NOT EXISTS (
    SELECT 1 FROM calls WHERE closer_first_name = 'Jane' AND closer_last_name = 'Smith'
)
LIMIT 1;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'Enhanced call logging form fields added successfully!' as status,
       'All required fields for comprehensive call logging have been added to the calls table' as message;
