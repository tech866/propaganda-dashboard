import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { createNotFoundError, createValidationError, withErrorHandling } from '@/middleware/errors';
import { CallService, UpdateCallData } from '@/lib/services/callService';
import { validateUpdateCall } from '@/lib/validation';

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

  // Validate request body using Yup schema
  const validation = await validateUpdateCall(body);
  
  if (!validation.isValid) {
    throw createValidationError('Validation failed', validation.errors);
  }

  const validatedData = validation.data!;

  // Create update data object with validated data
  const updateData: UpdateCallData = {};
  
  if (validatedData.prospect_name !== undefined) updateData.prospect_name = validatedData.prospect_name;
  if (validatedData.prospect_email !== undefined) updateData.prospect_email = validatedData.prospect_email;
  if (validatedData.prospect_phone !== undefined) updateData.prospect_phone = validatedData.prospect_phone;
  if (validatedData.call_type !== undefined) updateData.call_type = validatedData.call_type;
  if (validatedData.status !== undefined) updateData.status = validatedData.status;
  if (validatedData.outcome !== undefined) updateData.outcome = validatedData.outcome;
  if (validatedData.loss_reason_id !== undefined) updateData.loss_reason_id = validatedData.loss_reason_id;
  if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;
  if (validatedData.call_duration !== undefined) updateData.call_duration = validatedData.call_duration;
  if (validatedData.scheduled_at !== undefined) updateData.scheduled_at = validatedData.scheduled_at;
  if (validatedData.completed_at !== undefined) updateData.completed_at = validatedData.completed_at;

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
