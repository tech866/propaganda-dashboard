-- =====================================================
-- PROPAGANDA DASHBOARD - SUPABASE DATABASE SCHEMA
-- Physical Implementation of Business Logic
-- =====================================================
-- 
-- This file contains the complete SQL schema for the Propaganda Dashboard
-- Copy and paste this entire file into your Supabase SQL Editor
-- 
-- Created: 2024-09-30
-- Based on: Business Logic Decomposition (01_case_overview.md, 02_logic_breakdown.md, 03_meta_outline.md)
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE ENTITIES
-- =====================================================

-- Agencies (Multi-tenant organizations)
CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    subscription_plan VARCHAR(50) DEFAULT 'basic' NOT NULL CHECK (subscription_plan IN ('basic', 'professional', 'enterprise')),
    contact_info JSONB DEFAULT '{}',
    billing_address TEXT,
    active_status BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients (Business entities served by agencies)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    onboarding_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    contact_info JSONB DEFAULT '{}',
    industry VARCHAR(100),
    account_status VARCHAR(50) DEFAULT 'active' CHECK (account_status IN ('active', 'inactive', 'suspended', 'churned')),
    billing_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads (Potential clients before conversion)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    lead_source VARCHAR(100) NOT NULL,
    initial_contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    contact_info JSONB DEFAULT '{}',
    qualification_status VARCHAR(50) DEFAULT 'new' CHECK (qualification_status IN ('new', 'qualified', 'hot', 'cold', 'converted')),
    conversion_probability DECIMAL(3,2) DEFAULT 0.00 CHECK (conversion_probability >= 0 AND conversion_probability <= 1),
    converted_client_id UUID REFERENCES clients(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns (Grouping mechanism for calls and financial records)
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    campaign_status VARCHAR(50) DEFAULT 'active' CHECK (campaign_status IN ('active', 'paused', 'completed', 'cancelled')),
    budget_allocation DECIMAL(15,2),
    target_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales Calls (Individual logged interactions)
CREATE TABLE sales_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    scheduled_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER DEFAULT 0, -- Duration in minutes
    call_outcome VARCHAR(50) DEFAULT 'scheduled' CHECK (call_outcome IN ('scheduled', 'completed', 'no-show', 'cancelled', 'closed-won', 'closed-lost')),
    notes TEXT,
    follow_up_actions TEXT,
    attendee_list JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Metrics (Aggregated calculated values)
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    calculation_method VARCHAR(255) NOT NULL,
    metric_type VARCHAR(100) NOT NULL CHECK (metric_type IN ('show_rate', 'close_rate', 'roi', 'roas', 'conversion_rate', 'cost_per_lead')),
    calculated_value DECIMAL(15,4),
    time_period VARCHAR(50) NOT NULL, -- e.g., '2024-09', 'Q3-2024'
    comparison_baseline DECIMAL(15,4),
    trend_direction VARCHAR(20) CHECK (trend_direction IN ('up', 'down', 'stable')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integration Sources (External systems providing data)
CREATE TABLE integration_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    provider_name VARCHAR(100) NOT NULL CHECK (provider_name IN ('meta', 'whop', 'stripe', 'google_ads', 'linkedin')),
    connection_id VARCHAR(255) NOT NULL,
    data_sync_status VARCHAR(50) DEFAULT 'up_to_date' CHECK (data_sync_status IN ('up_to_date', 'delayed', 'failed', 'never_synced')),
    last_sync_time TIMESTAMP WITH TIME ZONE,
    authentication_status VARCHAR(50) DEFAULT 'disconnected' CHECK (authentication_status IN ('connected', 'disconnected', 'expired', 'error')),
    api_version VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Records (Ad spend and payment entries)
CREATE TABLE financial_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    integration_source_id UUID NOT NULL REFERENCES integration_sources(id) ON DELETE CASCADE,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('ad_spend', 'payment', 'refund', 'fee')),
    currency VARCHAR(3) DEFAULT 'USD',
    reference_number VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roles (Access permission definitions)
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_type VARCHAR(50) NOT NULL CHECK (role_type IN ('admin', 'agency_user', 'client_user', 'ceo', 'sales')),
    permissions JSONB NOT NULL DEFAULT '{}',
    name VARCHAR(100) NOT NULL,
    description TEXT,
    active_status BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom Stages (Agency-defined pipeline steps)
CREATE TABLE custom_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    stage_order INTEGER NOT NULL,
    stage_name VARCHAR(255) NOT NULL,
    stage_description TEXT,
    completion_criteria TEXT,
    active_status BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Feedback (Ratings and comments)
CREATE TABLE user_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    sales_call_id UUID REFERENCES sales_calls(id) ON DELETE SET NULL,
    feedback_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('rating', 'comment', 'complaint', 'suggestion')),
    rating_score INTEGER CHECK (rating_score >= 1 AND rating_score <= 5),
    comments TEXT,
    feedback_status VARCHAR(50) DEFAULT 'new' CHECK (feedback_status IN ('new', 'reviewed', 'resolved', 'dismissed')),
    response_actions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Templates (Saved dashboard configurations)
