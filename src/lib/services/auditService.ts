/**
 * Audit Logging Service
 * Propaganda Dashboard - Comprehensive Audit Trail System
 */

import { Pool } from 'pg';
import { 
  AuditLog, 
  AuditLogCreate, 
  AuditLogFilter, 
  AuditLogSummary, 
  AuditLogStats,
  AuditLogQuery,
  AuditLogResponse,
  AuditLogStatsResponse,
  AuditContext,
  AuditConfig,
  DEFAULT_AUDIT_CONFIG,
  AuditLevel,
  AuditCategory,
  EnhancedAuditLog
} from '@/lib/types/audit';
import { query, withTransaction } from '@/lib/database';

export class AuditService {
  private static instance: AuditService;
  private config: AuditConfig;
  private logBuffer: AuditLogCreate[] = [];
  private flushTimer?: NodeJS.Timeout;

  private constructor(config: AuditConfig = DEFAULT_AUDIT_CONFIG) {
    this.config = config;
    this.startFlushTimer();
  }

  public static getInstance(config?: AuditConfig): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService(config);
    }
    return AuditService.instance;
  }

  /**
   * Log an audit event
   */
  public async log(auditLog: AuditLogCreate): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    // Check if we should log this action type
    if (!this.shouldLogAction(auditLog.action)) {
      return;
    }

    // Add to buffer for batch processing
    this.logBuffer.push(auditLog);

    // Flush if buffer is full
    if (this.logBuffer.length >= this.config.batchSize) {
      await this.flush();
    }
  }

  /**
   * Log an enhanced audit event with additional context
   */
  public async logEnhanced(
    auditLog: AuditLogCreate,
    level: AuditLevel = AuditLevel.INFO,
    category: AuditCategory = AuditCategory.DATA_MODIFICATION,
    tags?: string[],
    correlationId?: string
  ): Promise<void> {
    const enhancedLog: AuditLogCreate = {
      ...auditLog,
      metadata: {
        ...auditLog.metadata,
        level,
        category,
        tags,
        correlationId,
        timestamp: new Date().toISOString()
      }
    };

    await this.log(enhancedLog);
  }

  /**
   * Log authentication events
   */
  public async logAuth(
    context: AuditContext,
    action: 'login' | 'logout' | 'register' | 'password_reset' | 'session_expired',
    success: boolean,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logEnhanced(
      {
        clientId: context.clientId,
        userId: context.userId,
        tableName: 'users',
        recordId: context.userId || 'unknown',
        action: 'SELECT',
        endpoint: context.endpoint,
        httpMethod: context.httpMethod,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        statusCode: success ? 200 : 401,
        metadata: {
          authAction: action,
          success,
          ...details
        }
      },
      success ? AuditLevel.INFO : AuditLevel.WARN,
      AuditCategory.AUTHENTICATION,
      ['auth', action]
    );
  }

  /**
   * Log data access events
   */
  public async logDataAccess(
    context: AuditContext,
    tableName: string,
    recordId: string,
    action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    duration?: number
  ): Promise<void> {
    await this.log({
      clientId: context.clientId,
      userId: context.userId,
      tableName,
      recordId,
      action,
      oldValues,
      newValues,
      endpoint: context.endpoint,
      httpMethod: context.httpMethod,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      sessionId: context.sessionId,
      operationDurationMs: duration,
      metadata: context.metadata
    });
  }

  /**
   * Log error events
   */
  public async logError(
    context: AuditContext,
    error: Error,
    tableName?: string,
    recordId?: string,
    action?: string
  ): Promise<void> {
    await this.logEnhanced(
      {
        clientId: context.clientId,
        userId: context.userId,
        tableName: tableName || 'system',
        recordId: recordId || 'unknown',
        action: 'SELECT', // Default action for errors
        endpoint: context.endpoint,
        httpMethod: context.httpMethod,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        statusCode: 500,
        errorMessage: error.message,
        metadata: {
          errorStack: error.stack,
          errorName: error.name,
          action,
          ...context.metadata
        }
      },
      AuditLevel.ERROR,
      AuditCategory.SYSTEM,
      ['error', 'system']
    );
  }

  /**
   * Get audit logs with filtering
   */
  public async getAuditLogs(queryParams: AuditLogQuery): Promise<AuditLogResponse> {
    const {
      clientId,
      userId,
      tableName,
      action,
      endpoint,
      httpMethod,
      statusCode,
      dateFrom,
      dateTo,
      limit = 50,
      offset = 0,
      orderBy = 'created_at',
      orderDirection = 'DESC'
    } = queryParams;

    let whereConditions = ['al.client_id = $1'];
    let params: any[] = [clientId];
    let paramIndex = 2;

    if (userId) {
      whereConditions.push(`al.user_id = $${paramIndex}`);
      params.push(userId);
      paramIndex++;
    }

    if (tableName) {
      whereConditions.push(`al.table_name = $${paramIndex}`);
      params.push(tableName);
      paramIndex++;
    }

    if (action) {
      whereConditions.push(`al.action = $${paramIndex}`);
      params.push(action);
      paramIndex++;
    }

    if (endpoint) {
      whereConditions.push(`al.endpoint ILIKE $${paramIndex}`);
      params.push(`%${endpoint}%`);
      paramIndex++;
    }

    if (httpMethod) {
      whereConditions.push(`al.http_method = $${paramIndex}`);
      params.push(httpMethod);
      paramIndex++;
    }

    if (statusCode) {
      whereConditions.push(`al.status_code = $${paramIndex}`);
      params.push(statusCode);
      paramIndex++;
    }

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

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM audit_logs al
      WHERE ${whereClause}
    `;

    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results
    const dataQuery = `
      SELECT 
        al.id,
        al.client_id,
        c.name as client_name,
        al.user_id,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role,
        al.table_name,
        al.record_id,
        al.action,
        al.endpoint,
        al.http_method,
        al.status_code,
        al.operation_duration_ms,
        al.error_message,
        al.ip_address,
        al.user_agent,
        al.session_id,
        al.created_at,
        al.metadata
      FROM audit_logs al
      LEFT JOIN clients c ON al.client_id = c.id
      LEFT JOIN users u ON al.user_id = u.id
      WHERE ${whereClause}
      ORDER BY al.${orderBy} ${orderDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);
    const dataResult = await query(dataQuery, params);

    return {
      success: true,
      data: dataResult.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  }

  /**
   * Get audit log statistics
   */
  public async getAuditStats(
    clientId: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<AuditLogStatsResponse> {
    let whereConditions = ['al.client_id = $1'];
    let params: any[] = [clientId];
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

    const statsQuery = `
      SELECT 
        COUNT(*) as total_logs,
        COUNT(CASE WHEN al.action = 'INSERT' THEN 1 END) as inserts,
        COUNT(CASE WHEN al.action = 'UPDATE' THEN 1 END) as updates,
        COUNT(CASE WHEN al.action = 'DELETE' THEN 1 END) as deletes,
        COUNT(CASE WHEN al.action = 'SELECT' THEN 1 END) as selects,
        COUNT(CASE WHEN al.status_code >= 400 THEN 1 END) as errors,
        AVG(al.operation_duration_ms) as avg_duration,
        MIN(al.created_at) as earliest_log,
        MAX(al.created_at) as latest_log
      FROM audit_logs al
      WHERE ${whereClause}
    `;

    const result = await query(statsQuery, params);
    const stats = result.rows[0];

    // Get logs by table
    const tableStatsQuery = `
      SELECT al.table_name, COUNT(*) as count
      FROM audit_logs al
      WHERE ${whereClause}
      GROUP BY al.table_name
      ORDER BY count DESC
    `;

    const tableStatsResult = await query(tableStatsQuery, params);
    const logsByTable = tableStatsResult.rows.reduce((acc, row) => {
      acc[row.table_name] = parseInt(row.count);
      return acc;
    }, {} as Record<string, number>);

    // Get logs by user
    const userStatsQuery = `
      SELECT u.name as user_name, COUNT(*) as count
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE ${whereClause}
      GROUP BY u.name
      ORDER BY count DESC
    `;

    const userStatsResult = await query(userStatsQuery, params);
    const logsByUser = userStatsResult.rows.reduce((acc, row) => {
      acc[row.user_name || 'Unknown'] = parseInt(row.count);
      return acc;
    }, {} as Record<string, number>);

    // Get logs by endpoint
    const endpointStatsQuery = `
      SELECT al.endpoint, COUNT(*) as count
      FROM audit_logs al
      WHERE ${whereClause} AND al.endpoint IS NOT NULL
      GROUP BY al.endpoint
      ORDER BY count DESC
      LIMIT 10
    `;

    const endpointStatsResult = await query(endpointStatsQuery, params);
    const logsByEndpoint = endpointStatsResult.rows.reduce((acc, row) => {
      acc[row.endpoint] = parseInt(row.count);
      return acc;
    }, {} as Record<string, number>);

    const auditStats: AuditLogStats = {
      totalLogs: parseInt(stats.total_logs),
      logsByAction: {
        INSERT: parseInt(stats.inserts),
        UPDATE: parseInt(stats.updates),
        DELETE: parseInt(stats.deletes),
        SELECT: parseInt(stats.selects)
      },
      logsByTable,
      logsByUser,
      logsByEndpoint,
      averageOperationDuration: parseFloat(stats.avg_duration) || 0,
      errorRate: stats.total_logs > 0 ? (parseInt(stats.errors) / parseInt(stats.total_logs)) * 100 : 0,
      dateRange: {
        from: stats.earliest_log ? new Date(stats.earliest_log) : new Date(),
        to: stats.latest_log ? new Date(stats.latest_log) : new Date()
      }
    };

    return {
      success: true,
      data: auditStats
    };
  }

  /**
   * Clean up old audit logs
   */
  public async cleanupOldLogs(retentionDays: number = 365): Promise<number> {
    const cleanupQuery = `
      DELETE FROM audit_logs 
      WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 day' * $1
    `;

    const result = await query(cleanupQuery, [retentionDays]);
    return result.rowCount || 0;
  }

  /**
   * Flush buffered logs to database
   */
  public async flush(): Promise<void> {
    if (this.logBuffer.length === 0) {
      return;
    }

    const logs = [...this.logBuffer];
    this.logBuffer = [];

    if (logs.length === 0) {
      return;
    }

    const insertQuery = `
      INSERT INTO audit_logs (
        client_id, user_id, table_name, record_id, action,
        old_values, new_values, ip_address, user_agent,
        session_id, endpoint, http_method, status_code,
        operation_duration_ms, error_message, metadata
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      )
    `;

    try {
      await withTransaction(async (client) => {
        for (const log of logs) {
          // Validate and convert UUIDs
          const clientId = this.validateUuid(log.clientId) ? log.clientId : null;
          const userId = this.validateUuid(log.userId) ? log.userId : null;
          // Generate a UUID for recordId if it's invalid or null
          const recordId = this.validateUuid(log.recordId) ? log.recordId : this.generateUuid();
          
          await client.query(insertQuery, [
            clientId,
            userId,
            log.tableName,
            recordId,
            log.action,
            log.oldValues ? JSON.stringify(log.oldValues) : null,
            log.newValues ? JSON.stringify(log.newValues) : null,
            log.ipAddress,
            log.userAgent,
            log.sessionId,
            log.endpoint,
            log.httpMethod,
            log.statusCode,
            log.operationDurationMs,
            log.errorMessage,
            log.metadata ? JSON.stringify(log.metadata) : null
          ]);
        }
      });
    } catch (error) {
      console.error('Failed to flush audit logs:', error);
      // Re-add logs to buffer for retry
      this.logBuffer.unshift(...logs);
    }
  }

  /**
   * Check if we should log a specific action type
   */
  private shouldLogAction(action: string): boolean {
    switch (action) {
      case 'SELECT':
        return this.config.logSelects;
      case 'INSERT':
        return this.config.logInserts;
      case 'UPDATE':
        return this.config.logUpdates;
      case 'DELETE':
        return this.config.logDeletes;
      default:
        return true;
    }
  }

  /**
   * Validate if a string is a valid UUID
   */
  private validateUuid(value: string | undefined | null): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  /**
   * Generate a new UUID
   */
  private generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Start the flush timer for batch processing
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(async () => {
      if (this.logBuffer.length > 0) {
        await this.flush();
      }
    }, this.config.flushInterval);
  }

  /**
   * Stop the flush timer
   */
  public stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  /**
   * Update audit configuration
   */
  public updateConfig(newConfig: Partial<AuditConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfig(): AuditConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const auditService = AuditService.getInstance();
