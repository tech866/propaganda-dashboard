-- Dashboard Performance Optimization Script
-- This script adds database indexes to improve dashboard loading performance

-- Indexes for financial_records table
CREATE INDEX IF NOT EXISTS idx_financial_records_campaign_id ON financial_records(campaign_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_type ON financial_records(type);
CREATE INDEX IF NOT EXISTS idx_financial_records_date ON financial_records(date);
CREATE INDEX IF NOT EXISTS idx_financial_records_campaign_type ON financial_records(campaign_id, type);

-- Indexes for campaigns table
CREATE INDEX IF NOT EXISTS idx_campaigns_client_id ON campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_active_status ON campaigns(active_status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_client_active ON campaigns(client_id, active_status);

-- Indexes for clients table
CREATE INDEX IF NOT EXISTS idx_clients_agency_id ON clients(agency_id);
CREATE INDEX IF NOT EXISTS idx_clients_active_status ON clients(active_status);
CREATE INDEX IF NOT EXISTS idx_clients_agency_active ON clients(agency_id, active_status);
CREATE INDEX IF NOT EXISTS idx_clients_updated_at ON clients(updated_at);

-- Indexes for calls table (for metrics)
CREATE INDEX IF NOT EXISTS idx_calls_client_id ON calls(client_id);
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON calls(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_outcome ON calls(outcome);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at);
CREATE INDEX IF NOT EXISTS idx_calls_client_created ON calls(client_id, created_at);
CREATE INDEX IF NOT EXISTS idx_calls_user_created ON calls(user_id, created_at);

-- Indexes for loss_reasons table
CREATE INDEX IF NOT EXISTS idx_loss_reasons_client_id ON loss_reasons(client_id);
CREATE INDEX IF NOT EXISTS idx_loss_reasons_active ON loss_reasons(is_active);
CREATE INDEX IF NOT EXISTS idx_loss_reasons_client_active ON loss_reasons(client_id, is_active);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_agency_id ON users(agency_id);
CREATE INDEX IF NOT EXISTS idx_users_client_id ON users(client_id);
CREATE INDEX IF NOT EXISTS idx_users_active_status ON users(active_status);
CREATE INDEX IF NOT EXISTS idx_users_agency_active ON users(agency_id, active_status);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_financial_campaigns_clients_agency 
ON financial_records(campaign_id) 
INCLUDE (type, amount);

CREATE INDEX IF NOT EXISTS idx_campaigns_clients_agency_active 
ON campaigns(client_id) 
INCLUDE (id, status, active_status, created_at);

-- Optimized RPC functions for dashboard data
CREATE OR REPLACE FUNCTION get_agency_kpis(agency_id_param UUID)
RETURNS TABLE (
  total_ad_spend NUMERIC,
  total_revenue NUMERIC,
  average_order_value NUMERIC,
  roas NUMERIC,
  ad_spend_change NUMERIC,
  revenue_change NUMERIC,
  aov_change NUMERIC,
  roas_change NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH agency_financials AS (
    SELECT 
      fr.type,
      fr.amount
    FROM financial_records fr
    INNER JOIN campaigns c ON fr.campaign_id = c.id
    INNER JOIN clients cl ON c.client_id = cl.id
    WHERE cl.agency_id = agency_id_param
  ),
  revenue_data AS (
    SELECT COALESCE(SUM(amount), 0) as total_revenue
    FROM agency_financials
    WHERE type = 'revenue'
  ),
  expense_data AS (
    SELECT COALESCE(SUM(amount), 0) as total_expenses
    FROM agency_financials
    WHERE type = 'expense'
  )
  SELECT 
    ed.total_expenses as total_ad_spend,
    rd.total_revenue as total_revenue,
    CASE 
      WHEN rd.total_revenue > 0 THEN rd.total_revenue / GREATEST(1, (SELECT COUNT(*) FROM agency_financials))
      ELSE 0 
    END as average_order_value,
    CASE 
      WHEN ed.total_expenses > 0 THEN rd.total_revenue / ed.total_expenses
      ELSE 0 
    END as roas,
    8.2::NUMERIC as ad_spend_change, -- Mock data - would calculate from historical data
    15.3::NUMERIC as revenue_change,
    -2.1::NUMERIC as aov_change,
    0.24::NUMERIC as roas_change
  FROM revenue_data rd, expense_data ed;
END;
$$ LANGUAGE plpgsql;

-- Optimized function for client summaries
CREATE OR REPLACE FUNCTION get_client_summaries(agency_id_param UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  status TEXT,
  total_revenue NUMERIC,
  total_ad_spend NUMERIC,
  margin NUMERIC,
  profit NUMERIC,
  campaign_count INTEGER,
  last_activity TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH client_financials AS (
    SELECT 
      cl.id as client_id,
      cl.name as client_name,
      cl.updated_at,
      COUNT(DISTINCT c.id) as campaign_count,
      COALESCE(SUM(CASE WHEN fr.type = 'revenue' THEN fr.amount ELSE 0 END), 0) as total_revenue,
      COALESCE(SUM(CASE WHEN fr.type = 'expense' THEN fr.amount ELSE 0 END), 0) as total_ad_spend
    FROM clients cl
    LEFT JOIN campaigns c ON cl.id = c.client_id AND c.active_status = true
    LEFT JOIN financial_records fr ON c.id = fr.campaign_id
    WHERE cl.agency_id = agency_id_param 
      AND cl.active_status = true
    GROUP BY cl.id, cl.name, cl.updated_at
  )
  SELECT 
    cf.client_id,
    cf.client_name,
    CASE 
      WHEN cf.total_revenue = 0 THEN 'poor'
      WHEN (cf.total_revenue - cf.total_ad_spend) / cf.total_revenue >= 0.7 THEN 'excellent'
      WHEN (cf.total_revenue - cf.total_ad_spend) / cf.total_revenue >= 0.5 THEN 'good'
      WHEN (cf.total_revenue - cf.total_ad_spend) / cf.total_revenue >= 0.3 THEN 'needs_attention'
      ELSE 'poor'
    END as status,
    cf.total_revenue,
    cf.total_ad_spend,
    CASE 
      WHEN cf.total_revenue > 0 THEN ((cf.total_revenue - cf.total_ad_spend) / cf.total_revenue) * 100
      ELSE 0 
    END as margin,
    cf.total_revenue - cf.total_ad_spend as profit,
    cf.campaign_count,
    cf.updated_at as last_activity
  FROM client_financials cf
  ORDER BY cf.total_revenue DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_agency_kpis(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_client_summaries(UUID) TO authenticated;

-- Analyze tables to update statistics
ANALYZE financial_records;
ANALYZE campaigns;
ANALYZE clients;
ANALYZE calls;
ANALYZE loss_reasons;
ANALYZE users;
