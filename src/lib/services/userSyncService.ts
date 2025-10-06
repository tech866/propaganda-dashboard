import { createClient } from '@supabase/supabase-js';
import { User } from '@clerk/nextjs/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface DatabaseUser {
  id: string;
  clerk_user_id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export class UserSyncService {
  /**
   * Sync a Clerk user to the database
   * Creates the user if they don't exist, updates if they do
   */
  static async syncUser(clerkUser: User): Promise<DatabaseUser> {
    const email = clerkUser.emailAddresses?.[0]?.emailAddress || '';
    const firstName = clerkUser.firstName || '';
    const lastName = clerkUser.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || email.split('@')[0];
    const clerkUserId = clerkUser.id;

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching user:', fetchError);
      throw fetchError;
    }

    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          email: email,
          name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_user_id', clerkUserId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user:', updateError);
        throw updateError;
      }

      console.log('User updated in database:', updatedUser.id);
      return updatedUser;
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          clerk_user_id: clerkUserId,
          email: email,
          name: fullName,
          role: 'admin', // Default role for new users
          client_id: '00000000-0000-0000-0000-000000000001', // Required field
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }

      console.log('User created in database:', newUser.id);
      return newUser;
    }
  }

  /**
   * Get user from database by Clerk user ID
   */
  static async getUserByClerkId(clerkUserId: string): Promise<DatabaseUser | null> {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      console.error('Error fetching user by Clerk ID:', error);
      throw error;
    }

    return user;
  }

  /**
   * Update user role in database
   */
  static async updateUserRole(clerkUserId: string, role: string): Promise<DatabaseUser> {
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        role: role,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_user_id', clerkUserId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      throw error;
    }

    return updatedUser;
  }

  /**
   * Delete user from database
   */
  static async deleteUser(clerkUserId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('clerk_user_id', clerkUserId);

    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}
