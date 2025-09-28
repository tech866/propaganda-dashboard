# Enhanced User Identification System

## Overview

The Enhanced User Identification System provides comprehensive user tracking and context management for the Agency Client Tracking Database & Dashboard. It extends the basic user identification with advanced features including session management, activity tracking, permission validation, and enhanced audit context creation.

## Key Features

### 1. Enhanced User Information Extraction
- **JWT Token Parsing**: Extracts comprehensive user data from NextAuth JWT tokens
- **Request Context**: Captures IP address, user agent, and device information
- **Session Tracking**: Maintains active session information with login time and last activity
- **Client Association**: Links users to their respective client organizations

### 2. Session Management
- **Active Session Tracking**: Monitors user sessions with login time and last activity
- **Session Validation**: Validates session activity and manages session timeouts
- **Multi-Session Support**: Handles multiple concurrent sessions per user
- **Client Session Aggregation**: Groups sessions by client for organizational tracking

### 3. Activity Monitoring
- **User Activity Summary**: Tracks user activity patterns and statistics
- **Session Activity**: Monitors individual session activity and duration
- **Client Activity**: Aggregates activity data at the client level
- **Performance Metrics**: Provides activity-based performance insights

### 4. Permission Validation
- **Role-Based Permissions**: Validates permissions based on user roles (ceo, admin, sales)
- **Resource Access Control**: Checks permissions for specific resources and actions
- **Client-Scoped Permissions**: Validates permissions within client boundaries
- **Dynamic Permission Checking**: Real-time permission validation for API requests

### 5. Enhanced Audit Context
- **Comprehensive Context**: Creates detailed audit context with user, session, and request information
- **Metadata Enrichment**: Includes additional metadata for audit trail completeness
- **Request Correlation**: Links audit logs to specific requests and sessions
- **Client Context**: Maintains client context throughout the audit trail

## Architecture

### Core Components

#### 1. UserIdentificationService
```typescript
class UserIdentificationService {
  // Extract enhanced user information from requests
  async extractUserFromRequest(request: NextRequest): Promise<EnhancedUser | undefined>
  
  // Create comprehensive audit context
  async createAuditContext(request: NextRequest, user?: EnhancedUser): Promise<AuditContext>
  
  // Session management
  async updateUserSession(user: EnhancedUser, request: NextRequest): Promise<void>
  getUserSession(sessionId: string): UserSession | undefined
  getUserSessions(userId: string): UserSession[]
  getClientSessions(clientId: string): UserSession[]
  
  // Activity tracking
  getUserActivitySummary(userId: string): UserActivitySummary
  getClientActivitySummary(clientId: string): ClientActivitySummary
  
  // Permission validation
  hasPermission(user: EnhancedUser, permission: string): boolean
  hasResourcePermission(user: EnhancedUser, resource: string, action: string): boolean
}
```

#### 2. Enhanced User Interface
```typescript
interface EnhancedUser extends User {
  sessionId?: string;
  loginTime?: Date;
  lastActivity?: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: DeviceInfo;
  location?: LocationInfo;
  permissions: string[];
}
```

#### 3. User Session Interface
```typescript
interface UserSession {
  sessionId: string;
  userId: string;
  clientId: string;
  loginTime: Date;
  lastActivity: Date;
  isActive: boolean;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: DeviceInfo;
    location?: LocationInfo;
  };
}
```

#### 4. Activity Summary Interfaces
```typescript
interface UserActivitySummary {
  userId: string;
  totalSessions: number;
  activeSessions: number;
  totalLoginTime: number;
  averageSessionDuration: number;
  lastLogin: Date;
  lastActivity: Date;
  loginFrequency: number;
  activityScore: number;
}

interface ClientActivitySummary {
  clientId: string;
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  activeSessions: number;
  averageSessionDuration: number;
  lastActivity: Date;
  activityScore: number;
}
```

## Integration Points

### 1. NextAuth.js Integration
- **JWT Token Parsing**: Extracts user information from NextAuth JWT tokens
- **Session Management**: Integrates with NextAuth session handling
- **Authentication Events**: Captures authentication events for audit logging

### 2. Audit Middleware Integration
- **Enhanced Context**: Provides enriched audit context for all operations
- **User Tracking**: Ensures comprehensive user tracking in audit logs
- **Session Correlation**: Links audit logs to specific user sessions

### 3. Database Operations
- **Audited Database Service**: Integrates with enhanced audited database operations
- **User Context**: Maintains user context throughout database operations
- **Permission Validation**: Validates permissions before database operations

### 4. API Route Integration
- **Enhanced Audit Wrapper**: Provides `withEnhancedAudit` wrapper for API routes
- **User Context**: Automatically extracts and maintains user context
- **Permission Checking**: Validates permissions for API access

## Usage Examples

### 1. Basic User Identification
```typescript
import { userIdentificationService } from '@/lib/services/userIdentification';

// Extract user from request
const user = await userIdentificationService.extractUserFromRequest(request);

// Create audit context
const context = await userIdentificationService.createAuditContext(request, user);
```

### 2. Session Management
```typescript
// Update user session
await userIdentificationService.updateUserSession(user, request);

// Get user sessions
const sessions = userIdentificationService.getUserSessions(user.id);

// Get client sessions
const clientSessions = userIdentificationService.getClientSessions(user.clientId);
```

### 3. Activity Tracking
```typescript
// Get user activity summary
const userActivity = userIdentificationService.getUserActivitySummary(user.id);

// Get client activity summary
const clientActivity = userIdentificationService.getClientActivitySummary(user.clientId);
```

### 4. Permission Validation
```typescript
// Check specific permission
const hasPermission = userIdentificationService.hasPermission(user, 'read:all');

// Check resource permission
const hasResourcePermission = userIdentificationService.hasResourcePermission(
  user, 
  'calls', 
  'read'
);
```

