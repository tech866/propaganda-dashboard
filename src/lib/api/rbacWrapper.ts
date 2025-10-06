// =====================================================
// RBAC API Route Wrapper
// Task 20.4: Extend Role-Based Access Control for Workspace-Scoped Roles
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { User } from '@supabase/supabase-js';
import { auth } from '@/lib/auth';
import { createRBACMiddleware, RBACOptions, RBACContext } from '@/middleware/rbac';
import { WORKSPACE_ERROR_CODES } from '@/lib/types/workspace';

export interface RBACHandlerOptions extends RBACOptions {
  requireAuth?: boolean;
}

export type RBACHandler = (
  request: NextRequest,
  context: RBACContext,
  params?: any
) => Promise<NextResponse>;

/**
 * Create an RBAC-protected API route handler
 */
export function createRBACHandler(
  handler: RBACHandler,
  options: RBACHandlerOptions = {}
) {
  const rbacMiddleware = createRBACMiddleware(options);

  return async function rbacHandler(
    request: NextRequest,
    { params }: { params: any } = { params: {} }
  ): Promise<NextResponse> {
    try {
      // Authenticate user if required
      let user: User;
      if (options.requireAuth !== false) {
        const authResult = await auth(request);
        if (!authResult.success || !authResult.user) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Authentication required',
              code: 'AUTH_REQUIRED'
            },
            { status: 401 }
          );
        }
        user = authResult.user;
      } else {
        // This shouldn't happen in practice, but handle it gracefully
        return NextResponse.json(
          { 
            success: false, 
            error: 'Authentication required',
            code: 'AUTH_REQUIRED'
          },
          { status: 401 }
        );
      }

      // Apply RBAC middleware
      const rbacResult = await rbacMiddleware(request, user, params);
      
      // If RBAC middleware returns a NextResponse, it's an error response
      if (rbacResult instanceof NextResponse) {
        return rbacResult;
      }

      // RBAC check passed, call the handler
      return await handler(request, rbacResult, params);

    } catch (error) {
      console.error('RBAC handler error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Pre-configured RBAC handlers for common use cases
 */

// Workspace access required
export const withWorkspaceAccess = (handler: RBACHandler) =>
  createRBACHandler(handler, { requireAuth: true });

// Admin role required
export const withAdminAccess = (handler: RBACHandler) =>
  createRBACHandler(handler, { 
    requireAuth: true,
    permission: 'workspace:manage'
  });

// Member management permissions required
export const withMemberManagement = (handler: RBACHandler) =>
  createRBACHandler(handler, { 
    requireAuth: true,
    permissions: ['members:invite', 'members:remove', 'members:manage_roles'],
    requireAll: false
  });

// Client management permissions required
export const withClientManagement = (handler: RBACHandler) =>
  createRBACHandler(handler, { 
    requireAuth: true,
    permissions: ['clients:create', 'clients:update', 'clients:delete'],
    requireAll: false
  });

// Call management permissions required
export const withCallManagement = (handler: RBACHandler) =>
  createRBACHandler(handler, { 
    requireAuth: true,
    permissions: ['calls:create', 'calls:update', 'calls:delete'],
    requireAll: false
  });

// Analytics view permissions required
export const withAnalyticsView = (handler: RBACHandler) =>
  createRBACHandler(handler, { 
    requireAuth: true,
    permissions: ['analytics:view', 'analytics:view_own'],
    requireAll: false
  });

// Call access with ownership check
export const withCallAccess = (handler: RBACHandler) =>
  createRBACHandler(handler, { 
    requireAuth: true,
    permission: 'calls:read',
    resourceOwnership: {
      resourceType: 'call',
      resourceIdParam: 'id'
    }
  });

// =====================================================
// Utility Functions for API Routes
// =====================================================

/**
 * Extract workspace ID from request context
 */
export function getWorkspaceIdFromContext(context: RBACContext): string {
  return context.workspaceId;
}

/**
 * Get user role from RBAC context
 */
export function getUserRoleFromContext(context: RBACContext): string | undefined {
  return context.userRole;
}

/**
 * Check if user has specific role in context
 */
export function hasRoleInContext(context: RBACContext, role: string): boolean {
  return context.userRole === role;
}

/**
 * Check if user is admin in context
 */
export function isAdminInContext(context: RBACContext): boolean {
  return context.userRole === 'admin';
}

/**
 * Check if user is manager or admin in context
 */
export function isManagerOrAdminInContext(context: RBACContext): boolean {
  return ['admin', 'manager'].includes(context.userRole || '');
}

/**
 * Create success response with RBAC context
 */
export function createSuccessResponse(
  data: any,
  context: RBACContext,
  message?: string
): NextResponse {
  return NextResponse.json({
    success: true,
    message: message || 'Operation completed successfully',
    data,
    context: {
      workspaceId: context.workspaceId,
      userRole: context.userRole
    }
  });
}

/**
 * Create error response with proper error codes
 */
export function createErrorResponse(
  error: string,
  code: string = 'UNKNOWN_ERROR',
  status: number = 400
): NextResponse {
  return NextResponse.json({
    success: false,
    error,
    code
  }, { status });
}

/**
 * Create validation error response
 */
export function createValidationErrorResponse(
  errors: Record<string, string>
): NextResponse {
  return NextResponse.json({
    success: false,
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details: errors
  }, { status: 400 });
}

/**
 * Create not found error response
 */
export function createNotFoundErrorResponse(
  resource: string = 'Resource'
): NextResponse {
  return NextResponse.json({
    success: false,
    error: `${resource} not found`,
    code: 'NOT_FOUND'
  }, { status: 404 });
}

/**
 * Create access denied error response
 */
export function createAccessDeniedErrorResponse(
  reason?: string
): NextResponse {
  return NextResponse.json({
    success: false,
    error: reason || 'Access denied',
    code: WORKSPACE_ERROR_CODES.INSUFFICIENT_PERMISSIONS
  }, { status: 403 });
}

// =====================================================
// Type Guards and Validation
// =====================================================

/**
 * Check if response is an RBAC context
 */
export function isRBACContext(response: any): response is RBACContext {
  return response && 
         typeof response === 'object' && 
         'user' in response && 
         'workspaceId' in response && 
         'hasPermission' in response;
}

/**
 * Validate workspace ID format
 */
export function isValidWorkspaceId(workspaceId: string): boolean {
  // UUID v4 format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(workspaceId);
}

/**
 * Validate user role
 */
export function isValidUserRole(role: string): boolean {
  const validRoles = ['admin', 'manager', 'sales_rep', 'client', 'viewer'];
  return validRoles.includes(role);
}

// =====================================================
// withRbacProtection Higher-Order Function
// =====================================================

/**
 * Higher-order function to wrap API route handlers with RBAC protection
 */
export function withRbacProtection(
  handler: RBACHandler,
  options: RBACHandlerOptions = {}
) {
  return async (
    request: NextRequest,
    context: { params: { [key: string]: string | string[] } }
  ): Promise<NextResponse> => {
    try {
      // Get authenticated user
      const user = await auth();
      if (!user) {
        return createAccessDeniedResponse('Authentication required');
      }

      // Create RBAC middleware
      const rbacMiddleware = createRBACMiddleware(options);

      // Execute RBAC middleware
      const rbacResult = await rbacMiddleware(request, user, context.params);

      // If result is a NextResponse (error), return it
      if (rbacResult instanceof NextResponse) {
        return rbacResult;
      }

      // If result is RBACContext (success), call the handler
      if (isRBACContext(rbacResult)) {
        return await handler(request, rbacResult, context.params);
      }

      // Fallback error
      return createAccessDeniedResponse('RBAC check failed');

    } catch (error) {
      console.error('RBAC protection error:', error);
      return NextResponse.json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      }, { status: 500 });
    }
  };
}
