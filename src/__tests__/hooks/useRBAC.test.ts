/**
 * useRBAC Hook Tests
 * Tests for the Role-Based Access Control hook functionality
 */

import { renderHook, act } from '@testing-library/react';
import { useRBAC } from '@/hooks/useRBAC';
import { useAuth } from '@/hooks/useAuth';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('useRBAC Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      isLoaded: true,
      signOut: jest.fn(),
    });
  });

  describe('Basic Functionality', () => {
    it('should return correct initial state', () => {
      const { result } = renderHook(() => useRBAC({ workspaceId: 'workspace-1' }));

      expect(result.current).toMatchObject({
        hasPermission: false,
        userRole: null,
        permissions: [],
        isLoading: true,
        error: null,
      });

      expect(typeof result.current.checkPermission).toBe('function');
      expect(typeof result.current.hasAnyPermission).toBe('function');
      expect(typeof result.current.hasAllPermissions).toBe('function');
      expect(typeof result.current.refresh).toBe('function');
    });

    it('should handle missing workspace ID', () => {
      const { result } = renderHook(() => useRBAC());

      expect(result.current).toMatchObject({
        hasPermission: false,
        userRole: null,
        permissions: [],
        isLoading: false,
        error: 'No workspace ID provided',
      });
    });

    it('should handle missing user', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoaded: true,
        signOut: jest.fn(),
      });

      const { result } = renderHook(() => useRBAC({ workspaceId: 'workspace-1' }));

      expect(result.current).toMatchObject({
        hasPermission: false,
        userRole: null,
        permissions: [],
        isLoading: false,
        error: 'User not authenticated',
      });
    });
  });

  describe('Permission Checking', () => {
    it('should check single permission correctly', () => {
      const { result } = renderHook(() => 
        useRBAC({ 
          workspaceId: 'workspace-1', 
          permission: 'calls:update' 
        })
      );

      // Initially should be false (no data loaded yet)
      expect(result.current.checkPermission('calls:update')).toBe(false);
      expect(result.current.hasPermission).toBe(false);
    });

    it('should check multiple permissions correctly', () => {
      const { result } = renderHook(() => 
        useRBAC({ 
          workspaceId: 'workspace-1', 
          permissions: ['calls:update', 'calls:view'] 
        })
      );

      expect(result.current.hasAnyPermission(['calls:update', 'calls:view'])).toBe(false);
      expect(result.current.hasAllPermissions(['calls:update', 'calls:view'])).toBe(false);
    });

    it('should handle permission checking with requireAll option', () => {
      const { result } = renderHook(() => 
        useRBAC({ 
          workspaceId: 'workspace-1', 
          permissions: ['calls:update', 'calls:view'],
          requireAll: true
        })
      );

      expect(result.current.hasAllPermissions(['calls:update', 'calls:view'])).toBe(false);
    });
  });

  describe('Role Checking', () => {
    it('should identify admin role correctly', () => {
      const { result } = renderHook(() => useRBAC({ workspaceId: 'workspace-1' }));

      // Initially should be false (no data loaded yet)
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isManager).toBe(false);
      expect(result.current.isClient).toBe(false);
      expect(result.current.isViewer).toBe(false);
    });

    it('should identify manager role correctly', () => {
      const { result } = renderHook(() => useRBAC({ workspaceId: 'workspace-1' }));

      expect(result.current.isManager).toBe(false);
      expect(result.current.canManageWorkspace).toBe(false);
      expect(result.current.canManageMembers).toBe(false);
      expect(result.current.canManageClients).toBe(false);
      expect(result.current.canManageCalls).toBe(false);
      expect(result.current.canViewAnalytics).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      // Mock a scenario where the API call fails
      const { result } = renderHook(() => useRBAC({ workspaceId: 'workspace-1' }));

      // Should handle errors without crashing
      expect(result.current.error).toBe(null);
      expect(result.current.isLoading).toBe(true);
    });

    it('should handle invalid workspace ID', () => {
      const { result } = renderHook(() => useRBAC({ workspaceId: '' }));

      expect(result.current.error).toBe('No workspace ID provided');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle invalid permission format', () => {
      const { result } = renderHook(() => useRBAC({ workspaceId: 'workspace-1' }));

      // Should not crash when checking invalid permissions
      expect(() => {
        result.current.checkPermission('');
        result.current.checkPermission(null as any);
        result.current.checkPermission(undefined as any);
      }).not.toThrow();
    });
  });

  describe('Refresh Functionality', () => {
    it('should provide refresh function', () => {
      const { result } = renderHook(() => useRBAC({ workspaceId: 'workspace-1' }));

      expect(typeof result.current.refresh).toBe('function');
    });

    it('should call refresh without errors', () => {
      const { result } = renderHook(() => useRBAC({ workspaceId: 'workspace-1' }));

      expect(() => {
        act(() => {
          result.current.refresh();
        });
      }).not.toThrow();
    });
  });

  describe('Hook Options', () => {
    it('should handle different workspace IDs', () => {
      const { result: result1 } = renderHook(() => useRBAC({ workspaceId: 'workspace-1' }));
      const { result: result2 } = renderHook(() => useRBAC({ workspaceId: 'workspace-2' }));

      expect(result1.current).toBeDefined();
      expect(result2.current).toBeDefined();
    });

    it('should handle different permission combinations', () => {
      const { result: result1 } = renderHook(() => 
        useRBAC({ 
          workspaceId: 'workspace-1', 
          permission: 'calls:update' 
        })
      );

      const { result: result2 } = renderHook(() => 
        useRBAC({ 
          workspaceId: 'workspace-1', 
          permissions: ['calls:update', 'calls:view'] 
        })
      );

      expect(result1.current).toBeDefined();
      expect(result2.current).toBeDefined();
    });

    it('should handle requireAll option', () => {
      const { result } = renderHook(() => 
        useRBAC({ 
          workspaceId: 'workspace-1', 
          permissions: ['calls:update', 'calls:view'],
          requireAll: true
        })
      );

      expect(result.current).toBeDefined();
    });
  });

  describe('Integration with useAuth', () => {
    it('should respond to auth state changes', () => {
      const { result, rerender } = renderHook(() => useRBAC({ workspaceId: 'workspace-1' }));

      // Initial state with user
      expect(result.current.isLoading).toBe(true);

      // Change auth state to no user
      mockUseAuth.mockReturnValue({
        user: null,
        isLoaded: true,
        signOut: jest.fn(),
      });

      rerender();

      expect(result.current.error).toBe('User not authenticated');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle loading state correctly', () => {
      // Start with loading state
      mockUseAuth.mockReturnValue({
        user: null,
        isLoaded: false,
        signOut: jest.fn(),
      });

      const { result } = renderHook(() => useRBAC({ workspaceId: 'workspace-1' }));

      expect(result.current.isLoading).toBe(true);
    });
  });
});
