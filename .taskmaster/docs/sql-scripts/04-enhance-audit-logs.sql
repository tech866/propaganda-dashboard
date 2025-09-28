-- =====================================================
-- Enhanced Audit Logs Table Schema
-- Propaganda Dashboard - Audit Logging Enhancement
-- =====================================================

-- Add additional columns to the existing audit_logs table
-- for comprehensive audit logging

-- Add session tracking
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS session_id VARCHAR(255);

-- Add request context
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS endpoint VARCHAR(500);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS http_method VARCHAR(10);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS status_code INTEGER;

-- Add performance metrics
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS operation_duration_ms INTEGER;

-- Add error tracking
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add additional metadata
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_client_id ON audit_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_session_id ON audit_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_endpoint ON audit_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status_code ON audit_logs(status_code);

-- Add composite indexes for common queries
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
