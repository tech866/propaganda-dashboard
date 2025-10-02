/**
 * Supabase Client with Clerk JWT Integration
 * 
 * This client is configured to work with Row Level Security (RLS)
 * by automatically including Clerk JWT tokens in requests.
 */

import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/nextjs';

// Server-side Supabase client with Clerk JWT
export function createServerSupabaseClient(token?: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: token ? {
          Authorization: `Bearer ${token}`,
        } : {},
      },
    }
  );
}

// Client-side Supabase client with Clerk JWT
export function createClientSupabaseClient() {
  const { getToken } = useAuth();
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: async () => {
          try {
            const token = await getToken({ template: 'supabase' });
            return {
              Authorization: token ? `Bearer ${token}` : '',
            };
          } catch (error) {
            console.warn('Failed to get Clerk token:', error);
            return {};
          }
        },
      },
    }
  );
}

// Admin Supabase client (bypasses RLS - use with caution)
export function createAdminSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// Utility function to get user info from JWT
export async function getCurrentUserInfo(token?: string) {
  const supabase = createServerSupabaseClient(token);
  
  try {
    const { data, error } = await supabase.rpc('current_user_info');
    
    if (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
}

// Utility function to check if user can access client
export async function canAccessClient(clientId: string, token?: string) {
  const supabase = createServerSupabaseClient(token);
  
  try {
    const { data, error } = await supabase.rpc('can_access_client', {
      client_id_param: clientId
    });
    
    if (error) {
      console.error('Failed to check client access:', error);
      return false;
    }
    
    return data;
  } catch (error) {
    console.error('Error checking client access:', error);
    return false;
  }
}

// Utility function to check if user is admin or CEO
export async function isAdminOrCEO(token?: string) {
  const supabase = createServerSupabaseClient(token);
  
  try {
    const { data, error } = await supabase.rpc('is_admin_or_ceo');
    
    if (error) {
      console.error('Failed to check admin status:', error);
      return false;
    }
    
    return data;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}
