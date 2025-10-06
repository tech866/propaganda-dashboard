// =====================================================
// Audit Service
// Task 20.5: Implement Workspace Management UI Components and Audit Logging
// =====================================================

import { query } from '../database';
import { User } from '@supabase/supabase-js';

export interface AuditLogEntry {
  workspace_id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export class AuditService {
  /**
   * Create an audit log entry
   */
  static async createAuditLog(
    entry: AuditLogEntry
  ): Promise<void> {
    try {
      const sql = `
      INSERT INTO audit_logs (
          workspace_id,
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
          user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;

      await query(sql, [
        entry.workspace_id,
        entry.user_id,
        entry.action,
        entry.resource_type,
        entry.resource_id || null,
        entry.details ? JSON.stringify(entry.details) : null,
        entry.ip_address || null,
        entry.user_agent || null
      ]);
    } catch (error) {
      console.error('Error creating audit log:', error);
      // Don't throw error to avoid breaking the main operation
    }
  }

  /**
   * Log workspace creation
   */
  static async logWorkspaceCreated(
    workspaceId: string,
    user: User,
    workspaceName: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.createAuditLog({
      workspace_id: workspaceId,
      user_id: user.id,
      action: 'workspace:created',
      resource_type: 'workspace',
      resource_id: workspaceId,
      details: { name: workspaceName },
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log workspace update
   */
  static async logWorkspaceUpdated(
    workspaceId: string,
    user: User,
    changes: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.createAuditLog({
      workspace_id: workspaceId,
      user_id: user.id,
      action: 'workspace:updated',
      resource_type: 'workspace',
      resource_id: workspaceId,
      details: { changes },
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log workspace deletion
   */
  static async logWorkspaceDeleted(
    workspaceId: string,
    user: User,
    workspaceName: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.createAuditLog({
      workspace_id: workspaceId,
      user_id: user.id,
      action: 'workspace:deleted',
      resource_type: 'workspace',
      resource_id: workspaceId,
      details: { name: workspaceName },
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log member invitation
   */
  static async logMemberInvited(
    workspaceId: string,
    user: User,
    invitedEmail: string,
    role: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.createAuditLog({
      workspace_id: workspaceId,
      user_id: user.id,
      action: 'member:invited',
      resource_type: 'member',
      details: { email: invitedEmail, role },
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log member joining
   */
  static async logMemberJoined(
    workspaceId: string,
    user: User,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.createAuditLog({
      workspace_id: workspaceId,
      user_id: user.id,
      action: 'member:joined',
      resource_type: 'member',
      resource_id: user.id,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log member removal
   */
  static async logMemberRemoved(
    workspaceId: string,
    user: User,
    removedUserId: string,
    removedUserName: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.createAuditLog({
      workspace_id: workspaceId,
      user_id: user.id,
      action: 'member:removed',
      resource_type: 'member',
      resource_id: removedUserId,
      details: { user_name: removedUserName },
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log role change
   */
  static async logRoleChanged(
    workspaceId: string,
    user: User,
    targetUserId: string,
    oldRole: string,
    newRole: string,
    targetUserName: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.createAuditLog({
      workspace_id: workspaceId,
      user_id: user.id,
      action: 'member:role_changed',
      resource_type: 'member',
      resource_id: targetUserId,
      details: { 
        user_name: targetUserName,
        old_role: oldRole,
        new_role: newRole
      },
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log invitation sent
   */
  static async logInvitationSent(
    workspaceId: string,
    user: User,
    invitedEmail: string,
    role: string,
    invitationId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.createAuditLog({
      workspace_id: workspaceId,
      user_id: user.id,
      action: 'invitation:sent',
      resource_type: 'invitation',
      resource_id: invitationId,
      details: { email: invitedEmail, role },
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log invitation accepted
   */
  static async logInvitationAccepted(
    workspaceId: string,
    user: User,
    invitationId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.createAuditLog({
      workspace_id: workspaceId,
      user_id: user.id,
      action: 'invitation:accepted',
      resource_type: 'invitation',
      resource_id: invitationId,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log invitation expired
   */
  static async logInvitationExpired(
    workspaceId: string,
    invitationId: string,
    invitedEmail: string
  ): Promise<void> {
    await this.createAuditLog({
      workspace_id: workspaceId,
      user_id: 'system', // System action
      action: 'invitation:expired',
      resource_type: 'invitation',
      resource_id: invitationId,
      details: { email: invitedEmail }
    });
  }

  /**
   * Log call creation
   */
  static async logCallCreated(
    workspaceId: string,
    user: User,
    callId: string,
    prospectName: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.createAuditLog({
      workspace_id: workspaceId,
      user_id: user.id,
      action: 'call:created',
      resource_type: 'call',
      resource_id: callId,
      details: { prospect_name: prospectName },
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log call update
   */
  static async logCallUpdated(
    workspaceId: string,
    user: User,
    callId: string,
    prospectName: string,
    changes: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.createAuditLog({
      workspace_id: workspaceId,
      user_id: user.id,
      action: 'call:updated',
      resource_type: 'call',
      resource_id: callId,
      details: { 
        prospect_name: prospectName,
        changes 
      },
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log call deletion
   */
  static async logCallDeleted(
    workspaceId: string,
    user: User,
    callId: string,
    prospectName: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.createAuditLog({
      workspace_id: workspaceId,
      user_id: user.id,
      action: 'call:deleted',
      resource_type: 'call',
      resource_id: callId,
      details: { prospect_name: prospectName },
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log client creation
   */
  static async logClientCreated(
    workspaceId: string,
    user: User,
    clientId: string,
    clientName: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.createAuditLog({
      workspace_id: workspaceId,
      user_id: user.id,
      action: 'client:created',
      resource_type: 'client',
      resource_id: clientId,
      details: { name: clientName },
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log client update
   */
  static async logClientUpdated(
    workspaceId: string,
    user: User,
    clientId: string,
    clientName: string,
    changes: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.createAuditLog({
      workspace_id: workspaceId,
      user_id: user.id,
      action: 'client:updated',
      resource_type: 'client',
      resource_id: clientId,
      details: {
        name: clientName,
        changes 
      },
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log client deletion
   */
  static async logClientDeleted(
    workspaceId: string,
    user: User,
    clientId: string,
    clientName: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.createAuditLog({
      workspace_id: workspaceId,
      user_id: user.id,
      action: 'client:deleted',
      resource_type: 'client',
      resource_id: clientId,
      details: { name: clientName },
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Log analytics view
   */
  static async logAnalyticsViewed(
    workspaceId: string,
    user: User,
    analyticsType: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.createAuditLog({
      workspace_id: workspaceId,
      user_id: user.id,
      action: 'analytics:viewed',
      resource_type: 'analytics',
      details: { type: analyticsType },
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * Get audit logs for a workspace
   */
  static async getAuditLogs(
    workspaceId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      type?: string;
    } = {}
  ): Promise<{ logs: any[]; total: number; hasMore: boolean }> {
    const { page = 1, limit = 20, search, type } = options;
    const offset = (page - 1) * limit;

    // Build query conditions
    let whereConditions = ['al.workspace_id = $1'];
    let params: any[] = [workspaceId];
    let paramIndex = 2;

    if (search) {
      whereConditions.push(`(
        al.action ILIKE $${paramIndex} OR 
        al.resource_type ILIKE $${paramIndex} OR 
        u.name ILIKE $${paramIndex} OR 
        u.email ILIKE $${paramIndex}
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (type && type !== 'all') {
      whereConditions.push(`al.resource_type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get audit logs
    const logsQuery = `
      SELECT 
        al.id,
        al.workspace_id,
        al.user_id,
        al.action,
        al.resource_type,
        al.resource_id,
        al.details,
        al.ip_address,
        al.user_agent,
        al.created_at,
        u.name as user_name,
        u.email as user_email
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);
    const logsResult = await query(logsQuery, params);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE ${whereClause}
    `;

    const countResult = await query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);
    const hasMore = offset + limit < total;

    return {
      logs: logsResult.rows,
      total,
      hasMore
    };
  }

  /**
   * Get audit log statistics
   */
  static async getAuditStats(
    workspaceId: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<{
    totalLogs: number;
    logsByType: Record<string, number>;
    logsByUser: Record<string, number>;
    logsByDate: Record<string, number>;
  }> {
    let whereConditions = ['al.workspace_id = $1'];
    let params: any[] = [workspaceId];
    let paramIndex = 2;

    if (dateFrom) {
      whereConditions.push(`al.created_at >= $${paramIndex}`);
      params.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      whereConditions.push(`al.created_at <= $${paramIndex}`);
      params.push(dateTo);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total logs
    const totalQuery = `
      SELECT COUNT(*) as total
      FROM audit_logs al
      WHERE ${whereClause}
    `;
    const totalResult = await query(totalQuery, params);
    const totalLogs = parseInt(totalResult.rows[0].total);

    // Get logs by type
    const typeQuery = `
      SELECT resource_type, COUNT(*) as count
      FROM audit_logs al
      WHERE ${whereClause}
      GROUP BY resource_type
    `;
    const typeResult = await query(typeQuery, params);
    const logsByType = typeResult.rows.reduce((acc, row) => {
      acc[row.resource_type] = parseInt(row.count);
      return acc;
    }, {} as Record<string, number>);

    // Get logs by user
    const userQuery = `
      SELECT u.name as user_name, COUNT(*) as count
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE ${whereClause}
      GROUP BY u.name
    `;
    const userResult = await query(userQuery, params);
    const logsByUser = userResult.rows.reduce((acc, row) => {
      acc[row.user_name || 'Unknown'] = parseInt(row.count);
      return acc;
    }, {} as Record<string, number>);

    // Get logs by date
    const dateQuery = `
      SELECT DATE(al.created_at) as date, COUNT(*) as count
      FROM audit_logs al
      WHERE ${whereClause}
      GROUP BY DATE(al.created_at)
      ORDER BY DATE(al.created_at)
    `;
    const dateResult = await query(dateQuery, params);
    const logsByDate = dateResult.rows.reduce((acc, row) => {
      acc[row.date] = parseInt(row.count);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLogs,
      logsByType,
      logsByUser,
      logsByDate
    };
  }

  /**
   * Clean up old audit logs
   */
  static async cleanupOldLogs(retentionDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const deleteQuery = `
      DELETE FROM audit_logs
      WHERE created_at < $1
    `;
    
    const result = await query(deleteQuery, [cutoffDate]);
    return result.rowCount || 0;
  }

  /**
   * Instance method for logging (for backward compatibility)
   */
  async log(entry: AuditLogEntry): Promise<void> {
    return AuditService.createAuditLog(entry);
  }
}

// Create a default instance for backward compatibility
export const auditService = new AuditService();