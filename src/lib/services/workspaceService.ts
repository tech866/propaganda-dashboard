// =====================================================
// Workspace Management Service
// Task 20.1: Multi-Tenant Data Isolation Service Layer
// =====================================================

import { query } from '../database';
import {
  Workspace,
  WorkspaceMembership,
  Invitation,
  WorkspaceAnalytics,
  UserWorkspace,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  InviteUserRequest,
  AcceptInvitationRequest,
  UpdateMembershipRequest,
  WorkspaceRole,
  MembershipStatus,
  InvitationStatus,
  WORKSPACE_ERROR_CODES,
  WorkspaceError,
} from '../types/workspace';
import { EmailService } from './emailService';

export class WorkspaceService {
  // =====================================================
  // Workspace Management
  // =====================================================

  /**
   * Create a new workspace
   */
  static async createWorkspace(
    workspaceData: CreateWorkspaceRequest,
    adminUserId: string
  ): Promise<Workspace> {
    const sql = `
      SELECT create_workspace($1, $2, $3, $4) as workspace_id
    `;
    
    const result = await query(sql, [
      workspaceData.name,
      workspaceData.slug,
      workspaceData.description || null,
      adminUserId
    ]);

    const workspaceId = result.rows[0].workspace_id;
    return this.getWorkspaceById(workspaceId);
  }

  /**
   * Get workspace by ID
   */
  static async getWorkspaceById(workspaceId: string): Promise<Workspace> {
    const sql = `
      SELECT * FROM workspaces 
      WHERE id = $1 AND is_active = true
    `;
    
    const result = await query(sql, [workspaceId]);
    
    if (result.rows.length === 0) {
      throw new Error(WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND);
    }
    
    return result.rows[0];
  }

  /**
   * Get workspace by slug
   */
  static async getWorkspaceBySlug(slug: string): Promise<Workspace> {
    const sql = `
      SELECT * FROM workspaces 
      WHERE slug = $1 AND is_active = true
    `;
    
    const result = await query(sql, [slug]);
    
    if (result.rows.length === 0) {
      throw new Error(WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND);
    }
    
    return result.rows[0];
  }

