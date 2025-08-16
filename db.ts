import { Pool, PoolConfig } from 'pg';

// Environment variables are loaded in app.ts

// Database configuration
// Support both DATABASE_URL and individual environment variables
const dbConfig: PoolConfig = process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
} : {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create a connection pool (lazy initialization)
let pool: Pool | null = null;

const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool(dbConfig);
    
    // Handle pool errors
    pool.on('error', (err: Error) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }
  return pool;
};

// Test database connection
export const testConnection = async (): Promise<void> => {
  try {
    const client = await getPool().connect();
    console.log('✅ Database connected successfully');
    client.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    throw err;
  }
};

// Export the pool getter for use in other modules
export default getPool;

// Helper function to execute queries
export const query = async (text: string, params?: any[]): Promise<any> => {
  const start = Date.now();
  try {
    const res = await getPool().query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Helper function to get a client from the pool
export const getClient = async () => {
  return await getPool().connect();
};
