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

// GET /api/calls - Get all calls (with optional filtering)
const getCalls = withErrorHandling(async (request: NextRequest, user: User) => {
  const { searchParams } = new URL(request.url);
  const requestedClientId = searchParams.get('clientId');
  const userId = searchParams.get('userId');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = parseInt(searchParams.get('offset') || '0');

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
  
  // Validate required fields
  const requiredFields = ['client_id', 'prospect_name', 'call_type', 'status'];
  const validation = validateRequiredFields(body, requiredFields);
  
  if (!validation.isValid) {
    throw createValidationError('Missing required fields', {
      missingFields: validation.missingFields
    });
  }

  // Validate client access
  if (!canAccessClient(user, body.client_id)) {
    throw createAuthorizationError('Access denied to create call for this client');
  }

  // Create call data object
  const callData: CreateCallData = {
    client_id: body.client_id,
    prospect_name: body.prospect_name,
    prospect_email: body.prospect_email || undefined,
    prospect_phone: body.prospect_phone || undefined,
    call_type: body.call_type,
    status: body.status,
    outcome: body.outcome || 'tbd',
    loss_reason_id: body.loss_reason_id || undefined,
    notes: body.notes || undefined,
    call_duration: body.call_duration || undefined,
    scheduled_at: body.scheduled_at || undefined,
    completed_at: body.completed_at || undefined,
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
