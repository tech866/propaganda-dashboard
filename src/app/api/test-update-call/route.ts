import { NextRequest, NextResponse } from 'next/server';
import { CallService, UpdateCallData } from '@/lib/services/callService';
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

// PUT /api/test-update-call - Test call update without authentication
const testUpdateCall = withErrorHandling(async (request: NextRequest) => {
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

    const body = await request.json();

    // Create update data object (only include fields that are provided)
    const updateData: UpdateCallData = {};
    
    if (body.prospect_name !== undefined) updateData.prospect_name = body.prospect_name;
    if (body.prospect_email !== undefined) updateData.prospect_email = body.prospect_email;
    if (body.prospect_phone !== undefined) updateData.prospect_phone = body.prospect_phone;
    if (body.call_type !== undefined) updateData.call_type = body.call_type;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.outcome !== undefined) updateData.outcome = body.outcome;
    if (body.loss_reason_id !== undefined) updateData.loss_reason_id = body.loss_reason_id;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.call_duration !== undefined) updateData.call_duration = body.call_duration;
    if (body.scheduled_at !== undefined) updateData.scheduled_at = body.scheduled_at;
    if (body.completed_at !== undefined) updateData.completed_at = body.completed_at;

    const updatedCall = await CallService.updateCall(callId, updateData, mockUser);

    if (!updatedCall) {
      return NextResponse.json(
        {
          success: false,
          message: 'Call not found or access denied',
          error: 'Call with the specified ID was not found or you do not have permission to update it',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Call updated successfully',
        data: updatedCall,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Call update test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
});

export const PUT = testUpdateCall;
