'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/middleware/auth';

// Define the role context interface
interface RoleContextType {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    clientId: string;
  } | null;
  isLoading: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  canViewMetrics: boolean;
  canViewAuditLogs: boolean;
  canManageUsers: boolean;
  canManageLossReasons: boolean;
  canManageSystemConfig: boolean;
  canViewAllData: boolean;
}

// Create the context
const RoleContext = createContext<RoleContextType | undefined>(undefined);

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  sales: [
    'view_own_calls',
    'create_calls',
    'update_own_calls',
    'view_own_metrics',
    'view_own_dashboard'
  ],
  admin: [
    'view_own_calls',
    'create_calls',
    'update_own_calls',
    'view_own_metrics',
    'view_own_dashboard',
    'view_all_calls',
    'view_all_metrics',
    'manage_users',
    'manage_loss_reasons',
    'manage_system_config',
    'view_audit_logs',
    'view_all_data'
  ],
  ceo: [
    'view_own_calls',
    'create_calls',
    'update_own_calls',
    'view_own_metrics',
    'view_own_dashboard',
    'view_all_calls',
    'view_all_metrics',
    'manage_users',
    'manage_loss_reasons',
    'manage_system_config',
    'view_audit_logs',
    'view_all_data',
    'view_financial_data',
    'manage_company_settings'
  ]
};

// Role hierarchy for access control
const ROLE_HIERARCHY: Record<UserRole, number> = {
  sales: 1,
  admin: 2,
  ceo: 3
};

// Role provider component
export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<RoleContextType['user']>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    if (status === 'unauthenticated') {
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.name || '',
        role: session.user.role || 'sales',
        clientId: session.user.clientId || ''
      });
    }

    setIsLoading(false);
  }, [session, status]);

  // Check if user has a specific role
  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  // Check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
  };

  // Check if user can view metrics (sales can view own, admin/ceo can view all)
  const canViewMetrics = hasPermission('view_own_metrics') || hasPermission('view_all_metrics');

  // Check if user can view audit logs (admin and ceo only)
  const canViewAuditLogs = hasAnyRole(['admin', 'ceo']);

  // Check if user can manage users (admin and ceo only)
  const canManageUsers = hasAnyRole(['admin', 'ceo']);

  // Check if user can manage loss reasons (admin and ceo only)
  const canManageLossReasons = hasAnyRole(['admin', 'ceo']);

  // Check if user can manage system configuration (admin and ceo only)
  const canManageSystemConfig = hasAnyRole(['admin', 'ceo']);

  // Check if user can view all data (admin and ceo only)
  const canViewAllData = hasPermission('view_all_data');

  const value: RoleContextType = {
    user,
    isLoading,
    hasRole,
    hasAnyRole,
    hasPermission,
    canViewMetrics,
    canViewAuditLogs,
    canManageUsers,
    canManageLossReasons,
    canManageSystemConfig,
    canViewAllData
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

// Custom hook to use the role context
export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

// Higher-order component for role-based access control
export function withRole<T extends object>(
  Component: React.ComponentType<T>,
  requiredRoles: UserRole[]
) {
  return function RoleProtectedComponent(props: T) {
    const { hasAnyRole, isLoading } = useRole();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!hasAnyRole(requiredRoles)) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">
              You don't have permission to view this content.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Component for conditional rendering based on roles
export function RoleGuard({ 
  roles, 
  children, 
  fallback 
}: { 
  roles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasAnyRole, isLoading } = useRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasAnyRole(roles)) {
    return fallback || null;
  }

  return <>{children}</>;
}

// Component for permission-based conditional rendering
export function PermissionGuard({ 
  permission, 
  children, 
  fallback 
}: { 
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasPermission, isLoading } = useRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasPermission(permission)) {
    return fallback || null;
  }

  return <>{children}</>;
}

export default RoleContext;
