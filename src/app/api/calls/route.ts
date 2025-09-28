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

// GET /api/calls - Get all calls (with optional filtering)
const getCalls = withErrorHandling(async (request: NextRequest, user: User) => {
  const { searchParams } = new URL(request.url);
  const requestedClientId = searchParams.get('clientId');
  const userId = searchParams.get('userId');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');

  // Validate client access
  if (requestedClientId && !canAccessClient(user, requestedClientId)) {
    throw createAuthorizationError('Access denied to client data');
  }

  // Get accessible client IDs for the user
  const accessibleClientIds = getAccessibleClientIds(user);
  
  // TODO: Implement database query with filters
  // For now, return mock data filtered by user permissions
  const mockCalls = [
    {
      id: '1',
      clientId: 'client-1',
      prospect: 'John Doe',
      owner: user.role === 'sales' ? user.id : 'user-1',
      timestamp: new Date().toISOString(),
      callType: 'outbound',
      status: 'completed',
      outcome: 'won',
      lossReason: null,
      notes: 'Great conversation, closed the deal'
    }
  ].filter(call => 
    accessibleClientIds.includes(call.clientId) &&
    (user.role === 'ceo' || user.role === 'admin' || call.owner === user.id)
  );

  return NextResponse.json(
    {
      success: true,
      data: mockCalls,
      filters: { clientId: requestedClientId, userId, dateFrom, dateTo },
      user: { id: user.id, role: user.role, clientId: user.clientId }
    },
    { status: 200 }
  );
});

// POST /api/calls - Create a new call
const createCall = withErrorHandling(async (request: NextRequest, user: User) => {
  const body = await request.json();
  
  // Validate required fields
  const requiredFields = ['clientId', 'prospect', 'callType', 'status'];
  const validation = validateRequiredFields(body, requiredFields);
  
  if (!validation.isValid) {
    throw createValidationError('Missing required fields', {
      missingFields: validation.missingFields
    });
  }

  // Validate client access
  if (!canAccessClient(user, body.clientId)) {
    throw createAuthorizationError('Access denied to create call for this client');
  }

  // TODO: Implement database insert
  // For now, return mock response
  const newCall = {
    id: Date.now().toString(),
    ...body,
    timestamp: new Date().toISOString(),
    owner: user.id // Set owner to current user
  };

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
