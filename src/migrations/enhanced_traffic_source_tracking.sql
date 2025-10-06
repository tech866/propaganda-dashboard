-- =====================================================
-- Enhanced Traffic Source Tracking Migration
-- Task 22.3: Update Calls Database Schema for Source-Based Analytics
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ADD TRAFFIC SOURCE AND CRM STAGE FIELDS
-- =====================================================

-- Add traffic source field with proper constraints
ALTER TABLE calls ADD COLUMN IF NOT EXISTS traffic_source VARCHAR(50) DEFAULT 'organic' CHECK (traffic_source IN ('organic', 'meta'));

-- Add CRM stage field with proper constraints and default
ALTER TABLE calls ADD COLUMN IF NOT EXISTS crm_stage VARCHAR(50) DEFAULT 'scheduled' CHECK (crm_stage IN (
    'scheduled', 'in_progress', 'completed', 'no_show', 'closed_won', 'lost'
));

-- =====================================================
-- 2. CREATE COMPREHENSIVE INDEXES FOR ANALYTICS
-- =====================================================

-- Basic indexes for new fields
CREATE INDEX IF NOT EXISTS idx_calls_traffic_source ON calls(traffic_source);
CREATE INDEX IF NOT EXISTS idx_calls_crm_stage ON calls(crm_stage);

-- Composite indexes for common analytics queries
CREATE INDEX IF NOT EXISTS idx_calls_traffic_source_stage ON calls(traffic_source, crm_stage);
CREATE INDEX IF NOT EXISTS idx_calls_workspace_traffic_source ON calls(workspace_id, traffic_source);
CREATE INDEX IF NOT EXISTS idx_calls_workspace_crm_stage ON calls(workspace_id, crm_stage);

-- Analytics-specific composite indexes
CREATE INDEX IF NOT EXISTS idx_calls_workspace_traffic_stage ON calls(workspace_id, traffic_source, crm_stage);
CREATE INDEX IF NOT EXISTS idx_calls_created_traffic_source ON calls(created_at, traffic_source);
CREATE INDEX IF NOT EXISTS idx_calls_workspace_created_traffic ON calls(workspace_id, created_at, traffic_source);

-- =====================================================
-- 3. UPDATE EXISTING DATA WITH INTELLIGENT DEFAULTS
-- =====================================================

-- Set default CRM stage for existing calls based on current status
UPDATE calls 
SET crm_stage = CASE 
    WHEN status = 'completed' AND outcome = 'won' THEN 'closed_won'
    WHEN status = 'completed' AND outcome = 'lost' THEN 'lost'
    WHEN status = 'completed' AND outcome = 'tbd' THEN 'completed'
    WHEN status = 'no-show' THEN 'no_show'
    WHEN status = 'rescheduled' THEN 'scheduled'
    ELSE 'scheduled'
END
WHERE crm_stage IS NULL OR crm_stage = 'scheduled';

-- Set default traffic source based on existing source_of_set_appointment
-- Using the classification logic from TrafficSourceService
UPDATE calls 
SET traffic_source = CASE 
    WHEN source_of_set_appointment = 'sdr_booked_call' THEN 'meta'
    WHEN source_of_set_appointment = 'non_sdr_booked_call' THEN 'organic'
    WHEN source_of_set_appointment = 'vsl' THEN 'meta'
    WHEN source_of_set_appointment = 'email' THEN 'organic'
    WHEN source_of_set_appointment = 'self_booking' THEN 'organic'
    ELSE 'organic'
END
WHERE traffic_source IS NULL;

-- =====================================================
-- 4. ADD COMPREHENSIVE COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN calls.traffic_source IS 'Traffic source classification: organic (website, referrals, direct) or meta (Facebook/Instagram ads)';
COMMENT ON COLUMN calls.crm_stage IS 'CRM pipeline stage: scheduled, in_progress, completed, no_show, closed_won, lost';

-- =====================================================
-- 5. ENHANCED RLS POLICIES FOR NEW FIELDS
-- =====================================================

-- Ensure existing RLS policies cover the new fields
-- The calls table policies should already include these fields, but let's verify

-- Check if RLS is enabled on calls table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'calls' AND relrowsecurity = true
    ) THEN
        ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create or update RLS policies to ensure new fields are properly secured
-- These policies should already exist from the workspace management migration

-- Policy for viewing calls in user's workspaces
DROP POLICY IF EXISTS "Users can view calls in their workspaces" ON calls;
CREATE POLICY "Users can view calls in their workspaces" ON calls
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
            AND wm.status = 'active'
        )
    );

