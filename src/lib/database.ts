// Legacy database interface for backward compatibility
// This file now serves as a compatibility layer for the new Supabase-based system
import { DatabaseService, db, dbAdmin } from './services/databaseService';
import * as mockDb from './mockDatabase';

// Check if we should use mock database (for development without Supabase)
const useMockDatabase = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_SUPABASE_URL;

// Database connection interface (legacy compatibility)
export interface DatabaseConnection {
  query: (text: string, params?: any[]) => Promise<any>;
  release: () => void;
}

// Get a client from the pool or mock database
export async function getClient(): Promise<any> {
  if (useMockDatabase) {
    console.log('Using mock database');
    return await mockDb.getClient();
  }
  
  // Return the new Supabase-based database service
  return db;
}

// Execute a query with automatic client management
export async function query(text: string, params?: any[]): Promise<any> {
  if (useMockDatabase) {
    return await mockDb.query(text, params);
  }
  
  // For Supabase, we need to handle SQL queries differently
  // Most operations should use the DatabaseService methods instead
  console.warn('Legacy query method called. Consider migrating to DatabaseService methods.');
  
  // Try to execute as RPC function if it looks like a stored procedure
  if (text.toLowerCase().includes('select') && text.toLowerCase().includes('from')) {
    // This is a basic SELECT query - we can't handle complex SQL with Supabase client
    console.error('Complex SQL queries not supported with Supabase client. Use DatabaseService methods instead.');
    return { rows: [], rowCount: 0 };
  }
  
  return { rows: [], rowCount: 0 };
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  if (useMockDatabase) {
    return await mockDb.testConnection();
  }
  
  try {
    // Test Supabase connection by trying to select from a system table
    const result = await db.select('agencies', { limit: 1 });
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection failed:', error);
    return false;
  }
}

// Close all connections in the pool (no-op for Supabase)
export async function closePool(): Promise<void> {
  if (useMockDatabase) {
    await mockDb.closePool();
  }
  // Supabase handles connection pooling automatically
  console.log('Supabase connection pool managed automatically');
}

// Database transaction helper
export async function withTransaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  if (useMockDatabase) {
    return await mockDb.withTransaction(callback);
  }
  
  // Supabase handles transactions automatically for single operations
  // For complex transactions, use RPC functions
  console.warn('Explicit transactions not supported with Supabase client. Use RPC functions for complex transactions.');
  return await callback(db);
}

// Export the new database service as default
export default db;

// Export the new services for direct use
export { db, dbAdmin, DatabaseService };