-- =====================================================
-- Advanced Sales Metrics Tracking System Implementation
-- Task 24.1: Design and Implement Database Schema for Advanced Sales Metrics
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CREATE SALES METRICS CONFIGURATION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS sales_metrics_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('count', 'rate', 'currency', 'percentage')),
    calculation_formula TEXT NOT NULL,
    kanban_stage_mapping JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workspace_id, metric_name)
);

-- =====================================================
-- 2. CREATE KANBAN STAGE TRANSITIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS kanban_stage_transitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    from_stage VARCHAR(50),
    to_stage VARCHAR(50) NOT NULL,
    transition_reason VARCHAR(255),
    transition_metadata JSONB DEFAULT '{}',
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transitioned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. CREATE SALES METRICS SNAPSHOTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS sales_metrics_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    traffic_source VARCHAR(50) CHECK (traffic_source IN ('organic', 'meta', 'all')),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    calculation_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workspace_id, snapshot_date, metric_name, traffic_source, user_id, client_id)
);

-- =====================================================
-- 4. EXTEND CALLS TABLE FOR ADVANCED METRICS
-- =====================================================

-- Add cash collected field
ALTER TABLE calls ADD COLUMN IF NOT EXISTS cash_collected DECIMAL(10,2) DEFAULT 0.00;

-- Add traffic source field (if not already exists)
ALTER TABLE calls ADD COLUMN IF NOT EXISTS traffic_source VARCHAR(50) DEFAULT 'organic' CHECK (traffic_source IN ('organic', 'meta'));

-- Add call outcome tracking fields
ALTER TABLE calls ADD COLUMN IF NOT EXISTS call_outcome VARCHAR(50) CHECK (call_outcome IN (
    'scheduled', 'showed', 'no_show', 'cancelled', 'rescheduled', 
    'closed_won', 'closed_lost', 'disqualified', 'follow_up_scheduled'
));

-- Add call duration tracking
ALTER TABLE calls ADD COLUMN IF NOT EXISTS call_duration_minutes INTEGER DEFAULT 0;

-- Add call quality score
ALTER TABLE calls ADD COLUMN IF NOT EXISTS call_quality_score INTEGER CHECK (call_quality_score >= 1 AND call_quality_score <= 10);

-- Add notes for call outcome
ALTER TABLE calls ADD COLUMN IF NOT EXISTS outcome_notes TEXT;

-- Add scheduled call time (if not already exists)
ALTER TABLE calls ADD COLUMN IF NOT EXISTS scheduled_call_time TIMESTAMP WITH TIME ZONE;

-- Add actual call time
ALTER TABLE calls ADD COLUMN IF NOT EXISTS actual_call_time TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- 5. CREATE TRAFFIC SOURCE ATTRIBUTION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS traffic_source_attributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
    traffic_source VARCHAR(50) NOT NULL CHECK (traffic_source IN ('organic', 'meta')),
    source_details JSONB DEFAULT '{}',
    attribution_confidence DECIMAL(3,2) DEFAULT 1.00 CHECK (attribution_confidence >= 0.00 AND attribution_confidence <= 1.00),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(call_id)
);

-- =====================================================
-- 6. CREATE PERFORMANCE INDEXES
-- =====================================================

