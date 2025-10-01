-- =====================================================
-- Enhanced Call Logging System for Supabase
-- This script adds enhanced call logging functionality to the existing schema
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ENHANCE EXISTING SALES_CALLS TABLE
-- =====================================================

-- Add new columns to the existing sales_calls table for enhanced call logging
ALTER TABLE sales_calls ADD COLUMN IF NOT EXISTS prospect_name VARCHAR(255);
ALTER TABLE sales_calls ADD COLUMN IF NOT EXISTS prospect_email VARCHAR(255);
ALTER TABLE sales_calls ADD COLUMN IF NOT EXISTS prospect_phone VARCHAR(50);
ALTER TABLE sales_calls ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE sales_calls ADD COLUMN IF NOT EXISTS closer_first_name VARCHAR(255);
ALTER TABLE sales_calls ADD COLUMN IF NOT EXISTS closer_last_name VARCHAR(255);
ALTER TABLE sales_calls ADD COLUMN IF NOT EXISTS source VARCHAR(50) CHECK (source IN ('sdr_call', 'non_sdr_booked'));
ALTER TABLE sales_calls ADD COLUMN IF NOT EXISTS traffic_source VARCHAR(50) CHECK (traffic_source IN ('organic', 'paid_ads'));
ALTER TABLE sales_calls ADD COLUMN IF NOT EXISTS enhanced_outcome VARCHAR(50) CHECK (enhanced_outcome IN (
    'no_show', 'no_close', 'canceled', 'disqualified', 'rescheduled', 
    'payment_plan_deposit', 'close_paid_in_full', 'follow_call_scheduled'
));
ALTER TABLE sales_calls ADD COLUMN IF NOT EXISTS offer_pitched TEXT;
ALTER TABLE sales_calls ADD COLUMN IF NOT EXISTS setter_first_name VARCHAR(255);
ALTER TABLE sales_calls ADD COLUMN IF NOT EXISTS setter_last_name VARCHAR(255);
ALTER TABLE sales_calls ADD COLUMN IF NOT EXISTS cash_collected_upfront DECIMAL(10,2) DEFAULT 0;
ALTER TABLE sales_calls ADD COLUMN IF NOT EXISTS total_amount_owed DECIMAL(10,2) DEFAULT 0;
ALTER TABLE sales_calls ADD COLUMN IF NOT EXISTS payment_installments INTEGER DEFAULT 1;
ALTER TABLE sales_calls ADD COLUMN IF NOT EXISTS payment_completion_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_completion_status IN ('pending', 'in_progress', 'completed'));
ALTER TABLE sales_calls ADD COLUMN IF NOT EXISTS crm_updated BOOLEAN DEFAULT false;
ALTER TABLE sales_calls ADD COLUMN IF NOT EXISTS prospect_notes TEXT;

-- =====================================================
-- 2. CREATE NEW TABLES FOR ENHANCED FUNCTIONALITY
-- =====================================================

-- Payment Schedules Table
CREATE TABLE IF NOT EXISTS payment_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sales_call_id UUID NOT NULL REFERENCES sales_calls(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    amount_due DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sales_call_id, installment_number)
);

-- Ad Spend Table (Enhanced version of financial_records for ad spend tracking)
CREATE TABLE IF NOT EXISTS ad_spend (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    campaign_name VARCHAR(255),
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('meta', 'google', 'other')),
    spend_amount DECIMAL(10,2) NOT NULL,
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    clicks INTEGER,
    impressions INTEGER,
    source VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('manual', 'api')),
    meta_campaign_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Offers Table
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agency_id, name)
);

-- Setters Table
CREATE TABLE IF NOT EXISTS setters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agency_id, first_name, last_name)
);

-- =====================================================
-- 3. CREATE ANALYTICS VIEW
-- =====================================================

