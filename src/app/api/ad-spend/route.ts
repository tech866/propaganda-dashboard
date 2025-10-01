import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { canAccessClient } from '@/middleware/utils';
import { 
  createValidationError, 
  createAuthorizationError, 
  withErrorHandling 
} from '@/middleware/errors';
import { EnhancedCallService, AdSpendData } from '@/lib/services/enhancedCallService';
import { validateCreateAdSpend } from '@/lib/validation/enhancedCallSchemas';

// GET /api/ad-spend - Get ad spend data
const getAdSpend = withErrorHandling(async (request: NextRequest, user: User) => {
  const { searchParams } = new URL(request.url);
  
  // Prepare filter data
  const filters = {
    clientId: searchParams.get('clientId') || undefined,
    dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
    dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
    platform: searchParams.get('platform') || undefined,
  };

  const requestedClientId = filters.clientId;

  // Validate client access
  if (requestedClientId && !canAccessClient(user, requestedClientId)) {
    throw createAuthorizationError('Access denied to client data');
  }

  // Get ad spend data from database
  const adSpend = await EnhancedCallService.getAdSpend(user, {
    clientId: requestedClientId || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    platform: filters.platform || undefined,
  });

  return NextResponse.json(
    {
      success: true,
      data: adSpend,
      filters,
      user: { id: user.id, role: user.role, clientId: user.clientId }
    },
    { status: 200 }
  );
});

// POST /api/ad-spend - Add new ad spend data
const addAdSpend = withErrorHandling(async (request: NextRequest, user: User) => {
  const body = await request.json();
  
  // Add client_id from authenticated user
  const bodyWithClientId = {
    ...body,
    client_id: user.clientId
  };
  
  // Validate request body using Yup schema
  const validation = await validateCreateAdSpend(bodyWithClientId);
  
  if (!validation.isValid) {
    throw createValidationError('Validation failed', validation.errors);
  }

  const validatedData = validation.data!;

  // Validate client access
  if (!canAccessClient(user, validatedData.client_id)) {
    throw createAuthorizationError('Access denied to add ad spend for this client');
  }

  // Create ad spend data object with validated data
  const adSpendData: AdSpendData = {
    client_id: validatedData.client_id,
    campaign_name: validatedData.campaign_name,
    platform: validatedData.platform,
    spend_amount: validatedData.spend_amount,
    date_from: validatedData.date_from,
    date_to: validatedData.date_to,
    clicks: validatedData.clicks,
    impressions: validatedData.impressions,
    source: validatedData.source,
    meta_campaign_id: validatedData.meta_campaign_id,
  };

  // Add ad spend data to database
  const newAdSpend = await EnhancedCallService.addAdSpend(adSpendData, user);

  return NextResponse.json(
    {
      success: true,
      message: 'Ad spend data added successfully',
      data: newAdSpend
    },
    { status: 201 }
  );
});

// Export the protected handlers
export const GET = withAuth(getAdSpend);
export const POST = withAuth(addAdSpend);
