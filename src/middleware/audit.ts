/**
 * Audit Logging Middleware
 * Propaganda Dashboard - Comprehensive Audit Trail System
 */

import { NextRequest, NextResponse } from 'next/server';
import { auditService } from '@/lib/services/auditService';
import { AuditContext, AuditLevel, AuditCategory, AuditLogCreate } from '@/lib/types/audit';
import { User } from '@/middleware/auth';
import { PoolClient } from 'pg';
import { userIdentificationService, EnhancedUser } from '@/lib/services/userIdentification';

// Use the exported audit service instance

/**
 * Extract audit context from request and user (legacy function)
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
    clientId: user?.clientId || null,
    userId: user?.id || null,
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
 * Extract enhanced audit context with comprehensive user identification
 */
export async function extractEnhancedAuditContext(request: NextRequest, user?: User | EnhancedUser): Promise<AuditContext> {
  // If user is already enhanced, use it directly
  if (user && 'sessionId' in user) {
    return await userIdentificationService.createAuditContext(request, user as EnhancedUser);
  }

  // Otherwise, extract user from request
  const enhancedUser = await userIdentificationService.extractUserFromRequest(request);
  return await userIdentificationService.createAuditContext(request, enhancedUser);
}

/**
 * Audit middleware wrapper for API routes (legacy version)
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
      const auditLog: AuditLogCreate = {
        clientId: context.clientId,
        userId: context.userId,
        tableName: 'api_requests',
        recordId: 'request',
        action: 'SELECT',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        endpoint: context.endpoint,
        httpMethod: context.httpMethod,
        statusCode: response.status,
        operationDurationMs: Date.now() - startTime,
        metadata: {
          ...context.metadata,
          statusCode: response.status,
          endpoint: context.endpoint,
          method: context.httpMethod
        }
      };

      await auditService.log(auditLog);

    } catch (err) {
      error = err as Error;
      
      // Log error
      const errorLog: AuditLogCreate = {
        clientId: context.clientId,
        userId: context.userId,
        tableName: 'api_requests',
        recordId: 'request',
        action: 'SELECT',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        endpoint: context.endpoint,
        httpMethod: context.httpMethod,
        statusCode: 500,
        operationDurationMs: Date.now() - startTime,
        errorMessage: error.message,
        metadata: {
          ...context.metadata,
          error: error.message,
          stack: error.stack
        }
      };

      await auditService.log(errorLog);

      // Re-throw the error
      throw error;
    }

    return response;
  };
}

/**
 * Enhanced audit middleware wrapper with comprehensive user identification
 */
