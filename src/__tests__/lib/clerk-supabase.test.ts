import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import {
  getUserFromSupabase,
  getCurrentUser,
  hasRole,
  isAdmin,
  canAccessClient,
  updateLastLogin,
  UserWithClerk
} from '@/lib/clerk-supabase';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn()
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn()
      }))
    })),
    rpc: jest.fn()
  }))
}));

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn()
}));

describe('Clerk-Supabase Integration', () => {
  const mockSupabaseClient = {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn()
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn()
      }))
    })),
    rpc: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  describe('getUserFromSupabase', () => {
    it('should return user data when user exists', async () => {
      const mockUser: UserWithClerk = {
        id: 'user-123',
        client_id: 'client-456',
        clerk_user_id: 'clerk-user-789',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
        is_active: true,
        last_login: null,
        clerk_metadata: { role: 'ADMIN' },
        last_sync_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        client_name: 'Test Agency'
      };

      const mockQuery = {
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null })
          }))
        }))
      };

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      });

      const result = await getUserFromSupabase('clerk-user-789');

      expect(result).toEqual(mockUser);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users_with_clerk');
    });

    it('should return null when user does not exist', async () => {
      const mockQuery = {
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: 'User not found' } })
          }))
        }))
      };

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      });

      const result = await getUserFromSupabase('non-existent-user');

      expect(result).toBeNull();
    });

    it('should return null when Supabase error occurs', async () => {
      const mockQuery = {
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockRejectedValue(new Error('Database error'))
          }))
        }))
      };

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      });

      const result = await getUserFromSupabase('clerk-user-789');

      expect(result).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when authenticated', async () => {
      const mockUser: UserWithClerk = {
        id: 'user-123',
        client_id: 'client-456',
        clerk_user_id: 'clerk-user-789',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
        is_active: true,
        last_login: null,
        clerk_metadata: { role: 'ADMIN' },
        last_sync_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        client_name: 'Test Agency'
      };

      (auth as jest.Mock).mockResolvedValue({ userId: 'clerk-user-789' });

      const mockQuery = {
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({ data: mockUser, error: null })
          }))
        }))
      };

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      });

      const result = await getCurrentUser();

      expect(result).toEqual(mockUser);
    });

    it('should return null when not authenticated', async () => {
      (auth as jest.Mock).mockResolvedValue({ userId: null });

      const result = await getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('hasRole', () => {
    const mockUser: UserWithClerk = {
      id: 'user-123',
      client_id: 'client-456',
      clerk_user_id: 'clerk-user-789',
      email: 'test@example.com',
      name: 'Test User',
      role: 'ADMIN',
      is_active: true,
      last_login: null,
      clerk_metadata: { role: 'ADMIN' },
      last_sync_at: '2024-01-01T00:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      client_name: 'Test Agency'
    };

    it('should return true for matching role', () => {
      expect(hasRole(mockUser, 'ADMIN')).toBe(true);
    });

    it('should return true for legacy admin role', () => {
      expect(hasRole(mockUser, 'admin')).toBe(true);
    });

    it('should return true for legacy ceo role', () => {
      expect(hasRole(mockUser, 'ceo')).toBe(true);
    });

    it('should return false for non-matching role', () => {
      expect(hasRole(mockUser, 'USER')).toBe(false);
    });

    it('should return false when user is null', () => {
      expect(hasRole(null, 'ADMIN')).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for ADMIN role', () => {
      const adminUser: UserWithClerk = {
        id: 'user-123',
        client_id: 'client-456',
        clerk_user_id: 'clerk-user-789',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
        is_active: true,
        last_login: null,
        clerk_metadata: { role: 'ADMIN' },
        last_sync_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        client_name: 'Test Agency'
      };

      expect(isAdmin(adminUser)).toBe(true);
    });

    it('should return true for legacy admin role', () => {
      const legacyAdminUser: UserWithClerk = {
        id: 'user-123',
        client_id: 'client-456',
        clerk_user_id: 'clerk-user-789',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        is_active: true,
        last_login: null,
        clerk_metadata: { role: 'admin' },
        last_sync_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        client_name: 'Test Agency'
      };

      expect(isAdmin(legacyAdminUser)).toBe(true);
    });

    it('should return false for USER role', () => {
      const regularUser: UserWithClerk = {
        id: 'user-123',
        client_id: 'client-456',
        clerk_user_id: 'clerk-user-789',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        is_active: true,
        last_login: null,
        clerk_metadata: { role: 'USER' },
        last_sync_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        client_name: 'Test Agency'
      };

      expect(isAdmin(regularUser)).toBe(false);
    });
  });

  describe('canAccessClient', () => {
    const adminUser: UserWithClerk = {
      id: 'user-123',
      client_id: 'client-456',
      clerk_user_id: 'clerk-user-789',
      email: 'test@example.com',
      name: 'Test User',
      role: 'ADMIN',
      is_active: true,
      last_login: null,
      clerk_metadata: { role: 'ADMIN' },
      last_sync_at: '2024-01-01T00:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      client_name: 'Test Agency'
    };

    const regularUser: UserWithClerk = {
      id: 'user-456',
      client_id: 'client-789',
      clerk_user_id: 'clerk-user-456',
      email: 'user@example.com',
      name: 'Regular User',
      role: 'USER',
      is_active: true,
      last_login: null,
      clerk_metadata: { role: 'USER' },
      last_sync_at: '2024-01-01T00:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      client_name: 'User Agency'
    };

    it('should return true for admin accessing any client', () => {
      expect(canAccessClient(adminUser, 'client-456')).toBe(true);
      expect(canAccessClient(adminUser, 'client-789')).toBe(true);
    });

    it('should return true for user accessing own client', () => {
      expect(canAccessClient(regularUser, 'client-789')).toBe(true);
    });

    it('should return false for user accessing different client', () => {
      expect(canAccessClient(regularUser, 'client-456')).toBe(false);
    });

    it('should return false when user is null', () => {
      expect(canAccessClient(null, 'client-456')).toBe(false);
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      const mockUpdate = {
        eq: jest.fn().mockResolvedValue({ error: null })
      };

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue(mockUpdate)
      });

      await updateLastLogin('clerk-user-789');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockUpdate.eq).toHaveBeenCalledWith('clerk_user_id', 'clerk-user-789');
    });

    it('should handle update errors gracefully', async () => {
      const mockUpdate = {
        eq: jest.fn().mockResolvedValue({ error: { message: 'Update failed' } })
      };

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue(mockUpdate)
      });

      // Should not throw error
      await expect(updateLastLogin('clerk-user-789')).resolves.not.toThrow();
    });
  });
});

