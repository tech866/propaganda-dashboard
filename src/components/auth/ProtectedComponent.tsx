'use client';

import React from 'react';
import { useRole } from '@/contexts/RoleContext';
import { UserRole } from '@/middleware/auth';

interface ProtectedComponentProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
}

/**
 * ProtectedComponent - A wrapper component that protects sensitive content
 * based on user roles and permissions
 */
export function ProtectedComponent({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallback = null,
  showAccessDenied = false
}: ProtectedComponentProps) {
  const { user, hasAnyRole, hasPermission, isLoading } = useRole();

  // Show loading state while checking permissions
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If no user is logged in, show fallback or access denied
  if (!user) {
    if (showAccessDenied) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600">
              Please log in to access this content.
            </p>
          </div>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  // Check role requirements
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    if (showAccessDenied) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">
              You don't have the required role to view this content.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Required roles: {requiredRoles.join(', ')}
            </p>
          </div>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => hasPermission(permission));
    
    if (!hasAllPermissions) {
      if (showAccessDenied) {
        return (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-600">
                You don't have the required permissions to view this content.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Required permissions: {requiredPermissions.join(', ')}
              </p>
            </div>
          </div>
        );
      }
      return <>{fallback}</>;
    }
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
}

/**
 * Higher-order component for protecting entire components
 */
export function withProtection<T extends object>(
  Component: React.ComponentType<T>,
  options: {
    requiredRoles?: UserRole[];
    requiredPermissions?: string[];
    fallback?: React.ReactNode;
    showAccessDenied?: boolean;
  } = {}
) {
  return function ProtectedComponentWrapper(props: T) {
    return (
      <ProtectedComponent
        requiredRoles={options.requiredRoles}
        requiredPermissions={options.requiredPermissions}
        fallback={options.fallback}
        showAccessDenied={options.showAccessDenied}
      >
        <Component {...props} />
      </ProtectedComponent>
    );
  };
}

/**
 * Hook for checking if user can access a specific resource
 */
export function useAccessControl() {
  const { user, hasAnyRole, hasPermission, isLoading } = useRole();

  const canAccess = (options: {
    requiredRoles?: UserRole[];
    requiredPermissions?: string[];
  } = {}) => {
    if (isLoading || !user) return false;

    const { requiredRoles = [], requiredPermissions = [] } = options;

    // Check roles
    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
      return false;
    }

    // Check permissions
    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission => hasPermission(permission));
      if (!hasAllPermissions) {
        return false;
      }
    }

    return true;
  };

  return {
    canAccess,
    user,
    isLoading
  };
}

export default ProtectedComponent;