### 5. Enhanced Audit Context
```typescript
// Create comprehensive audit context
const context = await userIdentificationService.createAuditContext(request, user);

// Use in audit logging
await auditService.log({
  ...context,
  action: 'API_ACCESS',
  resource: 'calls',
  details: 'User accessed calls API'
});
```

## Configuration

### Environment Variables
```bash
# NextAuth configuration (required)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Session timeout (optional, default: 24 hours)
USER_SESSION_TIMEOUT=86400000

# Activity tracking (optional, default: enabled)
ENABLE_ACTIVITY_TRACKING=true

# Permission validation (optional, default: enabled)
ENABLE_PERMISSION_VALIDATION=true
```

### Service Configuration
```typescript
// Configure session timeout
userIdentificationService.setSessionTimeout(24 * 60 * 60 * 1000); // 24 hours

// Configure activity tracking
userIdentificationService.setActivityTracking(true);

// Configure permission validation
userIdentificationService.setPermissionValidation(true);
```

## Testing

### Test Endpoints
- **GET /api/test-user-identification**: Comprehensive user identification testing
- **GET /api/test-user-identification?type=user**: Test user extraction
- **GET /api/test-user-identification?type=context**: Test audit context creation
- **GET /api/test-user-identification?type=session**: Test session tracking
- **GET /api/test-user-identification?type=activity**: Test activity summary
- **GET /api/test-user-identification?type=database**: Test enhanced audited database
- **GET /api/test-user-identification?type=permissions**: Test permission validation
- **GET /api/test-user-identification?type=sessions**: Test session management

### Test Script
```bash
# Run comprehensive user identification tests
node scripts/test-user-identification.js
```

### Test Coverage
- User information extraction from JWT tokens
- Audit context creation with enhanced metadata
- Session tracking and management
- Activity monitoring and summarization
- Permission validation for different roles
- Enhanced audited database operations
- Integration with audit logging system

## Security Considerations

### 1. Data Privacy
- **Minimal Data Collection**: Only collects necessary user information
- **Data Retention**: Implements configurable data retention policies
- **Data Encryption**: Ensures sensitive data is encrypted in transit and at rest

### 2. Session Security
- **Session Validation**: Validates session integrity and authenticity
- **Session Timeout**: Implements automatic session timeout
- **Session Invalidation**: Provides secure session invalidation

### 3. Permission Security
- **Role-Based Access**: Implements strict role-based access control
- **Permission Validation**: Validates permissions for all operations
- **Client Isolation**: Ensures client data isolation

### 4. Audit Security
- **Audit Trail Integrity**: Ensures audit trail cannot be tampered with
- **Audit Log Protection**: Protects audit logs from unauthorized access
- **Audit Log Retention**: Implements secure audit log retention

## Performance Considerations

### 1. Caching
- **Session Caching**: Caches active sessions for performance
- **User Data Caching**: Caches user data to reduce database queries
- **Permission Caching**: Caches permission data for faster validation

### 2. Optimization
- **Lazy Loading**: Implements lazy loading for non-critical data
- **Batch Operations**: Supports batch operations for efficiency
- **Connection Pooling**: Uses connection pooling for database operations

### 3. Monitoring
- **Performance Metrics**: Tracks performance metrics for optimization
- **Resource Usage**: Monitors resource usage and memory consumption
- **Error Tracking**: Tracks and logs errors for debugging

## Troubleshooting

### Common Issues

#### 1. User Not Found
```typescript
// Check if user extraction is working
const user = await userIdentificationService.extractUserFromRequest(request);
if (!user) {
  console.log('User not found - check JWT token and NextAuth configuration');
}
```

#### 2. Session Not Tracked
```typescript
// Check session tracking
const session = userIdentificationService.getUserSession(sessionId);
if (!session) {
  console.log('Session not found - check session management configuration');
}
```

#### 3. Permission Denied
```typescript
// Check permission validation
const hasPermission = userIdentificationService.hasPermission(user, permission);
if (!hasPermission) {
  console.log('Permission denied - check user role and permission configuration');
}
```

#### 4. Audit Context Missing
```typescript
// Check audit context creation
const context = await userIdentificationService.createAuditContext(request, user);
if (!context.userId || !context.clientId) {
  console.log('Audit context incomplete - check user extraction and context creation');
}
```

### Debug Mode
```typescript
// Enable debug mode for troubleshooting
userIdentificationService.setDebugMode(true);

// Check debug logs
console.log('Debug logs:', userIdentificationService.getDebugLogs());
```

## Future Enhancements

### 1. Advanced Analytics
- **User Behavior Analysis**: Analyze user behavior patterns
- **Performance Analytics**: Track performance metrics and trends
- **Predictive Analytics**: Implement predictive analytics for user activity

### 2. Enhanced Security
- **Multi-Factor Authentication**: Implement MFA support
- **Device Fingerprinting**: Add device fingerprinting for security
- **Risk Assessment**: Implement risk assessment for user actions

### 3. Integration Enhancements
- **SSO Integration**: Support for single sign-on providers
- **LDAP Integration**: Support for LDAP authentication
- **OAuth Integration**: Enhanced OAuth provider support

### 4. Monitoring and Alerting
- **Real-time Monitoring**: Implement real-time monitoring
- **Alert System**: Add alert system for security events
- **Dashboard Integration**: Integrate with monitoring dashboards

## Conclusion

The Enhanced User Identification System provides a robust foundation for user tracking, session management, and audit logging in the Agency Client Tracking Database & Dashboard. It ensures comprehensive user context throughout the application while maintaining security and performance standards.

The system is designed to be extensible and configurable, allowing for future enhancements and customizations based on specific business requirements.
