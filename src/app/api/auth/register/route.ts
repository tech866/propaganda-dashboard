import { NextRequest, NextResponse } from 'next/server';
import { createValidationError, createConflictError, withErrorHandling } from '@/middleware/errors';
import { validateRequiredFields } from '@/middleware/errors';

// Mock user storage (in a real app, this would be a database)
const mockUsers = [
  { 
    id: 'user-1', 
    email: 'test@example.com', 
    password: 'password123', 
    name: 'John Doe', 
    role: 'sales', 
    clientId: 'client-1' 
  },
  { 
    id: 'user-admin-1', 
    email: 'admin@example.com', 
    password: 'adminpassword', 
    name: 'Admin User', 
    role: 'admin', 
    clientId: 'client-1' 
  },
  { 
    id: 'user-ceo-1', 
    email: 'ceo@example.com', 
    password: 'ceopassword', 
    name: 'CEO User', 
    role: 'ceo', 
    clientId: 'client-agency' 
  },
];

// POST /api/auth/register - User registration
const register = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const requiredFields = ['email', 'password', 'name', 'role', 'clientId'];
  const validation = validateRequiredFields(body, requiredFields);

  if (!validation.isValid) {
    throw createValidationError('Missing required fields', {
      missingFields: validation.missingFields
    });
  }

  const { email, password, name, role, clientId } = body;

  // Check if user already exists
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    throw createConflictError('User with this email already exists');
  }

  // Validate role
  const validRoles = ['sales', 'admin', 'ceo'];
  if (!validRoles.includes(role)) {
    throw createValidationError('Invalid role. Must be one of: sales, admin, ceo');
  }

  // Create new user
  const newUser = {
    id: `user-${Date.now()}`,
    email,
    password, // In production, hash this password
    name,
    role,
    clientId
  };

  // Add to mock storage (in production, save to database)
  mockUsers.push(newUser);

  return NextResponse.json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        clientId: newUser.clientId
      }
    }
  }, { status: 201 });
});

export const POST = register;
