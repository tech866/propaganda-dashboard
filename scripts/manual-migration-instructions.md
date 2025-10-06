# Manual Database Migration Instructions

## Task 22.3: Update Calls Database Schema for Source-Based Analytics

Since the automated migration scripts are not working due to missing `exec_sql` function, please follow these steps to manually execute the migration in the Supabase dashboard:

### Step 1: Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** tab
3. Create a new query

### Step 2: Execute the Migration
Copy and paste the entire contents of `src/migrations/enhanced_traffic_source_tracking.sql` into the SQL Editor and execute it.

### Step 3: Verify the Migration
After execution, run this verification query to confirm the migration was successful:

```sql
-- Verification Query
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'calls' 
AND column_name IN ('traffic_source', 'crm_stage')
ORDER BY column_name;
```

Expected results:
- `traffic_source` column should exist with VARCHAR(50) type
- `crm_stage` column should exist with VARCHAR(50) type
- Both should have appropriate default values

### Step 4: Check Indexes
Verify that the indexes were created:

```sql
-- Check Indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'calls' 
AND indexname LIKE '%traffic_source%' OR indexname LIKE '%crm_stage%'
ORDER BY indexname;
```

### Step 5: Test the New Fields
Test that the new fields work correctly:

```sql
-- Test Insert
INSERT INTO calls (
    client_id, 
    user_id, 
    workspace_id, 
    prospect_name, 
    traffic_source, 
    crm_stage
) VALUES (
    'test-client-id',
    'test-user-id', 
    'test-workspace-id',
    'Test Prospect',
    'organic',
    'scheduled'
);

-- Test Select
SELECT id, prospect_name, traffic_source, crm_stage 
FROM calls 
WHERE prospect_name = 'Test Prospect';

-- Clean up test data
DELETE FROM calls WHERE prospect_name = 'Test Prospect';
```

### Step 6: Verify RLS Policies
Check that RLS policies are working:

```sql
-- Check RLS Status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'calls';

-- Check Policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'calls';
```

### Expected Results After Migration:

1. **New Columns Added:**
   - `traffic_source` (VARCHAR(50), default: 'organic')
   - `crm_stage` (VARCHAR(50), default: 'scheduled')

2. **Indexes Created:**
   - `idx_calls_traffic_source`
   - `idx_calls_crm_stage`
   - `idx_calls_traffic_source_stage`
   - `idx_calls_workspace_traffic_source`
   - `idx_calls_workspace_crm_stage`
   - And several composite indexes for analytics

3. **Analytics View Created:**
   - `call_analytics_summary` materialized view
   - Auto-refresh trigger for real-time analytics

4. **RLS Policies Updated:**
   - All existing policies should continue to work
   - New fields are automatically covered by existing policies

### Troubleshooting:

If you encounter any errors:

1. **Permission Issues:** Ensure you're logged in as a user with sufficient privileges
2. **Column Already Exists:** The migration uses `IF NOT EXISTS` clauses, so it should be safe to run multiple times
3. **Index Conflicts:** The migration uses `IF NOT EXISTS` for indexes as well

### Post-Migration Testing:

After the migration is complete, test the application to ensure:
1. Call logging forms work with the new fields
2. Kanban board displays calls correctly
3. Analytics dashboard shows traffic source data
4. All existing functionality continues to work

---

**Note:** This migration is designed to be idempotent (safe to run multiple times) and includes comprehensive error handling and verification steps.
