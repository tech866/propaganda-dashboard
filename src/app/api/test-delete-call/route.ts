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

// DELETE /api/test-delete-call - Test call deletion without authentication
const testDeleteCall = withErrorHandling(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('id');
    
    if (!callId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Call ID is required',
          error: 'Missing call ID parameter',
        },
        { status: 400 }
      );
    }

    const deleted = await CallService.deleteCall(callId, mockUser);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message: 'Call not found or access denied',
          error: 'Call with the specified ID was not found or you do not have permission to delete it',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Call deleted successfully',
        deletedId: callId,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Call deletion test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
});

export const DELETE = testDeleteCall;
