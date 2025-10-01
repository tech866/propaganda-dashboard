import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

// Initialize Supabase client only if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export interface UserWithClerk {
  id: string;
  client_id: string;
  clerk_user_id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER' | 'PROFESSIONAL' | 'ceo' | 'admin' | 'sales';
  is_active: boolean;
  last_login: string | null;
  clerk_metadata: any;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
  client_name: string;
}

/**
 * Get user data from Supabase using Clerk user ID
 */
export async function getUserFromSupabase(clerkUserId: string): Promise<UserWithClerk | null> {
  if (!supabase) {
    console.warn('Supabase client not configured');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('users_with_clerk')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching user from Supabase:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to get user from Supabase:', error);
    return null;
  }
}

/**
 * Get current authenticated user data
 */
export async function getCurrentUser(): Promise<UserWithClerk | null> {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return null;
    }

    return await getUserFromSupabase(userId);
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

/**
 * Check if user has specific role
 */
export function hasRole(user: UserWithClerk | null, requiredRole: string): boolean {
  if (!user) return false;
  
  // Map Clerk roles to legacy roles for backward compatibility
  const roleMap: Record<string, string[]> = {
    'ADMIN': ['ADMIN', 'admin', 'ceo'],
    'USER': ['USER', 'sales'],
    'PROFESSIONAL': ['PROFESSIONAL', 'admin', 'ceo']
  };

  const allowedRoles = roleMap[user.role] || [user.role];
  return allowedRoles.includes(requiredRole);
}

/**
 * Check if user is admin
 */
export function isAdmin(user: UserWithClerk | null): boolean {
  return hasRole(user, 'ADMIN') || hasRole(user, 'admin') || hasRole(user, 'ceo');
}

/**
 * Check if user can access client data
 */
export function canAccessClient(user: UserWithClerk | null, clientId: string): boolean {
  if (!user) return false;
  
  // Admins can access all clients
  if (isAdmin(user)) return true;
  
  // Users can only access their own client
  return user.client_id === clientId;
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(clerkUserId: string): Promise<void> {
  if (!supabase) {
    console.warn('Supabase client not configured');
    return;
  }

  try {
    const { error } = await supabase
      .from('users')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('clerk_user_id', clerkUserId);

    if (error) {
      console.error('Error updating last login:', error);
    }
  } catch (error) {
    console.error('Failed to update last login:', error);
  }
}
