import { NextRequest, NextResponse } from 'next/server';
import { withRole, User } from '@/middleware/auth';
import { createValidationError, withErrorHandling } from '@/middleware/errors';
import { validateCreateUser } from '@/lib/validation';

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
const createUser = withErrorHandling(async (request: NextRequest, user: User) => {
  const body = await request.json();
  
  // Validate request body using Yup schema
  const validation = await validateCreateUser(body);
  
  if (!validation.isValid) {
    throw createValidationError('Validation failed', validation.errors);
  }

  const validatedData = validation.data!;

  // Validate client access - users can only be created for accessible clients
  if (validatedData.clientId !== user.clientId && user.role !== 'ceo') {
    throw createValidationError('Access denied to create user for this client');
  }

  // TODO: Implement database insert
  // For now, return mock response
  const newUser = {
    id: Date.now().toString(),
    ...validatedData,
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
});

// Export the protected handlers (admin role required)
export const GET = withRole('admin', getUsers);
export const POST = withRole('admin', createUser);
