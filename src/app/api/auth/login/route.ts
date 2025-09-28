import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createAuthenticationError, createValidationError, withErrorHandling } from '@/middleware/errors';
import { validateLogin } from '@/lib/validation';
import jwt from 'jsonwebtoken';

// POST /api/auth/login - User login with JWT token
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
      id: '650e8400-e29b-41d4-a716-446655440003', 
      email: 'test@example.com', 
      password: 'password123', 
      name: 'John Doe', 
      role: 'sales', 
      clientId: '550e8400-e29b-41d4-a716-446655440001' 
    },
    { 
      id: '650e8400-e29b-41d4-a716-446655440002', 
      email: 'admin@example.com', 
      password: 'adminpassword', 
      name: 'Admin User', 
      role: 'admin', 
      clientId: '550e8400-e29b-41d4-a716-446655440001' 
    },
    { 
      id: '650e8400-e29b-41d4-a716-446655440001', 
      email: 'ceo@example.com', 
      password: 'ceopassword', 
      name: 'CEO User', 
      role: 'ceo', 
      clientId: '550e8400-e29b-41d4-a716-446655440001' 
    },
  ];

  const user = mockUsers.find(u => u.email === email && u.password === password);

  if (!user) {
    throw createAuthenticationError('Invalid credentials');
  }

  // Generate JWT token
  const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clientId: user.clientId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );

  // Return user data with JWT token
  return NextResponse.json({
    success: true,
    message: 'Login successful',
    token: token,
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
