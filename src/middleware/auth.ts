import { NextRequest, NextResponse } from 'next/server';
import { 
  createAuthenticationError, 
  createAuthorizationError, 
  formatErrorResponse 
} from './errors';
import jwt from 'jsonwebtoken';

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

// Real JWT validation using NextAuth JWT tokens
export function validateJWT(token: string): AuthResult {
  try {
    if (!token) {
      throw createAuthenticationError('Invalid or missing token');
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    
    // Verify the JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (!decoded || !decoded.id || !decoded.email) {
      throw createAuthenticationError('Invalid token payload');
    }

    // Create user object from JWT payload
    const user: User = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name || '',
      role: decoded.role || 'sales',
      clientId: decoded.clientId || '',
      permissions: getUserPermissions(decoded.role)
    };

    return {
      success: true,
      user
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'APIError') {
      throw error;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw createAuthenticationError('Invalid token');
    }
    throw createAuthenticationError('Token validation failed');
  }
}

// Helper function to get user permissions based on role
function getUserPermissions(role: UserRole): string[] {
  const permissions: Record<UserRole, string[]> = {
    'ceo': ['read:all-calls', 'read:all-metrics', 'read:all-users'],
    'admin': ['read:all-calls', 'write:all-calls', 'read:all-metrics', 'read:all-users', 'write:all-users'],
    'sales': ['read:own-calls', 'write:own-calls', 'read:own-metrics']
  };
  
  return permissions[role] || permissions['sales'];
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
