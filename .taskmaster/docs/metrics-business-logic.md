# Performance Metrics Business Logic Documentation

## Overview
This document defines the business logic for calculating key performance metrics in the Propaganda Dashboard system. The primary metrics are **Show Rate** and **Close Rate**, which are essential for tracking sales team performance and agency success.

## Core Metrics Definitions

### 1. Show Rate
**Definition:** The percentage of scheduled calls that actually occurred (completed calls vs. total scheduled calls)

**Formula:** 
```
Show Rate = (Completed Calls / Total Scheduled Calls) × 100
```

**Business Logic:**
- **Numerator (Completed Calls):** Calls with `status = 'completed'`
- **Denominator (Total Scheduled Calls):** All calls regardless of status
- **Exclusions:** None - all calls count toward the denominator
- **Status Values:** 
  - `completed` - Call happened successfully
  - `no-show` - Prospect didn't show up
  - `rescheduled` - Call was rescheduled (still counts as scheduled)

**Example Calculation:**
- Total scheduled calls: 100
- Completed calls: 75
- Show Rate = (75 / 100) × 100 = 75%

### 2. Close Rate
**Definition:** The percentage of completed calls that resulted in a win

**Formula:**
```
Close Rate = (Won Calls / Completed Calls) × 100
```

**Business Logic:**
- **Numerator (Won Calls):** Calls with `status = 'completed'` AND `outcome = 'won'`
- **Denominator (Completed Calls):** Calls with `status = 'completed'` (regardless of outcome)
- **Exclusions:** 
  - No-show calls (`status = 'no-show'`) are excluded
  - Rescheduled calls (`status = 'rescheduled'`) are excluded
  - Calls with `outcome = 'tbd'` are excluded from numerator but included in denominator
- **Outcome Values:**
  - `won` - Deal was closed successfully
  - `lost` - Deal was lost
  - `tbd` - Outcome is still to be determined

**Example Calculation:**
- Completed calls: 75
- Won calls: 30
- Close Rate = (30 / 75) × 100 = 40%

## Data Requirements

### Database Tables Used
1. **`calls`** - Primary table for all call data
2. **`loss_reasons`** - Reference table for loss categorization
3. **`users`** - For user-specific metrics
4. **`clients`** - For client-specific metrics

### Key Fields for Calculations
- `calls.status` - Call completion status
- `calls.outcome` - Call result (won/lost/tbd)
- `calls.client_id` - Multi-tenant isolation
- `calls.user_id` - Sales rep identification
- `calls.completed_at` - Date for time-based filtering
- `calls.loss_reason_id` - For loss reason analysis

## Filtering and Segmentation

### Time-based Filtering
- **Date Range:** Filter by `completed_at` timestamp
- **Default Period:** Last 30 days if no date range specified
- **Time Zone:** All calculations in UTC, convert to user's timezone for display

### User-based Filtering
- **Sales Rep:** Filter by specific `user_id`
- **Role-based Access:**
  - Sales users: Only their own calls
  - Admin users: All calls within their client(s)
  - CEO users: All calls across all clients

### Client-based Filtering
- **Multi-tenant:** All calculations scoped to `client_id`
- **Agency Rollup:** CEO can view aggregated metrics across all clients

## Loss Reasons Analysis

### Top Loss Reasons
**Purpose:** Identify the most common reasons for lost deals

**Calculation:**
1. Count calls with `outcome = 'lost'` grouped by `loss_reason_id`
2. Calculate percentage of total lost calls for each reason
3. Sort by count (descending)
4. Return top 5 reasons

**Formula:**
```
Loss Reason Percentage = (Calls with this loss reason / Total lost calls) × 100
```

### Loss Reason Categories
- **Price-related:** "Price too high", "Budget constraints"
- **Interest-related:** "Not interested", "Different approach"
- **Timing-related:** "Timing not right"
- **Competition-related:** "Competitor chosen"
- **Technical-related:** "Technical requirements", "Implementation timeline"
- **Internal-related:** "In-house marketing"

## Performance Requirements

### Response Time
- **Target:** P95 < 300ms for metric endpoints
- **Data Volume:** Up to 50,000 calls per client
- **Optimization:** Use database indexes and efficient queries

### Caching Strategy
- **Real-time:** Current period metrics (last 7 days)
- **Cached:** Historical metrics (older than 7 days)
- **Cache Duration:** 15 minutes for real-time, 1 hour for historical

## Edge Cases and Business Rules

### Zero Division Handling
- **Show Rate:** If no calls scheduled, return 0% (not undefined)
- **Close Rate:** If no completed calls, return 0% (not undefined)
- **Loss Reasons:** If no lost calls, return empty array

### Data Quality Rules
- **Missing Data:** Treat `NULL` values appropriately
- **Invalid Status:** Calls with invalid status should be excluded
- **Future Dates:** Don't include calls with future `completed_at` dates

### Multi-tenant Security
- **Data Isolation:** All queries must include `client_id` filter
- **User Access:** Sales users can only see their own data
- **Admin Access:** Admins can see all data within their client(s)
- **CEO Access:** CEOs can see aggregated data across all clients

## API Response Format

### Metrics Response Structure
```json
{
  "success": true,
  "data": {
    "showRate": {
      "value": 0.75,
      "percentage": 75.0,
      "label": "Show Rate",
      "description": "Shows / Booked calls",
      "trend": "+5%",
      "numerator": 75,
      "denominator": 100
    },
    "closeRate": {
      "value": 0.40,
      "percentage": 40.0,
      "label": "Close Rate", 
      "description": "Wins / Completed calls",
      "trend": "+2%",
      "numerator": 30,
      "denominator": 75
    },
    "totalCalls": 100,
    "completedCalls": 75,
    "wonCalls": 30,
    "lostCalls": 40,
    "tbdCalls": 5,
    "lossReasons": [
      {
        "id": "uuid",
        "name": "Price too high",
        "count": 15,
        "percentage": 37.5
      }
    ],
    "period": {
      "from": "2024-09-01T00:00:00Z",
      "to": "2024-09-30T23:59:59Z"
    },
    "filters": {
      "clientId": "uuid",
      "userId": "uuid"
    }
  }
}
```

## Implementation Notes

### Database Queries
- Use `COUNT()` with `CASE WHEN` for conditional counting
- Use `ROUND()` for percentage calculations
- Use `GROUP BY` for loss reason analysis
- Use `WHERE` clauses for filtering and multi-tenant isolation

### Error Handling
- Handle database connection errors gracefully
- Return meaningful error messages for invalid filters
- Log calculation errors for debugging

### Testing Considerations
- Test with various data scenarios (empty, single record, large datasets)
- Test edge cases (zero division, invalid data)
- Test multi-tenant isolation
- Test role-based access control
- Test time-based filtering accuracy

## Future Enhancements

### Additional Metrics (Future Phases)
- **Conversion Rate:** Leads to calls ratio
- **Average Call Duration:** Performance indicator
- **Call Volume Trends:** Time-based analysis
- **Revenue per Call:** Financial metrics
- **Pipeline Velocity:** Time from lead to close

### Advanced Analytics
- **Cohort Analysis:** Performance over time
- **Comparative Analysis:** User vs. team vs. client averages
- **Predictive Analytics:** Forecast future performance
- **Goal Tracking:** Target vs. actual performance
