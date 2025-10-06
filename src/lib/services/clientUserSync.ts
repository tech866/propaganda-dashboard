// =====================================================
// Client-Side User Sync Service
// Safe for client-side use, calls API endpoints
// =====================================================

export interface DatabaseUser {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
}

export class ClientUserSyncService {
  /**
   * Sync current user to database via API endpoint
   * This is safe to call from client-side code
   */
  static async syncCurrentUser(): Promise<DatabaseUser | null> {
    try {
      const response = await fetch('/api/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to sync user:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      console.log('User synced successfully:', data.user?.email);
      return data.user;
    } catch (error) {
      console.error('Error syncing user:', error);
      return null;
    }
  }

  /**
   * Get current user from database via API endpoint
   */
  static async getCurrentUser(): Promise<DatabaseUser | null> {
    try {
      const response = await fetch('/api/sync-user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // User not found in database, try to sync
          return await this.syncCurrentUser();
        }
        console.error('Failed to get user:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }
}