CREATE TABLE report_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('dashboard', 'export', 'recurring')),
    template_name VARCHAR(255) NOT NULL,
    configuration_settings JSONB DEFAULT '{}',
    schedule_frequency VARCHAR(50) CHECK (schedule_frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
    active_status BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users (User account information)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255), -- For local auth, NULL if using external auth
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    active_status BOOLEAN DEFAULT true
);

-- =====================================================
-- JUNCTION TABLES (Many-to-Many Relationships)
-- =====================================================

-- Agency Custom Stages (Many-to-Many)
CREATE TABLE agency_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    custom_stage_id UUID NOT NULL REFERENCES custom_stages(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(agency_id, custom_stage_id)
);

-- Campaign Calls (Many-to-Many)
CREATE TABLE campaign_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    sales_call_id UUID NOT NULL REFERENCES sales_calls(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, sales_call_id)
);

-- Template Metrics (Many-to-Many)
CREATE TABLE template_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_template_id UUID NOT NULL REFERENCES report_templates(id) ON DELETE CASCADE,
    performance_metric_id UUID NOT NULL REFERENCES performance_metrics(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(report_template_id, performance_metric_id)
);

-- Template Financials (Many-to-Many)
CREATE TABLE template_financials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_template_id UUID NOT NULL REFERENCES report_templates(id) ON DELETE CASCADE,
    financial_record_id UUID NOT NULL REFERENCES financial_records(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(report_template_id, financial_record_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Agency indexes
CREATE INDEX idx_agencies_active_status ON agencies(active_status);
CREATE INDEX idx_agencies_subscription_plan ON agencies(subscription_plan);

-- Client indexes
CREATE INDEX idx_clients_agency_id ON clients(agency_id);
CREATE INDEX idx_clients_account_status ON clients(account_status);
CREATE INDEX idx_clients_industry ON clients(industry);

-- Lead indexes
CREATE INDEX idx_leads_agency_id ON leads(agency_id);
CREATE INDEX idx_leads_qualification_status ON leads(qualification_status);
CREATE INDEX idx_leads_converted_client_id ON leads(converted_client_id);

-- Campaign indexes
CREATE INDEX idx_campaigns_agency_id ON campaigns(agency_id);
CREATE INDEX idx_campaigns_status ON campaigns(campaign_status);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);

-- Sales Call indexes
CREATE INDEX idx_sales_calls_client_id ON sales_calls(client_id);
CREATE INDEX idx_sales_calls_campaign_id ON sales_calls(campaign_id);
CREATE INDEX idx_sales_calls_outcome ON sales_calls(call_outcome);
CREATE INDEX idx_sales_calls_scheduled_date ON sales_calls(scheduled_date_time);

-- Performance Metrics indexes
CREATE INDEX idx_performance_metrics_campaign_id ON performance_metrics(campaign_id);
CREATE INDEX idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX idx_performance_metrics_time_period ON performance_metrics(time_period);

-- Financial Records indexes
CREATE INDEX idx_financial_records_campaign_id ON financial_records(campaign_id);
CREATE INDEX idx_financial_records_integration_source_id ON financial_records(integration_source_id);
CREATE INDEX idx_financial_records_transaction_date ON financial_records(transaction_date);
CREATE INDEX idx_financial_records_payment_status ON financial_records(payment_status);

-- Integration Sources indexes
CREATE INDEX idx_integration_sources_agency_id ON integration_sources(agency_id);
CREATE INDEX idx_integration_sources_provider ON integration_sources(provider_name);
CREATE INDEX idx_integration_sources_sync_status ON integration_sources(data_sync_status);

-- User indexes
CREATE INDEX idx_users_agency_id ON users(agency_id);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active_status ON users(active_status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Agency policies (users can only access their own agency)
CREATE POLICY "Users can view their own agency" ON agencies
    FOR SELECT USING (id = (SELECT agency_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own agency" ON agencies
    FOR UPDATE USING (id = (SELECT agency_id FROM users WHERE id = auth.uid()));

-- Client policies (users can only access clients from their agency)
CREATE POLICY "Users can view clients from their agency" ON clients
    FOR SELECT USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage clients from their agency" ON clients
    FOR ALL USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

-- Lead policies (users can only access leads from their agency)
CREATE POLICY "Users can view leads from their agency" ON leads
    FOR SELECT USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage leads from their agency" ON leads
    FOR ALL USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

-- Campaign policies (users can only access campaigns from their agency)
CREATE POLICY "Users can view campaigns from their agency" ON campaigns
    FOR SELECT USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage campaigns from their agency" ON campaigns
    FOR ALL USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

-- Sales Call policies (users can only access calls from their agency's clients)
CREATE POLICY "Users can view sales calls from their agency" ON sales_calls
    FOR SELECT USING (
        client_id IN (
            SELECT id FROM clients WHERE agency_id = (SELECT agency_id FROM users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can manage sales calls from their agency" ON sales_calls
    FOR ALL USING (
        client_id IN (
            SELECT id FROM clients WHERE agency_id = (SELECT agency_id FROM users WHERE id = auth.uid())
        )
    );

-- Performance Metrics policies (users can only access metrics from their agency's campaigns)
CREATE POLICY "Users can view performance metrics from their agency" ON performance_metrics
    FOR SELECT USING (
        campaign_id IN (
            SELECT id FROM campaigns WHERE agency_id = (SELECT agency_id FROM users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can manage performance metrics from their agency" ON performance_metrics
    FOR ALL USING (
        campaign_id IN (
            SELECT id FROM campaigns WHERE agency_id = (SELECT agency_id FROM users WHERE id = auth.uid())
        )
    );

-- Financial Records policies (users can only access financial records from their agency's campaigns)
CREATE POLICY "Users can view financial records from their agency" ON financial_records
    FOR SELECT USING (
        campaign_id IN (
            SELECT id FROM campaigns WHERE agency_id = (SELECT agency_id FROM users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can manage financial records from their agency" ON financial_records
    FOR ALL USING (
        campaign_id IN (
            SELECT id FROM campaigns WHERE agency_id = (SELECT agency_id FROM users WHERE id = auth.uid())
        )
    );

-- Integration Sources policies (users can only access integrations from their agency)
CREATE POLICY "Users can view integration sources from their agency" ON integration_sources
    FOR SELECT USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage integration sources from their agency" ON integration_sources
    FOR ALL USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

-- Custom Stages policies (users can only access stages from their agency)
CREATE POLICY "Users can view custom stages from their agency" ON custom_stages
    FOR SELECT USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage custom stages from their agency" ON custom_stages
    FOR ALL USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

-- User Feedback policies (users can only access feedback from their agency's clients)
CREATE POLICY "Users can view user feedback from their agency" ON user_feedback
    FOR SELECT USING (
        client_id IN (
            SELECT id FROM clients WHERE agency_id = (SELECT agency_id FROM users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can manage user feedback from their agency" ON user_feedback
    FOR ALL USING (
        client_id IN (
            SELECT id FROM clients WHERE agency_id = (SELECT agency_id FROM users WHERE id = auth.uid())
        )
    );

-- Report Templates policies (users can only access templates from their agency)
CREATE POLICY "Users can view report templates from their agency" ON report_templates
    FOR SELECT USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage report templates from their agency" ON report_templates
    FOR ALL USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

-- User policies (users can only access users from their agency)
CREATE POLICY "Users can view users from their agency" ON users
    FOR SELECT USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage users from their agency" ON users
    FOR ALL USING (agency_id = (SELECT agency_id FROM users WHERE id = auth.uid()));

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_calls_updated_at BEFORE UPDATE ON sales_calls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_performance_metrics_updated_at BEFORE UPDATE ON performance_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_records_updated_at BEFORE UPDATE ON financial_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integration_sources_updated_at BEFORE UPDATE ON integration_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_custom_stages_updated_at BEFORE UPDATE ON custom_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_feedback_updated_at BEFORE UPDATE ON user_feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON report_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (Comprehensive test data)
-- =====================================================

-- Insert sample roles
INSERT INTO roles (role_type, permissions, name, description) VALUES
('admin', '{"read": true, "write": true, "delete": true, "manage_users": true}', 'Administrator', 'Full system access'),
('agency_user', '{"read": true, "write": true, "delete": false, "manage_users": false}', 'Agency User', 'Standard agency user access'),
('client_user', '{"read": true, "write": false, "delete": false, "manage_users": false}', 'Client User', 'Read-only client access'),
('ceo', '{"read": true, "write": true, "delete": true, "manage_users": true, "financial": true}', 'CEO', 'Executive level access'),
('sales', '{"read": true, "write": true, "delete": false, "manage_users": false}', 'Sales Team', 'Sales team access');

-- Insert sample agencies
INSERT INTO agencies (id, name, registration_date, subscription_plan, contact_info, billing_address, active_status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Propaganda Marketing Agency', '2024-01-15 10:00:00+00', 'professional', '{"phone": "+1-555-0123", "email": "contact@propaganda.agency", "website": "https://propaganda.agency"}', '123 Marketing St, New York, NY 10001', true),
('550e8400-e29b-41d4-a716-446655440002', 'Digital Growth Co', '2024-02-20 14:30:00+00', 'enterprise', '{"phone": "+1-555-0456", "email": "hello@digitalgrowth.co", "website": "https://digitalgrowth.co"}', '456 Growth Ave, San Francisco, CA 94105', true),
('550e8400-e29b-41d4-a716-446655440003', 'Creative Solutions Inc', '2024-03-10 09:15:00+00', 'basic', '{"phone": "+1-555-0789", "email": "info@creativesolutions.com", "website": "https://creativesolutions.com"}', '789 Creative Blvd, Austin, TX 73301', true);

-- Insert sample clients
INSERT INTO clients (id, agency_id, name, onboarding_date, contact_info, industry, account_status, billing_info) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'TechCorp Inc', '2024-01-20 10:00:00+00', '{"contact_person": "Sarah Johnson", "email": "sarah@techcorp.com", "phone": "+1-555-1001"}', 'Technology', 'active', '{"billing_cycle": "monthly", "payment_method": "credit_card"}'),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'StartupXYZ', '2024-02-01 14:00:00+00', '{"contact_person": "Mike Chen", "email": "mike@startupxyz.com", "phone": "+1-555-1002"}', 'SaaS', 'active', '{"billing_cycle": "quarterly", "payment_method": "bank_transfer"}'),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'E-commerce Plus', '2024-02-15 11:30:00+00', '{"contact_person": "Lisa Rodriguez", "email": "lisa@ecommerceplus.com", "phone": "+1-555-1003"}', 'E-commerce', 'active', '{"billing_cycle": "monthly", "payment_method": "credit_card"}'),
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'HealthTech Solutions', '2024-03-01 09:00:00+00', '{"contact_person": "Dr. Emily Watson", "email": "emily@healthtech.com", "phone": "+1-555-2001"}', 'Healthcare', 'active', '{"billing_cycle": "monthly", "payment_method": "credit_card"}'),
('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'FinanceFlow', '2024-03-15 16:00:00+00', '{"contact_person": "Robert Kim", "email": "robert@financeflow.com", "phone": "+1-555-2002"}', 'Fintech', 'active', '{"billing_cycle": "quarterly", "payment_method": "bank_transfer"}'),
('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', 'Local Restaurant Group', '2024-04-01 12:00:00+00', '{"contact_person": "Maria Garcia", "email": "maria@localrestaurants.com", "phone": "+1-555-3001"}', 'Food & Beverage', 'active', '{"billing_cycle": "monthly", "payment_method": "credit_card"}');

-- Insert sample leads
INSERT INTO leads (id, agency_id, name, lead_source, initial_contact_date, contact_info, qualification_status, conversion_probability) VALUES
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'GreenTech Innovations', 'website_form', '2024-09-15 10:00:00+00', '{"contact_person": "Alex Thompson", "email": "alex@greentech.com", "phone": "+1-555-4001"}', 'qualified', 0.75),
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Fashion Forward', 'referral', '2024-09-20 14:30:00+00', '{"contact_person": "Jessica Lee", "email": "jessica@fashionforward.com", "phone": "+1-555-4002"}', 'hot', 0.90),
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'EduTech Platform', 'linkedin', '2024-09-25 11:15:00+00', '{"contact_person": "David Park", "email": "david@edutech.com", "phone": "+1-555-5001"}', 'qualified', 0.60),
('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'Local Fitness Studio', 'google_ads', '2024-09-28 16:45:00+00', '{"contact_person": "Amanda Wilson", "email": "amanda@fitnessstudio.com", "phone": "+1-555-6001"}', 'new', 0.40);

-- Insert sample campaigns
INSERT INTO campaigns (id, agency_id, name, start_date, end_date, campaign_status, budget_allocation, target_metrics) VALUES
('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'TechCorp Q4 Growth', '2024-10-01 00:00:00+00', '2024-12-31 23:59:59+00', 'active', 50000.00, '{"target_leads": 1000, "target_conversions": 50, "target_roi": 3.5}'),
('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'StartupXYZ Launch Campaign', '2024-09-15 00:00:00+00', '2024-11-15 23:59:59+00', 'active', 25000.00, '{"target_leads": 500, "target_conversions": 25, "target_roi": 2.8}'),
('850e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'E-commerce Holiday Push', '2024-11-01 00:00:00+00', '2024-12-25 23:59:59+00', 'active', 75000.00, '{"target_leads": 2000, "target_conversions": 100, "target_roi": 4.0}'),
('850e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'HealthTech Awareness', '2024-10-15 00:00:00+00', '2024-12-31 23:59:59+00', 'active', 40000.00, '{"target_leads": 800, "target_conversions": 40, "target_roi": 3.2}'),
('850e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'Restaurant Local SEO', '2024-09-01 00:00:00+00', '2024-12-31 23:59:59+00', 'active', 15000.00, '{"target_leads": 300, "target_conversions": 15, "target_roi": 2.5}');

-- Insert sample integration sources
INSERT INTO integration_sources (id, agency_id, provider_name, connection_id, data_sync_status, last_sync_time, authentication_status, api_version) VALUES
('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'meta', 'act_123456789012345', 'up_to_date', '2024-09-30 10:30:00+00', 'connected', 'v18.0'),
('950e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'stripe', 'acct_1A2B3C4D5E6F7G8H', 'up_to_date', '2024-09-30 10:25:00+00', 'connected', 'v1'),
('950e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'whop', 'whop_conn_abc123def456', 'up_to_date', '2024-09-30 10:20:00+00', 'connected', 'v2'),
('950e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'meta', 'act_987654321098765', 'up_to_date', '2024-09-30 09:45:00+00', 'connected', 'v18.0'),
('950e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'stripe', 'acct_9Z8Y7X6W5V4U3T2S', 'up_to_date', '2024-09-30 09:40:00+00', 'connected', 'v1'),
('950e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', 'google_ads', '123-456-7890', 'up_to_date', '2024-09-30 08:15:00+00', 'connected', 'v14');

-- Insert sample sales calls
INSERT INTO sales_calls (id, client_id, campaign_id, scheduled_date_time, duration, call_outcome, notes, follow_up_actions, attendee_list) VALUES
('a50e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '2024-09-15 14:00:00+00', 45, 'completed', 'Great initial discussion about Q4 goals. Client is very interested in scaling their ad spend.', 'Send proposal by end of week', '[{"name": "Sarah Johnson", "role": "Client"}, {"name": "John Smith", "role": "Account Manager"}]'),
('a50e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '2024-09-20 10:00:00+00', 30, 'completed', 'Follow-up call to discuss proposal details. Client has questions about targeting strategy.', 'Schedule technical deep-dive call', '[{"name": "Sarah Johnson", "role": "Client"}, {"name": "John Smith", "role": "Account Manager"}]'),
('a50e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440002', '2024-09-18 15:30:00+00', 60, 'completed', 'Product demo went well. Client is excited about the launch campaign strategy.', 'Prepare contract and timeline', '[{"name": "Mike Chen", "role": "Client"}, {"name": "Jane Doe", "role": "Campaign Manager"}]'),
('a50e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440003', '2024-09-22 11:00:00+00', 40, 'no-show', 'Client missed the call. Need to reschedule.', 'Reschedule for next week', '[{"name": "Lisa Rodriguez", "role": "Client"}, {"name": "Bob Wilson", "role": "Sales Rep"}]'),
('a50e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440004', '2024-09-25 13:00:00+00', 50, 'completed', 'Excellent discussion about healthcare marketing compliance. Client is ready to move forward.', 'Send compliance checklist and next steps', '[{"name": "Dr. Emily Watson", "role": "Client"}, {"name": "Alice Brown", "role": "Healthcare Specialist"}]'),
('a50e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440005', '850e8400-e29b-41d4-a716-446655440004', '2024-09-28 16:00:00+00', 35, 'closed-won', 'Deal closed! Client signed the contract for Q4 campaign.', 'Begin campaign setup and onboarding', '[{"name": "Robert Kim", "role": "Client"}, {"name": "Charlie Davis", "role": "Account Executive"}]'),
('a50e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440006', '850e8400-e29b-41d4-a716-446655440005', '2024-09-30 12:00:00+00', 25, 'scheduled', 'Upcoming call to discuss local SEO strategy for restaurant group.', 'Prepare local SEO audit report', '[{"name": "Maria Garcia", "role": "Client"}, {"name": "Diana Martinez", "role": "SEO Specialist"}]');

-- Insert sample performance metrics
INSERT INTO performance_metrics (id, campaign_id, calculation_method, metric_type, calculated_value, time_period, comparison_baseline, trend_direction) VALUES
('b50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'completed_calls / total_calls * 100', 'show_rate', 85.5, '2024-09', 82.3, 'up'),
('b50e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', 'closed_won_calls / completed_calls * 100', 'close_rate', 32.1, '2024-09', 28.7, 'up'),
('b50e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', 'revenue / ad_spend', 'roi', 3.2, '2024-09', 2.8, 'up'),
('b50e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440002', 'completed_calls / total_calls * 100', 'show_rate', 78.9, '2024-09', 75.2, 'up'),
('b50e8400-e29b-41d4-a716-446655440005', '850e8400-e29b-41d4-a716-446655440002', 'closed_won_calls / completed_calls * 100', 'close_rate', 28.4, '2024-09', 31.1, 'down'),
('b50e8400-e29b-41d4-a716-446655440006', '850e8400-e29b-41d4-a716-446655440003', 'completed_calls / total_calls * 100', 'show_rate', 92.1, '2024-09', 88.5, 'up'),
('b50e8400-e29b-41d4-a716-446655440007', '850e8400-e29b-41d4-a716-446655440004', 'completed_calls / total_calls * 100', 'show_rate', 80.0, '2024-09', 77.8, 'up'),
('b50e8400-e29b-41d4-a716-446655440008', '850e8400-e29b-41d4-a716-446655440005', 'completed_calls / total_calls * 100', 'show_rate', 75.0, '2024-09', 73.2, 'up');

-- Insert sample financial records
INSERT INTO financial_records (id, campaign_id, integration_source_id, transaction_date, amount, payment_status, transaction_type, currency, reference_number) VALUES
('c50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2024-09-01 00:00:00+00', 5000.00, 'paid', 'ad_spend', 'USD', 'FB_AD_001'),
('c50e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2024-09-15 00:00:00+00', 7500.00, 'paid', 'ad_spend', 'USD', 'FB_AD_002'),
('c50e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440002', '2024-09-30 00:00:00+00', 15000.00, 'paid', 'payment', 'USD', 'STRIPE_PAY_001'),
('c50e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440001', '2024-09-10 00:00:00+00', 3000.00, 'paid', 'ad_spend', 'USD', 'FB_AD_003'),
('c50e8400-e29b-41d4-a716-446655440005', '850e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440002', '2024-09-25 00:00:00+00', 8000.00, 'paid', 'payment', 'USD', 'STRIPE_PAY_002'),
('c50e8400-e29b-41d4-a716-446655440006', '850e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440001', '2024-09-05 00:00:00+00', 10000.00, 'paid', 'ad_spend', 'USD', 'FB_AD_004'),
('c50e8400-e29b-41d4-a716-446655440007', '850e8400-e29b-41d4-a716-446655440004', '950e8400-e29b-41d4-a716-446655440004', '2024-09-12 00:00:00+00', 4000.00, 'paid', 'ad_spend', 'USD', 'FB_AD_005'),
('c50e8400-e29b-41d4-a716-446655440008', '850e8400-e29b-41d4-a716-446655440005', '950e8400-e29b-41d4-a716-446655440006', '2024-09-20 00:00:00+00', 2000.00, 'paid', 'ad_spend', 'USD', 'GOOGLE_AD_001');

-- Insert sample custom stages
INSERT INTO custom_stages (id, agency_id, stage_order, stage_name, stage_description, completion_criteria, active_status) VALUES
('d50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 1, 'Initial Contact', 'First touchpoint with potential client', 'Contact made and interest expressed', true),
('d50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 2, 'Qualification', 'Assess client needs and budget', 'Needs assessment completed', true),
('d50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 3, 'Proposal', 'Present solution and pricing', 'Proposal sent and reviewed', true),
('d50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 4, 'Negotiation', 'Discuss terms and finalize details', 'Terms agreed upon', true),
('d50e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 5, 'Closed Won', 'Deal signed and project started', 'Contract signed', true),
('d50e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 1, 'Discovery', 'Understand client business and goals', 'Business analysis completed', true),
('d50e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 2, 'Strategy', 'Develop marketing strategy', 'Strategy document approved', true),
('d50e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 3, 'Implementation', 'Execute marketing campaigns', 'Campaigns launched', true);

-- Insert sample user feedback
INSERT INTO user_feedback (id, client_id, sales_call_id, feedback_date, feedback_type, rating_score, comments, feedback_status, response_actions) VALUES
('e50e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '2024-09-15 16:00:00+00', 'rating', 5, 'Excellent call! Very professional and knowledgeable team.', 'reviewed', 'Thank you email sent'),
('e50e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440003', '2024-09-18 17:30:00+00', 'rating', 4, 'Great demo, looking forward to working together.', 'reviewed', 'Follow-up scheduled'),
('e50e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440004', 'a50e8400-e29b-41d4-a716-446655440005', '2024-09-25 14:00:00+00', 'rating', 5, 'Outstanding understanding of healthcare compliance requirements.', 'reviewed', 'Compliance resources shared'),
('e50e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440005', 'a50e8400-e29b-41d4-a716-446655440006', '2024-09-28 17:00:00+00', 'rating', 5, 'Perfect! Excited to start this partnership.', 'reviewed', 'Onboarding process initiated'),
('e50e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440003', NULL, '2024-09-22 12:00:00+00', 'complaint', 2, 'Missed call without notice. Need better communication.', 'resolved', 'Apology sent and rescheduled'),
('e50e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440001', NULL, '2024-09-30 10:00:00+00', 'suggestion', 4, 'Would love to see more detailed reporting features.', 'new', 'Feature request logged');

-- Insert sample report templates
INSERT INTO report_templates (id, agency_id, template_type, template_name, configuration_settings, schedule_frequency, active_status) VALUES
('f50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'dashboard', 'Executive Summary', '{"metrics": ["show_rate", "close_rate", "roi"], "timeframe": "monthly", "clients": "all"}', 'monthly', true),
('f50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'export', 'Client Performance Report', '{"metrics": ["show_rate", "close_rate", "ad_spend", "revenue"], "timeframe": "quarterly", "format": "pdf"}', 'quarterly', true),
('f50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'dashboard', 'Campaign Overview', '{"metrics": ["show_rate", "close_rate", "roi"], "timeframe": "weekly", "campaigns": "active"}', 'weekly', true),
('f50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'recurring', 'Monthly Performance', '{"metrics": ["show_rate", "close_rate"], "timeframe": "monthly", "clients": "all"}', 'monthly', true);

-- Insert sample users
INSERT INTO users (id, agency_id, role_id, email, name, password_hash, last_login, active_status) VALUES
('150e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM roles WHERE role_type = 'ceo'), 'ceo@propaganda.agency', 'CEO User', '$2b$10$example_hash_ceo', '2024-09-30 09:00:00+00', true),
('150e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM roles WHERE role_type = 'admin'), 'admin@propaganda.agency', 'Admin User', '$2b$10$example_hash_admin', '2024-09-30 08:30:00+00', true),
('150e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM roles WHERE role_type = 'sales'), 'sales@propaganda.agency', 'Sales Team', '$2b$10$example_hash_sales', '2024-09-30 10:15:00+00', true),
('150e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM roles WHERE role_type = 'ceo'), 'ceo@digitalgrowth.co', 'Digital Growth CEO', '$2b$10$example_hash_ceo2', '2024-09-30 07:45:00+00', true),
('150e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM roles WHERE role_type = 'admin'), 'admin@digitalgrowth.co', 'Digital Growth Admin', '$2b$10$example_hash_admin2', '2024-09-30 08:00:00+00', true),
('150e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM roles WHERE role_type = 'admin'), 'admin@creativesolutions.com', 'Creative Solutions Admin', '$2b$10$example_hash_admin3', '2024-09-29 16:30:00+00', true);

-- Insert sample junction table data
INSERT INTO agency_stages (agency_id, custom_stage_id) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'd50e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440001', 'd50e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440001', 'd50e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440001', 'd50e8400-e29b-41d4-a716-446655440004'),
('550e8400-e29b-41d4-a716-446655440001', 'd50e8400-e29b-41d4-a716-446655440005'),
('550e8400-e29b-41d4-a716-446655440002', 'd50e8400-e29b-41d4-a716-446655440006'),
('550e8400-e29b-41d4-a716-446655440002', 'd50e8400-e29b-41d4-a716-446655440007'),
('550e8400-e29b-41d4-a716-446655440002', 'd50e8400-e29b-41d4-a716-446655440008');

INSERT INTO campaign_calls (campaign_id, sales_call_id) VALUES
('850e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001'),
('850e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440002'),
('850e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440003'),
('850e8400-e29b-41d4-a716-446655440003', 'a50e8400-e29b-41d4-a716-446655440004'),
('850e8400-e29b-41d4-a716-446655440004', 'a50e8400-e29b-41d4-a716-446655440005'),
('850e8400-e29b-41d4-a716-446655440004', 'a50e8400-e29b-41d4-a716-446655440006'),
('850e8400-e29b-41d4-a716-446655440005', 'a50e8400-e29b-41d4-a716-446655440007');

INSERT INTO template_metrics (report_template_id, performance_metric_id) VALUES
('f50e8400-e29b-41d4-a716-446655440001', 'b50e8400-e29b-41d4-a716-446655440001'),
('f50e8400-e29b-41d4-a716-446655440001', 'b50e8400-e29b-41d4-a716-446655440002'),
('f50e8400-e29b-41d4-a716-446655440001', 'b50e8400-e29b-41d4-a716-446655440003'),
('f50e8400-e29b-41d4-a716-446655440002', 'b50e8400-e29b-41d4-a716-446655440001'),
('f50e8400-e29b-41d4-a716-446655440002', 'b50e8400-e29b-41d4-a716-446655440002'),
('f50e8400-e29b-41d4-a716-446655440003', 'b50e8400-e29b-41d4-a716-446655440004'),
('f50e8400-e29b-41d4-a716-446655440003', 'b50e8400-e29b-41d4-a716-446655440005'),
('f50e8400-e29b-41d4-a716-446655440004', 'b50e8400-e29b-41d4-a716-446655440006'),
('f50e8400-e29b-41d4-a716-446655440004', 'b50e8400-e29b-41d4-a716-446655440007');

INSERT INTO template_financials (report_template_id, financial_record_id) VALUES
('f50e8400-e29b-41d4-a716-446655440001', 'c50e8400-e29b-41d4-a716-446655440001'),
('f50e8400-e29b-41d4-a716-446655440001', 'c50e8400-e29b-41d4-a716-446655440002'),
('f50e8400-e29b-41d4-a716-446655440001', 'c50e8400-e29b-41d4-a716-446655440003'),
('f50e8400-e29b-41d4-a716-446655440002', 'c50e8400-e29b-41d4-a716-446655440001'),
('f50e8400-e29b-41d4-a716-446655440002', 'c50e8400-e29b-41d4-a716-446655440002'),
('f50e8400-e29b-41d4-a716-446655440002', 'c50e8400-e29b-41d4-a716-446655440003'),
('f50e8400-e29b-41d4-a716-446655440003', 'c50e8400-e29b-41d4-a716-446655440004'),
('f50e8400-e29b-41d4-a716-446655440003', 'c50e8400-e29b-41d4-a716-446655440005'),
('f50e8400-e29b-41d4-a716-446655440004', 'c50e8400-e29b-41d4-a716-446655440006'),
('f50e8400-e29b-41d4-a716-446655440004', 'c50e8400-e29b-41d4-a716-446655440007');

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- This completes the database schema creation
-- Next steps:
-- 1. Verify all tables were created successfully
-- 2. Test RLS policies with sample data
-- 3. Update your application to use Supabase client
-- 4. Migrate existing data from mock database
-- 5. Test all API endpoints with new schema

SELECT 'Propaganda Dashboard database schema created successfully!' as status;
