import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/lib/database';
import { withErrorHandling } from '@/middleware/errors';

// GET /api/test-db - Test database connection
const testDb = withErrorHandling(async (request: NextRequest) => {
  const isConnected = await testConnection();
  
  return NextResponse.json(
    {
      success: true,
      message: 'Database connection test',
      connected: isConnected,
      timestamp: new Date().toISOString(),
    },
    { status: isConnected ? 200 : 500 }
  );
});

export const GET = testDb;