  /**
   * Update workspace
   */
  static async updateWorkspace(
    workspaceId: string,
    updateData: UpdateWorkspaceRequest
  ): Promise<Workspace> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updateData.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updateData.name);
    }
    if (updateData.slug !== undefined) {
      fields.push(`slug = $${paramCount++}`);
      values.push(updateData.slug);
    }
    if (updateData.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updateData.description);
    }
    if (updateData.settings !== undefined) {
      fields.push(`settings = $${paramCount++}`);
      values.push(JSON.stringify(updateData.settings));
    }
    if (updateData.is_active !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(updateData.is_active);
    }

    if (fields.length === 0) {
      return this.getWorkspaceById(workspaceId);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(workspaceId);

    const sql = `
      UPDATE workspaces 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    
    if (result.rows.length === 0) {
      throw new Error(WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND);
    }
    
    return result.rows[0];
  }

  /**
   * Delete workspace (soft delete)
   */
  static async deleteWorkspace(workspaceId: string): Promise<void> {
    const sql = `
      UPDATE workspaces 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    
    await query(sql, [workspaceId]);
  }

  // =====================================================
  // Workspace Memberships
  // =====================================================

  /**
   * Get user's workspaces
   */
  static async getUserWorkspaces(userId: string): Promise<UserWorkspace[]> {
    const sql = `
      SELECT * FROM get_user_workspaces($1)
    `;
    
    const result = await query(sql, [userId]);
    return result.rows;
  }

  /**
   * Get workspace members
   */
  static async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMembership[]> {
    const sql = `
      SELECT wm.*, u.name as user_name, u.email as user_email
      FROM workspace_memberships wm
      JOIN users u ON wm.user_id = u.id
      WHERE wm.workspace_id = $1
      ORDER BY wm.joined_at DESC
    `;
    
    const result = await query(sql, [workspaceId]);
    return result.rows;
  }

  /**
   * Add user to workspace
   */
  static async addUserToWorkspace(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
    invitedBy: string
  ): Promise<WorkspaceMembership> {
    const sql = `
      INSERT INTO workspace_memberships (workspace_id, user_id, role, invited_by, joined_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (workspace_id, user_id) 
      DO UPDATE SET 
        role = EXCLUDED.role,
        status = 'active',
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const result = await query(sql, [workspaceId, userId, role, invitedBy]);
    return result.rows[0];
  }

  /**
   * Update workspace membership
   */
  static async updateMembership(
    membershipId: string,
    updateData: UpdateMembershipRequest
  ): Promise<WorkspaceMembership> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updateData.role !== undefined) {
      fields.push(`role = $${paramCount++}`);
      values.push(updateData.role);
    }
    if (updateData.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updateData.status);
    }
    if (updateData.permissions !== undefined) {
      fields.push(`permissions = $${paramCount++}`);
      values.push(JSON.stringify(updateData.permissions));
    }

    if (fields.length === 0) {
      const sql = `SELECT * FROM workspace_memberships WHERE id = $1`;
      const result = await query(sql, [membershipId]);
      return result.rows[0];
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(membershipId);

    const sql = `
      UPDATE workspace_memberships 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  /**
   * Remove user from workspace
   */
  static async removeUserFromWorkspace(workspaceId: string, userId: string): Promise<void> {
    const sql = `
      UPDATE workspace_memberships 
      SET status = 'removed', updated_at = CURRENT_TIMESTAMP
      WHERE workspace_id = $1 AND user_id = $2
    `;
    
    await query(sql, [workspaceId, userId]);
  }

  /**
   * Check if user has access to workspace
   */
  static async checkWorkspaceAccess(
    workspaceId: string,
    userId: string
  ): Promise<{ hasAccess: boolean; role?: WorkspaceRole }> {
    const sql = `
      SELECT role FROM workspace_memberships 
      WHERE workspace_id = $1 AND user_id = $2 AND status = 'active'
    `;
    
    const result = await query(sql, [workspaceId, userId]);
    
    if (result.rows.length === 0) {
      return { hasAccess: false };
    }
    
    return { hasAccess: true, role: result.rows[0].role };
  }

  // =====================================================
  // Invitation Management
  // =====================================================

  /**
   * Invite user to workspace
   */
  static async inviteUser(
    workspaceId: string,
    inviteData: InviteUserRequest,
    invitedBy: string
  ): Promise<string> {
    const sql = `
      SELECT invite_user_to_workspace($1, $2, $3, $4, $5) as token
    `;
    
    const result = await query(sql, [
      workspaceId,
      inviteData.email,
      inviteData.role,
      invitedBy,
      inviteData.expires_in_hours || 168 // 7 days default
    ]);

    const token = result.rows[0].token;

    // Send invitation email
    try {
      // Get workspace and inviter details
      const workspace = await this.getWorkspaceById(workspaceId);
      const inviterSql = `SELECT name, email FROM users WHERE id = $1`;
      const inviterResult = await query(inviterSql, [invitedBy]);
      const inviter = inviterResult.rows[0];

      // Generate invitation link
      const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invitations/accept?token=${token}`;
      
      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (inviteData.expires_in_hours || 168));

      // Send email
      const emailSent = await EmailService.sendInvitationEmail({
        workspaceName: workspace.name,
        inviterName: inviter.name || inviter.email,
        role: inviteData.role,
        invitationLink,
        expiresAt: expiresAt.toLocaleDateString(),
        recipientEmail: inviteData.email
      });

      if (!emailSent) {
        console.warn(`Failed to send invitation email to ${inviteData.email}`);
      }
    } catch (error) {
      console.error('Error sending invitation email:', error);
      // Don't fail the invitation if email fails
    }

    return token;
  }

  /**
   * Get workspace invitations
   */
  static async getWorkspaceInvitations(workspaceId: string): Promise<Invitation[]> {
    const sql = `
      SELECT i.*, u.name as invited_by_name
      FROM invitations i
      JOIN users u ON i.invited_by = u.id
      WHERE i.workspace_id = $1
      ORDER BY i.created_at DESC
    `;
    
    const result = await query(sql, [workspaceId]);
    return result.rows;
  }

  /**
   * Accept invitation
   */
  static async acceptInvitation(
    token: string,
    userId: string
  ): Promise<{ success: boolean; workspaceId?: string }> {
    const sql = `
      SELECT accept_workspace_invitation($1, $2) as success
    `;
    
    const result = await query(sql, [token, userId]);
    const success = result.rows[0].success;

    if (success) {
      // Get workspace ID and role from the invitation
      const invitationSql = `
        SELECT i.workspace_id, i.role, u.email
        FROM invitations i
        JOIN users u ON u.id = $2
        WHERE i.token = $1
      `;
      const invitationResult = await query(invitationSql, [token, userId]);
      const invitation = invitationResult.rows[0];

      // Send welcome email
      try {
        const workspace = await this.getWorkspaceById(invitation.workspace_id);
        
        const welcomeEmailSent = await EmailService.sendWelcomeEmail(
          invitation.email,
          workspace.name,
          invitation.role
        );

        if (!welcomeEmailSent) {
          console.warn(`Failed to send welcome email to ${invitation.email}`);
        }
      } catch (error) {
        console.error('Error sending welcome email:', error);
        // Don't fail the acceptance if email fails
      }

      return { success: true, workspaceId: invitation.workspace_id };
    }

    return { success: false };
  }

  /**
   * Cancel invitation
   */
  static async cancelInvitation(invitationId: string): Promise<void> {
    const sql = `
      UPDATE invitations 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    
    await query(sql, [invitationId]);
  }

  /**
   * Resend invitation
   */
  static async resendInvitation(
    invitationId: string,
    expiresInHours: number = 168
  ): Promise<string> {
    // Get invitation details
    const getSql = `
      SELECT workspace_id, email, role, invited_by 
      FROM invitations 
      WHERE id = $1
    `;
    
    const getResult = await query(getSql, [invitationId]);
    
    if (getResult.rows.length === 0) {
      throw new Error(WORKSPACE_ERROR_CODES.INVITATION_NOT_FOUND);
    }
    
    const invitation = getResult.rows[0];
    
    // Cancel old invitation
    await this.cancelInvitation(invitationId);
    
    // Create new invitation (this will automatically send the email)
    return this.inviteUser(
      invitation.workspace_id,
      {
        email: invitation.email,
        role: invitation.role,
        expires_in_hours: expiresInHours
      },
      invitation.invited_by
    );
  }

  // =====================================================
  // Analytics and Reporting
  // =====================================================

  /**
   * Get workspace analytics
   */
  static async getWorkspaceAnalytics(workspaceId: string): Promise<WorkspaceAnalytics> {
    const sql = `
      SELECT * FROM workspace_analytics 
      WHERE workspace_id = $1
    `;
    
    const result = await query(sql, [workspaceId]);
    
    if (result.rows.length === 0) {
      throw new Error(WORKSPACE_ERROR_CODES.WORKSPACE_NOT_FOUND);
    }
    
    return result.rows[0];
  }

  /**
   * Get all workspaces for admin
   */
  static async getAllWorkspaces(): Promise<WorkspaceAnalytics[]> {
    const sql = `
      SELECT * FROM workspace_analytics 
      ORDER BY workspace_created_at DESC
    `;
    
    const result = await query(sql);
    return result.rows;
  }

  // =====================================================
  // Migration and Setup
  // =====================================================

  /**
   * Migrate existing data to workspace structure
   */
  static async migrateToWorkspaceStructure(): Promise<string> {
    const sql = `
      SELECT migrate_to_workspace_structure() as result
    `;
    
    const result = await query(sql);
    return result.rows[0].result;
  }

  /**
   * Check if workspace slug is available
   */
  static async isSlugAvailable(slug: string, excludeWorkspaceId?: string): Promise<boolean> {
    let sql = `
      SELECT COUNT(*) as count FROM workspaces 
      WHERE slug = $1 AND is_active = true
    `;
    
    const params = [slug];
    
    if (excludeWorkspaceId) {
      sql += ` AND id != $2`;
      params.push(excludeWorkspaceId);
    }
    
    const result = await query(sql, params);
    return parseInt(result.rows[0].count) === 0;
  }

  // =====================================================
  // Permission Helpers
  // =====================================================

  /**
   * Check if user has permission in workspace
   */
  static async hasPermission(
    workspaceId: string,
    userId: string,
    permission: string
  ): Promise<boolean> {
    const sql = `
      SELECT wm.role, wm.permissions
      FROM workspace_memberships wm
      WHERE wm.workspace_id = $1 AND wm.user_id = $2 AND wm.status = 'active'
    `;
    
    const result = await query(sql, [workspaceId, userId]);
    
    if (result.rows.length === 0) {
      return false;
    }
    
    const membership = result.rows[0];
    
    // Check role-based permissions
    const rolePermissions = this.getRolePermissions(membership.role);
    if (rolePermissions.includes(permission)) {
      return true;
    }
    
    // Check custom permissions
    const customPermissions = membership.permissions || {};
    return customPermissions[permission] === true;
  }

  /**
   * Get permissions for a role
   */
  private static getRolePermissions(role: WorkspaceRole): string[] {
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
  }
}
