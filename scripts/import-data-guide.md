# Import Data into Supabase - Step by Step Guide

## Prerequisites
- ✅ Supabase project is set up and running
- ✅ Database schema has been created (supabase_schema_setup_fixed.sql executed)
- ✅ Data export file is ready (supabase_data_export.sql)

## Import Steps

### Method 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Import the Data**
   - Copy the entire contents of `supabase_data_export.sql`
   - Paste into the SQL Editor
   - Click "Run" to execute

4. **Verify Import**
   - Check for any error messages
   - Run verification queries (see below)

### Method 2: Using Supabase CLI (Alternative)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Execute the SQL file
supabase db reset --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" < supabase_data_export.sql
```

## Verification Queries

After importing, run these queries to verify the data:

### 1. Check Table Counts
```sql
-- Check users table
SELECT COUNT(*) as user_count FROM users;

-- Check clients table  
SELECT COUNT(*) as client_count FROM clients;

-- Check calls table
SELECT COUNT(*) as call_count FROM calls;
```

### 2. Verify Data Integrity
```sql
-- Check user roles distribution
SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- Check call outcomes
SELECT outcome, COUNT(*) as count FROM calls GROUP BY outcome;

-- Check client-user relationships
SELECT c.name as client_name, COUNT(u.id) as user_count 
FROM clients c 
LEFT JOIN users u ON c.id = u.client_id 
GROUP BY c.id, c.name;
```

### 3. Test Row Level Security
```sql
-- Test RLS policies (should return data based on user context)
SELECT * FROM calls WHERE client_id = '550e8400-e29b-41d4-a716-446655440001';
```

## Expected Results

After successful import, you should see:
- **6 users** (2 CEO/Admin, 4 Sales)
- **2 clients** (Propaganda Inc, Tech Solutions LLC)
- **12 calls** (mix of won/lost/tbd outcomes)
- **Proper relationships** between users, clients, and calls

## Troubleshooting

### Common Issues

1. **Foreign Key Violations**
   - Ensure schema was created before data import
   - Check that all referenced IDs exist

2. **Permission Errors**
   - Verify RLS policies are properly set up
   - Check user permissions in Supabase

3. **Data Type Mismatches**
   - Ensure UUIDs are properly formatted
   - Check timestamp formats

### Error Recovery

If import fails:
1. Check the error message in Supabase SQL Editor
2. Verify the schema exists
3. Try importing in smaller chunks
4. Check for duplicate primary keys

## Next Steps

After successful import:
1. ✅ Verify all data is present
2. ✅ Test application connectivity
3. ✅ Update environment variables
4. ✅ Test application functionality
5. ✅ Decommission local database (optional)
