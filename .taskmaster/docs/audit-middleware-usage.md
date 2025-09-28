# Audit Middleware Usage Guide

## Overview

The audit middleware system provides comprehensive logging capabilities for the Propaganda Dashboard application. It automatically tracks database operations, API requests, authentication events, security incidents, and performance metrics.

## Components

### 1. Audit Middleware (`src/middleware/audit.ts`)

The core middleware provides functions for logging various types of events:

- **`withAudit`**: Wraps API route handlers to automatically log requests and responses
- **`auditDatabaseOperation`**: Logs database CRUD operations with before/after values
- **`auditAuthEvent`**: Logs authentication events (login, logout, etc.)
- **`auditSecurityEvent`**: Logs security-related events
- **`auditPerformanceEvent`**: Logs performance metrics
- **`auditSystemEvent`**: Logs system-level events
- **`withDatabaseAudit`**: Intercepts database operations for automatic logging

### 2. Audited Database Service (`src/lib/services/auditedDatabase.ts`)

A wrapper around the database service that automatically logs all database operations:

```typescript
import { createAuditedDatabase } from '@/lib/services/auditedDatabase';

const auditedDb = createAuditedDatabase(request, user);

// All operations are automatically logged
await auditedDb.insert('calls', callData);
await auditedDb.update('calls', id, updateData);
await auditedDb.delete('calls', id);
await auditedDb.select('calls', { client_id: clientId });
```

### 3. Next.js Middleware (`src/middleware.ts`)

Global middleware that automatically logs all incoming requests and outgoing responses.

## Usage Examples

### 1. API Route with Audit Logging

```typescript
import { withAuth, User } from '@/middleware/auth';
import { withAudit } from '@/middleware/audit';
import { withErrorHandling } from '@/middleware/errors';

const getCalls = withErrorHandling(withAudit(async (request: NextRequest, user: User) => {
  // Your API logic here
  // All requests and responses are automatically logged
  return NextResponse.json({ data: calls });
}));

export const GET = withAuth(getCalls);
```

### 2. Database Operations with Audit Logging

```typescript
import { createAuditedDatabase } from '@/lib/services/auditedDatabase';

const auditedDb = createAuditedDatabase(request, user);

// Insert with audit logging
const newCall = await auditedDb.insert('calls', {
  client_id: clientId,
  prospect_name: 'John Doe',
  call_duration: 300,
  outcome: 'interested'
});

// Update with audit logging (captures old and new values)
const updatedCall = await auditedDb.update('calls', callId, {
  outcome: 'scheduled_meeting',
  notes: 'Follow up next week'
});

// Delete with audit logging (captures old values)
await auditedDb.delete('calls', callId);
```

### 3. Manual Audit Logging

```typescript
import { 
  auditAuthEvent, 
  auditSecurityEvent, 
  auditPerformanceEvent,
  extractAuditContext 
} from '@/middleware/audit';

const context = extractAuditContext(request, user);

// Log authentication events
await auditAuthEvent(context, 'login', true, { 
  loginMethod: 'credentials' 
});

// Log security events
await auditSecurityEvent(context, 'unauthorized_access', {
  attemptedEndpoint: '/api/admin/users',
  reason: 'Insufficient permissions'
});

// Log performance events
await auditPerformanceEvent(context, 'slow_query', 1500, {
  query: 'SELECT * FROM large_table',
  tableSize: '1000000 rows'
});
```

## Configuration

### Audit Service Configuration

The audit service can be configured through environment variables or the `AuditConfig` interface:

```typescript
const config: AuditConfig = {
  enabled: true,
  logSelects: true,
  logInserts: true,
  logUpdates: true,
  logDeletes: true,
  batchSize: 10,
  flushInterval: 5000,
  retentionDays: 365,
  sensitiveFields: ['password', 'ssn', 'creditCardNumber']
};
```

### Database Schema

