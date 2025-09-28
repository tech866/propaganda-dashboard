import { NextRequest } from 'next/server';
import { User, authenticate } from './auth';

// Helper function to get current user from request
export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  const authResult = authenticate(request);
  return authResult.success ? authResult.user || null : null;
}

// Helper function to check if user can access client data
export function canAccessClient(user: User, clientId: string): boolean {
  // CEO can access all clients
  if (user.role === 'ceo') {
    return true;
  }
  
  // Admin and Sales can only access their assigned client
  return user.clientId === clientId;
}

// Helper function to check if user can access call data
export function canAccessCall(user: User, callOwnerId: string, callClientId: string): boolean {
  // CEO can access all calls
  if (user.role === 'ceo') {
    return true;
  }
  
  // Admin can access all calls within their client
  if (user.role === 'admin' && user.clientId === callClientId) {
    return true;
  }
  
  // Sales can only access their own calls
  if (user.role === 'sales' && user.id === callOwnerId) {
    return true;
  }
  
  return false;
}

// Helper function to validate client access
export function validateClientAccess(user: User, clientId: string): boolean {
  if (!canAccessClient(user, clientId)) {
    return false;
  }
  return true;
}

// Helper function to get user's accessible client IDs
export function getAccessibleClientIds(user: User): string[] {
  if (user.role === 'ceo') {
    // TODO: In production, fetch all client IDs from database
    return ['client-1', 'client-2', 'client-3'];
  }
  
  return [user.clientId];
}
