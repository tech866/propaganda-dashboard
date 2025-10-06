// =====================================================
// RBAC React Hook
// Task 20.4: Extend Role-Based Access Control for Workspace-Scoped Roles
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { WorkspaceRole } from '@/lib/types/workspace';

export interface RBACState {
  hasPermission: boolean;
  userRole: WorkspaceRole | null;
  permissions: string[];
  isLoading: boolean;
  error: string | null;
}

export interface UseRBACOptions {
  workspaceId?: string;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
}

export interface UseRBACReturn extends RBACState {
  checkPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  isAdmin: boolean;
  isManager: boolean;
  isSalesRep: boolean;
  isClient: boolean;
  isViewer: boolean;
  canManageWorkspace: boolean;
  canManageMembers: boolean;
  canManageClients: boolean;
  canManageCalls: boolean;
  canViewAnalytics: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook for Role-Based Access Control
 */
export function useRBAC(options: UseRBACOptions = {}): UseRBACReturn {
  const { user } = useAuth();
  const [state, setState] = useState<RBACState>({
    hasPermission: false,
    userRole: null,
    permissions: [],
    isLoading: true,
    error: null
  });

  const fetchRBACData = useCallback(async () => {
    if (!user || !options.workspaceId) {
      setState({
        hasPermission: false,
        userRole: null,
        permissions: [],
        isLoading: false,
        error: null
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(
        `/api/workspaces/${options.workspaceId}/rbac/check`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            permission: options.permission,
            permissions: options.permissions,
            requireAll: options.requireAll
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check permissions');
      }

      setState({
        hasPermission: data.hasPermission,
        userRole: data.userRole,
        permissions: data.permissions || [],
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error('RBAC check error:', error);
      setState({
        hasPermission: false,
        userRole: null,
        permissions: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [user, options.workspaceId, options.permission, options.permissions, options.requireAll]);

  useEffect(() => {
    fetchRBACData();
  }, [fetchRBACData]);

  // Permission checking functions
  const checkPermission = useCallback((permission: string): boolean => {
    return state.permissions.includes(permission);
  }, [state.permissions]);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return permissions.some(permission => state.permissions.includes(permission));
  }, [state.permissions]);

  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    return permissions.every(permission => state.permissions.includes(permission));
  }, [state.permissions]);

  // Role checking functions
  const isAdmin = state.userRole === 'admin';
  const isManager = state.userRole === 'manager';
  const isSalesRep = state.userRole === 'sales_rep';
  const isClient = state.userRole === 'client';
  const isViewer = state.userRole === 'viewer';

  // Specific permission checks
  const canManageWorkspace = checkPermission('workspace:manage');
  const canManageMembers = hasAnyPermission(['members:invite', 'members:remove', 'members:manage_roles']);
  const canManageClients = hasAnyPermission(['clients:create', 'clients:update', 'clients:delete']);
  const canManageCalls = hasAnyPermission(['calls:create', 'calls:update', 'calls:delete']);
  const canViewAnalytics = hasAnyPermission(['analytics:view', 'analytics:view_own']);

  return {
    ...state,
    checkPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isManager,
    isSalesRep,
    isClient,
    isViewer,
    canManageWorkspace,
    canManageMembers,
    canManageClients,
    canManageCalls,
    canViewAnalytics,
    refresh: fetchRBACData
  };
}

/**
 * Hook for checking a single permission
 */
export function usePermission(workspaceId: string, permission: string) {
  return useRBAC({ workspaceId, permission });
}

/**
 * Hook for checking multiple permissions
 */
export function usePermissions(workspaceId: string, permissions: string[], requireAll = false) {
  return useRBAC({ workspaceId, permissions, requireAll });
}

/**
 * Hook for checking user role
 */
export function useUserRole(workspaceId: string) {
  const rbac = useRBAC({ workspaceId });
  return {
    role: rbac.userRole,
    isAdmin: rbac.isAdmin,
    isManager: rbac.isManager,
    isSalesRep: rbac.isSalesRep,
    isClient: rbac.isClient,
    isViewer: rbac.isViewer,
    isLoading: rbac.isLoading,
    error: rbac.error
  };
}

/**
 * Hook for workspace access
 */
export function useWorkspaceAccess(workspaceId: string) {
  return useRBAC({ workspaceId });
}
