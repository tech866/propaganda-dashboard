-- =====================================================
-- Propaganda Dashboard Database Schema
-- Seed Data Script for Development and Testing
-- =====================================================

-- =====================================================
-- 1. INSERT CLIENTS (TENANTS)
-- =====================================================

INSERT INTO clients (id, name, email, phone, address, is_active) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Propaganda Inc', 'contact@propaganda.com', '+1-555-0101', '123 Agency St, New York, NY 10001', true),
    ('550e8400-e29b-41d4-a716-446655440002', 'Tech Solutions LLC', 'info@techsolutions.com', '+1-555-0102', '456 Tech Ave, San Francisco, CA 94105', true),
    ('550e8400-e29b-41d4-a716-446655440003', 'Marketing Pro', 'hello@marketingpro.com', '+1-555-0103', '789 Marketing Blvd, Los Angeles, CA 90210', true);

-- =====================================================
-- 2. INSERT USERS
-- =====================================================

-- Propaganda Inc Users
INSERT INTO users (id, client_id, email, password_hash, name, role, is_active) VALUES
    ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'ceo@propaganda.com', '$2b$10$example_hash_ceo', 'CEO User', 'ceo', true),
    ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'admin@propaganda.com', '$2b$10$example_hash_admin', 'Admin User', 'admin', true),
    ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'sales1@propaganda.com', '$2b$10$example_hash_sales1', 'John Doe', 'sales', true),
    ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'sales2@propaganda.com', '$2b$10$example_hash_sales2', 'Jane Smith', 'sales', true);

