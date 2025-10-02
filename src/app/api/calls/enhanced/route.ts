import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { canAccessClient } from '@/middleware/utils';
import { 
  createValidationError, 
  createAuthorizationError, 
  withErrorHandling 
} from '@/middleware/errors';
import { EnhancedCallService, CreateEnhancedCallData } from '@/lib/services/enhancedCallService';
import { validateCreateEnhancedCall, validateEnhancedCallFilter } from '@/lib/validation/enhancedCallSchemas';

// GET /api/calls/enhanced - Get enhanced calls with filtering
const getEnhancedCalls = withErrorHandling(async (request: NextRequest, user: User) => {
  const { searchParams } = new URL(request.url);
  
  // Prepare filter data for validation
  const filterData = {
    clientId: searchParams.get('clientId') || undefined,
    userId: searchParams.get('userId') || undefined,
    dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
    dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
    trafficSource: searchParams.get('trafficSource') || undefined,
    enhancedOutcome: searchParams.get('enhancedOutcome') || undefined,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
  };

  // Validate filter parameters
  const filterValidation = await validateEnhancedCallFilter(filterData);
  if (!filterValidation.isValid) {
    throw createValidationError('Invalid filter parameters', filterValidation.errors);
  }

  const validatedFilters = filterValidation.data!;
  const requestedClientId = validatedFilters.clientId;
  const userId = validatedFilters.userId;

  // Validate client access
  if (requestedClientId && !canAccessClient(user, requestedClientId)) {
    throw createAuthorizationError('Access denied to client data');
  }

  // Get enhanced calls from database
  const calls = await EnhancedCallService.getEnhancedCalls(user, {
    clientId: requestedClientId || undefined,
    userId: userId || undefined,
    dateFrom: validatedFilters.dateFrom || undefined,
    dateTo: validatedFilters.dateTo || undefined,
    trafficSource: validatedFilters.trafficSource as 'organic' | 'paid_ads' || undefined,
    enhancedOutcome: validatedFilters.enhancedOutcome || undefined,
    limit: validatedFilters.limit,
    offset: validatedFilters.offset,
  });

  return NextResponse.json(
    {
      success: true,
      data: calls,
      filters: validatedFilters,
      user: { id: user.id, role: user.role, clientId: user.clientId }
    },
    { status: 200 }
  );
});

// POST /api/calls/enhanced - Create a new enhanced call
const createEnhancedCall = withErrorHandling(async (request: NextRequest, user: User) => {
  const body = await request.json();
  
  // Add client_id from authenticated user
  const bodyWithClientId = {
    ...body,
    client_id: user.clientId
  };
  
  // Validate request body using Yup schema
  const validation = await validateCreateEnhancedCall(bodyWithClientId);
  
  if (!validation.isValid) {
    throw createValidationError('Validation failed', validation.errors);
  }

  const validatedData = validation.data!;

  // Validate client access
  if (!canAccessClient(user, validatedData.client_id)) {
    throw createAuthorizationError('Access denied to create call for this client');
  }

  // Create enhanced call data object with validated data
  const callData: CreateEnhancedCallData = {
    client_id: validatedData.client_id,
    prospect_name: validatedData.prospect_name,
    prospect_email: validatedData.prospect_email,
    prospect_phone: validatedData.prospect_phone,
    company_name: validatedData.company_name,
    closer_first_name: validatedData.closer_first_name,
    closer_last_name: validatedData.closer_last_name,
    source: validatedData.source,
    traffic_source: validatedData.traffic_source,
    call_type: validatedData.call_type,
    status: validatedData.status,
    outcome: validatedData.outcome,
    enhanced_outcome: validatedData.enhanced_outcome,
    loss_reason_id: validatedData.loss_reason_id,
    offer_pitched: validatedData.offer_pitched,
    setter_first_name: validatedData.setter_first_name,
    setter_last_name: validatedData.setter_last_name,
    cash_collected_upfront: validatedData.cash_collected_upfront,
    total_amount_owed: validatedData.total_amount_owed,
    payment_installments: validatedData.payment_installments,
    payment_completion_status: validatedData.payment_completion_status,
    crm_updated: validatedData.crm_updated,
    prospect_notes: validatedData.prospect_notes,
    notes: validatedData.notes,
    call_duration: validatedData.call_duration,
    scheduled_at: validatedData.scheduled_at,
    completed_at: validatedData.completed_at,
    payment_schedule: validatedData.payment_schedule,
  };

  // Create enhanced call in database
  const newCall = await EnhancedCallService.createEnhancedCall(callData, user);

  return NextResponse.json(
    {
      success: true,
      message: 'Enhanced call created successfully',
      data: newCall
    },
    { status: 201 }
  );
});

// Export the protected handlers
export const GET = withAuth(getEnhancedCalls);
export const POST = withAuth(createEnhancedCall);

