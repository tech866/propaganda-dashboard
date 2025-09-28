import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { createNotFoundError, withErrorHandling } from '@/middleware/errors';
import { CallService, UpdateCallData } from '@/lib/services/callService';

// GET /api/calls/[id] - Get a specific call by ID
const getCallById = withErrorHandling(async (
  request: NextRequest, 
  user: User, 
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const call = await CallService.getCallById(id, user);

  if (!call) {
    throw createNotFoundError(`Call with ID ${id}`);
  }

  return NextResponse.json(
    {
      success: true,
      data: call
    },
    { status: 200 }
  );
});

// PUT /api/calls/[id] - Update a specific call
const updateCall = withErrorHandling(async (
  request: NextRequest, 
  user: User, 
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
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

  const updatedCall = await CallService.updateCall(id, updateData, user);

  if (!updatedCall) {
    throw createNotFoundError(`Call with ID ${id}`);
  }

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
const deleteCall = withErrorHandling(async (
  request: NextRequest, 
  user: User, 
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const deleted = await CallService.deleteCall(id, user);

  if (!deleted) {
    throw createNotFoundError(`Call with ID ${id}`);
  }

  return NextResponse.json(
    {
      success: true,
      message: 'Call deleted successfully',
      deletedId: id
    },
    { status: 200 }
  );
});

// Export the protected handlers
export const GET = withAuth(getCallById);
export const PUT = withAuth(updateCall);
export const DELETE = withAuth(deleteCall);
