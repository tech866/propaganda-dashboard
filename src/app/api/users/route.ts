import { NextRequest, NextResponse } from 'next/server';
import { withRole, User } from '@/middleware/auth';

// GET /api/users - Get all users (admin only)
async function getUsers(request: NextRequest, user: User) {
  try {
    // TODO: Implement database query
    // For now, return mock data filtered by user's client access
    const mockUsers = [
      {
        id: 'user-1',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'sales',
        clientId: 'client-1',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'user-2',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        clientId: 'client-1',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ].filter(u => u.clientId === user.clientId || user.role === 'ceo');

    return NextResponse.json(
      {
        success: true,
        data: mockUsers,
        user: { id: user.id, role: user.role, clientId: user.clientId }
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch users',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user (admin only)
async function createUser(request: NextRequest, user: User) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['email', 'name', 'role', 'clientId'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
          missingFields
        },
        { status: 400 }
      );
    }

    // Validate client access - users can only be created for accessible clients
    if (body.clientId !== user.clientId && user.role !== 'ceo') {
      return NextResponse.json(
        {
          success: false,
          message: 'Access denied to create user for this client'
        },
        { status: 403 }
      );
    }

    // TODO: Implement database insert
    // For now, return mock response
    const newUser = {
      id: Date.now().toString(),
      ...body,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        data: newUser
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Export the protected handlers (admin role required)
export const GET = withRole('admin', getUsers);
export const POST = withRole('admin', createUser);
