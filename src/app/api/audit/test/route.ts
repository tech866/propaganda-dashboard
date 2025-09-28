/**
 * Test Audit Logs API Route
 * Task 10.4 - Test the enhanced audit logs table functionality
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { withErrorHandling } from '@/middleware/errors';
import { withEnhancedAudit } from '@/middleware/audit';
import { createEnhancedAuditedDatabase } from '@/lib/services/enhancedAuditedDatabase';
import { query } from '@/lib/database';

// GET /api/audit/test - Test audit logs functionality
const testAuditLogs = withErrorHandling(withEnhancedAudit(async (request: NextRequest, user: User) => {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get('type') || 'all';

  const results: any[] = [];

  try {
    // Test 1: Insert audit log directly
    if (testType === 'all' || testType === 'insert') {
      const auditedDb = await createEnhancedAuditedDatabase(request, user);
      
      const insertResult = await auditedDb.insert('audit_logs', {
        client_id: user.clientId,
        user_id: user.id,
        table_name: 'test_table',
        record_id: '750e8400-e29b-41d4-a716-446655440001',
        action: 'INSERT',
        endpoint: '/api/audit/test',
        http_method: 'GET',
        status_code: 200,
        operation_duration_ms: 50,
        ip_address: '127.0.0.1',
        user_agent: 'Test User Agent',
        session_id: 'test-session-789',
        metadata: {
          test: true,
          source: 'api_test',
          timestamp: new Date().toISOString()
        }
      }, 'id, table_name, action, endpoint');

      results.push({
        test: 'direct_insert',
        status: 'success',
        data: {
          id: insertResult.id,
          table_name: insertResult.table_name,
          action: insertResult.action,
          endpoint: insertResult.endpoint
        }
      });
    }

    // Test 2: Query audit logs using the summary view
    if (testType === 'all' || testType === 'query') {
      const queryResult = await query(`
        SELECT 
          id, client_name, user_name, table_name, action, 
          endpoint, http_method, status_code, operation_duration_ms,
          created_at
        FROM audit_logs_summary 
        WHERE user_id = $1
        ORDER BY created_at DESC 
        LIMIT 10
      `, [user.id]);

      results.push({
        test: 'summary_view_query',
        status: 'success',
        data: {
          count: queryResult.rows.length,
          logs: queryResult.rows.map(row => ({
            id: row.id,
            table_name: row.table_name,
            action: row.action,
            endpoint: row.endpoint,
            created_at: row.created_at
          }))
        }
      });
    }

    // Test 3: Test statistics function
    if (testType === 'all' || testType === 'stats') {
      const statsResult = await query(`
        SELECT * FROM get_audit_log_stats($1, $2, 30)
      `, [user.clientId, user.id]);

      const stats = statsResult.rows[0];
      results.push({
        test: 'statistics_function',
        status: 'success',
        data: {
          total_logs: stats.total_logs,
          logs_by_action: stats.logs_by_action,
          logs_by_table: stats.logs_by_table,
          logs_by_user: stats.logs_by_user,
          avg_duration_ms: Math.round(stats.avg_duration_ms || 0),
          error_count: stats.error_count
        }
      });
    }

    // Test 4: Test cleanup function (dry run)
    if (testType === 'all' || testType === 'cleanup') {
      const cleanupResult = await query(`
        SELECT cleanup_old_audit_logs(365)
      `);

      results.push({
        test: 'cleanup_function',
        status: 'success',
        data: {
          logs_that_would_be_deleted: cleanupResult.rows[0].cleanup_old_audit_logs,
          note: 'This is a dry run with 365-day retention'
        }
      });
    }

    // Test 5: Test enhanced audited database operations
    if (testType === 'all' || testType === 'audited_db') {
      const auditedDb = await createEnhancedAuditedDatabase(request, user);
      
      // Test a simple query
      const testResult = await auditedDb.query('SELECT NOW() as current_time', [], 'test_table');
      
      results.push({
        test: 'enhanced_audited_database',
        status: 'success',
        data: {
          query_result: testResult.rows[0],
          user_info: auditedDb.getUser() || {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            clientId: user.clientId
          },
          audit_context: auditedDb.getAuditContext()
        }
      });
    }

    // Test 6: Test audit log filtering and pagination
    if (testType === 'all' || testType === 'filtering') {
      const filterResult = await query(`
        SELECT 
          id, table_name, action, endpoint, http_method, status_code,
          operation_duration_ms, created_at
        FROM audit_logs_summary 
        WHERE client_id = $1
          AND action = 'INSERT'
          AND created_at >= NOW() - INTERVAL '1 day'
        ORDER BY created_at DESC
        LIMIT 5
      `, [user.clientId]);

      results.push({
        test: 'filtering_and_pagination',
        status: 'success',
        data: {
          filtered_count: filterResult.rows.length,
          logs: filterResult.rows.map(row => ({
            id: row.id,
            table_name: row.table_name,
            action: row.action,
            endpoint: row.endpoint,
            created_at: row.created_at
          }))
        }
      });
    }

    // Test 7: Test audit log performance metrics
    if (testType === 'all' || testType === 'performance') {
      const perfResult = await query(`
        SELECT 
          COUNT(*) as total_operations,
          AVG(operation_duration_ms) as avg_duration,
          MIN(operation_duration_ms) as min_duration,
          MAX(operation_duration_ms) as max_duration,
          COUNT(*) FILTER (WHERE operation_duration_ms > 1000) as slow_operations
        FROM audit_logs 
        WHERE client_id = $1
          AND created_at >= NOW() - INTERVAL '1 day'
      `, [user.clientId]);

      const perf = perfResult.rows[0];
      results.push({
        test: 'performance_metrics',
        status: 'success',
        data: {
          total_operations: perf.total_operations,
          avg_duration_ms: Math.round(perf.avg_duration || 0),
          min_duration_ms: perf.min_duration,
          max_duration_ms: perf.max_duration,
          slow_operations: perf.slow_operations
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Audit logs functionality tests completed',
      testType,
      results,
      timestamp: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        clientId: user.clientId
      }
    });

  } catch (error) {
    console.error('Audit logs test error:', error);
    throw error;
  }
}));

export const GET = withAuth(testAuditLogs);
