/**
 * Test Audit Logging API Route
 * Demonstrates various audit logging scenarios
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { withErrorHandling } from '@/middleware/errors';
import { 
  withAudit, 
  auditDatabaseOperation, 
  auditAuthEvent, 
  auditSecurityEvent,
  auditPerformanceEvent,
  auditSystemEvent,
  extractAuditContext 
} from '@/middleware/audit';
import { createAuditedDatabase } from '@/lib/services/auditedDatabase';

// GET /api/test-audit - Test various audit logging scenarios
const testAuditLogging = withErrorHandling(withAudit(async (request: NextRequest, user: User) => {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get('type') || 'all';
  const context = extractAuditContext(request, user);

  const results: any[] = [];

  try {
    // Test 1: Database Operations
    if (testType === 'all' || testType === 'database') {
      const auditedDb = createAuditedDatabase(request, user);
      
      // Test SELECT operation
      await auditedDb.query('SELECT NOW() as current_time', [], 'test_table');
      results.push({ test: 'database_select', status: 'success' });

      // Test INSERT operation (if table exists)
      try {
        await auditedDb.insert('audit_logs', {
          client_id: user.clientId,
          table_name: 'test_table',
          record_id: 'test_record',
          action: 'INSERT',
          created_at: new Date()
        });
        results.push({ test: 'database_insert', status: 'success' });
      } catch (error) {
        results.push({ test: 'database_insert', status: 'skipped', reason: 'Table may not exist' });
      }
    }

    // Test 2: Authentication Events
    if (testType === 'all' || testType === 'auth') {
      await auditAuthEvent(context, 'login', true, { 
        test: true, 
        timestamp: new Date().toISOString() 
      });
      results.push({ test: 'auth_login_success', status: 'success' });

      await auditAuthEvent(context, 'login', false, { 
        test: true, 
        reason: 'Invalid credentials' 
      });
      results.push({ test: 'auth_login_failure', status: 'success' });
    }

    // Test 3: Security Events
    if (testType === 'all' || testType === 'security') {
      await auditSecurityEvent(context, 'unauthorized_access', {
        test: true,
        attemptedEndpoint: '/api/admin/users',
        reason: 'Insufficient permissions'
      });
      results.push({ test: 'security_unauthorized', status: 'success' });

      await auditSecurityEvent(context, 'suspicious_activity', {
        test: true,
        activity: 'Multiple failed login attempts',
        ipAddress: context.ipAddress
      });
      results.push({ test: 'security_suspicious', status: 'success' });
    }

    // Test 4: Performance Events
    if (testType === 'all' || testType === 'performance') {
      // Simulate a slow operation
      const startTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
      const duration = Date.now() - startTime;

      await auditPerformanceEvent(context, 'slow_query', duration, {
        test: true,
        query: 'SELECT * FROM large_table',
        duration
      });
      results.push({ test: 'performance_slow_query', status: 'success' });
    }

    // Test 5: System Events
    if (testType === 'all' || testType === 'system') {
      await auditSystemEvent(context, 'system_startup', {
        test: true,
        version: '1.0.0',
        environment: 'development'
      });
      results.push({ test: 'system_startup', status: 'success' });

      await auditSystemEvent(context, 'error_occurred', {
        test: true,
        error: 'Test error for audit logging',
        component: 'test-audit-api'
      });
      results.push({ test: 'system_error', status: 'success' });
    }

    // Test 6: Data Changes
    if (testType === 'all' || testType === 'data') {
      await auditDatabaseOperation(
        context,
        'test_table',
        'test_record_123',
        'INSERT',
        undefined,
        { name: 'Test Record', value: 42 },
        50
      );
      results.push({ test: 'data_insert', status: 'success' });

      await auditDatabaseOperation(
        context,
        'test_table',
        'test_record_123',
        'UPDATE',
        { name: 'Test Record', value: 42 },
        { name: 'Updated Record', value: 84 },
        75
      );
      results.push({ test: 'data_update', status: 'success' });

      await auditDatabaseOperation(
        context,
        'test_table',
        'test_record_123',
        'DELETE',
        { name: 'Updated Record', value: 84 },
        undefined,
        25
      );
      results.push({ test: 'data_delete', status: 'success' });
    }

    return NextResponse.json({
      success: true,
      message: 'Audit logging tests completed',
      testType,
      results,
      context: {
        clientId: context.clientId,
        userId: context.userId,
        endpoint: context.endpoint,
        httpMethod: context.httpMethod,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    // Log the error as a system event
    await auditSystemEvent(context, 'error_occurred', {
      test: true,
      error: (error as Error).message,
      component: 'test-audit-api',
      stack: (error as Error).stack
    });

    throw error;
  }
}));

export const GET = withAuth(testAuditLogging);
