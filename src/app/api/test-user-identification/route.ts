/**
 * Test User Identification API Route
 * Demonstrates enhanced user identification capabilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { withErrorHandling } from '@/middleware/errors';
import { withEnhancedAudit } from '@/middleware/audit';
import { userIdentificationService } from '@/lib/services/userIdentification';
import { createEnhancedAuditedDatabase } from '@/lib/services/enhancedAuditedDatabase';

// GET /api/test-user-identification - Test enhanced user identification
const testUserIdentification = withErrorHandling(withEnhancedAudit(async (request: NextRequest, user: User) => {
  const { searchParams } = new URL(request.url);
  const testType = searchParams.get('type') || 'all';

  const results: any[] = [];

  try {
    // Test 1: Extract enhanced user information
    if (testType === 'all' || testType === 'user') {
      const enhancedUser = await userIdentificationService.extractUserFromRequest(request);
      results.push({
        test: 'extract_enhanced_user',
        status: 'success',
        data: {
          id: enhancedUser?.id,
          email: enhancedUser?.email,
          name: enhancedUser?.name,
          role: enhancedUser?.role,
          clientId: enhancedUser?.clientId,
          sessionId: enhancedUser?.sessionId,
          loginTime: enhancedUser?.loginTime,
          lastActivity: enhancedUser?.lastActivity,
          ipAddress: enhancedUser?.ipAddress,
          userAgent: enhancedUser?.userAgent,
          deviceInfo: enhancedUser?.deviceInfo,
          location: enhancedUser?.location,
          permissions: enhancedUser?.permissions
        }
      });
    }

    // Test 2: Create enhanced audit context
    if (testType === 'all' || testType === 'context') {
      const context = await userIdentificationService.createAuditContext(request);
      results.push({
        test: 'create_audit_context',
        status: 'success',
        data: {
          clientId: context.clientId,
          userId: context.userId,
          sessionId: context.sessionId,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
          endpoint: context.endpoint,
          httpMethod: context.httpMethod,
          metadata: context.metadata
        }
      });
    }

    // Test 3: Session tracking
    if (testType === 'all' || testType === 'session') {
      const enhancedUser = await userIdentificationService.extractUserFromRequest(request);
      if (enhancedUser) {
        await userIdentificationService.updateUserSession(enhancedUser, request);
        
        const userSession = userIdentificationService.getUserSession(enhancedUser.sessionId || '');
        results.push({
          test: 'session_tracking',
          status: 'success',
          data: {
            sessionId: userSession?.sessionId,
            userId: userSession?.userId,
            clientId: userSession?.clientId,
            loginTime: userSession?.loginTime,
            lastActivity: userSession?.lastActivity,
            isActive: userSession?.isActive,
            metadata: userSession?.metadata
          }
        });
      }
    }

    // Test 4: User activity summary
    if (testType === 'all' || testType === 'activity') {
      const enhancedUser = await userIdentificationService.extractUserFromRequest(request);
      if (enhancedUser) {
        const activitySummary = userIdentificationService.getUserActivitySummary(enhancedUser.id);
        results.push({
          test: 'user_activity_summary',
          status: 'success',
          data: activitySummary
        });
      }
    }

    // Test 5: Enhanced audited database operations
    if (testType === 'all' || testType === 'database') {
      const auditedDb = await createEnhancedAuditedDatabase(request, user);
      
      // Test a simple query
      const result = await auditedDb.query('SELECT NOW() as current_time', [], 'test_table');
      results.push({
        test: 'enhanced_audited_database',
        status: 'success',
        data: {
          queryResult: result.rows[0],
          userInfo: auditedDb.getUser(),
          auditContext: auditedDb.getAuditContext()
        }
      });
    }

    // Test 6: Permission validation
    if (testType === 'all' || testType === 'permissions') {
      const enhancedUser = await userIdentificationService.extractUserFromRequest(request);
      if (enhancedUser) {
        const permissions = [
          'read:all',
          'write:all',
          'delete:all',
          'admin:all',
          'audit:all',
          'read:client',
          'write:client',
          'delete:client',
          'admin:client',
          'audit:client',
          'read:own',
          'write:own'
        ];

        const permissionResults = permissions.map(permission => ({
          permission,
          hasPermission: userIdentificationService.hasPermission(enhancedUser, permission)
        }));

        results.push({
          test: 'permission_validation',
          status: 'success',
          data: {
            userRole: enhancedUser.role,
            userPermissions: enhancedUser.permissions,
            permissionResults
          }
        });
      }
    }

    // Test 7: Client sessions
    if (testType === 'all' || testType === 'sessions') {
      const enhancedUser = await userIdentificationService.extractUserFromRequest(request);
      if (enhancedUser) {
        const userSessions = userIdentificationService.getUserSessions(enhancedUser.id);
        const clientSessions = userIdentificationService.getClientSessions(enhancedUser.clientId);

        results.push({
          test: 'session_management',
          status: 'success',
          data: {
            userSessions: userSessions.length,
            clientSessions: clientSessions.length,
            userSessionsData: userSessions.map(session => ({
              sessionId: session.sessionId,
              loginTime: session.loginTime,
              lastActivity: session.lastActivity,
              isActive: session.isActive
            }))
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Enhanced user identification tests completed',
      testType,
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('User identification test error:', error);
    throw error;
  }
}));

export const GET = withAuth(testUserIdentification);
