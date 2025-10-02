import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { canAccessClient } from '@/middleware/utils';
import { 
  createValidationError, 
  createAuthorizationError, 
  withErrorHandling 
} from '@/middleware/errors';
import { EnhancedCallService } from '@/lib/services/enhancedCallService';
import { validateAnalyticsFilter } from '@/lib/validation/enhancedCallSchemas';

// GET /api/analytics/calls - Get call analytics
const getCallAnalytics = withErrorHandling(async (request: NextRequest, user: User) => {
  const { searchParams } = new URL(request.url);
  
  // Prepare filter data for validation
  const filterData = {
    clientId: searchParams.get('clientId') || undefined,
    userId: searchParams.get('userId') || undefined,
    dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
    dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
  };

  // Validate filter parameters
  const filterValidation = await validateAnalyticsFilter(filterData);
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

  // Get analytics from database
  const analytics = await EnhancedCallService.getCallAnalytics(user, {
    clientId: requestedClientId || undefined,
    userId: userId || undefined,
    dateFrom: validatedFilters.dateFrom || undefined,
    dateTo: validatedFilters.dateTo || undefined,
  });

  return NextResponse.json(
    {
      success: true,
      data: analytics,
      filters: validatedFilters,
      user: { id: user.id, role: user.role, clientId: user.clientId }
    },
    { status: 200 }
  );
});

// Export the protected handler
export const GET = withAuth(getCallAnalytics);

