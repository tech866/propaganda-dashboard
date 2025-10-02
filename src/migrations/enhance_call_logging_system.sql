-- =====================================================
-- Enhanced Call Logging System Migration
-- Adds comprehensive call tracking and analytics capabilities
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ENHANCED CALLS TABLE
-- =====================================================

-- First, let's add new columns to the existing calls table
ALTER TABLE calls ADD COLUMN IF NOT EXISTS closer_first_name VARCHAR(255);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS closer_last_name VARCHAR(255);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS source VARCHAR(50) CHECK (source IN ('sdr_call', 'non_sdr_booked'));
ALTER TABLE calls ADD COLUMN IF NOT EXISTS traffic_source VARCHAR(50) CHECK (traffic_source IN ('organic', 'paid_ads'));
ALTER TABLE calls ADD COLUMN IF NOT EXISTS enhanced_outcome VARCHAR(50) CHECK (enhanced_outcome IN (
    'no_show', 'no_close', 'canceled', 'disqualified', 'rescheduled', 
    'payment_plan_deposit', 'close_paid_in_full', 'follow_call_scheduled'
));
ALTER TABLE calls ADD COLUMN IF NOT EXISTS offer_pitched TEXT;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS setter_first_name VARCHAR(255);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS setter_last_name VARCHAR(255);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS cash_collected_upfront DECIMAL(10,2) DEFAULT 0;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS total_amount_owed DECIMAL(10,2) DEFAULT 0;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS payment_installments INTEGER DEFAULT 1;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS payment_completion_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_completion_status IN ('pending', 'in_progress', 'completed'));
ALTER TABLE calls ADD COLUMN IF NOT EXISTS crm_updated BOOLEAN DEFAULT false;
ALTER TABLE calls ADD COLUMN IF NOT EXISTS prospect_notes TEXT;

-- =====================================================
-- 2. PAYMENT SCHEDULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    amount_due DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(call_id, installment_number)
);

-- =====================================================
-- 3. AD SPEND TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ad_spend (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    campaign_name VARCHAR(255),
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('meta', 'google', 'other')),
    spend_amount DECIMAL(10,2) NOT NULL,
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    clicks INTEGER,
    impressions INTEGER,
    source VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('manual', 'api')),
    meta_campaign_id VARCHAR(255), -- For Meta API integration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. OFFERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, name)
);

-- =====================================================
-- 5. SETTERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS setters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, first_name, last_name)
);

-- =====================================================
-- 6. ANALYTICS VIEWS
-- =====================================================

