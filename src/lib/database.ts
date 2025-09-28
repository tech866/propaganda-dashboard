import { Pool, PoolClient } from 'pg';
import { dbConfig, validateEnvironment } from '@/config/database';

// Validate environment variables on startup
validateEnvironment();

// Create a connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Database connection interface
export interface DatabaseConnection {
  query: (text: string, params?: any[]) => Promise<any>;
  release: () => void;
}

// Get a client from the pool
export async function getClient(): Promise<PoolClient> {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
}

// Execute a query with automatic client management
export async function query(text: string, params?: any[]): Promise<any> {
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
  await pool.end();
}

// Database transaction helper
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
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
