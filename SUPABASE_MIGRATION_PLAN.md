# Supabase Migration Plan

## Overview
This document outlines the comprehensive migration strategy from local PostgreSQL to Supabase Cloud Database for the Propaganda Dashboard project.

## Current State Analysis

### Database Configuration
- **Current**: Local PostgreSQL with connection pooling via `pg` library
- **Target**: Supabase Cloud Database with native client
- **Schema**: Already defined in `physical_mapping_sql_editor.sql`
- **Data**: Currently using mock database in development

### Key Components to Migrate
1. **Database Connection Layer** (`src/lib/database.ts`)
2. **Configuration** (`src/config/database.ts`)
3. **API Routes** (All database-dependent endpoints)
4. **Services** (All service classes using database)
5. **Authentication** (Already using Supabase for auth)
6. **Environment Variables**

## Migration Strategy

### Phase 1: Environment Setup ✅
- [x] Supabase project created
- [x] Environment variables configured
- [x] Supabase client initialized

### Phase 2: Schema Deployment
- [ ] Deploy complete schema to Supabase
- [ ] Set up Row Level Security (RLS) policies
- [ ] Configure database functions and triggers
- [ ] Add Meta tokens table

### Phase 3: Service Layer Migration
- [ ] Create unified database service
- [ ] Migrate all service classes to use Supabase
- [ ] Update API routes to use new service layer
- [ ] Remove PostgreSQL dependencies

### Phase 4: Data Migration
- [ ] Export existing data (if any)
- [ ] Import data to Supabase
- [ ] Validate data integrity
- [ ] Set up sample data

### Phase 5: Testing & Validation
- [ ] Test all API endpoints
- [ ] Validate authentication flow
- [ ] Test multi-tenant data isolation
- [ ] Performance testing

### Phase 6: Cleanup
- [ ] Remove old database configuration
- [ ] Update documentation
- [ ] Remove unused dependencies

## Implementation Steps

### Step 1: Deploy Schema to Supabase
```sql
-- Run the complete schema from physical_mapping_sql_editor.sql
-- Add Meta tokens table from src/migrations/add_meta_tokens_table.sql
```

### Step 2: Create Unified Database Service
```typescript
// src/lib/services/databaseService.ts
// Unified service for all database operations using Supabase
```

### Step 3: Update Service Classes
- Update all service classes to use Supabase client
- Maintain existing interfaces for backward compatibility
- Add proper error handling and logging

### Step 4: Update API Routes
- Replace direct database calls with service layer
- Add proper error handling
- Maintain existing API contracts

### Step 5: Environment Configuration
- Update environment variables
- Remove PostgreSQL-specific configurations
- Add Supabase-specific configurations

## Risk Mitigation

### Data Loss Prevention
- Complete schema backup before migration
- Data validation scripts
- Rollback plan with local PostgreSQL

### Service Disruption
- Gradual migration approach
- Feature flags for new vs old database
- Comprehensive testing before deployment

### Performance Considerations
- Connection pooling optimization
- Query performance monitoring
- Caching strategies

## Success Criteria

1. **Functional Requirements**
   - All existing features work with Supabase
   - Authentication and authorization intact
   - Multi-tenant data isolation maintained
   - API response times within acceptable limits

2. **Technical Requirements**
   - No PostgreSQL dependencies remaining
   - All tests passing
   - Documentation updated
   - Environment variables properly configured

3. **Performance Requirements**
   - Database queries execute within 200ms
   - Connection pool properly managed
   - No memory leaks or connection issues

## Timeline

- **Phase 1**: Environment Setup (Completed)
- **Phase 2**: Schema Deployment (1 day)
- **Phase 3**: Service Layer Migration (2-3 days)
- **Phase 4**: Data Migration (1 day)
- **Phase 5**: Testing & Validation (1-2 days)
- **Phase 6**: Cleanup (1 day)

**Total Estimated Time**: 6-8 days

## Dependencies

- Supabase project access
- Environment variables configured
- All existing tests passing
- Backup of current database state

## Rollback Plan

If migration fails:
1. Revert to local PostgreSQL configuration
2. Restore from database backup
3. Update environment variables
4. Restart services
5. Validate functionality

## Post-Migration Tasks

1. Monitor performance metrics
2. Update deployment scripts
3. Train team on Supabase features
4. Set up monitoring and alerting
5. Document new database procedures
