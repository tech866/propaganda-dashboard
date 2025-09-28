-- =====================================================
-- Propaganda Dashboard Database Schema
-- Index Creation Script for Performance Optimization
-- =====================================================

-- =====================================================
-- CLIENTS TABLE INDEXES
-- =====================================================

-- Index on email for login lookups
CREATE INDEX idx_clients_email ON clients(email);

-- Index on active status for filtering
CREATE INDEX idx_clients_active ON clients(is_active);

-- Composite index for active clients
CREATE INDEX idx_clients_active_email ON clients(is_active, email);

-- =====================================================
-- USERS TABLE INDEXES
-- =====================================================

-- Index on client_id for multi-tenant queries
CREATE INDEX idx_users_client_id ON users(client_id);

-- Composite index on client_id and email for login
CREATE INDEX idx_users_client_email ON users(client_id, email);

-- Index on role for role-based queries
CREATE INDEX idx_users_role ON users(client_id, role);

-- Index on active status
CREATE INDEX idx_users_active ON users(client_id, is_active);

-- Composite index for active users by role
CREATE INDEX idx_users_active_role ON users(client_id, is_active, role);

-- Index on last_login for user activity tracking
CREATE INDEX idx_users_last_login ON users(client_id, last_login);

-- =====================================================
-- LOSS REASONS TABLE INDEXES
-- =====================================================

-- Index on client_id for multi-tenant queries
CREATE INDEX idx_loss_reasons_client_id ON loss_reasons(client_id);

-- Index on active status
CREATE INDEX idx_loss_reasons_active ON loss_reasons(client_id, is_active);

-- Index on name for lookups
CREATE INDEX idx_loss_reasons_name ON loss_reasons(client_id, name);

-- =====================================================
-- CALLS TABLE INDEXES
-- =====================================================

-- Index on client_id for multi-tenant queries
CREATE INDEX idx_calls_client_id ON calls(client_id);

-- Index on user_id for user-specific queries
CREATE INDEX idx_calls_user_id ON calls(client_id, user_id);

-- Index on status for filtering
CREATE INDEX idx_calls_status ON calls(client_id, status);

-- Index on outcome for filtering
CREATE INDEX idx_calls_outcome ON calls(client_id, outcome);

-- Index on call_type for filtering
CREATE INDEX idx_calls_type ON calls(client_id, call_type);

-- Index on created_at for date range queries
CREATE INDEX idx_calls_created_at ON calls(client_id, created_at);

-- Index on completed_at for date range queries
CREATE INDEX idx_calls_completed_at ON calls(client_id, completed_at);

-- Index on scheduled_at for scheduling queries
CREATE INDEX idx_calls_scheduled_at ON calls(client_id, scheduled_at);

-- Composite index for user calls by date
CREATE INDEX idx_calls_user_created ON calls(client_id, user_id, created_at);

-- Composite index for calls by status and outcome
CREATE INDEX idx_calls_status_outcome ON calls(client_id, status, outcome);

-- Index on loss_reason_id for loss reason queries
CREATE INDEX idx_calls_loss_reason ON calls(client_id, loss_reason_id);

-- Composite index for metrics calculations (Show Rate, Close Rate)
CREATE INDEX idx_calls_metrics ON calls(client_id, status, outcome, created_at);

-- =====================================================
-- AUDIT LOGS TABLE INDEXES
-- =====================================================

-- Index on client_id for multi-tenant queries
CREATE INDEX idx_audit_logs_client_id ON audit_logs(client_id);

-- Index on user_id for user-specific audit queries
CREATE INDEX idx_audit_logs_user_id ON audit_logs(client_id, user_id);

-- Index on table_name for table-specific audit queries
CREATE INDEX idx_audit_logs_table_name ON audit_logs(client_id, table_name);

-- Index on created_at for date range queries
CREATE INDEX idx_audit_logs_created_at ON audit_logs(client_id, created_at);

-- Index on action for action-specific queries
CREATE INDEX idx_audit_logs_action ON audit_logs(client_id, action);

-- Composite index for user activity tracking
CREATE INDEX idx_audit_logs_user_created ON audit_logs(client_id, user_id, created_at);

-- Composite index for table-specific audit queries
CREATE INDEX idx_audit_logs_table_created ON audit_logs(client_id, table_name, created_at);

-- Index on record_id for record-specific audit queries
CREATE INDEX idx_audit_logs_record_id ON audit_logs(client_id, table_name, record_id);

-- =====================================================
-- PARTIAL INDEXES FOR PERFORMANCE
-- =====================================================

-- Partial index for active clients only
CREATE INDEX idx_clients_active_partial ON clients(email) WHERE is_active = true;

-- Partial index for active users only
CREATE INDEX idx_users_active_partial ON users(client_id, email) WHERE is_active = true;

-- Partial index for completed calls only
CREATE INDEX idx_calls_completed_partial ON calls(client_id, user_id, completed_at) WHERE status = 'completed';

-- Partial index for won calls only
CREATE INDEX idx_calls_won_partial ON calls(client_id, user_id, completed_at) WHERE outcome = 'won';

-- Partial index for lost calls only
CREATE INDEX idx_calls_lost_partial ON calls(client_id, user_id, completed_at) WHERE outcome = 'lost';

-- =====================================================
-- COMMENTS ON INDEXES
-- =====================================================

COMMENT ON INDEX idx_clients_email IS 'Fast lookup for client login by email';
COMMENT ON INDEX idx_clients_active IS 'Filter active clients efficiently';

COMMENT ON INDEX idx_users_client_email IS 'Fast user login lookup within client context';
COMMENT ON INDEX idx_users_role IS 'Efficient role-based queries within client';
COMMENT ON INDEX idx_users_active_role IS 'Active users filtered by role within client';

COMMENT ON INDEX idx_calls_user_created IS 'User call history ordered by date';
COMMENT ON INDEX idx_calls_metrics IS 'Optimized for Show Rate and Close Rate calculations';
COMMENT ON INDEX idx_calls_status_outcome IS 'Efficient filtering by call status and outcome';

COMMENT ON INDEX idx_audit_logs_user_created IS 'User activity timeline';
COMMENT ON INDEX idx_audit_logs_table_created IS 'Table-specific audit history';
COMMENT ON INDEX idx_audit_logs_record_id IS 'Record-specific audit trail';

-- =====================================================
-- INDEX USAGE STATISTICS QUERY
-- =====================================================

-- Query to check index usage (run after data is loaded):
/*
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_tup_read DESC;
*/
