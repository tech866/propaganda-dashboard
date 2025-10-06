import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { canAccessClient } from '@/middleware/utils';
import { 
  createValidationError, 
  createAuthorizationError, 
  createNotFoundError,
  withErrorHandling 
} from '@/middleware/errors';
import { SalesCallService } from '@/lib/services/salesCallService';

// GET /api/calls/[id] - Get a specific call
const getCall = withErrorHandling(async (request: NextRequest, user: User, { params }: { params: { id: string } }) => {
  const callId = params.id;

  if (!callId) {
    throw createValidationError('Call ID is required');
  }

  // Get call from database
  const call = await SalesCallService.getSalesCallById(callId, user);

  if (!call) {
    throw createNotFoundError('Call not found');
  }

  // Validate client access
  if (!canAccessClient(user, call.client_id)) {
    throw createAuthorizationError('Access denied to this call');
  }

  return NextResponse.json(
    {
      success: true,
      data: call
    },
    { status: 200 }
  );
});

// PATCH /api/calls/[id] - Update a specific call
const updateCall = withErrorHandling(async (request: NextRequest, user: User, { params }: { params: { id: string } }) => {
  const callId = params.id;
  const body = await request.json();

  if (!callId) {
    throw createValidationError('Call ID is required');
  }

  // Get existing call to validate access
  const existingCall = await SalesCallService.getSalesCallById(callId, user);

  if (!existingCall) {
    throw createNotFoundError('Call not found');
  }

  // Validate client access
  if (!canAccessClient(user, existingCall.client_id)) {
    throw createAuthorizationError('Access denied to update this call');
  }

  // Update call in database
  const updatedCall = await SalesCallService.updateSalesCall(callId, body, user);

  return NextResponse.json(
    {
      success: true,
      message: 'Call updated successfully',
      data: updatedCall
    },
    { status: 200 }
  );
});

// DELETE /api/calls/[id] - Delete a specific call
const deleteCall = withErrorHandling(async (request: NextRequest, user: User, { params }: { params: { id: string } }) => {
  const callId = params.id;

  if (!callId) {
    throw createValidationError('Call ID is required');
  }

  // Get existing call to validate access
  const existingCall = await SalesCallService.getSalesCallById(callId, user);

  if (!existingCall) {
    throw createNotFoundError('Call not found');
  }

  // Validate client access
  if (!canAccessClient(user, existingCall.client_id)) {
    throw createAuthorizationError('Access denied to delete this call');
  }

  // Delete call from database
  await SalesCallService.deleteSalesCall(callId, user);

  return NextResponse.json(
    {
      success: true,
      message: 'Call deleted successfully'
    },
    { status: 200 }
  );
});

// Export the protected handlers
export const GET = withAuth(getCall);
export const PATCH = withAuth(updateCall);
export const DELETE = withAuth(deleteCall);