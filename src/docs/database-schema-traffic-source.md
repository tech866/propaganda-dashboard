# Database Schema: Traffic Source Tracking

## Overview

This document describes the database schema changes implemented for Task 22.3: "Update Calls Database Schema for Source-Based Analytics". These changes add traffic source tracking and CRM stage management to the calls table.

## Schema Changes

### New Columns Added to `calls` Table

#### 1. `traffic_source` Column
- **Type**: `VARCHAR(50)`
- **Default**: `'organic'`
- **Constraints**: `CHECK (traffic_source IN ('organic', 'meta'))`
- **Purpose**: Classifies the source of traffic for each call
- **Values**:
  - `'organic'`: Organic traffic (website, referrals, direct)
  - `'meta'`: Meta advertising (Facebook/Instagram ads)

#### 2. `crm_stage` Column
- **Type**: `VARCHAR(50)`
- **Default**: `'scheduled'`
- **Constraints**: `CHECK (crm_stage IN ('scheduled', 'in_progress', 'completed', 'no_show', 'closed_won', 'lost'))`
- **Purpose**: Tracks the current stage of the call in the CRM pipeline
- **Values**:
  - `'scheduled'`: Call is scheduled but not yet started
  - `'in_progress'`: Call is currently in progress
  - `'completed'`: Call has been completed
  - `'no_show'`: Prospect did not show up for the call
  - `'closed_won'`: Call resulted in a successful close
  - `'lost'`: Call did not result in a close

## Indexes Created

### Basic Indexes
```sql
CREATE INDEX idx_calls_traffic_source ON calls(traffic_source);
CREATE INDEX idx_calls_crm_stage ON calls(crm_stage);
```

### Composite Indexes for Analytics
```sql
-- For traffic source and stage combinations
CREATE INDEX idx_calls_traffic_source_stage ON calls(traffic_source, crm_stage);

-- For workspace-scoped queries
CREATE INDEX idx_calls_workspace_traffic_source ON calls(workspace_id, traffic_source);
CREATE INDEX idx_calls_workspace_crm_stage ON calls(workspace_id, crm_stage);

-- For comprehensive analytics queries
CREATE INDEX idx_calls_workspace_traffic_stage ON calls(workspace_id, traffic_source, crm_stage);
CREATE INDEX idx_calls_created_traffic_source ON calls(created_at, traffic_source);
CREATE INDEX idx_calls_workspace_created_traffic ON calls(workspace_id, created_at, traffic_source);
```

## Data Migration

### Existing Data Updates

The migration includes intelligent defaults for existing data:

#### CRM Stage Migration
```sql
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
```

#### Traffic Source Migration
```sql
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
```

## Analytics Materialized View

### `call_analytics_summary` View

A materialized view is created for efficient analytics queries:

```sql
CREATE MATERIALIZED VIEW call_analytics_summary AS
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
```

### Auto-Refresh Trigger

The materialized view is automatically refreshed when calls are modified:

```sql
CREATE TRIGGER calls_analytics_refresh_trigger
    AFTER INSERT OR UPDATE OR DELETE ON calls
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_refresh_call_analytics();
```

## Row Level Security (RLS)

### Updated Policies

The existing RLS policies on the `calls` table automatically cover the new fields since they apply to the entire row. The policies ensure:

1. **View Access**: Users can only view calls in their active workspaces
2. **Insert Access**: Users can only insert calls into their active workspaces
3. **Update Access**: Users can only update calls in their active workspaces
4. **Delete Access**: Users can only delete calls in their active workspaces

### Policy Example
```sql
CREATE POLICY "Users can view calls in their workspaces" ON calls
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM workspace_memberships wm
            JOIN users u ON wm.user_id = u.id
            WHERE u.clerk_user_id = auth.jwt() ->> 'sub'
            AND wm.status = 'active'
        )
    );
```

## API Integration

### Service Layer Updates

The `SalesCallService` has been updated to handle the new fields:

```typescript
// Create call with traffic source classification
const trafficSourceClassification = TrafficSourceService.classifyTrafficSource({
  sourceOfAppointment: callData.source_of_set_appointment,
  leadSource: callData.lead_source,
  trafficSource: callData.traffic_source,
  manualOverride: callData.traffic_source
});

const finalTrafficSource = callData.traffic_source || trafficSourceClassification.traffic_source;
```

### Frontend Integration

The call logging forms now include:

1. **Traffic Source Selection**: Dropdown with organic/meta options
2. **Auto-Classification**: Automatic traffic source suggestion based on appointment source
3. **CRM Stage Management**: Default to 'scheduled' for new calls

## Performance Considerations

### Query Optimization

The new indexes are designed to optimize common analytics queries:

1. **Traffic Source Analytics**: `idx_calls_workspace_traffic_source`
2. **Stage Analytics**: `idx_calls_workspace_crm_stage`
3. **Combined Analytics**: `idx_calls_workspace_traffic_stage`
4. **Time-based Analytics**: `idx_calls_created_traffic_source`

### Materialized View Benefits

- **Faster Analytics**: Pre-computed aggregations for common queries
- **Reduced Load**: Offloads complex calculations from real-time queries
- **Auto-Refresh**: Keeps data current without manual intervention

## Migration Verification

### Manual Verification Steps

1. **Check Columns**: Verify new columns exist with correct types
2. **Test Insert**: Insert a test call with new fields
3. **Test Update**: Update the test call's traffic source and stage
4. **Test Analytics**: Run analytics queries to verify performance
5. **Check Indexes**: Verify all indexes were created successfully
6. **Test RLS**: Ensure RLS policies work with new fields

### Automated Verification

Use the `scripts/verify-migration.js` script to automatically verify the migration:

```bash
node scripts/verify-migration.js
```

## Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure user has sufficient database privileges
2. **Column Conflicts**: Migration uses `IF NOT EXISTS` to prevent conflicts
3. **Index Conflicts**: All indexes use `IF NOT EXISTS` for safety
4. **RLS Issues**: Verify user has proper workspace membership

### Rollback Plan

If rollback is needed:

1. **Remove New Columns**: `ALTER TABLE calls DROP COLUMN IF EXISTS traffic_source, crm_stage;`
2. **Remove Indexes**: Drop all indexes with `traffic_source` or `crm_stage` in the name
3. **Remove Views**: `DROP MATERIALIZED VIEW IF EXISTS call_analytics_summary;`
4. **Remove Functions**: `DROP FUNCTION IF EXISTS refresh_call_analytics_summary();`

## Future Enhancements

### Potential Improvements

1. **Additional Traffic Sources**: Support for more traffic source types
2. **Custom Stages**: Allow workspace-specific CRM stage customization
3. **Advanced Analytics**: More sophisticated analytics calculations
4. **Real-time Updates**: WebSocket-based real-time analytics updates

### Monitoring

Monitor the following metrics after deployment:

1. **Query Performance**: Check analytics query execution times
2. **Index Usage**: Monitor index utilization
3. **Materialized View Refresh**: Ensure auto-refresh is working
4. **Data Quality**: Verify traffic source classification accuracy
