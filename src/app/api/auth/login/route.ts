import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAuthenticationError, createValidationError, withErrorHandling } from '@/middleware/errors';
import { validateLogin } from '@/lib/validation';

// POST /api/auth/login - User login (NextAuth compatible)
const login = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();

  // Validate request body using Yup schema
  const validation = await validateLogin(body);
  
  if (!validation.isValid) {
    throw createValidationError('Validation failed', validation.errors);
  }

  const { email, password } = validation.data!;

  // Mock user data (in a real app, this would come from a database)
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

  const user = mockUsers.find(u => u.email === email && u.password === password);

  if (!user) {
    throw createAuthenticationError('Invalid credentials');
  }

  // Return user data (NextAuth will handle JWT token generation)
  return NextResponse.json({
    success: true,
    message: 'Login successful',
    data: { 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role, 
        clientId: user.clientId 
      }
    },
  }, { status: 200 });
});

export const POST = login;
