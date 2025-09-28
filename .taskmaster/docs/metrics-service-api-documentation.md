# Metrics Service API Documentation

## Overview

The Metrics Service provides a comprehensive API for retrieving and analyzing performance metrics in the Propaganda Dashboard system. It encapsulates all metrics calculations and provides a clean, cached interface for accessing Show Rate, Close Rate, and other key performance indicators.

## Service Architecture

### Core Components

1. **MetricsService Class**: Main service layer that handles all metrics operations
2. **Calculation Functions**: Business logic for computing metrics (from `src/lib/calculations/metricsCalculations.ts`)
3. **Database Layer**: PostgreSQL queries for data retrieval
4. **Caching Layer**: In-memory cache for performance optimization
5. **API Endpoints**: RESTful endpoints for client access

### Key Features

- **Multi-tenant Support**: All metrics are scoped by client ID
- **Role-based Access Control**: Different access levels for CEO, Admin, and Sales roles
- **Caching**: 5-minute TTL cache for improved performance
- **Comprehensive Metrics**: Show Rate, Close Rate, trends, comparisons, and summaries
- **Real-time Data**: Support for real-time metrics (last 24 hours)
- **Validation**: Input validation for all parameters

## API Endpoints

### 1. Get Metrics
**GET** `/api/metrics`

Retrieves comprehensive metrics for a client or user.

**Query Parameters:**
- `clientId` (optional): UUID of the client
- `userId` (optional): UUID of the user
- `dateFrom` (optional): Start date (ISO string)
- `dateTo` (optional): End date (ISO string)

**Response:**
```json
{
  "success": true,
  "data": {
    "showRate": {
      "percentage": 75.0,
      "completedCalls": 15,
      "totalCalls": 20
    },
    "closeRate": {
      "percentage": 60.0,
      "wonCalls": 9,
      "completedCalls": 15
    },
    "totalCalls": 20,
    "wonCalls": 9,
    "lostCalls": 6,
    "tbdCalls": 0,
    "lossReasons": [
      {
        "reason": "Price too high",
        "count": 3,
        "percentage": 50.0
      }
    ]
  }
}
```

### 2. Get Metrics Summary
**GET** `/api/metrics/summary`

Retrieves comprehensive metrics summary with additional insights.

**Query Parameters:** Same as Get Metrics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCalls": 20,
    "completedCalls": 15,
    "wonCalls": 9,
    "lostCalls": 6,
    "noShowCalls": 3,
    "rescheduledCalls": 2,
    "showRate": 75.0,
    "closeRate": 60.0,
    "averageCallDuration": 25,
    "topLossReasons": [
      {
        "reason": "Price too high",
        "count": 3,
        "percentage": 50.0
      }
    ]
  }
}
```

### 3. Get Metrics Comparison
**GET** `/api/metrics/comparison`

Compares metrics between two time periods.

**Query Parameters:**
- `clientId` (optional): UUID of the client
- `userId` (optional): UUID of the user
- `currentDateFrom`: Start date for current period
- `currentDateTo`: End date for current period
- `previousDateFrom`: Start date for previous period
- `previousDateTo`: End date for previous period

**Response:**
```json
{
  "success": true,
  "data": {
    "current": { /* metrics for current period */ },
    "previous": { /* metrics for previous period */ },
    "change": {
      "showRate": 5.0,
      "closeRate": -2.0,
      "totalCalls": 10,
      "wonCalls": 3
    }
  }
}
```

### 4. Get Real-time Metrics
**GET** `/api/metrics/realtime`

Retrieves real-time metrics for the last 24 hours.

**Query Parameters:**
- `clientId` (optional): UUID of the client
- `userId` (optional): UUID of the user

**Response:**
```json
{
  "success": true,
  "data": { /* metrics data */ },
  "period": "last_24_hours",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 5. Get Weekly Metrics
**GET** `/api/metrics/weekly`

Retrieves weekly metrics for the last 7 days.

**Query Parameters:**
- `clientId` (optional): UUID of the client
- `userId` (optional): UUID of the user

**Response:**
```json
{
  "success": true,
  "data": { /* metrics data */ },
  "period": "last_7_days",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 6. Get Monthly Metrics
**GET** `/api/metrics/monthly`

Retrieves monthly metrics for the last 30 days.

**Query Parameters:**
- `clientId` (optional): UUID of the client
- `userId` (optional): UUID of the user

**Response:**
```json
{
  "success": true,
  "data": { /* metrics data */ },
  "period": "last_30_days",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 7. Get Metrics Trend
**GET** `/api/metrics/trend`

Retrieves trend data for metrics over time.

**Query Parameters:**
- `clientId` (optional): UUID of the client
- `days` (optional): Number of days to analyze (default: 30)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15",
      "showRate": 75.0,
      "closeRate": 60.0,
      "totalCalls": 5,
      "completedCalls": 4,
      "wonCalls": 2
    }
  ]
}
```

### 8. Get User Performance Comparison
**GET** `/api/metrics/performance`

Compares performance between users (Admin/CEO only).

**Query Parameters:**
- `clientId` (optional): UUID of the client

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userId": "user-1",
      "userName": "John Doe",
      "showRate": 80.0,
      "closeRate": 65.0,
      "totalCalls": 25,
      "wonCalls": 13
    }
  ]
}
```

