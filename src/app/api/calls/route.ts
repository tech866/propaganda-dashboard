import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { getAccessibleClientIds, canAccessClient } from '@/middleware/utils';
import { 
  createValidationError, 
  createAuthorizationError, 
  createNotFoundError,
  validateRequiredFields,
  withErrorHandling 
} from '@/middleware/errors';
import { CallService, CreateCallData } from '@/lib/services/callService';
import { validateCreateCall, validateCallFilter } from '@/lib/validation';

// GET /api/calls - Get all calls (with optional filtering)
const getCalls = withErrorHandling(async (request: NextRequest, user: User) => {
  const { searchParams } = new URL(request.url);
  
  // Prepare filter data for validation
  const filterData = {
    clientId: searchParams.get('clientId') || undefined,
    userId: searchParams.get('userId') || undefined,
    dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
    dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
  };

  // Validate filter parameters
  const filterValidation = await validateCallFilter(filterData);
  if (!filterValidation.isValid) {
    throw createValidationError('Invalid filter parameters', filterValidation.errors);
  }

  const validatedFilters = filterValidation.data!;
  const requestedClientId = validatedFilters.clientId;
  const userId = validatedFilters.userId;
  const dateFrom = validatedFilters.dateFrom;
  const dateTo = validatedFilters.dateTo;
  const limit = validatedFilters.limit || 100;
  const offset = validatedFilters.offset || 0;

  // Validate client access
  if (requestedClientId && !canAccessClient(user, requestedClientId)) {
    throw createAuthorizationError('Access denied to client data');
  }

  // Get calls from database
  const calls = await CallService.getCalls(user, {
    clientId: requestedClientId || undefined,
    userId: userId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    limit,
    offset,
  });

  return NextResponse.json(
    {
      success: true,
      data: calls,
      filters: { clientId: requestedClientId, userId, dateFrom, dateTo, limit, offset },
      user: { id: user.id, role: user.role, clientId: user.clientId }
    },
    { status: 200 }
  );
});

// POST /api/calls - Create a new call
const createCall = withErrorHandling(async (request: NextRequest, user: User) => {
  const body = await request.json();
  
  // Add client_id from authenticated user
  const bodyWithClientId = {
    ...body,
    client_id: user.clientId
  };
  
  // Validate request body using Yup schema
  const validation = await validateCreateCall(bodyWithClientId);
  
  if (!validation.isValid) {
    throw createValidationError('Validation failed', validation.errors);
  }

  const validatedData = validation.data!;

  // Validate client access
  if (!canAccessClient(user, validatedData.client_id)) {
    throw createAuthorizationError('Access denied to create call for this client');
  }

  // Create call data object with validated data
  const callData: CreateCallData = {
    client_id: validatedData.client_id,
    prospect_name: validatedData.prospect_name,
    prospect_email: validatedData.prospect_email,
    prospect_phone: validatedData.prospect_phone,
    call_type: validatedData.call_type,
    status: validatedData.status,
    outcome: validatedData.outcome || 'tbd',
    loss_reason_id: validatedData.loss_reason_id,
    notes: validatedData.notes,
    call_duration: validatedData.call_duration,
    scheduled_at: validatedData.scheduled_at,
    completed_at: validatedData.completed_at,
  };

  // Create call in database
  const newCall = await CallService.createCall(callData, user);

  return NextResponse.json(
    {
      success: true,
      message: 'Call created successfully',
      data: newCall
    },
    { status: 201 }
  );
});

// Export the protected handlers
export const GET = withAuth(getCalls);
export const POST = withAuth(createCall);
