/**
 * Audit Logging Middleware
 * Propaganda Dashboard - Comprehensive Audit Trail System
 */

import { NextRequest, NextResponse } from 'next/server';
import { auditService } from '@/lib/services/auditService';
import { AuditContext, AuditLevel, AuditCategory } from '@/lib/types/audit';
import { User } from '@/middleware/auth';

/**
 * Extract audit context from request and user
 */
export function extractAuditContext(request: NextRequest, user?: User): AuditContext {
  const ipAddress = request.ip || 
    request.headers.get('x-forwarded-for') || 
    request.headers.get('x-real-ip') || 
    'unknown';
  
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const endpoint = request.nextUrl.pathname;
  const httpMethod = request.method as any;

  return {
    clientId: user?.clientId || 'unknown',
    userId: user?.id,
    sessionId: request.headers.get('x-session-id') || undefined,
    ipAddress,
    userAgent,
    endpoint,
    httpMethod,
    metadata: {
      referer: request.headers.get('referer'),
      origin: request.headers.get('origin'),
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Audit middleware wrapper for API routes
 */
export function withAudit<T extends any[]>(
  handler: (request: NextRequest, user: User, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, user: User, ...args: T): Promise<NextResponse> => {
    const startTime = Date.now();
    const context = extractAuditContext(request, user);
    let response: NextResponse;
    let error: Error | null = null;

    try {
      // Execute the original handler
      response = await handler(request, user, ...args);
      
      // Log successful operation
      await auditService.logDataAccess(
        context,
        'api_requests',
        'request',
        'SELECT',
        undefined,
        {
          statusCode: response.status,
          endpoint: context.endpoint,
          method: context.httpMethod
        },
        Date.now() - startTime
      );

    } catch (err) {
      error = err as Error;
      
      // Log error
      await auditService.logError(
        context,
        error,
        'api_requests',
        'request',
        context.httpMethod
      );

      // Re-throw the error
      throw error;
    }

    return response;
  };
}

/**
 * Audit database operations
 */
export async function auditDatabaseOperation(
  context: AuditContext,
  tableName: string,
  recordId: string,
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT',
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>,
  duration?: number
): Promise<void> {
  try {
    await auditService.logDataAccess(
      context,
      tableName,
      recordId,
      action,
      oldValues,
      newValues,
      duration
    );
  } catch (error) {
    // Don't let audit logging errors break the main operation
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Audit authentication events
 */
export async function auditAuthEvent(
  context: AuditContext,
  action: 'login' | 'logout' | 'register' | 'password_reset' | 'session_expired',
  success: boolean,
  details?: Record<string, any>
): Promise<void> {
  try {
    await auditService.logAuth(context, action, success, details);
  } catch (error) {
    console.error('Failed to log auth event:', error);
  }
}

/**
 * Audit API access
 */
export async function auditApiAccess(
  context: AuditContext,
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number,
  errorMessage?: string
): Promise<void> {
  try {
    const auditContext = {
      ...context,
      endpoint,
      httpMethod: method as any
    };

    if (errorMessage) {
      await auditService.logError(
        auditContext,
        new Error(errorMessage),
        'api_requests',
        endpoint
      );
    } else {
      await auditService.logDataAccess(
        auditContext,
        'api_requests',
        endpoint,
        'SELECT',
        undefined,
        {
          statusCode,
          method,
          endpoint
        },
        duration
      );
    }
  } catch (error) {
    console.error('Failed to log API access:', error);
  }
}

/**
 * Audit data changes with before/after values
 */
export async function auditDataChange(
  context: AuditContext,
  tableName: string,
  recordId: string,
  action: 'INSERT' | 'UPDATE' | 'DELETE',
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>,
  duration?: number
): Promise<void> {
  try {
    await auditService.logDataAccess(
      context,
      tableName,
      recordId,
      action,
      oldValues,
      newValues,
      duration
    );
  } catch (error) {
    console.error('Failed to log data change:', error);
  }
}

/**
 * Audit security events
 */
export async function auditSecurityEvent(
  context: AuditContext,
  event: 'unauthorized_access' | 'permission_denied' | 'suspicious_activity' | 'rate_limit_exceeded',
  details?: Record<string, any>
): Promise<void> {
  try {
    await auditService.logEnhanced(
      {
        clientId: context.clientId,
        userId: context.userId,
        tableName: 'security_events',
        recordId: 'security',
        action: 'SELECT',
        endpoint: context.endpoint,
        httpMethod: context.httpMethod,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        statusCode: 403,
        metadata: {
          securityEvent: event,
          ...details,
          ...context.metadata
        }
      },
      AuditLevel.WARN,
      AuditCategory.SECURITY,
      ['security', event]
    );
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Audit performance events
 */
export async function auditPerformanceEvent(
  context: AuditContext,
  operation: string,
  duration: number,
  details?: Record<string, any>
): Promise<void> {
  try {
    await auditService.logEnhanced(
      {
        clientId: context.clientId,
        userId: context.userId,
        tableName: 'performance_events',
        recordId: operation,
        action: 'SELECT',
        endpoint: context.endpoint,
        httpMethod: context.httpMethod,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        operationDurationMs: duration,
        metadata: {
          operation,
          duration,
          ...details,
          ...context.metadata
        }
      },
      duration > 1000 ? AuditLevel.WARN : AuditLevel.INFO,
      AuditCategory.PERFORMANCE,
      ['performance', operation]
    );
  } catch (error) {
    console.error('Failed to log performance event:', error);
  }
}

/**
 * Audit system events
 */
export async function auditSystemEvent(
  context: AuditContext,
  event: 'system_startup' | 'system_shutdown' | 'maintenance_mode' | 'backup_completed' | 'error_occurred',
  details?: Record<string, any>
): Promise<void> {
  try {
    await auditService.logEnhanced(
      {
        clientId: context.clientId,
        userId: context.userId,
        tableName: 'system_events',
        recordId: 'system',
        action: 'SELECT',
        endpoint: context.endpoint,
        httpMethod: context.httpMethod,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        metadata: {
          systemEvent: event,
          ...details,
          ...context.metadata
        }
      },
      event === 'error_occurred' ? AuditLevel.ERROR : AuditLevel.INFO,
      AuditCategory.SYSTEM,
      ['system', event]
    );
  } catch (error) {
    console.error('Failed to log system event:', error);
  }
}

/**
 * Create audit context from request headers
 */
export function createAuditContextFromHeaders(
  request: NextRequest,
  user?: User
): AuditContext {
  return extractAuditContext(request, user);
}

/**
 * Audit middleware for Next.js API routes
 */
export function auditMiddleware(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const startTime = Date.now();
    const context = extractAuditContext(request);
    
    try {
      const response = await handler(request, ...args);
      const duration = Date.now() - startTime;
      
      await auditApiAccess(
        context,
        context.endpoint || 'unknown',
        context.httpMethod || 'GET',
        response?.status || 200,
        duration
      );
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      await auditApiAccess(
        context,
        context.endpoint || 'unknown',
        context.httpMethod || 'GET',
        500,
        duration,
        (error as Error).message
      );
      
      throw error;
    }
  };
}
