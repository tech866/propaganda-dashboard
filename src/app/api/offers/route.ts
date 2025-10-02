import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { canAccessClient } from '@/middleware/utils';
import { 
  createValidationError, 
  createAuthorizationError, 
  withErrorHandling 
} from '@/middleware/errors';
import { EnhancedCallService } from '@/lib/services/enhancedCallService';

// GET /api/offers - Get offers for a client
const getOffers = withErrorHandling(async (request: NextRequest, user: User) => {
  const offers = await EnhancedCallService.getOffers(user);

  return NextResponse.json(
    {
      success: true,
      data: offers,
      user: { id: user.id, role: user.role, clientId: user.clientId }
    },
    { status: 200 }
  );
});

// Export the protected handler
export const GET = withAuth(getOffers);