-- Create a comprehensive analytics view
CREATE OR REPLACE VIEW call_analytics AS
SELECT 
    c.client_id,
    c.user_id,
    DATE_TRUNC('month', c.created_at) as month,
    COUNT(*) as total_calls,
    COUNT(CASE WHEN c.status = 'completed' THEN 1 END) as total_shows,
    COUNT(CASE WHEN c.enhanced_outcome = 'close_paid_in_full' OR c.enhanced_outcome = 'payment_plan_deposit' THEN 1 END) as total_closes,
    COUNT(CASE WHEN c.traffic_source = 'paid_ads' THEN 1 END) as paid_ads_calls,
    COUNT(CASE WHEN c.traffic_source = 'organic' THEN 1 END) as organic_calls,
    SUM(c.cash_collected_upfront) as total_cash_collected,
    SUM(c.total_amount_owed) as total_revenue,
    ROUND(
        CASE 
            WHEN COUNT(*) > 0 THEN COUNT(CASE WHEN c.status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL * 100
            ELSE 0 
        END, 2
    ) as show_rate_percentage,
    ROUND(
        CASE 
            WHEN COUNT(CASE WHEN c.status = 'completed' THEN 1 END) > 0 THEN 
                COUNT(CASE WHEN c.enhanced_outcome = 'close_paid_in_full' OR c.enhanced_outcome = 'payment_plan_deposit' THEN 1 END)::DECIMAL / 
                COUNT(CASE WHEN c.status = 'completed' THEN 1 END)::DECIMAL * 100
            ELSE 0 
        END, 2
    ) as close_rate_percentage
FROM calls c
GROUP BY c.client_id, c.user_id, DATE_TRUNC('month', c.created_at);

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for calls table
CREATE INDEX IF NOT EXISTS idx_calls_client_id ON calls(client_id);
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON calls(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at);
CREATE INDEX IF NOT EXISTS idx_calls_traffic_source ON calls(traffic_source);
CREATE INDEX IF NOT EXISTS idx_calls_enhanced_outcome ON calls(enhanced_outcome);
CREATE INDEX IF NOT EXISTS idx_calls_source ON calls(source);

-- Indexes for payment_schedules table
CREATE INDEX IF NOT EXISTS idx_payment_schedules_call_id ON payment_schedules(call_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_due_date ON payment_schedules(due_date);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_status ON payment_schedules(status);

-- Indexes for ad_spend table
CREATE INDEX IF NOT EXISTS idx_ad_spend_client_id ON ad_spend(client_id);
CREATE INDEX IF NOT EXISTS idx_ad_spend_date_range ON ad_spend(date_from, date_to);
CREATE INDEX IF NOT EXISTS idx_ad_spend_platform ON ad_spend(platform);

-- Indexes for offers table
CREATE INDEX IF NOT EXISTS idx_offers_client_id ON offers(client_id);
CREATE INDEX IF NOT EXISTS idx_offers_is_active ON offers(is_active);

-- Indexes for setters table
CREATE INDEX IF NOT EXISTS idx_setters_client_id ON setters(client_id);
CREATE INDEX IF NOT EXISTS idx_setters_is_active ON setters(is_active);

-- =====================================================
-- 8. COMMENTS ON NEW COLUMNS AND TABLES
-- =====================================================

COMMENT ON COLUMN calls.closer_first_name IS 'First name of the closer (logged-in user)';
COMMENT ON COLUMN calls.closer_last_name IS 'Last name of the closer (logged-in user)';
COMMENT ON COLUMN calls.company_name IS 'Company name of the prospect';
COMMENT ON COLUMN calls.source IS 'Source of the call: sdr_call or non_sdr_booked';
COMMENT ON COLUMN calls.traffic_source IS 'Traffic source: organic or paid_ads';
COMMENT ON COLUMN calls.enhanced_outcome IS 'Enhanced call outcome with more specific options';
COMMENT ON COLUMN calls.offer_pitched IS 'Description of the offer pitched during the call';
COMMENT ON COLUMN calls.setter_first_name IS 'First name of the setter who booked the call';
COMMENT ON COLUMN calls.setter_last_name IS 'Last name of the setter who booked the call';
COMMENT ON COLUMN calls.cash_collected_upfront IS 'Amount of cash collected upfront';
COMMENT ON COLUMN calls.total_amount_owed IS 'Total amount the customer owes';
COMMENT ON COLUMN calls.payment_installments IS 'Number of payment installments';
COMMENT ON COLUMN calls.payment_completion_status IS 'Status of payment completion';
COMMENT ON COLUMN calls.crm_updated IS 'Whether the CRM has been updated with this call data';
COMMENT ON COLUMN calls.prospect_notes IS 'Additional notes about the prospect';

COMMENT ON TABLE payment_schedules IS 'Payment schedule for calls with installment plans';
COMMENT ON TABLE ad_spend IS 'Ad spend tracking for ROAS calculations';
COMMENT ON TABLE offers IS 'Available offers that can be pitched';
COMMENT ON TABLE setters IS 'Setters who book calls for closers';
COMMENT ON VIEW call_analytics IS 'Comprehensive analytics view for call performance metrics';

-- =====================================================
-- 9. SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample offers
INSERT INTO offers (client_id, name, description, price) 
SELECT 
    c.id,
    'Premium Coaching Program',
    '6-month intensive coaching program with weekly calls',
    5000.00
FROM clients c
WHERE NOT EXISTS (SELECT 1 FROM offers WHERE client_id = c.id AND name = 'Premium Coaching Program');

INSERT INTO offers (client_id, name, description, price) 
SELECT 
    c.id,
    'Basic Training Course',
    '3-month basic training course with monthly calls',
    2500.00
FROM clients c
WHERE NOT EXISTS (SELECT 1 FROM offers WHERE client_id = c.id AND name = 'Basic Training Course');

-- Insert sample setters
INSERT INTO setters (client_id, first_name, last_name, email)
SELECT 
    c.id,
    'John',
    'Smith',
    'john.smith@example.com'
FROM clients c
WHERE NOT EXISTS (SELECT 1 FROM setters WHERE client_id = c.id AND first_name = 'John' AND last_name = 'Smith');

INSERT INTO setters (client_id, first_name, last_name, email)
SELECT 
    c.id,
    'Sarah',
    'Johnson',
    'sarah.johnson@example.com'
FROM clients c
WHERE NOT EXISTS (SELECT 1 FROM setters WHERE client_id = c.id AND first_name = 'Sarah' AND last_name = 'Johnson');

