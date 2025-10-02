import { query } from '@/lib/database';

export interface AuditLog {
  id: string;
  user_id: string;
  user_role: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface CreateAuditLogData {
  userId: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Create an audit log entry
   */
  static async createAuditLog(data: CreateAuditLogData): Promise<AuditLog> {
    const {
      userId,
      userRole,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress,
      userAgent
    } = data;

    const auditQuery = `
      INSERT INTO audit_logs (
        user_id,
        user_role,
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
        user_agent,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
    `;

    const result = await query(auditQuery, [
      userId,
      userRole,
      action,
      resourceType,
      resourceId,
      JSON.stringify(details),
      ipAddress,
      userAgent
    ]);

    return result.rows[0];
  }

  /**
   * Get audit logs with filtering
   */
  static async getAuditLogs(filters: {
    userId?: string;
    userRole?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<AuditLog[]> {
    const {
      userId,
      userRole,
      action,
      resourceType,
      resourceId,
      dateFrom,
      dateTo,
      limit = 100,
      offset = 0
    } = filters;

    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (userId) {
      whereConditions.push(`user_id = $${paramIndex}`);
      queryParams.push(userId);
      paramIndex++;
    }

    if (userRole) {
      whereConditions.push(`user_role = $${paramIndex}`);
      queryParams.push(userRole);
      paramIndex++;
    }

    if (action) {
      whereConditions.push(`action = $${paramIndex}`);
      queryParams.push(action);
      paramIndex++;
    }

    if (resourceType) {
      whereConditions.push(`resource_type = $${paramIndex}`);
      queryParams.push(resourceType);
      paramIndex++;
    }

    if (resourceId) {
      whereConditions.push(`resource_id = $${paramIndex}`);
      queryParams.push(resourceId);
      paramIndex++;
    }

    if (dateFrom) {
      whereConditions.push(`created_at >= $${paramIndex}`);
      queryParams.push(dateFrom);
      paramIndex++;
    }

    if (dateTo) {
      whereConditions.push(`created_at <= $${paramIndex}`);
      queryParams.push(dateTo);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const auditQuery = `
      SELECT *
      FROM audit_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    const result = await query(auditQuery, queryParams);
    return result.rows;
  }

  /**
   * Log client management actions
   */
  static async logClientAction(
    userId: string,
    userRole: string,
    action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'VIEW_PERFORMANCE',
    clientId: string,
    details: Record<string, any> = {},
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditLog> {
    return this.createAuditLog({
      userId,
      userRole,
      action,
      resourceType: 'CLIENT',
      resourceId: clientId,
      details: {
        ...details,
        timestamp: new Date().toISOString()
      },
      ipAddress,
      userAgent
    });
  }

  /**
   * Log unauthorized access attempts
   */
  static async logUnauthorizedAccess(
    userId: string,
    userRole: string,
    attemptedAction: string,
    resourceType: string,
    resourceId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditLog> {
    return this.createAuditLog({
      userId,
      userRole,
      action: 'UNAUTHORIZED_ACCESS',
      resourceType,
      resourceId,
      details: {
        attemptedAction,
        timestamp: new Date().toISOString()
      },
      ipAddress,
      userAgent
    });
  }
}