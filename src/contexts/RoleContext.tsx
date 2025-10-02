'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useOrganization } from '@clerk/nextjs';
import { UserRole } from '@/lib/clerk';
import { getUserFromSupabase, UserWithClerk } from '@/lib/clerk-supabase';

// Check if Clerk is configured
const isClerkConfigured = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('placeholder') &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.length > 20;

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
  canManageClients: boolean;
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
  agency_user: [
    'view_own_calls',
    'create_calls',
    'update_own_calls',
    'view_own_metrics',
    'view_own_dashboard'
  ],
  client_user: [
    'view_own_calls',
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
    'manage_clients',
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
    'manage_clients',
    'view_audit_logs',
    'view_all_data',
    'view_financial_data',
    'manage_company_settings'
  ]
};

// Role hierarchy for access control
const ROLE_HIERARCHY: Record<UserRole, number> = {
  client_user: 1,
  sales: 2,
  agency_user: 2,
  admin: 3,
  ceo: 4
};

// Role provider component
export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<RoleContextType['user']>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use Clerk hooks only if configured
  const clerkHooks = isClerkConfigured ? {
    user: useUser(),
    organization: useOrganization()
  } : null;
  
  const clerkUser = clerkHooks?.user?.user;
  const userLoaded = clerkHooks?.user?.isLoaded ?? true;
  const organization = clerkHooks?.organization?.organization;
  const orgLoaded = clerkHooks?.organization?.isLoaded ?? true;

  // Mock user for development when Clerk is not configured
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Setting up mock user for development...');
      setUser({
        id: 'dev-user-1',
        email: 'dev@example.com',
        name: 'Development User',
        role: 'admin',
        clientId: 'dev-agency-1'
      });
      setIsLoading(false);
      return;
    }
  }, []);

  // Clerk integration
  useEffect(() => {
    // Only run Clerk integration if Clerk is configured
    if (!isClerkConfigured) {
      return;
    }

    if (!userLoaded || !orgLoaded) {
      setIsLoading(true);
      return;
    }

    if (!clerkUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Get role from Clerk user metadata
    const role = (clerkUser.publicMetadata?.role as UserRole) || 'agency_user';
    const agencyId = organization?.id || '';

    setUser({
      id: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress || '',
      name: clerkUser.fullName || '',
      role: role,
      clientId: agencyId
    });

    setIsLoading(false);
  }, [clerkUser, userLoaded, organization, orgLoaded, isClerkConfigured]);

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

  // Check if user can manage clients (admin and ceo only)
  const canManageClients = hasAnyRole(['admin', 'ceo']);

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
    canManageClients,
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
