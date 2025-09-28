import { NextRequest, NextResponse } from 'next/server';
import { 
  createAuthenticationError, 
  createAuthorizationError, 
  formatErrorResponse 
} from './errors';

// User roles and permissions
export type UserRole = 'ceo' | 'admin' | 'sales';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  clientId: string;
  permissions: string[];
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

// Mock JWT validation (in production, use a proper JWT library)
export function validateJWT(token: string): AuthResult {
  try {
    // TODO: Replace with actual JWT validation
    // For now, we'll use a simple mock validation
    if (!token || token === 'invalid-token') {
      throw createAuthenticationError('Invalid or missing token');
    }

    // Mock user data based on token
    const mockUsers: Record<string, User> = {
      'mock-jwt-token-ceo': {
        id: 'user-ceo-1',
        email: 'ceo@propaganda.com',
        name: 'CEO User',
        role: 'ceo',
        clientId: 'client-1',
        permissions: ['read:all-calls', 'read:all-metrics', 'read:all-users']
      },
      'mock-jwt-token-admin': {
        id: 'user-admin-1',
        email: 'admin@propaganda.com',
        name: 'Admin User',
        role: 'admin',
        clientId: 'client-1',
        permissions: ['read:all-calls', 'write:all-calls', 'read:all-metrics', 'read:all-users', 'write:all-users']
      },
      'mock-jwt-token-sales': {
        id: 'user-sales-1',
        email: 'sales@propaganda.com',
        name: 'Sales User',
        role: 'sales',
        clientId: 'client-1',
        permissions: ['read:own-calls', 'write:own-calls', 'read:own-metrics']
      }
    };

    const user = mockUsers[token];
    if (!user) {
      throw createAuthenticationError('User not found');
    }

    return {
      success: true,
      user
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'APIError') {
      throw error;
    }
    throw createAuthenticationError('Token validation failed');
  }
}

// Extract token from request headers
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

// Check if user has required permission
export function hasPermission(user: User, requiredPermission: string): boolean {
  return user.permissions.includes(requiredPermission) || user.permissions.includes('admin:all');
}

// Check if user has required role
export function hasRole(user: User, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    'sales': 1,
    'admin': 2,
    'ceo': 3
  };
  
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}

// Main authentication middleware function
export function authenticate(request: NextRequest): AuthResult {
  const token = extractToken(request);
  
  if (!token) {
    throw createAuthenticationError('No authentication token provided');
  }

  return validateJWT(token);
}

// Middleware for protecting API routes
export function withAuth(
  handler: (request: NextRequest, user: User) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const authResult = authenticate(request);
      
      if (!authResult.success || !authResult.user) {
        throw createAuthenticationError('Authentication failed');
      }

      return await handler(request, authResult.user);
    } catch (error) {
      return formatErrorResponse(error as Error);
    }
  };
}

// Middleware for role-based access control
export function withRole(
  requiredRole: UserRole,
  handler: (request: NextRequest, user: User) => Promise<NextResponse>
) {
  return withAuth(async (request: NextRequest, user: User): Promise<NextResponse> => {
    if (!hasRole(user, requiredRole)) {
      throw createAuthorizationError(`Role '${requiredRole}' or higher required`);
    }

    return handler(request, user);
  });
}

// Middleware for permission-based access control
export function withPermission(
  requiredPermission: string,
  handler: (request: NextRequest, user: User) => Promise<NextResponse>
) {
  return withAuth(async (request: NextRequest, user: User): Promise<NextResponse> => {
    if (!hasPermission(user, requiredPermission)) {
      throw createAuthorizationError(`Permission '${requiredPermission}' required`);
    }

    return handler(request, user);
  });
}
