/**
 * Audit Logging Types and Interfaces
 * Propaganda Dashboard - Comprehensive Audit Trail System
 */

export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface AuditLog {
  id: string;
  clientId: string;
  userId?: string;
  tableName: string;
  recordId: string;
  action: AuditAction;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  endpoint?: string;
  httpMethod?: HttpMethod;
  statusCode?: number;
  operationDurationMs?: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface AuditLogCreate {
  clientId: string;
  userId?: string;
  tableName: string;
  recordId: string;
  action: AuditAction;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  endpoint?: string;
  httpMethod?: HttpMethod;
  statusCode?: number;
  operationDurationMs?: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface AuditLogFilter {
  clientId?: string;
  userId?: string;
  tableName?: string;
  action?: AuditAction;
  endpoint?: string;
  httpMethod?: HttpMethod;
  statusCode?: number;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export interface AuditLogSummary {
  id: string;
  clientId: string;
  clientName?: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  tableName: string;
  recordId: string;
  action: AuditAction;
  endpoint?: string;
  httpMethod?: HttpMethod;
  statusCode?: number;
  operationDurationMs?: number;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface AuditContext {
  clientId: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  httpMethod?: HttpMethod;
  metadata?: Record<string, any>;
}

export interface AuditLogStats {
  totalLogs: number;
  logsByAction: Record<AuditAction, number>;
  logsByTable: Record<string, number>;
  logsByUser: Record<string, number>;
  logsByEndpoint: Record<string, number>;
  averageOperationDuration: number;
  errorRate: number;
  dateRange: {
    from: Date;
    to: Date;
  };
}

export interface AuditLogQuery {
  clientId: string;
  userId?: string;
  tableName?: string;
  action?: AuditAction;
  endpoint?: string;
  httpMethod?: HttpMethod;
  statusCode?: number;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'operation_duration_ms' | 'status_code';
  orderDirection?: 'ASC' | 'DESC';
}

export interface AuditLogResponse {
  success: boolean;
  data: AuditLogSummary[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface AuditLogStatsResponse {
  success: boolean;
  data: AuditLogStats;
}

// Audit logging configuration
export interface AuditConfig {
  enabled: boolean;
  logSelects: boolean;
  logInserts: boolean;
  logUpdates: boolean;
  logDeletes: boolean;
  logErrors: boolean;
  logPerformance: boolean;
  maxLogAge: number; // in days
  batchSize: number;
  flushInterval: number; // in milliseconds
}

// Default audit configuration
export const DEFAULT_AUDIT_CONFIG: AuditConfig = {
  enabled: true,
  logSelects: false, // Don't log SELECT operations by default (too verbose)
  logInserts: true,
  logUpdates: true,
  logDeletes: true,
  logErrors: true,
  logPerformance: true,
  maxLogAge: 365, // 1 year
  batchSize: 100,
  flushInterval: 5000, // 5 seconds
};

// Audit log levels for different types of operations
export enum AuditLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug'
}

// Audit categories for organizing different types of operations
export enum AuditCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
  SYSTEM = 'system',
  SECURITY = 'security',
  PERFORMANCE = 'performance'
}

// Enhanced audit log with additional context
export interface EnhancedAuditLog extends AuditLog {
  level: AuditLevel;
  category: AuditCategory;
  tags?: string[];
  correlationId?: string;
  parentOperationId?: string;
}