-- Sales metrics config indexes
CREATE INDEX IF NOT EXISTS idx_sales_metrics_config_workspace_id ON sales_metrics_config(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sales_metrics_config_metric_name ON sales_metrics_config(metric_name);
CREATE INDEX IF NOT EXISTS idx_sales_metrics_config_is_active ON sales_metrics_config(is_active);

-- Kanban stage transitions indexes
CREATE INDEX IF NOT EXISTS idx_kanban_transitions_workspace_id ON kanban_stage_transitions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_kanban_transitions_call_id ON kanban_stage_transitions(call_id);
CREATE INDEX IF NOT EXISTS idx_kanban_transitions_to_stage ON kanban_stage_transitions(to_stage);
CREATE INDEX IF NOT EXISTS idx_kanban_transitions_user_id ON kanban_stage_transitions(user_id);
CREATE INDEX IF NOT EXISTS idx_kanban_transitions_transitioned_at ON kanban_stage_transitions(transitioned_at);
CREATE INDEX IF NOT EXISTS idx_kanban_transitions_workspace_date ON kanban_stage_transitions(workspace_id, transitioned_at);

-- Sales metrics snapshots indexes
CREATE INDEX IF NOT EXISTS idx_sales_metrics_snapshots_workspace_id ON sales_metrics_snapshots(workspace_id);
CREATE INDEX IF NOT EXISTS idx_sales_metrics_snapshots_snapshot_date ON sales_metrics_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_sales_metrics_snapshots_metric_name ON sales_metrics_snapshots(metric_name);
CREATE INDEX IF NOT EXISTS idx_sales_metrics_snapshots_traffic_source ON sales_metrics_snapshots(traffic_source);
CREATE INDEX IF NOT EXISTS idx_sales_metrics_snapshots_user_id ON sales_metrics_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_metrics_snapshots_client_id ON sales_metrics_snapshots(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_metrics_snapshots_workspace_date_metric ON sales_metrics_snapshots(workspace_id, snapshot_date, metric_name);

-- Calls table new field indexes
CREATE INDEX IF NOT EXISTS idx_calls_cash_collected ON calls(cash_collected);
CREATE INDEX IF NOT EXISTS idx_calls_traffic_source ON calls(traffic_source);
CREATE INDEX IF NOT EXISTS idx_calls_call_outcome ON calls(call_outcome);
CREATE INDEX IF NOT EXISTS idx_calls_scheduled_call_time ON calls(scheduled_call_time);
CREATE INDEX IF NOT EXISTS idx_calls_actual_call_time ON calls(actual_call_time);
CREATE INDEX IF NOT EXISTS idx_calls_workspace_traffic_source ON calls(workspace_id, traffic_source);
CREATE INDEX IF NOT EXISTS idx_calls_workspace_outcome ON calls(workspace_id, call_outcome);

-- Traffic source attributions indexes
CREATE INDEX IF NOT EXISTS idx_traffic_source_attributions_workspace_id ON traffic_source_attributions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_traffic_source_attributions_call_id ON traffic_source_attributions(call_id);
CREATE INDEX IF NOT EXISTS idx_traffic_source_attributions_traffic_source ON traffic_source_attributions(traffic_source);

-- =====================================================
-- 7. INSERT DEFAULT METRICS CONFIGURATION
-- =====================================================

-- Insert default metrics configuration for each workspace
INSERT INTO sales_metrics_config (workspace_id, metric_name, metric_type, calculation_formula, kanban_stage_mapping)
SELECT 
    w.id as workspace_id,
    metric_name,
    metric_type,
    calculation_formula,
    kanban_stage_mapping::jsonb
FROM workspaces w
CROSS JOIN (
    VALUES 
        ('calls_scheduled', 'count', 'COUNT(*) WHERE call_outcome IS NOT NULL', '{"stages": ["scheduled"]}'),
        ('calls_taken', 'count', 'COUNT(*) WHERE call_outcome IN (''showed'', ''no_show'', ''closed_won'', ''closed_lost'', ''disqualified'')', '{"stages": ["showed", "no_show", "closed_won", "closed_lost", "disqualified"]}'),
        ('calls_cancelled', 'count', 'COUNT(*) WHERE call_outcome = ''cancelled''', '{"stages": ["cancelled"]}'),
        ('calls_rescheduled', 'count', 'COUNT(*) WHERE call_outcome = ''rescheduled''', '{"stages": ["rescheduled"]}'),
        ('calls_showed', 'count', 'COUNT(*) WHERE call_outcome = ''showed''', '{"stages": ["showed"]}'),
        ('calls_closed_won', 'count', 'COUNT(*) WHERE call_outcome = ''closed_won''', '{"stages": ["closed_won"]}'),
        ('calls_disqualified', 'count', 'COUNT(*) WHERE call_outcome = ''disqualified''', '{"stages": ["disqualified"]}'),
        ('cash_collected', 'currency', 'SUM(cash_collected)', '{"stages": ["closed_won"]}'),
        ('show_rate', 'percentage', '(COUNT(*) WHERE call_outcome = ''showed'') / (COUNT(*) WHERE call_outcome IS NOT NULL) * 100', '{"stages": ["showed", "scheduled"]}'),
        ('close_rate', 'percentage', '(COUNT(*) WHERE call_outcome = ''closed_won'') / (COUNT(*) WHERE call_outcome IN (''showed'', ''no_show'', ''closed_won'', ''closed_lost'', ''disqualified'')) * 100', '{"stages": ["closed_won", "showed"]}'),
        ('gross_collected_per_booked_call', 'currency', 'SUM(cash_collected) / COUNT(*) WHERE call_outcome IS NOT NULL', '{"stages": ["closed_won", "scheduled"]}'),
        ('cash_per_live_call', 'currency', 'SUM(cash_collected) / COUNT(*) WHERE call_outcome IN (''showed'', ''no_show'', ''closed_won'', ''closed_lost'', ''disqualified'')', '{"stages": ["closed_won", "showed"]}'),
        ('cash_based_aov', 'currency', 'SUM(cash_collected) / COUNT(*) WHERE call_outcome = ''closed_won''', '{"stages": ["closed_won"]}')
) AS metrics(metric_name, metric_type, calculation_formula, kanban_stage_mapping)
WHERE NOT EXISTS (
    SELECT 1 FROM sales_metrics_config smc 
    WHERE smc.workspace_id = w.id AND smc.metric_name = metrics.metric_name
);

-- =====================================================
-- 8. CREATE TRIGGERS FOR AUTOMATIC METRICS CALCULATION
-- =====================================================

-- Function to log kanban stage transitions
CREATE OR REPLACE FUNCTION log_kanban_stage_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if the stage actually changed
    IF OLD.crm_stage IS DISTINCT FROM NEW.crm_stage THEN
        INSERT INTO kanban_stage_transitions (
            workspace_id,
            call_id,
            from_stage,
            to_stage,
            user_id,
            transitioned_at
        ) VALUES (
            NEW.workspace_id,
            NEW.id,
            OLD.crm_stage,
            NEW.crm_stage,
            NEW.updated_by, -- Assuming we have an updated_by field
            CURRENT_TIMESTAMP
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for calls table
DROP TRIGGER IF EXISTS trigger_log_kanban_stage_transition ON calls;
CREATE TRIGGER trigger_log_kanban_stage_transition
    AFTER UPDATE ON calls
    FOR EACH ROW
    EXECUTE FUNCTION log_kanban_stage_transition();

-- Function to update metrics snapshots
CREATE OR REPLACE FUNCTION update_metrics_snapshot()
RETURNS TRIGGER AS $$
DECLARE
    workspace_uuid UUID;
    snapshot_date DATE;
BEGIN
    -- Get workspace_id from the call
    workspace_uuid := NEW.workspace_id;
    snapshot_date := CURRENT_DATE;
    
    -- Update or insert metrics snapshots for today
    -- This is a simplified version - in production, you'd want more sophisticated logic
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. CREATE ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE sales_metrics_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_stage_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_metrics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_source_attributions ENABLE ROW LEVEL SECURITY;

-- Sales metrics config policies
CREATE POLICY "Users can view metrics config for their workspace" ON sales_metrics_config
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Admins can manage metrics config for their workspace" ON sales_metrics_config
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships 
            WHERE user_id = auth.uid() AND status = 'active' AND role IN ('admin', 'manager')
        )
    );

-- Kanban stage transitions policies
CREATE POLICY "Users can view transitions for their workspace" ON kanban_stage_transitions
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can insert transitions for their workspace" ON kanban_stage_transitions
    FOR INSERT WITH CHECK (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Sales metrics snapshots policies
CREATE POLICY "Users can view snapshots for their workspace" ON sales_metrics_snapshots
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Traffic source attributions policies
CREATE POLICY "Users can view attributions for their workspace" ON traffic_source_attributions
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can manage attributions for their workspace" ON traffic_source_attributions
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- =====================================================
-- 10. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE sales_metrics_config IS 'Configuration for sales metrics calculation and Kanban stage mapping';
COMMENT ON TABLE kanban_stage_transitions IS 'Log of all Kanban stage transitions for metrics calculation';
COMMENT ON TABLE sales_metrics_snapshots IS 'Daily snapshots of calculated sales metrics';
COMMENT ON TABLE traffic_source_attributions IS 'Traffic source attribution data for calls';

COMMENT ON COLUMN calls.cash_collected IS 'Amount of cash collected from this call/deal';
COMMENT ON COLUMN calls.traffic_source IS 'Traffic source: organic or meta (paid)';
COMMENT ON COLUMN calls.call_outcome IS 'Final outcome of the call';
COMMENT ON COLUMN calls.call_duration_minutes IS 'Duration of the call in minutes';
COMMENT ON COLUMN calls.call_quality_score IS 'Quality score of the call (1-10)';
COMMENT ON COLUMN calls.outcome_notes IS 'Notes about the call outcome';
COMMENT ON COLUMN calls.scheduled_call_time IS 'When the call was scheduled for';
COMMENT ON COLUMN calls.actual_call_time IS 'When the call actually took place';

-- =====================================================
-- 11. CREATE VIEWS FOR COMMON METRICS QUERIES
-- =====================================================

-- View for current metrics by workspace
CREATE OR REPLACE VIEW current_workspace_metrics AS
SELECT 
    w.id as workspace_id,
    w.name as workspace_name,
    COUNT(c.id) as total_calls,
    COUNT(CASE WHEN c.call_outcome = 'scheduled' THEN 1 END) as calls_scheduled,
    COUNT(CASE WHEN c.call_outcome IN ('showed', 'no_show', 'closed_won', 'closed_lost', 'disqualified') THEN 1 END) as calls_taken,
    COUNT(CASE WHEN c.call_outcome = 'cancelled' THEN 1 END) as calls_cancelled,
    COUNT(CASE WHEN c.call_outcome = 'rescheduled' THEN 1 END) as calls_rescheduled,
    COUNT(CASE WHEN c.call_outcome = 'showed' THEN 1 END) as calls_showed,
    COUNT(CASE WHEN c.call_outcome = 'closed_won' THEN 1 END) as calls_closed_won,
    COUNT(CASE WHEN c.call_outcome = 'disqualified' THEN 1 END) as calls_disqualified,
    COALESCE(SUM(c.cash_collected), 0) as cash_collected,
    CASE 
        WHEN COUNT(c.id) > 0 THEN 
            ROUND((COUNT(CASE WHEN c.call_outcome = 'showed' THEN 1 END)::DECIMAL / COUNT(c.id)) * 100, 2)
        ELSE 0 
    END as show_rate,
    CASE 
        WHEN COUNT(CASE WHEN c.call_outcome IN ('showed', 'no_show', 'closed_won', 'closed_lost', 'disqualified') THEN 1 END) > 0 THEN 
            ROUND((COUNT(CASE WHEN c.call_outcome = 'closed_won' THEN 1 END)::DECIMAL / COUNT(CASE WHEN c.call_outcome IN ('showed', 'no_show', 'closed_won', 'closed_lost', 'disqualified') THEN 1 END)) * 100, 2)
        ELSE 0 
    END as close_rate,
    CASE 
        WHEN COUNT(c.id) > 0 THEN 
            ROUND(COALESCE(SUM(c.cash_collected), 0) / COUNT(c.id), 2)
        ELSE 0 
    END as gross_collected_per_booked_call,
    CASE 
        WHEN COUNT(CASE WHEN c.call_outcome IN ('showed', 'no_show', 'closed_won', 'closed_lost', 'disqualified') THEN 1 END) > 0 THEN 
            ROUND(COALESCE(SUM(c.cash_collected), 0) / COUNT(CASE WHEN c.call_outcome IN ('showed', 'no_show', 'closed_won', 'closed_lost', 'disqualified') THEN 1 END), 2)
        ELSE 0 
    END as cash_per_live_call,
    CASE 
        WHEN COUNT(CASE WHEN c.call_outcome = 'closed_won' THEN 1 END) > 0 THEN 
            ROUND(COALESCE(SUM(c.cash_collected), 0) / COUNT(CASE WHEN c.call_outcome = 'closed_won' THEN 1 END), 2)
        ELSE 0 
    END as cash_based_aov
FROM workspaces w
LEFT JOIN calls c ON w.id = c.workspace_id
GROUP BY w.id, w.name;

-- View for metrics by traffic source
CREATE OR REPLACE VIEW metrics_by_traffic_source AS
SELECT 
    w.id as workspace_id,
    w.name as workspace_name,
    c.traffic_source,
    COUNT(c.id) as total_calls,
    COUNT(CASE WHEN c.call_outcome = 'scheduled' THEN 1 END) as calls_scheduled,
    COUNT(CASE WHEN c.call_outcome IN ('showed', 'no_show', 'closed_won', 'closed_lost', 'disqualified') THEN 1 END) as calls_taken,
    COUNT(CASE WHEN c.call_outcome = 'cancelled' THEN 1 END) as calls_cancelled,
    COUNT(CASE WHEN c.call_outcome = 'rescheduled' THEN 1 END) as calls_rescheduled,
    COUNT(CASE WHEN c.call_outcome = 'showed' THEN 1 END) as calls_showed,
    COUNT(CASE WHEN c.call_outcome = 'closed_won' THEN 1 END) as calls_closed_won,
    COUNT(CASE WHEN c.call_outcome = 'disqualified' THEN 1 END) as calls_disqualified,
    COALESCE(SUM(c.cash_collected), 0) as cash_collected,
    CASE 
        WHEN COUNT(c.id) > 0 THEN 
            ROUND((COUNT(CASE WHEN c.call_outcome = 'showed' THEN 1 END)::DECIMAL / COUNT(c.id)) * 100, 2)
        ELSE 0 
    END as show_rate,
    CASE 
        WHEN COUNT(CASE WHEN c.call_outcome IN ('showed', 'no_show', 'closed_won', 'closed_lost', 'disqualified') THEN 1 END) > 0 THEN 
            ROUND((COUNT(CASE WHEN c.call_outcome = 'closed_won' THEN 1 END)::DECIMAL / COUNT(CASE WHEN c.call_outcome IN ('showed', 'no_show', 'closed_won', 'closed_lost', 'disqualified') THEN 1 END)) * 100, 2)
        ELSE 0 
    END as close_rate,
    CASE 
        WHEN COUNT(c.id) > 0 THEN 
            ROUND(COALESCE(SUM(c.cash_collected), 0) / COUNT(c.id), 2)
        ELSE 0 
    END as gross_collected_per_booked_call,
    CASE 
        WHEN COUNT(CASE WHEN c.call_outcome IN ('showed', 'no_show', 'closed_won', 'closed_lost', 'disqualified') THEN 1 END) > 0 THEN 
            ROUND(COALESCE(SUM(c.cash_collected), 0) / COUNT(CASE WHEN c.call_outcome IN ('showed', 'no_show', 'closed_won', 'closed_lost', 'disqualified') THEN 1 END), 2)
        ELSE 0 
    END as cash_per_live_call,
    CASE 
        WHEN COUNT(CASE WHEN c.call_outcome = 'closed_won' THEN 1 END) > 0 THEN 
            ROUND(COALESCE(SUM(c.cash_collected), 0) / COUNT(CASE WHEN c.call_outcome = 'closed_won' THEN 1 END), 2)
        ELSE 0 
    END as cash_based_aov
FROM workspaces w
LEFT JOIN calls c ON w.id = c.workspace_id
WHERE c.traffic_source IS NOT NULL
GROUP BY w.id, w.name, c.traffic_source;

-- =====================================================
-- 12. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions for authenticated users
GRANT SELECT ON current_workspace_metrics TO authenticated;
GRANT SELECT ON metrics_by_traffic_source TO authenticated;

-- Grant permissions for service role
GRANT ALL ON sales_metrics_config TO service_role;
GRANT ALL ON kanban_stage_transitions TO service_role;
GRANT ALL ON sales_metrics_snapshots TO service_role;
GRANT ALL ON traffic_source_attributions TO service_role;
GRANT SELECT ON current_workspace_metrics TO service_role;
GRANT SELECT ON metrics_by_traffic_source TO service_role;
