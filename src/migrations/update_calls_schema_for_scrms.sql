-- =====================================================
-- Update Calls Schema for SCRM Requirements
-- Adds all required fields for the comprehensive SCRM call logging form
-- Based on user requirements for prospect tracking and source management
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ADD NEW COLUMNS TO EXISTING CALLS TABLE
-- =====================================================

-- Split prospect name into first and last name
ALTER TABLE calls ADD COLUMN IF NOT EXISTS prospect_first_name VARCHAR(255);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS prospect_last_name VARCHAR(255);

-- Add company name (pre-selected from workspace)
ALTER TABLE calls ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);

-- Add source of set appointment with conditional logic
ALTER TABLE calls ADD COLUMN IF NOT EXISTS source_of_set_appointment VARCHAR(50) CHECK (source_of_set_appointment IN ('sdr_booked_call', 'non_sdr_booked_call'));

-- Add SDR-specific fields
ALTER TABLE calls ADD COLUMN IF NOT EXISTS sdr_type VARCHAR(50) CHECK (sdr_type IN ('dialer', 'dm_setter'));
ALTER TABLE calls ADD COLUMN IF NOT EXISTS sdr_first_name VARCHAR(255);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS sdr_last_name VARCHAR(255);

-- Add non-SDR specific fields
ALTER TABLE calls ADD COLUMN IF NOT EXISTS non_sdr_source VARCHAR(50) CHECK (non_sdr_source IN ('vsl_booking', 'regular_booking'));

-- Update call outcome with SCRM stages
ALTER TABLE calls ADD COLUMN IF NOT EXISTS scrms_outcome VARCHAR(50) DEFAULT 'call_booked' CHECK (scrms_outcome IN (
    'call_booked', 'no_show', 'no_close', 'cancelled', 'disqualified', 
    'rescheduled', 'payment_plan', 'deposit', 'closed_paid_in_full', 'follow_up_call_scheduled'
));

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for new fields
CREATE INDEX IF NOT EXISTS idx_calls_prospect_first_name ON calls(prospect_first_name);
CREATE INDEX IF NOT EXISTS idx_calls_prospect_last_name ON calls(prospect_last_name);
CREATE INDEX IF NOT EXISTS idx_calls_company_name ON calls(company_name);
CREATE INDEX IF NOT EXISTS idx_calls_source_of_set_appointment ON calls(source_of_set_appointment);
CREATE INDEX IF NOT EXISTS idx_calls_sdr_type ON calls(sdr_type);
CREATE INDEX IF NOT EXISTS idx_calls_sdr_name ON calls(sdr_first_name, sdr_last_name);
CREATE INDEX IF NOT EXISTS idx_calls_non_sdr_source ON calls(non_sdr_source);
CREATE INDEX IF NOT EXISTS idx_calls_scrms_outcome ON calls(scrms_outcome);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_calls_source_outcome ON calls(source_of_set_appointment, scrms_outcome);
CREATE INDEX IF NOT EXISTS idx_calls_company_source ON calls(company_name, source_of_set_appointment);

-- =====================================================
-- 3. UPDATE EXISTING DATA (if any)
-- =====================================================

-- Split existing prospect_name into first and last name
UPDATE calls 
SET 
    prospect_first_name = SPLIT_PART(prospect_name, ' ', 1),
    prospect_last_name = CASE 
        WHEN POSITION(' ' IN prospect_name) > 0 
        THEN SUBSTRING(prospect_name FROM POSITION(' ' IN prospect_name) + 1)
        ELSE ''
    END
WHERE prospect_name IS NOT NULL AND prospect_first_name IS NULL;

-- Set default company name (this will be updated by the application based on workspace)
UPDATE calls 
SET company_name = 'Default Company'
WHERE company_name IS NULL;

-- Set default SCRMS outcome
UPDATE calls 
SET scrms_outcome = 'call_booked'
WHERE scrms_outcome IS NULL;

-- =====================================================
-- 4. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN calls.prospect_first_name IS 'First name of the prospect';
COMMENT ON COLUMN calls.prospect_last_name IS 'Last name of the prospect';
COMMENT ON COLUMN calls.company_name IS 'Company name (pre-selected from workspace)';
COMMENT ON COLUMN calls.source_of_set_appointment IS 'Source of set appointment: sdr_booked_call or non_sdr_booked_call';
COMMENT ON COLUMN calls.sdr_type IS 'Type of SDR: dialer or dm_setter (only for sdr_booked_call)';
COMMENT ON COLUMN calls.sdr_first_name IS 'First name of SDR rep (only for sdr_booked_call)';
COMMENT ON COLUMN calls.sdr_last_name IS 'Last name of SDR rep (only for sdr_booked_call)';
COMMENT ON COLUMN calls.non_sdr_source IS 'Source for non-SDR calls: vsl_booking or regular_booking';
COMMENT ON COLUMN calls.scrms_outcome IS 'SCRM stage outcome with default call_booked';

-- =====================================================
-- 5. CREATE TRIGGER FOR UPDATED_AT
-- =====================================================

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_calls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS trigger_update_calls_updated_at ON calls;
CREATE TRIGGER trigger_update_calls_updated_at
    BEFORE UPDATE ON calls
    FOR EACH ROW
    EXECUTE FUNCTION update_calls_updated_at();
