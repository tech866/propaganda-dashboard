import { Pool, PoolClient } from 'pg';
import { dbConfig, validateEnvironment } from '@/config/database';
import * as mockDb from './mockDatabase';

// Validate environment variables on startup
validateEnvironment();

// Check if we should use mock database
const useMockDatabase = process.env.NODE_ENV === 'development' && !process.env.DB_HOST;

// Create a connection pool only if not using mock database
let pool: Pool | null = null;
if (!useMockDatabase) {
  try {
    pool = new Pool(dbConfig);
  } catch (error) {
    console.warn('Failed to create database pool, falling back to mock database');
  }
}

// Handle pool errors only if pool exists
if (pool) {
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });
}

// Database connection interface
export interface DatabaseConnection {
  query: (text: string, params?: any[]) => Promise<any>;
  release: () => void;
}

// Get a client from the pool or mock database
export async function getClient(): Promise<PoolClient | mockDb.MockClient> {
  if (useMockDatabase || !pool) {
    console.log('Using mock database');
    return await mockDb.getClient();
  }
  
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('Error connecting to database, falling back to mock:', error);
    return await mockDb.getClient();
  }
}

// Execute a query with automatic client management
export async function query(text: string, params?: any[]): Promise<any> {
  if (useMockDatabase || !pool) {
    return await mockDb.query(text, params);
  }
  
  const client = await getClient();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  if (useMockDatabase || !pool) {
    return await mockDb.testConnection();
  }
  
  try {
    const result = await query('SELECT NOW() as current_time');
    console.log('Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Close all connections in the pool
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
  } else {
    await mockDb.closePool();
  }
}

// Database transaction helper
export async function withTransaction<T>(
  callback: (client: PoolClient | mockDb.MockClient) => Promise<T>
): Promise<T> {
  if (useMockDatabase || !pool) {
    return await mockDb.withTransaction(callback);
  }
  
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default pool;