### 9. Clear Metrics Cache
**DELETE** `/api/metrics/cache`

Clears the metrics cache (Admin/CEO only).

**Response:**
```json
{
  "success": true,
  "message": "Metrics cache cleared successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Role-based Access Control

### CEO Role
- Can access all metrics across all clients
- Can filter by any client or user
- Can clear cache
- Can view user performance comparisons

### Admin Role
- Can access metrics for their assigned client(s)
- Can filter by users within their client
- Can clear cache
- Can view user performance comparisons within their client

### Sales Role
- Can only access their own personal metrics
- Cannot filter by other users
- Cannot clear cache
- Cannot view user performance comparisons

## Caching Strategy

### Cache Configuration
- **TTL**: 5 minutes (300,000 milliseconds)
- **Storage**: In-memory Map (production should use Redis)
- **Key Generation**: JSON stringified filters
- **Bypass Options**: Real-time metrics bypass cache

### Cache Management
- Automatic expiration based on TTL
- Manual cache clearing via API endpoint
- Cache invalidation on data updates (future enhancement)

## Error Handling

### Common Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "clientId": "Invalid clientId format"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Authorization Error (403):**
```json
{
  "success": false,
  "error": "Access denied to view metrics for this client",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Authentication Error (401):**
```json
{
  "success": false,
  "error": "Authentication required",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Performance Considerations

### Database Optimization
- Indexed queries on `client_id`, `user_id`, `status`, `outcome`, `created_at`
- Efficient WHERE clause construction
- Minimal data transfer with targeted SELECT statements

### Caching Benefits
- Reduced database load for frequently accessed metrics
- Faster response times for repeated queries
- Configurable cache bypass for real-time data

### Query Optimization
- Parallel execution for comparison queries
- Efficient date range filtering
- Optimized aggregation queries for summaries

## Usage Examples

### JavaScript/TypeScript Client
```typescript
// Get metrics for a client
const response = await fetch('/api/metrics?clientId=550e8400-e29b-41d4-a716-446655440001');
const data = await response.json();

// Get real-time metrics
const realtimeResponse = await fetch('/api/metrics/realtime');
const realtimeData = await realtimeResponse.json();

// Get metrics comparison
const comparisonResponse = await fetch('/api/metrics/comparison?' + 
  'currentDateFrom=2024-01-01&currentDateTo=2024-01-31&' +
  'previousDateFrom=2023-12-01&previousDateTo=2023-12-31');
const comparisonData = await comparisonResponse.json();
```

### cURL Examples
```bash
# Get basic metrics
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/metrics?clientId=550e8400-e29b-41d4-a716-446655440001"

# Get weekly metrics
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/metrics/weekly"

# Clear cache (Admin/CEO only)
curl -X DELETE -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/metrics/cache"
```

## Future Enhancements

### Planned Features
1. **Redis Integration**: Replace in-memory cache with Redis
2. **Real-time Updates**: WebSocket support for live metrics
3. **Advanced Analytics**: Machine learning insights
4. **Export Functionality**: CSV/PDF export of metrics
5. **Custom Date Ranges**: Flexible date range selection
6. **Metrics Alerts**: Automated alerts for performance thresholds
7. **Historical Data**: Long-term metrics storage and analysis

### Performance Improvements
1. **Database Partitioning**: Partition calls table by date
2. **Materialized Views**: Pre-computed metrics for common queries
3. **CDN Integration**: Cache static metrics data
4. **Query Optimization**: Advanced indexing strategies

## Testing

### Unit Tests
- Comprehensive test coverage for all service methods
- Mock database interactions
- Cache behavior validation
- Input validation testing

### Integration Tests
- End-to-end API testing
- Authentication and authorization testing
- Database integration testing
- Performance testing

### Test Commands
```bash
# Run all metrics service tests
npm test -- src/lib/services/__tests__/metricsService.test.ts

# Run all metrics calculation tests
npm test -- src/lib/calculations/__tests__/metricsCalculations.test.ts

# Run all tests
npm test
```

## Monitoring and Logging

### Metrics to Monitor
- API response times
- Cache hit/miss ratios
- Database query performance
- Error rates by endpoint
- User access patterns

### Logging Strategy
- Structured logging with correlation IDs
- Performance metrics logging
- Error tracking and alerting
- Audit trail for sensitive operations

This documentation provides a comprehensive guide to the Metrics Service API, enabling developers to effectively integrate and utilize the metrics functionality in the Propaganda Dashboard system.