-- Tech Solutions LLC Users
INSERT INTO users (id, client_id, email, password_hash, name, role, is_active) VALUES
    ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'admin@techsolutions.com', '$2b$10$example_hash_admin2', 'Tech Admin', 'admin', true),
    ('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'sales@techsolutions.com', '$2b$10$example_hash_sales3', 'Tech Sales', 'sales', true);

-- Marketing Pro Users
INSERT INTO users (id, client_id, email, password_hash, name, role, is_active) VALUES
    ('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 'ceo@marketingpro.com', '$2b$10$example_hash_ceo2', 'Marketing CEO', 'ceo', true),
    ('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 'sales@marketingpro.com', '$2b$10$example_hash_sales4', 'Marketing Sales', 'sales', true);

-- =====================================================
-- 3. INSERT LOSS REASONS
-- =====================================================

-- Propaganda Inc Loss Reasons
INSERT INTO loss_reasons (id, client_id, name, description, is_active) VALUES
    ('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Price too high', 'Prospect found the pricing too expensive', true),
    ('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Not interested', 'Prospect was not interested in the service', true),
    ('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Timing not right', 'Prospect said timing was not right for them', true),
    ('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Competitor chosen', 'Prospect chose a competitor instead', true),
    ('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Budget constraints', 'Prospect had budget limitations', true);

-- Tech Solutions LLC Loss Reasons
INSERT INTO loss_reasons (id, client_id, name, description, is_active) VALUES
    ('750e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Technical requirements', 'Prospect had specific technical requirements we could not meet', true),
    ('750e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'Implementation timeline', 'Prospect needed faster implementation than we could provide', true);

-- Marketing Pro Loss Reasons
INSERT INTO loss_reasons (id, client_id, name, description, is_active) VALUES
    ('750e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 'In-house marketing', 'Prospect decided to handle marketing in-house', true),
    ('750e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', 'Different approach', 'Prospect wanted a different marketing approach', true);

-- =====================================================
-- 4. INSERT CALLS
-- =====================================================

-- Propaganda Inc Calls
INSERT INTO calls (id, client_id, user_id, prospect_name, prospect_email, prospect_phone, call_type, status, outcome, loss_reason_id, notes, call_duration, scheduled_at, completed_at) VALUES
    ('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 'Alice Johnson', 'alice@example.com', '+1-555-1001', 'outbound', 'completed', 'won', NULL, 'Great conversation, closed the deal', 1800, '2024-09-20 10:00:00+00', '2024-09-20 10:30:00+00'),
    ('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 'Bob Wilson', 'bob@example.com', '+1-555-1002', 'inbound', 'completed', 'lost', '750e8400-e29b-41d4-a716-446655440001', 'Price was too high for their budget', 1200, '2024-09-21 14:00:00+00', '2024-09-21 14:20:00+00'),
    ('850e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440004', 'Carol Davis', 'carol@example.com', '+1-555-1003', 'outbound', 'completed', 'won', NULL, 'Excellent prospect, very interested', 2100, '2024-09-22 09:00:00+00', '2024-09-22 09:35:00+00'),
    ('850e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440004', 'David Brown', 'david@example.com', '+1-555-1004', 'inbound', 'no-show', 'tbd', NULL, 'Prospect did not show up for scheduled call', 0, '2024-09-23 15:00:00+00', NULL),
    ('850e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 'Eva Martinez', 'eva@example.com', '+1-555-1005', 'outbound', 'completed', 'lost', '750e8400-e29b-41d4-a716-446655440002', 'Not interested in our services', 900, '2024-09-24 11:00:00+00', '2024-09-24 11:15:00+00'),
    ('850e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440004', 'Frank Taylor', 'frank@example.com', '+1-555-1006', 'inbound', 'completed', 'won', NULL, 'Quick decision maker, signed immediately', 1500, '2024-09-25 16:00:00+00', '2024-09-25 16:25:00+00');

-- Tech Solutions LLC Calls
INSERT INTO calls (id, client_id, user_id, prospect_name, prospect_email, prospect_phone, call_type, status, outcome, loss_reason_id, notes, call_duration, scheduled_at, completed_at) VALUES
    ('850e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440006', 'Grace Lee', 'grace@example.com', '+1-555-2001', 'outbound', 'completed', 'won', NULL, 'Technical discussion went well', 2400, '2024-09-20 13:00:00+00', '2024-09-20 13:40:00+00'),
    ('850e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440006', 'Henry Chen', 'henry@example.com', '+1-555-2002', 'inbound', 'completed', 'lost', '750e8400-e29b-41d4-a716-446655440006', 'Could not meet their technical requirements', 1800, '2024-09-21 10:00:00+00', '2024-09-21 10:30:00+00');

-- Marketing Pro Calls
INSERT INTO calls (id, client_id, user_id, prospect_name, prospect_email, prospect_phone, call_type, status, outcome, loss_reason_id, notes, call_duration, scheduled_at, completed_at) VALUES
    ('850e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440008', 'Iris Wang', 'iris@example.com', '+1-555-3001', 'outbound', 'completed', 'won', NULL, 'Marketing strategy aligned perfectly', 2700, '2024-09-22 14:00:00+00', '2024-09-22 14:45:00+00'),
    ('850e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440008', 'Jack Thompson', 'jack@example.com', '+1-555-3002', 'inbound', 'completed', 'lost', '750e8400-e29b-41d4-a716-446655440008', 'Decided to handle marketing in-house', 1200, '2024-09-23 11:00:00+00', '2024-09-23 11:20:00+00');

-- =====================================================
-- 5. INSERT AUDIT LOGS (SAMPLE)
-- =====================================================

-- Sample audit logs for user creation
INSERT INTO audit_logs (id, client_id, user_id, table_name, record_id, action, new_values, ip_address, user_agent) VALUES
    ('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'users', '650e8400-e29b-41d4-a716-446655440003', 'INSERT', '{"name": "John Doe", "email": "sales1@propaganda.com", "role": "sales"}', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
    ('950e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'users', '650e8400-e29b-41d4-a716-446655440004', 'INSERT', '{"name": "Jane Smith", "email": "sales2@propaganda.com", "role": "sales"}', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');

-- Sample audit logs for call creation
INSERT INTO audit_logs (id, client_id, user_id, table_name, record_id, action, new_values, ip_address, user_agent) VALUES
    ('950e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 'calls', '850e8400-e29b-41d4-a716-446655440001', 'INSERT', '{"prospect_name": "Alice Johnson", "call_type": "outbound", "status": "completed", "outcome": "won"}', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
    ('950e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', 'calls', '850e8400-e29b-41d4-a716-446655440002', 'INSERT', '{"prospect_name": "Bob Wilson", "call_type": "inbound", "status": "completed", "outcome": "lost"}', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

-- =====================================================
-- 6. VERIFY DATA INSERTION
-- =====================================================

-- Check record counts
SELECT 'clients' as table_name, COUNT(*) as record_count FROM clients
UNION ALL
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'loss_reasons' as table_name, COUNT(*) as record_count FROM loss_reasons
UNION ALL
SELECT 'calls' as table_name, COUNT(*) as record_count FROM calls
UNION ALL
SELECT 'audit_logs' as table_name, COUNT(*) as record_count FROM audit_logs;

-- Check multi-tenant data segregation
SELECT 
    c.name as client_name,
    COUNT(DISTINCT u.id) as user_count,
    COUNT(DISTINCT lr.id) as loss_reason_count,
    COUNT(DISTINCT cl.id) as call_count
FROM clients c
LEFT JOIN users u ON c.id = u.client_id
LEFT JOIN loss_reasons lr ON c.id = lr.client_id
LEFT JOIN calls cl ON c.id = cl.client_id
GROUP BY c.id, c.name
ORDER BY c.name;

-- =====================================================
-- 7. SAMPLE QUERIES FOR TESTING
-- =====================================================

-- Show Rate calculation for Propaganda Inc
SELECT 
    'Propaganda Inc' as client,
    COUNT(*) as total_calls,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_calls,
    ROUND(
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL * 100, 2
    ) as show_rate_percentage
FROM calls 
WHERE client_id = '550e8400-e29b-41d4-a716-446655440001';

-- Close Rate calculation for Propaganda Inc
SELECT 
    'Propaganda Inc' as client,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_calls,
    COUNT(CASE WHEN outcome = 'won' THEN 1 END) as won_calls,
    ROUND(
        COUNT(CASE WHEN outcome = 'won' THEN 1 END)::DECIMAL / 
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::DECIMAL * 100, 2
    ) as close_rate_percentage
FROM calls 
WHERE client_id = '550e8400-e29b-41d4-a716-446655440001';

-- Loss reasons breakdown for Propaganda Inc
SELECT 
    lr.name as loss_reason,
    COUNT(*) as count,
    ROUND(COUNT(*)::DECIMAL / (SELECT COUNT(*) FROM calls WHERE client_id = '550e8400-e29b-41d4-a716-446655440001' AND outcome = 'lost')::DECIMAL * 100, 1) as percentage
FROM calls c
JOIN loss_reasons lr ON c.loss_reason_id = lr.id
WHERE c.client_id = '550e8400-e29b-41d4-a716-446655440001' 
    AND c.outcome = 'lost'
GROUP BY lr.id, lr.name
ORDER BY count DESC;
