// Unified Database Service for Supabase
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { DatabaseConnection } from '@/lib/database';

export interface QueryResult<T = any> {
  data: T[] | null;
  error: any;
  count?: number;
}

export interface InsertResult<T = any> {
  data: T | null;
  error: any;
}

export interface UpdateResult<T = any> {
  data: T | null;
  error: any;
}

export interface DeleteResult {
  error: any;
}

export class DatabaseService {
  private useAdmin: boolean;

  constructor(useAdmin: boolean = false) {
    this.useAdmin = useAdmin;
  }

  private getClient() {
    return this.useAdmin ? supabaseAdmin : supabase;
  }

  // Execute a SELECT query
  async select<T = any>(
    table: string,
    options: {
      columns?: string;
      filters?: Record<string, any>;
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<QueryResult<T>> {
    try {
      let query = this.getClient().from(table);

      // Select specific columns
      if (options.columns) {
        query = query.select(options.columns);
      } else {
        query = query.select('*');
      }

      // Apply filters
      if (options.filters) {
        for (const [key, value] of Object.entries(options.filters)) {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else {
              query = query.eq(key, value);
            }
          }
        }
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? true 
        });
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      return { data, error, count: count || undefined };
    } catch (error) {
      console.error('Database select error:', error);
      return { data: null, error };
    }
  }

  // Execute an INSERT query
  async insert<T = any>(
    table: string,
    data: Partial<T> | Partial<T>[]
  ): Promise<InsertResult<T>> {
    try {
      const { data: result, error } = await this.getClient()
        .from(table)
        .insert(data)
        .select()
        .single();

      return { data: result, error };
    } catch (error) {
      console.error('Database insert error:', error);
      return { data: null, error };
    }
  }

  // Execute an INSERT query for multiple records
  async insertMany<T = any>(
    table: string,
    data: Partial<T>[]
  ): Promise<QueryResult<T>> {
    try {
      const { data: result, error } = await this.getClient()
        .from(table)
        .insert(data)
        .select();

      return { data: result, error };
    } catch (error) {
      console.error('Database insertMany error:', error);
      return { data: null, error };
    }
  }

  // Execute an UPDATE query
  async update<T = any>(
    table: string,
    data: Partial<T>,
    filters: Record<string, any>
  ): Promise<UpdateResult<T>> {
    try {
      let query = this.getClient().from(table).update(data);

      // Apply filters
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      }

      const { data: result, error } = await query.select().single();

      return { data: result, error };
    } catch (error) {
      console.error('Database update error:', error);
      return { data: null, error };
    }
  }

  // Execute a DELETE query
  async delete(
    table: string,
    filters: Record<string, any>
  ): Promise<DeleteResult> {
    try {
      let query = this.getClient().from(table);

      // Apply filters
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else {
            query = query.eq(key, value);
          }
        }
      }

      const { error } = await query.delete();

      return { error };
    } catch (error) {
      console.error('Database delete error:', error);
      return { error };
    }
  }

  // Execute a raw SQL query (for complex operations)
  async query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    try {
      // Note: Supabase doesn't support raw SQL queries directly
      // This would need to be implemented using RPC functions
      console.warn('Raw SQL queries not supported in Supabase client. Use RPC functions instead.');
      return { data: null, error: new Error('Raw SQL queries not supported') };
    } catch (error) {
      console.error('Database query error:', error);
      return { data: null, error };
    }
  }

  // Execute a stored procedure/RPC function
  async rpc<T = any>(
    functionName: string,
    params?: Record<string, any>
  ): Promise<QueryResult<T>> {
    try {
      const { data, error } = await this.getClient().rpc(functionName, params);
      return { data, error };
    } catch (error) {
      console.error('Database RPC error:', error);
      return { data: null, error };
    }
  }

  // Execute operations in a transaction
  async withTransaction<T>(
    callback: (db: DatabaseService) => Promise<T>
  ): Promise<T> {
    // Note: Supabase doesn't support explicit transactions in the client
    // Transactions are handled automatically for single operations
    // For complex transactions, use RPC functions
    console.warn('Explicit transactions not supported in Supabase client. Use RPC functions for complex transactions.');
    return await callback(this);
  }

  // Get a single record by ID
  async findById<T = any>(table: string, id: string): Promise<QueryResult<T>> {
    return this.select<T>(table, {
      filters: { id },
      limit: 1
    });
  }

  // Check if a record exists
  async exists(table: string, filters: Record<string, any>): Promise<boolean> {
    const result = await this.select(table, {
      columns: 'id',
      filters,
      limit: 1
    });
    return !result.error && result.data && result.data.length > 0;
  }

  // Count records
  async count(table: string, filters?: Record<string, any>): Promise<number> {
    try {
      let query = this.getClient().from(table).select('*', { count: 'exact', head: true });

      if (filters) {
        for (const [key, value] of Object.entries(filters)) {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else {
              query = query.eq(key, value);
            }
          }
        }
      }

      const { count, error } = await query;

      if (error) {
        console.error('Database count error:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Database count error:', error);
      return 0;
    }
  }
}

// Create default instances
export const db = new DatabaseService(false); // Regular client
export const dbAdmin = new DatabaseService(true); // Admin client

// Legacy compatibility - maintain the same interface as the old database.ts
export async function getClient(): Promise<DatabaseConnection> {
  // Return a mock client that uses the new database service
  return {
    query: async (text: string, params?: any[]) => {
      console.warn('Legacy query method called. Consider migrating to DatabaseService.');
      return { rows: [], rowCount: 0 };
    },
    release: () => {
      // No-op for compatibility
    }
  };
}

export async function query(text: string, params?: any[]): Promise<any> {
  console.warn('Legacy query function called. Consider migrating to DatabaseService.');
  return { rows: [], rowCount: 0 };
}

export async function withTransaction<T>(
  callback: (client: DatabaseConnection) => Promise<T>
): Promise<T> {
  console.warn('Legacy transaction function called. Consider migrating to DatabaseService.');
  const mockClient = await getClient();
  return await callback(mockClient);
}

// Export default for backward compatibility
export default db;
