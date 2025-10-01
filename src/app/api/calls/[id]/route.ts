import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { createNotFoundError, createValidationError, withErrorHandling } from '@/middleware/errors';
import { SalesCallService, UpdateSalesCallData } from '@/lib/services/salesCallService';
import { validateUpdateCall } from '@/lib/validation';

// GET /api/calls/[id] - Get a specific call by ID
const getCallById = withErrorHandling(async (
  request: NextRequest, 
  user: User, 
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  const call = await SalesCallService.getSalesCallById(id, user);

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
      const updateData: UpdateSalesCallData = {};
  
  // Basic fields
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
  
  // Enhanced call logging form fields
  if (validatedData.closer_first_name !== undefined) updateData.closer_first_name = validatedData.closer_first_name;
  if (validatedData.closer_last_name !== undefined) updateData.closer_last_name = validatedData.closer_last_name;
  if (validatedData.source_of_set_appointment !== undefined) updateData.source_of_set_appointment = validatedData.source_of_set_appointment;
  if (validatedData.enhanced_call_outcome !== undefined) updateData.enhanced_call_outcome = validatedData.enhanced_call_outcome;
  if (validatedData.initial_payment_collected_on !== undefined) updateData.initial_payment_collected_on = validatedData.initial_payment_collected_on;
  if (validatedData.customer_full_name !== undefined) updateData.customer_full_name = validatedData.customer_full_name;
  if (validatedData.customer_email !== undefined) updateData.customer_email = validatedData.customer_email;
  if (validatedData.calls_taken !== undefined) updateData.calls_taken = validatedData.calls_taken;
  if (validatedData.setter_first_name !== undefined) updateData.setter_first_name = validatedData.setter_first_name;
  if (validatedData.setter_last_name !== undefined) updateData.setter_last_name = validatedData.setter_last_name;
  if (validatedData.cash_collected_upfront !== undefined) updateData.cash_collected_upfront = validatedData.cash_collected_upfront;
  if (validatedData.total_amount_owed !== undefined) updateData.total_amount_owed = validatedData.total_amount_owed;
  if (validatedData.prospect_notes !== undefined) updateData.prospect_notes = validatedData.prospect_notes;
  if (validatedData.lead_source !== undefined) updateData.lead_source = validatedData.lead_source;

      const updatedCall = await SalesCallService.updateSalesCall(id, updateData, user);

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

  const deleted = await SalesCallService.deleteSalesCall(id, user);

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
