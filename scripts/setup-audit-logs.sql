-- =====================================================
-- Setup Enhanced Audit Logs Table
-- Propaganda Dashboard - Task 10.4
-- =====================================================

-- Connect to the database and run this script to set up the enhanced audit logs table

-- First, ensure the basic audit_logs table exists (from 01-create-tables.sql)
-- If it doesn't exist, create it
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add enhanced columns if they don't exist
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS session_id VARCHAR(255);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS endpoint VARCHAR(500);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS http_method VARCHAR(10);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS status_code INTEGER;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS operation_duration_ms INTEGER;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_client_id ON audit_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_session_id ON audit_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_endpoint ON audit_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status_code ON audit_logs(status_code);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_client_created ON audit_logs(client_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_action ON audit_logs(table_name, action);

-- Add comments for new columns
COMMENT ON COLUMN audit_logs.session_id IS 'User session identifier for tracking user sessions';
COMMENT ON COLUMN audit_logs.endpoint IS 'API endpoint that was accessed';
COMMENT ON COLUMN audit_logs.http_method IS 'HTTP method used (GET, POST, PUT, DELETE, etc.)';
COMMENT ON COLUMN audit_logs.status_code IS 'HTTP response status code';
COMMENT ON COLUMN audit_logs.operation_duration_ms IS 'Time taken for the operation in milliseconds';
COMMENT ON COLUMN audit_logs.error_message IS 'Error message if the operation failed';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context and metadata as JSON';

-- Create a view for easy audit log querying
CREATE OR REPLACE VIEW audit_logs_summary AS
SELECT 
    al.id,
    al.client_id,
    c.name as client_name,
    al.user_id,
    u.name as user_name,
    u.email as user_email,
    u.role as user_role,
    al.table_name,
    al.record_id,
    al.action,
    al.endpoint,
    al.http_method,
    al.status_code,
    al.operation_duration_ms,
    al.error_message,
    al.ip_address,
    al.user_agent,
    al.session_id,
    al.created_at,
    al.metadata
FROM audit_logs al
LEFT JOIN clients c ON al.client_id = c.id
LEFT JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC;

-- Add comment for the view
COMMENT ON VIEW audit_logs_summary IS 'Comprehensive view of audit logs with user and client information';

-- Create a function to clean up old audit logs (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(retention_days INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add comment for the cleanup function
COMMENT ON FUNCTION cleanup_old_audit_logs(INTEGER) IS 'Clean up audit logs older than specified retention period (default 365 days)';

-- Create a function to get audit log statistics
CREATE OR REPLACE FUNCTION get_audit_log_stats(
    p_client_id UUID DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_logs BIGINT,
    logs_by_action JSONB,
    logs_by_table JSONB,
    logs_by_user JSONB,
    avg_duration_ms NUMERIC,
    error_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH filtered_logs AS (
        SELECT al.*
        FROM audit_logs al
        WHERE (p_client_id IS NULL OR al.client_id = p_client_id)
          AND (p_user_id IS NULL OR al.user_id = p_user_id)
          AND al.created_at >= CURRENT_TIMESTAMP - INTERVAL '1 day' * p_days
    ),
    action_stats AS (
        SELECT jsonb_object_agg(action, action_count) as action_data
        FROM (
            SELECT action, COUNT(*) as action_count
            FROM filtered_logs
            GROUP BY action
        ) t
    ),
    table_stats AS (
        SELECT jsonb_object_agg(table_name, table_count) as table_data
        FROM (
            SELECT table_name, COUNT(*) as table_count
            FROM filtered_logs
            GROUP BY table_name
        ) t
    ),
    user_stats AS (
        SELECT jsonb_object_agg(user_name, user_count) as user_data
        FROM (
            SELECT COALESCE(u.name, 'Unknown') as user_name, COUNT(*) as user_count
            FROM filtered_logs fl
            LEFT JOIN users u ON fl.user_id = u.id
            GROUP BY u.name
        ) t
    )
    SELECT 
        (SELECT COUNT(*) FROM filtered_logs) as total_logs,
        COALESCE((SELECT action_data FROM action_stats), '{}'::jsonb) as logs_by_action,
        COALESCE((SELECT table_data FROM table_stats), '{}'::jsonb) as logs_by_table,
        COALESCE((SELECT user_data FROM user_stats), '{}'::jsonb) as logs_by_user,
        (SELECT AVG(operation_duration_ms) FROM filtered_logs) as avg_duration_ms,
        (SELECT COUNT(*) FROM filtered_logs WHERE error_message IS NOT NULL) as error_count;
END;
$$ LANGUAGE plpgsql;

-- Add comment for the stats function
COMMENT ON FUNCTION get_audit_log_stats(UUID, UUID, INTEGER) IS 'Get audit log statistics for a client, user, or time period';

-- Insert some sample audit log data for testing
INSERT INTO audit_logs (
    client_id, user_id, table_name, record_id, action, 
    endpoint, http_method, status_code, operation_duration_ms,
    ip_address, user_agent, session_id, metadata
) VALUES 
(
    (SELECT id FROM clients LIMIT 1),
    (SELECT id FROM users LIMIT 1),
    'calls',
    uuid_generate_v4(),
    'INSERT',
    '/api/calls',
    'POST',
    201,
    150,
    '127.0.0.1',
    'Mozilla/5.0 (Test Browser)',
    'test-session-123',
    '{"test": true, "source": "setup_script"}'
),
(
    (SELECT id FROM clients LIMIT 1),
    (SELECT id FROM users LIMIT 1),
    'users',
    uuid_generate_v4(),
    'UPDATE',
    '/api/users/123',
    'PUT',
    200,
    89,
    '127.0.0.1',
    'Mozilla/5.0 (Test Browser)',
    'test-session-123',
    '{"test": true, "source": "setup_script"}'
);

-- Verify the setup
SELECT 'Audit logs table setup completed successfully!' as status;
SELECT COUNT(*) as total_audit_logs FROM audit_logs;
SELECT COUNT(*) as enhanced_columns FROM information_schema.columns 
WHERE table_name = 'audit_logs' AND column_name IN ('session_id', 'endpoint', 'http_method', 'status_code', 'operation_duration_ms', 'error_message', 'metadata');
