import { NextRequest, NextResponse } from 'next/server';

// GET /api/auth/me - Get current user info
export async function GET(request: NextRequest) {
  try {
    // TODO: Implement JWT token validation
    // For now, return mock user data
    const mockUser = {
      id: 'user-1',
      email: 'john@example.com',
      name: 'John Doe',
      role: 'sales', // sales, admin, ceo
      clientId: 'client-1',
      permissions: ['read:own-calls', 'write:own-calls']
    };

    return NextResponse.json(
      {
        success: true,
        data: mockUser
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get user info',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
