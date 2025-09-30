-- =====================================================
-- SAMPLE DATA FOR PROPAGANDA DASHBOARD
-- =====================================================
-- Copy-paste this into your Supabase SQL Editor
-- This contains only the INSERT statements for sample data

-- Insert sample roles (with specific IDs to avoid subquery issues)
INSERT INTO roles (id, role_type, permissions, name, description) VALUES
('250e8400-e29b-41d4-a716-446655440001', 'admin', '{"read": true, "write": true, "delete": true, "manage_users": true}', 'Administrator', 'Full system access'),
('250e8400-e29b-41d4-a716-446655440002', 'agency_user', '{"read": true, "write": true, "delete": false, "manage_users": false}', 'Agency User', 'Standard agency user access'),
('250e8400-e29b-41d4-a716-446655440003', 'client_user', '{"read": true, "write": false, "delete": false, "manage_users": false}', 'Client User', 'Read-only client access'),
('250e8400-e29b-41d4-a716-446655440004', 'ceo', '{"read": true, "write": true, "delete": true, "manage_users": true, "financial": true}', 'CEO', 'Executive level access'),
('250e8400-e29b-41d4-a716-446655440005', 'sales', '{"read": true, "write": true, "delete": false, "manage_users": false}', 'Sales Team', 'Sales team access');

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

-- Insert sample users (using specific role IDs to avoid subquery issues)
INSERT INTO users (id, agency_id, role_id, email, name, password_hash, last_login, active_status) VALUES
('150e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '250e8400-e29b-41d4-a716-446655440004', 'ceo@propaganda.agency', 'CEO User', '$2b$10$example_hash_ceo', '2024-09-30 09:00:00+00', true),
('150e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '250e8400-e29b-41d4-a716-446655440001', 'admin@propaganda.agency', 'Admin User', '$2b$10$example_hash_admin', '2024-09-30 08:30:00+00', true),
('150e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '250e8400-e29b-41d4-a716-446655440005', 'sales@propaganda.agency', 'Sales Team', '$2b$10$example_hash_sales', '2024-09-30 10:15:00+00', true),
('150e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '250e8400-e29b-41d4-a716-446655440004', 'ceo@digitalgrowth.co', 'Digital Growth CEO', '$2b$10$example_hash_ceo2', '2024-09-30 07:45:00+00', true),
('150e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '250e8400-e29b-41d4-a716-446655440001', 'admin@digitalgrowth.co', 'Digital Growth Admin', '$2b$10$example_hash_admin2', '2024-09-30 08:00:00+00', true),
('150e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', '250e8400-e29b-41d4-a716-446655440001', 'admin@creativesolutions.com', 'Creative Solutions Admin', '$2b$10$example_hash_admin3', '2024-09-29 16:30:00+00', true);

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

SELECT 'Sample data inserted successfully!' as status;
