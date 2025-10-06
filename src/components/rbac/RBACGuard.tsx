// =====================================================
// RBAC Guard Component
// Task 20.4: Extend Role-Based Access Control for Workspace-Scoped Roles
// =====================================================

import React from 'react';
import { useRBAC, UseRBACOptions } from '@/hooks/useRBAC';

export interface RBACGuardProps extends UseRBACOptions {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loading?: React.ReactNode;
  error?: React.ReactNode;
  requireAll?: boolean;
  roles?: string[];
  invert?: boolean; // Show content when permission is NOT granted
}

/**
 * RBAC Guard Component - Conditionally renders children based on permissions
 */
export function RBACGuard({
  children,
  fallback = null,
  loading = null,
  error = null,
  requireAll = false,
  roles = [],
  invert = false,
  ...rbacOptions
}: RBACGuardProps) {
  const rbac = useRBAC(rbacOptions);

  // Show loading state
  if (rbac.isLoading) {
    return <>{loading}</>;
  }

  // Show error state
  if (rbac.error) {
    return <>{error}</>;
  }

  // Check role-based access
  let hasRoleAccess = true;
  if (roles.length > 0) {
    hasRoleAccess = roles.includes(rbac.userRole || '');
  }

  // Check permission-based access
  let hasPermissionAccess = rbac.hasPermission;
  if (rbacOptions.permissions && rbacOptions.permissions.length > 0) {
    hasPermissionAccess = requireAll 
      ? rbac.hasAllPermissions(rbacOptions.permissions)
      : rbac.hasAnyPermission(rbacOptions.permissions);
  }

  // Determine if access should be granted
  const shouldShow = invert 
    ? !(hasRoleAccess && hasPermissionAccess)
    : hasRoleAccess && hasPermissionAccess;

  return shouldShow ? <>{children}</> : <>{fallback}</>;
}

/**
 * Admin-only component wrapper
 */
export function AdminOnly({ children, fallback = null, ...props }: Omit<RBACGuardProps, 'roles'>) {
  return (
    <RBACGuard roles={['admin']} fallback={fallback} {...props}>
      {children}
    </RBACGuard>
  );
}

/**
 * Manager or Admin component wrapper
 */
export function ManagerOrAdmin({ children, fallback = null, ...props }: Omit<RBACGuardProps, 'roles'>) {
  return (
    <RBACGuard roles={['admin', 'manager']} fallback={fallback} {...props}>
      {children}
    </RBACGuard>
  );
}

/**
 * Sales Rep or higher component wrapper
 */
export function SalesRepOrHigher({ children, fallback = null, ...props }: Omit<RBACGuardProps, 'roles'>) {
  return (
    <RBACGuard roles={['admin', 'manager', 'sales_rep']} fallback={fallback} {...props}>
      {children}
    </RBACGuard>
  );
}

/**
 * Permission-based component wrapper
 */
export function PermissionGuard({ 
  permission, 
  permissions, 
  children, 
  fallback = null, 
  ...props 
}: Omit<RBACGuardProps, 'permission' | 'permissions'> & {
  permission?: string;
  permissions?: string[];
}) {
  return (
    <RBACGuard 
      permission={permission}
      permissions={permissions}
      fallback={fallback}
      {...props}
    >
      {children}
    </RBACGuard>
  );
}

/**
 * Workspace management permissions
 */
export function WorkspaceManagement({ children, fallback = null, ...props }: Omit<RBACGuardProps, 'permission'>) {
  return (
    <RBACGuard permission="workspace:manage" fallback={fallback} {...props}>
      {children}
    </RBACGuard>
  );
}

/**
 * Member management permissions
 */
export function MemberManagement({ children, fallback = null, ...props }: Omit<RBACGuardProps, 'permissions'>) {
  return (
    <RBACGuard 
      permissions={['members:invite', 'members:remove', 'members:manage_roles']}
      fallback={fallback}
      {...props}
    >
      {children}
    </RBACGuard>
  );
}

/**
 * Client management permissions
 */
export function ClientManagement({ children, fallback = null, ...props }: Omit<RBACGuardProps, 'permissions'>) {
  return (
    <RBACGuard 
      permissions={['clients:create', 'clients:update', 'clients:delete']}
      fallback={fallback}
      {...props}
    >
      {children}
    </RBACGuard>
  );
}

/**
 * Call management permissions
 */
export function CallManagement({ children, fallback = null, ...props }: Omit<RBACGuardProps, 'permissions'>) {
  return (
    <RBACGuard 
      permissions={['calls:create', 'calls:update', 'calls:delete']}
      fallback={fallback}
      {...props}
    >
      {children}
    </RBACGuard>
  );
}

/**
 * Analytics view permissions
 */
export function AnalyticsView({ children, fallback = null, ...props }: Omit<RBACGuardProps, 'permissions'>) {
  return (
    <RBACGuard 
      permissions={['analytics:view', 'analytics:view_own']}
      fallback={fallback}
      {...props}
    >
      {children}
    </RBACGuard>
  );
}