export function withEnhancedAudit<T extends any[]>(
  handler: (request: NextRequest, user: User, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, user: User, ...args: T): Promise<NextResponse> => {
    const startTime = Date.now();
    const context = await extractEnhancedAuditContext(request, user);
    let response: NextResponse;
    let error: Error | null = null;

    try {
      // Execute the original handler
      response = await handler(request, user, ...args);
      
      // Log successful operation with enhanced context
      const auditLog: AuditLogCreate = {
        clientId: context.clientId,
        userId: context.userId,
        tableName: 'api_requests',
        recordId: 'request',
        action: 'SELECT',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        endpoint: context.endpoint,
        httpMethod: context.httpMethod,
        statusCode: response.status,
        operationDurationMs: Date.now() - startTime,
        metadata: {
          ...context.metadata,
          statusCode: response.status,
          endpoint: context.endpoint,
          method: context.httpMethod,
          enhanced: true
        }
      };

      await auditService.log(auditLog);

    } catch (err) {
      error = err as Error;
      
      // Log error with enhanced context
      const errorLog: AuditLogCreate = {
        clientId: context.clientId,
        userId: context.userId,
        tableName: 'api_requests',
        recordId: 'request',
        action: 'SELECT',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        endpoint: context.endpoint,
        httpMethod: context.httpMethod,
        statusCode: 500,
        operationDurationMs: Date.now() - startTime,
        errorMessage: error.message,
        metadata: {
          ...context.metadata,
          error: error.message,
          stack: error.stack,
          enhanced: true
        }
      };

      await auditService.log(errorLog);

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
    const auditLog: AuditLogCreate = {
      clientId: context.clientId,
      userId: context.userId,
      tableName,
      recordId,
      action,
      oldValues,
      newValues,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      sessionId: context.sessionId,
      endpoint: context.endpoint,
      httpMethod: context.httpMethod,
      operationDurationMs: duration,
      metadata: {
        ...context.metadata,
        operation: 'database',
        tableName,
        recordId,
        action
      }
    };

    await auditService.log(auditLog);
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
    const auditLog: AuditLogCreate = {
      clientId: context.clientId,
      userId: context.userId,
      tableName: 'auth_events',
      recordId: action,
      action: 'INSERT',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      sessionId: context.sessionId,
      endpoint: context.endpoint,
      httpMethod: context.httpMethod,
      statusCode: success ? 200 : 401,
      metadata: {
        ...context.metadata,
        authAction: action,
        success,
        ...details
      }
    };

    await auditService.log(auditLog);
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
    const auditLog: AuditLogCreate = {
      clientId: context.clientId,
      userId: context.userId,
      tableName: 'api_requests',
      recordId: endpoint,
      action: 'SELECT',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      sessionId: context.sessionId,
      endpoint,
      httpMethod: method as any,
      statusCode,
      operationDurationMs: duration,
      errorMessage,
      metadata: {
        ...context.metadata,
        method,
        endpoint,
        duration
      }
    };

    await auditService.log(auditLog);
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
    const auditLog: AuditLogCreate = {
      clientId: context.clientId,
      userId: context.userId,
      tableName,
      recordId,
      action,
      oldValues,
      newValues,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      sessionId: context.sessionId,
      endpoint: context.endpoint,
      httpMethod: context.httpMethod,
      operationDurationMs: duration,
      metadata: {
        ...context.metadata,
        operation: 'data_change',
        tableName,
        recordId,
        action,
        hasOldValues: !!oldValues,
        hasNewValues: !!newValues
      }
    };

    await auditService.log(auditLog);
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
    const auditLog: AuditLogCreate = {
      clientId: context.clientId,
      userId: context.userId,
      tableName: 'security_events',
      recordId: 'security',
      action: 'SELECT',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      sessionId: context.sessionId,
      endpoint: context.endpoint,
      httpMethod: context.httpMethod,
      statusCode: 403,
      metadata: {
        ...context.metadata,
        securityEvent: event,
        level: AuditLevel.WARN,
        category: AuditCategory.SECURITY,
        tags: ['security', event],
        ...details
      }
    };

    await auditService.log(auditLog);
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
    const auditLog: AuditLogCreate = {
      clientId: context.clientId,
      userId: context.userId,
      tableName: 'performance_events',
      recordId: operation,
      action: 'SELECT',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      sessionId: context.sessionId,
      endpoint: context.endpoint,
      httpMethod: context.httpMethod,
      operationDurationMs: duration,
      metadata: {
        ...context.metadata,
        operation,
        duration,
        level: duration > 1000 ? AuditLevel.WARN : AuditLevel.INFO,
        category: AuditCategory.PERFORMANCE,
        tags: ['performance', operation],
        ...details
      }
    };

    await auditService.log(auditLog);
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
    const auditLog: AuditLogCreate = {
      clientId: context.clientId,
      userId: context.userId,
      tableName: 'system_events',
      recordId: 'system',
      action: 'SELECT',
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      sessionId: context.sessionId,
      endpoint: context.endpoint,
      httpMethod: context.httpMethod,
      metadata: {
        ...context.metadata,
        systemEvent: event,
        level: event === 'error_occurred' ? AuditLevel.ERROR : AuditLevel.INFO,
        category: AuditCategory.SYSTEM,
        tags: ['system', event],
        ...details
      }
    };

    await auditService.log(auditLog);
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

/**
 * Database operation interceptor for audit logging
 */
export function withDatabaseAudit<T extends any[]>(
  operation: (client: PoolClient, ...args: T) => Promise<any>,
  tableName: string,
  context: AuditContext
) {
  return async (client: PoolClient, ...args: T): Promise<any> => {
    const startTime = Date.now();
    let oldValues: Record<string, any> | undefined;
    let newValues: Record<string, any> | undefined;
    let recordId: string = 'unknown';
    let action: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT' = 'SELECT';

    try {
      // Determine operation type and capture old values for UPDATE/DELETE
      const query = args[0] as string;
      const queryLower = query.toLowerCase().trim();
      
      if (queryLower.startsWith('insert')) {
        action = 'INSERT';
        newValues = args[1] || {};
        recordId = newValues.id || 'new';
      } else if (queryLower.startsWith('update')) {
        action = 'UPDATE';
        newValues = args[1] || {};
        
        // Try to get old values for UPDATE operations
        if (newValues.id) {
          try {
            const selectQuery = `SELECT * FROM ${tableName} WHERE id = $1`;
            const oldResult = await client.query(selectQuery, [newValues.id]);
            oldValues = oldResult.rows[0];
            recordId = newValues.id;
          } catch (err) {
            console.warn('Could not fetch old values for audit:', err);
          }
        }
      } else if (queryLower.startsWith('delete')) {
        action = 'DELETE';
        
        // Try to get old values for DELETE operations
        if (args[1] && args[1].length > 0) {
          try {
            const selectQuery = `SELECT * FROM ${tableName} WHERE id = $1`;
            const oldResult = await client.query(selectQuery, [args[1][0]]);
            oldValues = oldResult.rows[0];
            recordId = args[1][0];
          } catch (err) {
            console.warn('Could not fetch old values for audit:', err);
          }
        }
      }

      // Execute the original operation
      const result = await operation(client, ...args);
      const duration = Date.now() - startTime;

      // Log the database operation
      await auditDatabaseOperation(
        context,
        tableName,
        recordId,
        action,
        oldValues,
        newValues,
        duration
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Log the failed operation
      const errorLog: AuditLogCreate = {
        clientId: context.clientId,
        userId: context.userId,
        tableName,
        recordId,
        action,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        endpoint: context.endpoint,
        httpMethod: context.httpMethod,
        operationDurationMs: duration,
        errorMessage: (error as Error).message,
        metadata: {
          ...context.metadata,
          operation: 'database',
          tableName,
          recordId,
          action,
          error: (error as Error).message,
          stack: (error as Error).stack
        }
      };

      await auditService.log(errorLog);
      throw error;
    }
  };
}
