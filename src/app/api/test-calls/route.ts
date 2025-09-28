import { NextRequest, NextResponse } from 'next/server';
import { CallService } from '@/lib/services/callService';
import { withErrorHandling } from '@/middleware/errors';

// Mock user for testing
const mockUser = {
  id: '650e8400-e29b-41d4-a716-446655440003',
  email: 'sales1@propaganda.com',
  name: 'John Doe',
  role: 'sales' as const,
  clientId: '550e8400-e29b-41d4-a716-446655440001',
  permissions: ['read:own-calls', 'write:own-calls', 'read:own-metrics']
};

// GET /api/test-calls - Test calls API without authentication
const testCalls = withErrorHandling(async (request: NextRequest) => {
  try {
    // Test getting calls
    const calls = await CallService.getCalls(mockUser, { limit: 5 });
    
    // Test getting call stats
    const stats = await CallService.getCallStats(mockUser);
    
    return NextResponse.json(
      {
        success: true,
        message: 'Calls API test successful',
        data: {
          calls: calls,
          stats: stats,
          user: mockUser
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Calls API test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
});

export const GET = testCalls;
