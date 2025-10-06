# Kanban-Ready Data Structures Documentation

## Overview

This document outlines the data structures and relationships designed to support the CRM-style Kanban board functionality. The system is built around the `calls` table with additional fields for comprehensive SCRM tracking and traffic source analytics.

## Core Data Structure

### Calls Table Schema

The `calls` table serves as the central data structure for the Kanban board, containing all necessary fields for call management, analytics, and pipeline tracking.

#### Primary Fields
- `id` (UUID) - Primary key
- `client_id` (UUID) - References the client/workspace
- `user_id` (UUID) - References the user who created the call
- `created_at` (TIMESTAMP) - Call creation timestamp
- `updated_at` (TIMESTAMP) - Last modification timestamp

#### Prospect Information
- `prospect_first_name` (VARCHAR) - First name of the prospect
- `prospect_last_name` (VARCHAR) - Last name of the prospect
- `prospect_email` (VARCHAR) - Prospect's email address
- `prospect_phone` (VARCHAR) - Prospect's phone number
- `company_name` (VARCHAR) - Company name (pre-selected from workspace)

#### Source and Appointment Tracking
- `source_of_set_appointment` (ENUM) - How the appointment was set
  - `sdr_booked_call` - Set by SDR (Sales Development Representative)
  - `non_sdr_booked_call` - Set through other means
- `sdr_type` (ENUM) - Type of SDR (only for SDR booked calls)
  - `dialer` - Cold calling SDR
  - `dm_setter` - Direct message SDR
- `sdr_first_name` (VARCHAR) - SDR's first name
- `sdr_last_name` (VARCHAR) - SDR's last name
- `non_sdr_source` (ENUM) - Source for non-SDR calls
  - `vsl_booking` - Video sales letter booking
  - `regular_booking` - Standard booking process

#### CRM Pipeline Management
- `crm_stage` (ENUM) - Current stage in the CRM pipeline
  - `scheduled` - Call is scheduled but not yet started
  - `in_progress` - Call is currently being conducted
  - `completed` - Call has been completed
  - `no_show` - Prospect did not attend the call
  - `closed_won` - Sale was successful
  - `lost` - Sale was not successful

#### Traffic Source Analytics
- `traffic_source` (ENUM) - Source of the lead
  - `organic` - Organic traffic (website, referrals, etc.)
  - `meta` - Meta Ads (Facebook/Instagram paid advertising)

#### SCRM Outcome Tracking
- `scrms_outcome` (ENUM) - Detailed outcome of the call
  - `call_booked` - Default state when call is initially logged
  - `no_show` - Prospect didn't attend
  - `no_close` - Call completed but no sale
  - `cancelled` - Call was cancelled
  - `disqualified` - Prospect was disqualified
  - `rescheduled` - Call was rescheduled
  - `payment_plan` - Sale with payment plan
  - `deposit` - Sale with deposit collected
  - `closed_paid_in_full` - Full payment received
  - `follow_up_call_scheduled` - Follow-up call scheduled

#### Call Details
- `call_type` (ENUM) - Type of call
  - `inbound` - Prospect called in
  - `outbound` - We called the prospect
- `status` (ENUM) - Call status
  - `completed` - Call finished
  - `no-show` - Prospect didn't show
  - `rescheduled` - Call was rescheduled
- `outcome` (ENUM) - High-level outcome
  - `won` - Sale successful
  - `lost` - Sale unsuccessful
  - `tbd` - To be determined
- `scheduled_at` (TIMESTAMP) - When the call was scheduled
- `completed_at` (TIMESTAMP) - When the call was completed
- `call_duration` (INTEGER) - Duration in minutes
- `notes` (TEXT) - Additional call notes
- `loss_reason_id` (UUID) - Reference to loss reason (if applicable)

## Kanban Board Grouping Logic

### Primary Grouping: CRM Stage
The Kanban board groups calls by their `crm_stage` field, creating six columns:

1. **Scheduled** - Calls that are booked but not yet started
2. **In Progress** - Calls currently being conducted
3. **Completed** - Calls that have finished
4. **No Show** - Prospects who didn't attend
5. **Closed/Won** - Successful sales
6. **Lost** - Unsuccessful sales

### Secondary Grouping: Traffic Source
Within each stage, calls can be filtered or visually distinguished by `traffic_source`:
- **Organic** - Green badge/indicator
- **Meta** - Blue badge/indicator

### Tertiary Grouping: SCRM Outcome
For detailed analysis, calls can be further grouped by `scrms_outcome` to provide granular insights into call results.

## Analytics Calculations

