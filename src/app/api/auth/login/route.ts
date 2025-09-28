import { NextRequest, NextResponse } from 'next/server';

// POST /api/auth/login - User login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and password are required'
        },
        { status: 400 }
      );
    }

    // TODO: Implement actual authentication logic
    // For now, return mock response
    const mockUser = {
      id: 'user-1',
      email,
      name: 'John Doe',
      role: 'sales', // sales, admin, ceo
      clientId: 'client-1'
    };

    const mockToken = 'mock-jwt-token-' + Date.now();

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          user: mockUser,
          token: mockToken
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Login failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
