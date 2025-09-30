// Clerk helper functions and types

// User role types (matching our Supabase schema)
export type UserRole = 'ceo' | 'admin' | 'sales' | 'agency_user' | 'client_user';

// User metadata interface
export interface ClerkUserMetadata {
  agency_id?: string;
  role?: UserRole;
  subscription_plan?: 'basic' | 'professional' | 'enterprise';
}

// Organization metadata interface
export interface ClerkOrganizationMetadata {
  subscription_plan?: 'basic' | 'professional' | 'enterprise';
  billing_address?: string;
  contact_info?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

// Helper function to get user role from Clerk user
export function getUserRole(user: any): UserRole {
  return user?.publicMetadata?.role || 'agency_user';
}

// Helper function to get agency ID from Clerk user
export function getAgencyId(user: any): string | null {
  return user?.publicMetadata?.agency_id || null;
}

// Helper function to get organization ID (agency ID)
export function getOrganizationId(organization: any): string | null {
  return organization?.id || null;
}

// Role-based permissions
export const rolePermissions = {
  ceo: ['read:all', 'write:all', 'delete:all', 'manage_users', 'manage_agencies', 'financial'],
  admin: ['read:all', 'write:all', 'delete:all', 'manage_users'],
  sales: ['read:own', 'write:own', 'read:agency_metrics'],
  agency_user: ['read:own', 'write:own'],
  client_user: ['read:own']
};

// Check if user has permission
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(permission);
}

// Check if user can access agency data
export function canAccessAgency(user: any, agencyId: string): boolean {
  const userRole = getUserRole(user);
  const userAgencyId = getAgencyId(user);
  
  // CEO and Admin can access any agency
  if (userRole === 'ceo' || userRole === 'admin') {
    return true;
  }
  
  // Other roles can only access their own agency
  return userAgencyId === agencyId;
}

// Check if user can manage users
export function canManageUsers(user: any): boolean {
  const userRole = getUserRole(user);
  return userRole === 'ceo' || userRole === 'admin';
}

// Check if user can access financial data
export function canAccessFinancial(user: any): boolean {
  const userRole = getUserRole(user);
  return userRole === 'ceo';
}

// Export helper functions for use throughout the app
