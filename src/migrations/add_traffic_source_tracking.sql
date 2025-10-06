-- =====================================================
-- Add Traffic Source Tracking for CRM Analytics
-- Task 22: Implement Traffic Source Tracking and UTM Parameter Management
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ADD TRAFFIC SOURCE FIELD TO CALLS TABLE
-- =====================================================

-- Add traffic source field to differentiate between organic and meta sources
ALTER TABLE calls ADD COLUMN IF NOT EXISTS traffic_source VARCHAR(50) CHECK (traffic_source IN ('organic', 'meta'));

-- Add CRM stage field for kanban board management
ALTER TABLE calls ADD COLUMN IF NOT EXISTS crm_stage VARCHAR(50) DEFAULT 'scheduled' CHECK (crm_stage IN (
    'scheduled', 'in_progress', 'completed', 'no_show', 'closed_won', 'lost'
));

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for new fields
CREATE INDEX IF NOT EXISTS idx_calls_traffic_source ON calls(traffic_source);
CREATE INDEX IF NOT EXISTS idx_calls_crm_stage ON calls(crm_stage);

-- Composite indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_calls_traffic_source_stage ON calls(traffic_source, crm_stage);
CREATE INDEX IF NOT EXISTS idx_calls_workspace_traffic_source ON calls(workspace_id, traffic_source);
CREATE INDEX IF NOT EXISTS idx_calls_workspace_crm_stage ON calls(workspace_id, crm_stage);

-- =====================================================
-- 3. UPDATE EXISTING DATA
-- =====================================================

-- Set default CRM stage for existing calls
UPDATE calls 
SET crm_stage = CASE 
    WHEN status = 'completed' THEN 'completed'
    WHEN status = 'no-show' THEN 'no_show'
    WHEN status = 'rescheduled' THEN 'scheduled'
    ELSE 'scheduled'
END
WHERE crm_stage IS NULL;

-- Set default traffic source based on existing source_of_set_appointment
-- This is a best guess - users will need to update manually
UPDATE calls 
SET traffic_source = CASE 
    WHEN source_of_set_appointment = 'sdr_booked_call' THEN 'meta'
    WHEN source_of_set_appointment = 'non_sdr_booked_call' THEN 'organic'
    ELSE 'organic'
END
WHERE traffic_source IS NULL;

-- =====================================================
-- 4. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN calls.traffic_source IS 'Traffic source: organic or meta (paid ads)';
COMMENT ON COLUMN calls.crm_stage IS 'CRM stage for kanban board: scheduled, in_progress, completed, no_show, closed_won, lost';

-- =====================================================
-- 5. UPDATE RLS POLICIES (if needed)
-- =====================================================

-- Ensure RLS policies include new fields
-- The existing policies should already cover these fields since they're on the calls table
