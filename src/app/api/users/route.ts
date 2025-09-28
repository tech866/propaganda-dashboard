import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { createValidationError, withErrorHandling } from '@/middleware/errors';
import { validateCreateUser } from '@/lib/validation';
import { getClient } from '@/lib/database';

// GET /api/users - Get all users (admin/ceo only)
const getUsers = withErrorHandling(async (request: NextRequest, user: User) => {
  const client = await getClient();
  
  try {
    // Only admin and CEO can access user data
    if (user.role === 'sales') {
      return NextResponse.json(
        {
          success: false,
          message: 'Access denied'
        },
        { status: 403 }
      );
    }

    let query = `
      SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u.client_id as "clientId",
        u.is_active as "isActive",
        u.created_at as "createdAt"
      FROM users u
      JOIN clients c ON u.client_id = c.id
    `;
    
    const queryParams: string[] = [];
    
    // Admin can only see users from their client, CEO can see all
    if (user.role === 'admin') {
      query += ' WHERE u.client_id = $1';
      queryParams.push(user.clientId);
    }
    
    query += ' ORDER BY u.name ASC';
    
    const result = await client.query(query, queryParams);

    return NextResponse.json(
      {
        success: true,
        data: result.rows,
        user: { id: user.id, role: user.role, clientId: user.clientId }
      },
      { status: 200 }
    );
  } finally {
    client.release();
  }
});

// POST /api/users - Create a new user (admin only)
const createUser = withErrorHandling(async (request: NextRequest, user: User) => {
  const body = await request.json();
  
  // Add clientId from authenticated user
  const bodyWithClientId = {
    ...body,
    clientId: user.clientId
  };
  
  // Validate request body using Yup schema
  const validation = await validateCreateUser(bodyWithClientId);
  
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

// Export the protected handlers
export const GET = withAuth(getUsers);
export const POST = withAuth(createUser);
