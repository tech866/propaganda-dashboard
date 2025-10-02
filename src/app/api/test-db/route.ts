import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withErrorHandling } from '@/middleware/errors';

// GET /api/test-db - Test Supabase connection
const testDb = withErrorHandling(async (request: NextRequest) => {
  try {
    // Test Supabase connection by querying a simple table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    const isConnected = !error;
    
    return NextResponse.json(
      {
        success: true,
        message: 'Supabase connection test',
        connected: isConnected,
        database: 'supabase',
        timestamp: new Date().toISOString(),
        error: error?.message || null
      },
      { status: isConnected ? 200 : 500 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Supabase connection test failed',
        connected: false,
        database: 'supabase',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});

export const GET = testDb;
