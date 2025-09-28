import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAuthenticationError, withErrorHandling } from '@/middleware/errors';

// GET /api/auth/me - Get current user info
const getMe = withErrorHandling(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw createAuthenticationError('Not authenticated');
  }

  // Get user permissions based on role
  const getUserPermissions = (role: string): string[] => {
    const permissions: Record<string, string[]> = {
      'ceo': ['read:all-calls', 'read:all-metrics', 'read:all-users'],
      'admin': ['read:all-calls', 'write:all-calls', 'read:all-metrics', 'read:all-users', 'write:all-users'],
      'sales': ['read:own-calls', 'write:own-calls', 'read:own-metrics']
    };
    
    return permissions[role] || permissions['sales'];
  };

  return NextResponse.json({
    success: true,
    data: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      clientId: session.user.clientId,
      permissions: getUserPermissions(session.user.role),
    },
  }, { status: 200 });
});

export const GET = getMe;