The audit logs are stored in the `audit_logs` table with the following structure:

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  user_id UUID,
  table_name VARCHAR(255),
  record_id VARCHAR(255),
  action VARCHAR(50) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id UUID,
  endpoint VARCHAR(255),
  http_method VARCHAR(10),
  status_code INTEGER,
  operation_duration_ms INTEGER,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### 1. Retrieve Audit Logs

```
GET /api/audit?clientId=uuid&userId=uuid&action=INSERT&limit=100&offset=0
```

### 2. Get Audit Statistics

```
GET /api/audit/stats?clientId=uuid
```

### 3. Clean Up Old Logs

```
DELETE /api/audit/cleanup?retentionDays=365
```

### 4. Test Audit Logging

```
GET /api/test-audit?type=all
```

## Best Practices

### 1. Use Audited Database Service

Always use the `AuditedDatabaseService` for database operations to ensure automatic logging:

```typescript
// ✅ Good
const auditedDb = createAuditedDatabase(request, user);
await auditedDb.insert('calls', data);

// ❌ Avoid (no audit logging)
await query('INSERT INTO calls ...', [data]);
```

### 2. Wrap API Routes

Use the `withAudit` wrapper for API routes to ensure request/response logging:

```typescript
// ✅ Good
const handler = withErrorHandling(withAudit(async (request, user) => {
  // API logic
}));

// ❌ Avoid (no audit logging)
const handler = withErrorHandling(async (request, user) => {
  // API logic
});
```

### 3. Log Security Events

Always log security-related events:

```typescript
// Log unauthorized access attempts
await auditSecurityEvent(context, 'unauthorized_access', {
  attemptedEndpoint: request.nextUrl.pathname,
  reason: 'Invalid token'
});

// Log suspicious activity
await auditSecurityEvent(context, 'suspicious_activity', {
  activity: 'Multiple failed login attempts',
  count: 5
});
```

### 4. Monitor Performance

Log performance events for slow operations:

```typescript
const startTime = Date.now();
// ... perform operation
const duration = Date.now() - startTime;

if (duration > 1000) {
  await auditPerformanceEvent(context, 'slow_operation', duration, {
    operation: 'complex_query',
    duration
  });
}
```

## Testing

### 1. Test Audit Logging

Use the test endpoint to verify audit logging functionality:

```bash
# Test all audit logging types
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/test-audit?type=all"

# Test specific audit logging type
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/test-audit?type=database"
```

### 2. Verify Logs

Check that audit logs are being created:

```bash
# Get recent audit logs
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/audit?limit=10"

# Get audit statistics
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/audit/stats"
```

## Troubleshooting

### 1. Audit Logs Not Appearing

- Check that the audit service is enabled
- Verify database connection
- Check for errors in the console
- Ensure the audit_logs table exists

### 2. Performance Issues

- Adjust batch size and flush interval
- Consider disabling SELECT logging for high-volume operations
- Monitor database performance

### 3. Missing Context Information

- Ensure user authentication is working
- Check that audit context is being extracted correctly
- Verify middleware is running on the correct routes

## Security Considerations

### 1. Sensitive Data

The audit system automatically redacts sensitive fields defined in the configuration:

```typescript
sensitiveFields: ['password', 'ssn', 'creditCardNumber']
```

### 2. Access Control

Only users with appropriate roles can access audit logs:

- **CEO**: Can access all audit logs
- **Admin**: Can access audit logs for their client
- **Sales**: Cannot access audit logs

### 3. Data Retention

Configure appropriate retention periods for audit logs:

```typescript
retentionDays: 365 // Keep logs for 1 year
```

## Monitoring and Alerting

### 1. Error Monitoring

Monitor audit logs for errors and security events:

```sql
SELECT * FROM audit_logs 
WHERE error_message IS NOT NULL 
ORDER BY created_at DESC;
```

### 2. Performance Monitoring

Track slow operations:

```sql
SELECT * FROM audit_logs 
WHERE operation_duration_ms > 1000 
ORDER BY operation_duration_ms DESC;
```

### 3. Security Monitoring

Monitor security events:

```sql
SELECT * FROM audit_logs 
WHERE table_name = 'security_events' 
ORDER BY created_at DESC;
```
