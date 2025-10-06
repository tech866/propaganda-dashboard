// =====================================================
// Client-Safe Workspace Management Service
// Task 20.1: Multi-Tenant Data Isolation Service Layer (Client-Safe)
// =====================================================

import {
  Workspace,
  WorkspaceMembership,
  Invitation,
  WorkspaceAnalytics,
  UserWorkspace,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  UpdateMembershipRequest,
  WorkspaceRole,
  MembershipStatus,
  InvitationStatus,
} from '@/lib/types/workspace';

/**
 * Client-safe workspace service that doesn't include server-side dependencies
 * like EmailService. Email functionality should be handled via API routes.
 */
export class WorkspaceServiceClient {
  /**
   * Get all workspaces for a user
   */
  static async getUserWorkspaces(userId: string): Promise<UserWorkspace[]> {
    const response = await fetch('/api/workspaces');
    if (!response.ok) {
      throw new Error('Failed to fetch user workspaces');
    }
    const data = await response.json();
    return data.workspaces || [];
  }

  /**
   * Get workspace by ID
   */
  static async getWorkspace(workspaceId: string): Promise<Workspace | null> {
    const response = await fetch(`/api/workspaces/${workspaceId}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch workspace');
    }
    const data = await response.json();
    return data.workspace;
  }

  /**
   * Get workspace by ID (alias for getWorkspace)
   */
  static async getWorkspaceById(workspaceId: string): Promise<Workspace | null> {
    return this.getWorkspace(workspaceId);
  }

  /**
   * Check if user has access to workspace
   */
  static async checkWorkspaceAccess(workspaceId: string, userId: string): Promise<{ hasAccess: boolean; role?: WorkspaceRole }> {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/access`);
      if (response.ok) {
        const data = await response.json();
        return { hasAccess: true, role: data.role };
      }
      return { hasAccess: false };
    } catch {
      return { hasAccess: false };
    }
  }

  /**
   * Create a new workspace
   */
  static async createWorkspace(request: CreateWorkspaceRequest): Promise<Workspace> {
    const response = await fetch('/api/workspaces', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to create workspace');
    }

    const data = await response.json();
    return data.workspace;
  }

  /**
   * Update workspace
   */
  static async updateWorkspace(
    workspaceId: string,
    request: UpdateWorkspaceRequest
  ): Promise<Workspace> {
    const response = await fetch(`/api/workspaces/${workspaceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to update workspace');
    }

    const data = await response.json();
    return data.workspace;
  }

  /**
   * Delete workspace
   */
  static async deleteWorkspace(workspaceId: string): Promise<boolean> {
    const response = await fetch(`/api/workspaces/${workspaceId}`, {
      method: 'DELETE',
    });

    return response.ok;
  }

  /**
   * Get workspace members
   */
  static async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMembership[]> {
    const response = await fetch(`/api/workspaces/${workspaceId}/members`);
    if (!response.ok) {
      throw new Error('Failed to fetch workspace members');
    }
    const data = await response.json();
    return data.members || [];
  }

  /**
   * Update membership role
   */
  static async updateMembership(
    workspaceId: string,
    membershipId: string,
    request: UpdateMembershipRequest
  ): Promise<WorkspaceMembership> {
    const response = await fetch(`/api/workspaces/${workspaceId}/members/${membershipId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to update membership');
    }

    const data = await response.json();
    return data.membership;
  }

  /**
   * Remove member from workspace
   */
  static async removeMember(workspaceId: string, membershipId: string): Promise<boolean> {
    const response = await fetch(`/api/workspaces/${workspaceId}/members/${membershipId}`, {
      method: 'DELETE',
    });

    return response.ok;
  }

  /**
   * Get workspace invitations
   */
  static async getWorkspaceInvitations(workspaceId: string): Promise<Invitation[]> {
    const response = await fetch(`/api/workspaces/${workspaceId}/invitations`);
    if (!response.ok) {
      throw new Error('Failed to fetch workspace invitations');
    }
    const data = await response.json();
    return data.invitations || [];
  }

  /**
   * Cancel invitation
   */
  static async cancelInvitation(workspaceId: string, invitationId: string): Promise<boolean> {
    const response = await fetch(`/api/workspaces/${workspaceId}/invitations/${invitationId}`, {
      method: 'DELETE',
    });

    return response.ok;
  }

  /**
   * Resend invitation
   */
  static async resendInvitation(workspaceId: string, invitationId: string): Promise<boolean> {
    const response = await fetch(`/api/workspaces/${workspaceId}/invitations/${invitationId}/resend`, {
      method: 'POST',
    });

    return response.ok;
  }

  /**
   * Get workspace analytics
   */
  static async getWorkspaceAnalytics(workspaceId: string): Promise<WorkspaceAnalytics> {
    const response = await fetch(`/api/workspaces/${workspaceId}/analytics`);
    if (!response.ok) {
      throw new Error('Failed to fetch workspace analytics');
    }
    const data = await response.json();
    return data.analytics;
  }

  /**
   * Switch to a workspace (client-side only)
   */
  static async switchToWorkspace(workspaceId: string): Promise<void> {
    // This is handled client-side by updating the context
    // The actual workspace switching logic is in the context
    return Promise.resolve();
  }
}
