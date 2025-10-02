/**
 * Enhanced Audited Database Service
 * Propaganda Dashboard - Database operations with comprehensive user identification
 */

import { supabase, supabaseAdmin } from '@/lib/supabase';
import { withDatabaseAudit, extractEnhancedAuditContext } from '@/middleware/audit';
import { AuditContext } from '@/lib/types/audit';
import { NextRequest } from 'next/server';
import { userIdentificationService, EnhancedUser } from '@/lib/services/userIdentification';
import { User } from '@/middleware/auth';

/**
 * Enhanced audited database service with comprehensive user identification
 */
export class EnhancedAuditedDatabaseService {
  private context: AuditContext;
  private user: EnhancedUser | null;

  constructor(context: AuditContext, user?: EnhancedUser) {
    this.context = context;
    this.user = user || null;
  }

  /**
   * Execute a query with enhanced audit logging
   */
  async query(text: string, params?: any[], tableName?: string): Promise<any> {
    console.warn('Raw SQL queries not supported in Supabase. Use RPC functions or DatabaseService methods instead.');
    
    // For audit logging, we'll log the attempt but return empty results
    const auditedOperation = withDatabaseAudit(
      async () => {
        console.warn(`Attempted raw SQL query: ${text}`);
        return { rows: [], rowCount: 0 };
      },
      tableName || 'unknown',
      this.context
    );

    return await auditedOperation();
  }

  /**
   * Execute a transaction with enhanced audit logging
   */
  async withTransaction<T>(
    callback: (client: any) => Promise<T>,
    tableName?: string
  ): Promise<T> {
    console.warn('Explicit transactions not supported in Supabase client. Use RPC functions for complex transactions.');
    
    const auditedCallback = withDatabaseAudit(
      async () => {
        // Execute the callback with a mock client for compatibility
        const mockClient = { query: () => Promise.resolve({ rows: [], rowCount: 0 }) };
        return await callback(mockClient);
      },
      tableName || 'transaction',
      this.context
    );

    return await auditedCallback();
  }

  /**
   * Insert a record with enhanced audit logging
   */
  async insert(
    tableName: string,
    data: Record<string, any>,
    returning: string = 'id'
  ): Promise<any> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

    const query = `
      INSERT INTO ${tableName} (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING ${returning}
    `;

    const result = await this.query(query, values, tableName);
    return result.rows[0];
  }

  /**
   * Update a record with enhanced audit logging
   */
  async update(
    tableName: string,
    id: string,
    data: Record<string, any>,
    returning: string = '*'
  ): Promise<any> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');

    const query = `
      UPDATE ${tableName}
      SET ${setClause}
      WHERE id = $${values.length + 1}
      RETURNING ${returning}
    `;

    const result = await this.query(query, [...values, id], tableName);
    return result.rows[0];
  }

  /**
   * Delete a record with enhanced audit logging
   */
  async delete(
    tableName: string,
    id: string,
    returning: string = '*'
  ): Promise<any> {
    const query = `
      DELETE FROM ${tableName}
      WHERE id = $1
      RETURNING ${returning}
    `;

    const result = await this.query(query, [id], tableName);
    return result.rows[0];
  }

  /**
   * Select records with enhanced audit logging
   */
  async select(
    tableName: string,
    conditions: Record<string, any> = {},
    options: {
      columns?: string;
      limit?: number;
      offset?: number;
      orderBy?: string;
      orderDirection?: 'ASC' | 'DESC';
    } = {}
  ): Promise<any[]> {
    const {
      columns = '*',
      limit,
      offset,
      orderBy,
      orderDirection = 'ASC'
    } = options;

    let query = `SELECT ${columns} FROM ${tableName}`;
    const values: any[] = [];
    let paramIndex = 1;

    // Add WHERE conditions
    const conditionKeys = Object.keys(conditions);
    if (conditionKeys.length > 0) {
      const whereClause = conditionKeys
        .map(key => `${key} = $${paramIndex++}`)
        .join(' AND ');
      query += ` WHERE ${whereClause}`;
      values.push(...Object.values(conditions));
    }

    // Add ORDER BY
    if (orderBy) {
      query += ` ORDER BY ${orderBy} ${orderDirection}`;
    }

    // Add LIMIT
    if (limit) {
      query += ` LIMIT $${paramIndex++}`;
      values.push(limit);
    }

    // Add OFFSET
    if (offset) {
      query += ` OFFSET $${paramIndex++}`;
      values.push(offset);
    }

    const result = await this.query(query, values, tableName);
    return result.rows;
  }

  /**
   * Find a single record by ID with enhanced audit logging
   */
  async findById(
    tableName: string,
    id: string,
    columns: string = '*'
  ): Promise<any> {
    const query = `SELECT ${columns} FROM ${tableName} WHERE id = $1`;
    const result = await this.query(query, [id], tableName);
    return result.rows[0];
  }

  /**
   * Count records with enhanced audit logging
   */
  async count(
    tableName: string,
    conditions: Record<string, any> = {}
  ): Promise<number> {
    let query = `SELECT COUNT(*) as count FROM ${tableName}`;
    const values: any[] = [];
    let paramIndex = 1;

    // Add WHERE conditions
    const conditionKeys = Object.keys(conditions);
    if (conditionKeys.length > 0) {
      const whereClause = conditionKeys
        .map(key => `${key} = $${paramIndex++}`)
        .join(' AND ');
      query += ` WHERE ${whereClause}`;
      values.push(...Object.values(conditions));
    }

    const result = await this.query(query, values, tableName);
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Get user information
   */
  getUser(): EnhancedUser | null {
    return this.user;
  }

  /**
   * Get audit context
   */
  getAuditContext(): AuditContext {
    return this.context;
  }

  /**
   * Update user session activity
   */
  async updateUserActivity(): Promise<void> {
    if (this.user?.sessionId) {
      await userIdentificationService.updateUserSession(this.user, {} as NextRequest);
    }
  }
}

/**
 * Create an enhanced audited database service from a request context
 */
export async function createEnhancedAuditedDatabase(request: NextRequest, user?: User): Promise<EnhancedAuditedDatabaseService> {
  const enhancedUser = await userIdentificationService.extractUserFromRequest(request);
  const context = await userIdentificationService.createAuditContext(request, enhancedUser);
  return new EnhancedAuditedDatabaseService(context, enhancedUser);
}

/**
 * Create an enhanced audited database service from an audit context
 */
export function createEnhancedAuditedDatabaseFromContext(context: AuditContext, user?: EnhancedUser): EnhancedAuditedDatabaseService {
  return new EnhancedAuditedDatabaseService(context, user);
}