-- Create a comprehensive analytics view for call performance
CREATE OR REPLACE VIEW call_analytics AS
SELECT 
    sc.agency_id,
    sc.client_id,
    DATE_TRUNC('month', sc.created_at) as month,
    COUNT(*) as total_calls,
    COUNT(CASE WHEN sc.call_outcome = 'completed' THEN 1 END) as total_shows,
    COUNT(CASE WHEN sc.enhanced_outcome = 'close_paid_in_full' OR sc.enhanced_outcome = 'payment_plan_deposit' THEN 1 END) as total_closes,
    COUNT(CASE WHEN sc.traffic_source = 'paid_ads' THEN 1 END) as paid_ads_calls,
    COUNT(CASE WHEN sc.traffic_source = 'organic' THEN 1 END) as organic_calls,
    SUM(COALESCE(sc.cash_collected_upfront, 0)) as total_cash_collected,
    SUM(COALESCE(sc.total_amount_owed, 0)) as total_revenue,
    ROUND(
        CASE 
            WHEN COUNT(*) > 0 THEN COUNT(CASE WHEN sc.call_outcome = 'completed' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL * 100
            ELSE 0 
        END, 2
    ) as show_rate_percentage,
    ROUND(
        CASE 
            WHEN COUNT(CASE WHEN sc.call_outcome = 'completed' THEN 1 END) > 0 THEN 
                COUNT(CASE WHEN sc.enhanced_outcome = 'close_paid_in_full' OR sc.enhanced_outcome = 'payment_plan_deposit' THEN 1 END)::DECIMAL / 
                COUNT(CASE WHEN sc.call_outcome = 'completed' THEN 1 END)::DECIMAL * 100
            ELSE 0 
        END, 2
    ) as close_rate_percentage
FROM sales_calls sc
GROUP BY sc.agency_id, sc.client_id, DATE_TRUNC('month', sc.created_at);

-- =====================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for enhanced sales_calls columns
CREATE INDEX IF NOT EXISTS idx_sales_calls_prospect_name ON sales_calls(prospect_name);
CREATE INDEX IF NOT EXISTS idx_sales_calls_traffic_source ON sales_calls(traffic_source);
CREATE INDEX IF NOT EXISTS idx_sales_calls_enhanced_outcome ON sales_calls(enhanced_outcome);
CREATE INDEX IF NOT EXISTS idx_sales_calls_source ON sales_calls(source);
CREATE INDEX IF NOT EXISTS idx_sales_calls_cash_collected ON sales_calls(cash_collected_upfront);
CREATE INDEX IF NOT EXISTS idx_sales_calls_total_owed ON sales_calls(total_amount_owed);

-- Indexes for payment_schedules table
CREATE INDEX IF NOT EXISTS idx_payment_schedules_sales_call_id ON payment_schedules(sales_call_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_due_date ON payment_schedules(due_date);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_status ON payment_schedules(status);

-- Indexes for ad_spend table
CREATE INDEX IF NOT EXISTS idx_ad_spend_agency_id ON ad_spend(agency_id);
CREATE INDEX IF NOT EXISTS idx_ad_spend_date_range ON ad_spend(date_from, date_to);
CREATE INDEX IF NOT EXISTS idx_ad_spend_platform ON ad_spend(platform);

-- Indexes for offers table
CREATE INDEX IF NOT EXISTS idx_offers_agency_id ON offers(agency_id);
CREATE INDEX IF NOT EXISTS idx_offers_is_active ON offers(is_active);

-- Indexes for setters table
CREATE INDEX IF NOT EXISTS idx_setters_agency_id ON setters(agency_id);
CREATE INDEX IF NOT EXISTS idx_setters_is_active ON setters(is_active);

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_spend ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE setters ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE RLS POLICIES
-- =====================================================

-- Payment Schedules policies
CREATE POLICY "Users can view payment schedules from their agency" ON payment_schedules
    FOR SELECT USING (
        sales_call_id IN (
            SELECT id FROM sales_calls WHERE client_id IN (
                SELECT id FROM clients WHERE agency_id = (SELECT agency_id FROM users WHERE id = auth.uid())
            )
        )
    );

CREATE POLICY "Users can manage payment schedules from their agency" ON payment_schedules
    FOR ALL USING (
        sales_call_id IN (
            SELECT id FROM sales_calls WHERE client_id IN (
                SELECT id FROM clients WHERE agency_id = (SELECT agency_id FROM users WHERE id = auth.uid())
            )
        )
    );

-- Ad Spend policies
CREATE POLICY "Users can view ad spend from their agency" ON ad_spend
    FOR SELECT USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage ad spend from their agency" ON ad_spend
    FOR ALL USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

-- Offers policies
CREATE POLICY "Users can view offers from their agency" ON offers
    FOR SELECT USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage offers from their agency" ON offers
    FOR ALL USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

-- Setters policies
CREATE POLICY "Users can view setters from their agency" ON setters
    FOR SELECT USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage setters from their agency" ON setters
    FOR ALL USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

-- =====================================================
-- 7. ADD UPDATED_AT TRIGGERS
-- =====================================================

-- Add updated_at triggers to new tables
CREATE TRIGGER update_payment_schedules_updated_at 
    BEFORE UPDATE ON payment_schedules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_spend_updated_at 
    BEFORE UPDATE ON ad_spend 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at 
    BEFORE UPDATE ON offers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_setters_updated_at 
    BEFORE UPDATE ON setters 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. INSERT SAMPLE DATA
-- =====================================================

-- Insert sample offers for existing agencies
INSERT INTO offers (agency_id, name, description, price) 
SELECT 
    a.id,
    'Premium Coaching Program',
    '6-month intensive coaching program with weekly calls',
    5000.00
FROM agencies a
WHERE NOT EXISTS (SELECT 1 FROM offers WHERE agency_id = a.id AND name = 'Premium Coaching Program');

INSERT INTO offers (agency_id, name, description, price) 
SELECT 
    a.id,
    'Basic Training Course',
    '3-month basic training course with monthly calls',
    2500.00
FROM agencies a
WHERE NOT EXISTS (SELECT 1 FROM offers WHERE agency_id = a.id AND name = 'Basic Training Course');

-- Insert sample setters for existing agencies
INSERT INTO setters (agency_id, first_name, last_name, email)
SELECT 
    a.id,
    'John',
    'Smith',
    'john.smith@example.com'
FROM agencies a
WHERE NOT EXISTS (SELECT 1 FROM setters WHERE agency_id = a.id AND first_name = 'John' AND last_name = 'Smith');

INSERT INTO setters (agency_id, first_name, last_name, email)
SELECT 
    a.id,
    'Sarah',
    'Johnson',
    'sarah.johnson@example.com'
FROM agencies a
WHERE NOT EXISTS (SELECT 1 FROM setters WHERE agency_id = a.id AND first_name = 'Sarah' AND last_name = 'Johnson');

-- Insert sample ad spend data
INSERT INTO ad_spend (agency_id, campaign_name, platform, spend_amount, date_from, date_to, clicks, impressions, source)
SELECT 
    a.id,
    'Q4 2024 Campaign',
    'meta',
    5000.00,
    '2024-10-01',
    '2024-12-31',
    1000,
    50000,
    'manual'
FROM agencies a
WHERE NOT EXISTS (SELECT 1 FROM ad_spend WHERE agency_id = a.id AND campaign_name = 'Q4 2024 Campaign');

-- =====================================================
-- 9. COMMENTS ON NEW COLUMNS AND TABLES
-- =====================================================

COMMENT ON COLUMN sales_calls.prospect_name IS 'Name of the prospect/customer';
COMMENT ON COLUMN sales_calls.prospect_email IS 'Email address of the prospect';
COMMENT ON COLUMN sales_calls.prospect_phone IS 'Phone number of the prospect';
COMMENT ON COLUMN sales_calls.company_name IS 'Company name of the prospect';
COMMENT ON COLUMN sales_calls.closer_first_name IS 'First name of the closer (logged-in user)';
COMMENT ON COLUMN sales_calls.closer_last_name IS 'Last name of the closer (logged-in user)';
COMMENT ON COLUMN sales_calls.source IS 'Source of the call: sdr_call or non_sdr_booked';
COMMENT ON COLUMN sales_calls.traffic_source IS 'Traffic source: organic or paid_ads';
COMMENT ON COLUMN sales_calls.enhanced_outcome IS 'Enhanced call outcome with more specific options';
COMMENT ON COLUMN sales_calls.offer_pitched IS 'Description of the offer pitched during the call';
COMMENT ON COLUMN sales_calls.setter_first_name IS 'First name of the setter who booked the call';
COMMENT ON COLUMN sales_calls.setter_last_name IS 'Last name of the setter who booked the call';
COMMENT ON COLUMN sales_calls.cash_collected_upfront IS 'Amount of cash collected upfront';
COMMENT ON COLUMN sales_calls.total_amount_owed IS 'Total amount the customer owes';
COMMENT ON COLUMN sales_calls.payment_installments IS 'Number of payment installments';
COMMENT ON COLUMN sales_calls.payment_completion_status IS 'Status of payment completion';
COMMENT ON COLUMN sales_calls.crm_updated IS 'Whether the CRM has been updated with this call data';
COMMENT ON COLUMN sales_calls.prospect_notes IS 'Additional notes about the prospect';

COMMENT ON TABLE payment_schedules IS 'Payment schedule for sales calls with installment plans';
COMMENT ON TABLE ad_spend IS 'Ad spend tracking for ROAS calculations';
COMMENT ON TABLE offers IS 'Available offers that can be pitched';
COMMENT ON TABLE setters IS 'Setters who book calls for closers';
COMMENT ON VIEW call_analytics IS 'Comprehensive analytics view for call performance metrics';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'Enhanced call logging system added to Supabase successfully!' as status;
