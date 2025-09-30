'use client';

import { useRole } from '@/contexts/RoleContext';
import { UserRole } from '@/lib/clerk';
import { ReactNode } from 'react';

interface RoleBasedAccessProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
  requireAll?: boolean; // If true, user must have ALL roles; if false, user needs ANY role
}

function RoleBasedAccess({ 
  allowedRoles, 
  children, 
  fallback = null, 
  requireAll = false 
}: RoleBasedAccessProps) {
  const { hasAnyRole, hasRole, isLoading } = useRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasAccess = requireAll 
    ? allowedRoles.every(role => hasRole(role))
    : hasAnyRole(allowedRoles);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Specific role-based components for common use cases
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedAccess allowedRoles={['admin', 'ceo']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

export function CEOOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedAccess allowedRoles={['ceo']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

export function SalesAndAbove({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedAccess allowedRoles={['sales', 'admin', 'ceo']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

export function AgencyUsersAndAbove({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedAccess allowedRoles={['agency_user', 'sales', 'admin', 'ceo']} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
}

// Permission-based access control
interface PermissionBasedAccessProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionBasedAccess({ permission, children, fallback }: PermissionBasedAccessProps) {
  const { hasPermission, isLoading } = useRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Common permission-based components
export function CanViewAllData({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionBasedAccess permission="view_all_data" fallback={fallback}>
      {children}
    </PermissionBasedAccess>
  );
}

export function CanManageUsers({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionBasedAccess permission="manage_users" fallback={fallback}>
      {children}
    </PermissionBasedAccess>
  );
}

export function CanViewFinancialData({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionBasedAccess permission="view_financial_data" fallback={fallback}>
      {children}
    </PermissionBasedAccess>
  );
}

export function CanManageClients({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <PermissionBasedAccess permission="manage_clients" fallback={fallback}>
      {children}
    </PermissionBasedAccess>
  );
}

// Default export for the main component
export default RoleBasedAccess;
