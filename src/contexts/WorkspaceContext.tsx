// =====================================================
// Workspace Context Provider
// Task 20.1: Multi-Tenant Data Isolation Context
// =====================================================

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import {
  Workspace,
  WorkspaceContext as WorkspaceContextType,
  UserWorkspace,
  WorkspaceRole,
  WORKSPACE_ERROR_CODES,
} from '@/lib/types/workspace';
import { WorkspaceServiceClient } from '@/lib/services/workspaceServiceClient';

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

interface WorkspaceProviderProps {
  children: React.ReactNode;
  workspaceId?: string;
}

export function WorkspaceProvider({ children, workspaceId }: WorkspaceProviderProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [userRole, setUserRole] = useState<WorkspaceRole | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [availableWorkspaces, setAvailableWorkspaces] = useState<UserWorkspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =====================================================
  // Helper Functions
  // =====================================================

  const getRolePermissions = useCallback((role: WorkspaceRole): string[] => {
    const rolePermissions: Record<WorkspaceRole, string[]> = {
      admin: [
        'workspace:manage',
        'members:invite',
        'members:remove',
        'members:manage_roles',
        'clients:create',
        'clients:read',
        'clients:update',
        'clients:delete',
        'calls:create',
        'calls:read',
        'calls:update',
        'calls:delete',
        'analytics:view',
        'settings:manage',
      ],
      manager: [
        'members:invite',
        'clients:create',
        'clients:read',
        'clients:update',
        'calls:create',
        'calls:read',
        'calls:update',
        'calls:delete',
        'analytics:view',
      ],
      sales_rep: [
        'clients:read',
        'calls:create',
        'calls:read',
        'calls:update',
        'analytics:view_own',
      ],
      client: [
        'calls:read_own',
        'analytics:view_own',
      ],
      viewer: [
        'calls:read',
        'analytics:view',
      ],
    };
    
    return rolePermissions[role] || [];
  }, []);

  // =====================================================
  // Workspace Management Functions
  // =====================================================

  const loadUserWorkspaces = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

        const workspaces = await WorkspaceServiceClient.getUserWorkspaces(user.id);
      setAvailableWorkspaces(workspaces);

      // If no workspace is specified, use the first available workspace
      if (!workspaceId && workspaces.length > 0) {
        const firstWorkspace = workspaces[0];
        setCurrentWorkspace({
          id: firstWorkspace.workspace_id,
          name: firstWorkspace.workspace_name,
          slug: firstWorkspace.workspace_slug,
          settings: {},
          is_active: true,
          created_at: firstWorkspace.joined_at,
          updated_at: firstWorkspace.joined_at,
        });
        setUserRole(firstWorkspace.user_role);
        setUserPermissions(getRolePermissions(firstWorkspace.user_role));
      }
    } catch (err) {
      console.error('Error loading user workspaces:', err);
      setError(err instanceof Error ? err.message : 'Failed to load workspaces');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, workspaceId, getRolePermissions]);

  const loadCurrentWorkspace = useCallback(async () => {
    if (!workspaceId || !user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Check if user has access to this workspace
      const access = await WorkspaceServiceClient.checkWorkspaceAccess(workspaceId, user.id);
      
      if (!access.hasAccess) {
        setError(WORKSPACE_ERROR_CODES.WORKSPACE_ACCESS_DENIED);
        router.push('/dashboard');
        return;
      }

      // Load workspace details
      const workspace = await WorkspaceServiceClient.getWorkspaceById(workspaceId);
      setCurrentWorkspace(workspace);
      setUserRole(access.role || null);
      setUserPermissions(getRolePermissions(access.role || 'viewer'));

    } catch (err) {
      console.error('Error loading current workspace:', err);
      setError(err instanceof Error ? err.message : 'Failed to load workspace');
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, user?.id, router, getRolePermissions]);

  const switchWorkspace = useCallback(async (newWorkspaceId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user has access to the new workspace
      const access = await WorkspaceServiceClient.checkWorkspaceAccess(newWorkspaceId, user?.id || '');
      
      if (!access.hasAccess) {
        setError(WORKSPACE_ERROR_CODES.WORKSPACE_ACCESS_DENIED);
        return;
      }

      // Load workspace details
      const workspace = await WorkspaceServiceClient.getWorkspaceById(newWorkspaceId);
      setCurrentWorkspace(workspace);
      setUserRole(access.role || null);
      setUserPermissions(getRolePermissions(access.role || 'viewer'));

      // Update URL to reflect workspace change
      const currentPath = pathname;
      const newPath = currentPath.replace(/^\/workspace\/[^\/]+/, `/workspace/${workspace.slug}`);
      router.push(newPath);

    } catch (err) {
      console.error('Error switching workspace:', err);
      setError(err instanceof Error ? err.message : 'Failed to switch workspace');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, pathname, router, getRolePermissions]);

  // =====================================================
  // Permission Helpers
  // =====================================================

  const hasPermission = useCallback((permission: string): boolean => {
    return userPermissions.includes(permission);
  }, [userPermissions]);

  const hasRole = useCallback((role: WorkspaceRole): boolean => {
    return userRole === role;
  }, [userRole]);

  const isAdmin = useCallback((): boolean => {
    return hasRole('admin');
  }, [hasRole]);

  const isManager = useCallback((): boolean => {
    return hasRole('admin') || hasRole('manager');
  }, [hasRole]);

  // =====================================================
  // Effects
  // =====================================================

  useEffect(() => {
    if (!isLoaded) return;

    if (workspaceId) {
      loadCurrentWorkspace();
    } else {
      loadUserWorkspaces();
    }
  }, [isLoaded, workspaceId, loadCurrentWorkspace, loadUserWorkspaces]);

  // =====================================================
  // Context Value
  // =====================================================

  const contextValue: WorkspaceContextType = {
    currentWorkspace,
    userRole,
    userPermissions,
    availableWorkspaces,
    isLoading,
    error,
    // Additional helper functions
    switchWorkspace,
    hasPermission,
    hasRole,
    isAdmin,
    isManager,
    refreshWorkspaces: loadUserWorkspaces,
  };

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
}

// =====================================================
// Hook to use Workspace Context
// =====================================================

export function useWorkspace(): WorkspaceContextType {
  const context = useContext(WorkspaceContext);
  
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  
  return context;
}

// =====================================================
// Higher-Order Component for Workspace Protection
// =====================================================

interface WorkspaceProtectedProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: WorkspaceRole;
  fallback?: React.ReactNode;
}

export function WorkspaceProtected({ 
  children, 
  requiredPermission, 
  requiredRole, 
  fallback = null 
}: WorkspaceProtectedProps) {
  const { hasPermission, hasRole, isLoading } = useWorkspace();

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// =====================================================
// Workspace Switcher Component
// =====================================================

export function WorkspaceSwitcher() {
  const { availableWorkspaces, currentWorkspace, switchWorkspace, isLoading } = useWorkspace();

  if (isLoading || availableWorkspaces.length <= 1) {
    return null;
  }

  return (
    <div className="relative">
      <select
        value={currentWorkspace?.id || ''}
        onChange={(e) => switchWorkspace(e.target.value)}
        className="bg-card border-border text-foreground rounded-xl px-4 py-2 pr-8 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {availableWorkspaces.map((workspace) => (
          <option key={workspace.workspace_id} value={workspace.workspace_id}>
            {workspace.workspace_name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