### Show Rate Calculation
```
Show Rate = (Completed Calls / Total Calls) × 100
```
Where "Completed Calls" includes calls with `crm_stage` in:
- `completed`
- `no_show`
- `closed_won`
- `lost`

### Close Rate Calculation
```
Close Rate = (Closed/Won Calls / Completed Calls) × 100
```
Where "Closed/Won Calls" are calls with `crm_stage = 'closed_won'`

### Traffic Source Segmentation
Analytics are calculated separately for:
- **Organic Traffic**: `traffic_source = 'organic'`
- **Meta Ads**: `traffic_source = 'meta'`

## Data Relationships

### Workspace Isolation
All calls are isolated by `client_id` (workspace), ensuring multi-tenant data separation.

### User Association
Calls are associated with users through `user_id` for tracking who created/managed each call.

### Loss Reason Reference
Optional relationship to `loss_reasons` table for categorizing why sales were lost.

## Performance Optimizations

### Indexes
The following indexes are created for optimal performance:

#### Individual Field Indexes
- `idx_calls_prospect_first_name`
- `idx_calls_prospect_last_name`
- `idx_calls_company_name`
- `idx_calls_source_of_set_appointment`
- `idx_calls_sdr_type`
- `idx_calls_sdr_name` (composite: sdr_first_name, sdr_last_name)
- `idx_calls_non_sdr_source`
- `idx_calls_scrms_outcome`
- `idx_calls_traffic_source`
- `idx_calls_crm_stage`

#### Composite Indexes
- `idx_calls_source_outcome` (source_of_set_appointment, scrms_outcome)
- `idx_calls_company_source` (company_name, source_of_set_appointment)
- `idx_calls_traffic_stage` (traffic_source, crm_stage)

### Query Optimization
Common queries are optimized for:
- Kanban board loading (grouped by crm_stage)
- Analytics calculations (filtered by traffic_source)
- Search and filtering operations
- Real-time updates and drag-and-drop operations

## Data Validation Rules

### Conditional Field Requirements
- If `source_of_set_appointment = 'sdr_booked_call'`:
  - `sdr_type` is required
  - `sdr_first_name` is required
  - `sdr_last_name` is required
- If `source_of_set_appointment = 'non_sdr_booked_call'`:
  - `non_sdr_source` is required

### Field Constraints
- All ENUM fields have strict value validation
- Email fields use proper email format validation
- Phone fields use standardized phone number format
- Timestamps are automatically managed by the system

## Integration Points

### API Endpoints
- `GET /api/calls` - Retrieve calls for Kanban board
- `PATCH /api/calls/[id]` - Update call stage (drag-and-drop)
- `GET /api/analytics` - Retrieve analytics data
- `POST /api/calls` - Create new calls

### Real-time Updates
The system supports real-time updates through:
- Optimistic UI updates for drag-and-drop operations
- Automatic analytics recalculation when calls move between stages
- WebSocket integration for multi-user collaboration (future enhancement)

## Future Enhancements

### Planned Features
1. **Call Ordering**: Add `kanban_order` field for custom call ordering within stages
2. **Call Assignments**: Add `assigned_to` field for assigning calls to specific users
3. **Call Priorities**: Add `priority` field for urgent call handling
4. **Call Tags**: Add tagging system for flexible call categorization
5. **Call Dependencies**: Add dependency tracking between related calls

### Scalability Considerations
- Database partitioning by `client_id` for large multi-tenant deployments
- Caching layer for frequently accessed analytics data
- Background job processing for complex analytics calculations
- Archive strategy for old completed calls

## Migration Strategy

### Existing Data Handling
- Existing `prospect_name` fields are automatically split into `prospect_first_name` and `prospect_last_name`
- Default values are set for new fields to maintain data integrity
- Backward compatibility is maintained for existing API consumers

### Rollback Plan
- All new fields are nullable to allow safe rollback
- Migration scripts include rollback procedures
- Data validation ensures no data loss during migration

## Security Considerations

### Row-Level Security (RLS)
- All queries are filtered by `client_id` to ensure workspace isolation
- User access is controlled through `user_id` associations
- Admin users have broader access within their workspace

### Data Privacy
- Personal information (names, emails, phones) is encrypted at rest
- Audit logging tracks all data modifications
- GDPR compliance through data export and deletion capabilities

## Monitoring and Maintenance

### Performance Monitoring
- Query performance tracking for Kanban board operations
- Analytics calculation time monitoring
- Database index usage analysis

### Data Quality
- Regular validation of data integrity
- Automated cleanup of orphaned records
- Monitoring of field completion rates

This documentation provides a comprehensive overview of the Kanban-ready data structures, ensuring the system can effectively support CRM pipeline management, analytics, and future enhancements.
