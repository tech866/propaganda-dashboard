/**
 * Workspace Invitation Service
 * Handles workspace invitations, team member management, and role assignments
 */

import { createAdminSupabaseClient } from '@/lib/supabase-client';
import { EmailService } from './emailService';
import { WorkspaceRole } from '@/lib/types/workspace';

export interface CreateInvitationData {
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  invitedBy: string;
  expiresInDays?: number;
}

export interface Invitation {
  id: string;
  workspace_id: string;
  email: string;
  role: WorkspaceRole;
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AcceptInvitationData {
  token: string;
  userId: string;
  userEmail: string;
  userName: string;
}

export class WorkspaceInvitationService {
  private static supabase = createAdminSupabaseClient();

  /**
   * Create a new workspace invitation
   */
  static async createInvitation(data: CreateInvitationData): Promise<{ success: boolean; invitation?: Invitation; error?: string }> {
    try {
      const { workspaceId, email, role, invitedBy, expiresInDays = 7 } = data;

      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await this.supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('user_id', email)
        .single();

      if (memberCheckError && memberCheckError.code !== 'PGRST116') {
        throw new Error(`Failed to check existing membership: ${memberCheckError.message}`);
      }

      if (existingMember) {
        return { success: false, error: 'User is already a member of this workspace' };
      }

      // Check for existing pending invitation
      const { data: existingInvitation, error: invitationCheckError } = await this.supabase
        .from('workspace_invitations')
        .select('id, expires_at')
        .eq('workspace_id', workspaceId)
        .eq('email', email)
        .is('accepted_at', null)
        .single();

      if (invitationCheckError && invitationCheckError.code !== 'PGRST116') {
        throw new Error(`Failed to check existing invitations: ${invitationCheckError.message}`);
      }

      if (existingInvitation) {
        const expiresAt = new Date(existingInvitation.expires_at);
        if (expiresAt > new Date()) {
          return { success: false, error: 'A pending invitation already exists for this email' };
        }
      }

      // Generate invitation token
      const token = this.generateInvitationToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      // Create invitation
      const { data: invitation, error: createError } = await this.supabase
        .from('workspace_invitations')
        .insert({
          workspace_id: workspaceId,
          email,
          role,
          invited_by: invitedBy,
          token,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create invitation: ${createError.message}`);
      }

      // Get workspace details for email
      const { data: workspace, error: workspaceError } = await this.supabase
        .from('workspaces')
        .select('name')
        .eq('id', workspaceId)
        .single();

      if (workspaceError) {
        console.warn('Failed to fetch workspace details for email:', workspaceError.message);
      }

      // Get inviter details for email
      const { data: inviter, error: inviterError } = await this.supabase
        .from('users')
        .select('name')
        .eq('id', invitedBy)
        .single();

      if (inviterError) {
        console.warn('Failed to fetch inviter details for email:', inviterError.message);
      }

      // Send invitation email
      const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${token}`;
      
      const emailResult = await EmailService.sendTeamInvitation({
        inviteeEmail: email,
        inviterName: inviter?.name || 'A team member',
        workspaceName: workspace?.name || 'the workspace',
        role: this.formatRoleName(role),
        invitationUrl,
        expiresAt,
      });

      if (!emailResult.success) {
        console.warn('Failed to send invitation email:', emailResult.error);
        // Don't fail the invitation creation if email fails
      }

      return { success: true, invitation };
    } catch (error) {
      console.error('Error creating workspace invitation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Accept a workspace invitation
   */
  static async acceptInvitation(data: AcceptInvitationData): Promise<{ success: boolean; error?: string }> {
    try {
      const { token, userId, userEmail, userName } = data;

      // Find the invitation
      const { data: invitation, error: invitationError } = await this.supabase
        .from('workspace_invitations')
        .select('*')
        .eq('token', token)
        .is('accepted_at', null)
        .single();

      if (invitationError) {
        if (invitationError.code === 'PGRST116') {
          return { success: false, error: 'Invalid or expired invitation' };
        }
        throw new Error(`Failed to find invitation: ${invitationError.message}`);
      }

      // Check if invitation is expired
      const expiresAt = new Date(invitation.expires_at);
      if (expiresAt < new Date()) {
        return { success: false, error: 'Invitation has expired' };
      }

      // Check if email matches
      if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
        return { success: false, error: 'Invitation email does not match your account' };
      }

      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await this.supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', invitation.workspace_id)
        .eq('user_id', userId)
        .single();

      if (memberCheckError && memberCheckError.code !== 'PGRST116') {
        throw new Error(`Failed to check existing membership: ${memberCheckError.message}`);
      }

      if (existingMember) {
        return { success: false, error: 'You are already a member of this workspace' };
      }

      // Start transaction
      const { error: transactionError } = await this.supabase.rpc('accept_workspace_invitation', {
        invitation_id: invitation.id,
        user_id: userId,
        workspace_id: invitation.workspace_id,
        role: invitation.role,
      });

      if (transactionError) {
        throw new Error(`Failed to accept invitation: ${transactionError.message}`);
      }

      // Get workspace details for welcome email
      const { data: workspace, error: workspaceError } = await this.supabase
        .from('workspaces')
        .select('name')
        .eq('id', invitation.workspace_id)
        .single();

      if (workspaceError) {
        console.warn('Failed to fetch workspace details for welcome email:', workspaceError.message);
      }

      // Send welcome email
      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;
      
      const emailResult = await EmailService.sendWelcomeEmail({
        userEmail,
        userName,
        workspaceName: workspace?.name || 'the workspace',
        loginUrl,
      });

      if (!emailResult.success) {
        console.warn('Failed to send welcome email:', emailResult.error);
        // Don't fail the invitation acceptance if email fails
      }

      return { success: true };
    } catch (error) {
      console.error('Error accepting workspace invitation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get invitation by token
   */
  static async getInvitationByToken(token: string): Promise<{ success: boolean; invitation?: Invitation; error?: string }> {
    try {
      const { data: invitation, error } = await this.supabase
        .from('workspace_invitations')
        .select(`
          *,
          workspaces!inner(name),
          users!workspace_invitations_invited_by_fkey(name)
        `)
        .eq('token', token)
        .is('accepted_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Invalid or expired invitation' };
        }
        throw new Error(`Failed to fetch invitation: ${error.message}`);
      }

      // Check if invitation is expired
      const expiresAt = new Date(invitation.expires_at);
      if (expiresAt < new Date()) {
        return { success: false, error: 'Invitation has expired' };
      }

      return { success: true, invitation };
    } catch (error) {
      console.error('Error fetching invitation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get workspace invitations
   */
  static async getWorkspaceInvitations(workspaceId: string): Promise<{ success: boolean; invitations?: Invitation[]; error?: string }> {
    try {
      const { data: invitations, error } = await this.supabase
        .from('workspace_invitations')
        .select(`
          *,
          users!workspace_invitations_invited_by_fkey(name)
        `)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch invitations: ${error.message}`);
      }

      return { success: true, invitations };
    } catch (error) {
      console.error('Error fetching workspace invitations:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Cancel an invitation
   */
  static async cancelInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('workspace_invitations')
        .delete()
        .eq('id', invitationId)
        .is('accepted_at', null);

      if (error) {
        throw new Error(`Failed to cancel invitation: ${error.message}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error canceling invitation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Resend invitation email
   */
  static async resendInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: invitation, error: fetchError } = await this.supabase
        .from('workspace_invitations')
        .select(`
          *,
          workspaces!inner(name),
          users!workspace_invitations_invited_by_fkey(name)
        `)
        .eq('id', invitationId)
        .is('accepted_at', null)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch invitation: ${fetchError.message}`);
      }

      // Check if invitation is expired
      const expiresAt = new Date(invitation.expires_at);
      if (expiresAt < new Date()) {
        return { success: false, error: 'Invitation has expired' };
      }

      // Send invitation email
      const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${invitation.token}`;
      
      const emailResult = await EmailService.sendTeamInvitation({
        inviteeEmail: invitation.email,
        inviterName: invitation.users?.name || 'A team member',
        workspaceName: invitation.workspaces?.name || 'the workspace',
        role: this.formatRoleName(invitation.role),
        invitationUrl,
        expiresAt,
      });

      if (!emailResult.success) {
        return { success: false, error: emailResult.error };
      }

      return { success: true };
    } catch (error) {
      console.error('Error resending invitation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Generate a secure invitation token
   */
  private static generateInvitationToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Format role name for display
   */
  private static formatRoleName(role: WorkspaceRole): string {
    const roleNames: Record<WorkspaceRole, string> = {
      admin: 'Administrator',
      manager: 'Manager',
      sales: 'Sales Representative',
      client: 'Client',
      viewer: 'Viewer',
    };
    return roleNames[role] || role;
  }
}



