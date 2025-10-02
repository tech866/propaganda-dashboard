import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { canAccessClient } from '@/middleware/utils';
import { 
  createValidationError, 
  createAuthorizationError, 
  withErrorHandling 
} from '@/middleware/errors';
import { EnhancedCallService } from '@/lib/services/enhancedCallService';

// GET /api/setters - Get setters for a client
const getSetters = withErrorHandling(async (request: NextRequest, user: User) => {
  const setters = await EnhancedCallService.getSetters(user);

  return NextResponse.json(
    {
      success: true,
      data: setters,
      user: { id: user.id, role: user.role, clientId: user.clientId }
    },
    { status: 200 }
  );
});

// Export the protected handler
export const GET = withAuth(getSetters);

