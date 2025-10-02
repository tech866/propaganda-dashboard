# Database Migration Scripts

This directory contains scripts for migrating data from PostgreSQL to Supabase.

## Export Data from PostgreSQL

### Prerequisites

1. **PostgreSQL Database**: Ensure your local PostgreSQL database is running and contains data
2. **Environment Variables**: Set up your database connection in `.env.local`:
   ```bash
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=propaganda_dashboard
   DB_USER=travis
   DB_PASSWORD=your_password
   ```

### Usage

#### Export as SQL (Recommended for Supabase)
```bash
npm run export-data
```

This will:
- Connect to your local PostgreSQL database
- Export all data from tables: `users`, `clients`, `calls`, `call_analytics`
- Generate `supabase_data_export.sql` in the project root
- Format data as INSERT statements ready for Supabase import

#### Export as JSON (For backup/analysis)
```bash
npm run export-data:json
```

This will:
- Export each table as separate JSON files
- Useful for data analysis or backup purposes
- Files saved as `data_[table_name].json`

### Output Files

- `supabase_data_export.sql` - Main export file for Supabase import
- `data_users.json` - Users table as JSON
- `data_clients.json` - Clients table as JSON  
- `data_calls.json` - Calls table as JSON
- `data_call_analytics.json` - Call analytics as JSON

### Import to Supabase

1. **Run the schema setup first** (if not already done):
   ```sql
   -- Run supabase_schema_setup_fixed.sql in Supabase SQL Editor
   ```

2. **Import the data**:
   ```sql
   -- Run supabase_data_export.sql in Supabase SQL Editor
   ```

### Troubleshooting

#### Connection Issues
- Verify PostgreSQL is running: `brew services list | grep postgres`
- Check database credentials in `.env.local`
- Ensure database exists: `psql -d propaganda_dashboard -c "SELECT 1;"`

#### Permission Issues
- Ensure user has SELECT permissions on all tables
- Check if tables exist and contain data

#### Data Issues
- Review exported SQL for any data type mismatches
- Check for foreign key constraints that might cause import failures
- Verify UUID formats are compatible with Supabase

### Next Steps

After successful export:
1. Review the generated SQL file
2. Import data into Supabase
3. Verify data integrity
4. Update application configuration to use Supabase
5. Test application functionality

## Migration Checklist

- [ ] Local PostgreSQL database running
- [ ] Environment variables configured
- [ ] Data export completed successfully
- [ ] Supabase schema created
- [ ] Data imported to Supabase
- [ ] Application tested with Supabase
- [ ] Local database decommissioned (optional)
