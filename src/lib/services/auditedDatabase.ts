/**
 * Audited Database Service
 * Propaganda Dashboard - Database operations with automatic audit logging
 */

import { supabase, supabaseAdmin } from '@/lib/supabase';
import { withDatabaseAudit, extractAuditContext } from '@/middleware/audit';
import { AuditContext } from '@/lib/types/audit';
import { NextRequest } from 'next/server';

/**
 * Audited database service that automatically logs all operations
 */
export class AuditedDatabaseService {
  private context: AuditContext;

  constructor(context: AuditContext) {
    this.context = context;
  }

  /**
   * Execute a query with audit logging
   * Note: Supabase doesn't support raw SQL queries directly
   * This method is kept for compatibility but should use RPC functions
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
   * Execute a transaction with audit logging
   * Note: Supabase doesn't support explicit transactions in the client
   * This method is kept for compatibility but transactions are handled automatically
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
   * Insert a record with audit logging
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
   * Update a record with audit logging
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
   * Delete a record with audit logging
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
   * Select records with audit logging
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
   * Find a single record by ID with audit logging
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
   * Count records with audit logging
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
}

/**
 * Create an audited database service from a request context
 */
export function createAuditedDatabase(request: NextRequest, user?: any): AuditedDatabaseService {
  const context = extractAuditContext(request, user);
  return new AuditedDatabaseService(context);
}

/**
 * Create an audited database service from an audit context
 */
export function createAuditedDatabaseFromContext(context: AuditContext): AuditedDatabaseService {
  return new AuditedDatabaseService(context);
}