-- Policy for inserting calls in user's workspaces
DROP POLICY IF EXISTS "Users can insert calls in their workspaces" ON calls;
CREATE POLICY "Users can insert calls in their workspaces" ON calls
    FOR INSERT WITH CHECK (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
            AND wm.status = 'active'
        )
    );

-- Policy for updating calls in user's workspaces
DROP POLICY IF EXISTS "Users can update calls in their workspaces" ON calls;
CREATE POLICY "Users can update calls in their workspaces" ON calls
    FOR UPDATE USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
            AND wm.status = 'active'
        )
    );

-- Policy for deleting calls in user's workspaces
DROP POLICY IF EXISTS "Users can delete calls in their workspaces" ON calls;
CREATE POLICY "Users can delete calls in their workspaces" ON calls
    FOR DELETE USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
            AND wm.status = 'active'
        )
    );

-- =====================================================
-- 6. CREATE ANALYTICS VIEW FOR PERFORMANCE
-- =====================================================

-- Create a materialized view for analytics queries
CREATE MATERIALIZED VIEW IF NOT EXISTS call_analytics_summary AS
SELECT 
    workspace_id,
    traffic_source,
    crm_stage,
    COUNT(*) as call_count,
    COUNT(CASE WHEN crm_stage IN ('completed', 'no_show', 'closed_won', 'lost') THEN 1 END) as completed_calls,
    COUNT(CASE WHEN crm_stage = 'closed_won' THEN 1 END) as closed_won_calls,
    ROUND(
        COUNT(CASE WHEN crm_stage IN ('completed', 'no_show', 'closed_won', 'lost') THEN 1 END) * 100.0 / COUNT(*), 
        2
    ) as show_rate,
    ROUND(
        COUNT(CASE WHEN crm_stage = 'closed_won' THEN 1 END) * 100.0 / 
        NULLIF(COUNT(CASE WHEN crm_stage IN ('completed', 'no_show', 'closed_won', 'lost') THEN 1 END), 0), 
        2
    ) as close_rate,
    DATE_TRUNC('day', created_at) as date
FROM calls
WHERE workspace_id IS NOT NULL
GROUP BY workspace_id, traffic_source, crm_stage, DATE_TRUNC('day', created_at);

-- Create index on the materialized view
CREATE INDEX IF NOT EXISTS idx_call_analytics_workspace_traffic ON call_analytics_summary(workspace_id, traffic_source);
CREATE INDEX IF NOT EXISTS idx_call_analytics_workspace_date ON call_analytics_summary(workspace_id, date);

-- =====================================================
-- 7. CREATE REFRESH FUNCTION FOR ANALYTICS VIEW
-- =====================================================

-- Function to refresh the analytics materialized view
CREATE OR REPLACE FUNCTION refresh_call_analytics_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY call_analytics_summary;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. CREATE TRIGGER TO AUTO-REFRESH ANALYTICS
-- =====================================================

-- Function to refresh analytics when calls are updated
CREATE OR REPLACE FUNCTION trigger_refresh_call_analytics()
RETURNS trigger AS $$
BEGIN
    -- Refresh analytics view when calls are modified
    PERFORM refresh_call_analytics_summary();
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for analytics refresh
DROP TRIGGER IF EXISTS calls_analytics_refresh_trigger ON calls;
CREATE TRIGGER calls_analytics_refresh_trigger
    AFTER INSERT OR UPDATE OR DELETE ON calls
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_refresh_call_analytics();

-- =====================================================
-- 9. VERIFICATION QUERIES
-- =====================================================

-- Verify the migration was successful
DO $$
DECLARE
    traffic_source_exists boolean;
    crm_stage_exists boolean;
    indexes_exist boolean;
BEGIN
    -- Check if new columns exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calls' AND column_name = 'traffic_source'
    ) INTO traffic_source_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calls' AND column_name = 'crm_stage'
    ) INTO crm_stage_exists;
    
    -- Check if indexes exist
    SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'calls' AND indexname = 'idx_calls_traffic_source'
    ) INTO indexes_exist;
    
    -- Report results
    RAISE NOTICE 'Migration Status:';
    RAISE NOTICE '  traffic_source column: %', CASE WHEN traffic_source_exists THEN 'EXISTS' ELSE 'MISSING' END;
    RAISE NOTICE '  crm_stage column: %', CASE WHEN crm_stage_exists THEN 'EXISTS' ELSE 'MISSING' END;
    RAISE NOTICE '  indexes created: %', CASE WHEN indexes_exist THEN 'EXISTS' ELSE 'MISSING' END;
    
    IF traffic_source_exists AND crm_stage_exists AND indexes_exist THEN
        RAISE NOTICE '✅ Migration completed successfully!';
    ELSE
        RAISE NOTICE '❌ Migration incomplete - some components missing';
    END IF;
END $$;
