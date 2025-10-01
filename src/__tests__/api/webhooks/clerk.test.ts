import { NextRequest } from 'next/server';
import { POST } from '@/app/api/webhooks/clerk/route';
import { createClient } from '@supabase/supabase-js';
import { Webhook } from 'svix';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    rpc: jest.fn(),
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn()
      }))
    }))
  }))
}));

// Mock Svix Webhook
jest.mock('svix', () => ({
  Webhook: jest.fn().mockImplementation(() => ({
    verify: jest.fn()
  }))
}));

// Mock environment variables
const originalEnv = process.env;

describe('Clerk Webhook Handler', () => {
  const mockSupabaseClient = {
    rpc: jest.fn(),
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn()
      }))
    }))
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
      CLERK_WEBHOOK_SECRET: 'test-webhook-secret'
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('user.created event', () => {
    it('should sync user data when user is created', async () => {
      const mockUserData = {
        id: 'clerk-user-123',
        email_addresses: [{ email_address: 'test@example.com' }],
        first_name: 'John',
        last_name: 'Doe',
        public_metadata: { role: 'ADMIN' }
      };

      const mockWebhook = {
        verify: jest.fn().mockReturnValue({
          type: 'user.created',
          data: mockUserData
        })
      };

      (Webhook as jest.Mock).mockImplementation(() => mockWebhook);

      mockSupabaseClient.rpc.mockResolvedValue({
        data: 'user-123',
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        headers: {
          'svix-id': 'test-id',
          'svix-timestamp': '1234567890',
          'svix-signature': 'test-signature'
        },
        body: JSON.stringify(mockUserData)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.message).toBe('Webhook processed successfully');
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('sync_clerk_user', {
        p_clerk_user_id: 'clerk-user-123',
        p_email: 'test@example.com',
        p_name: 'John Doe',
        p_metadata: { role: 'ADMIN' }
      });
    });

    it('should handle missing email gracefully', async () => {
      const mockUserData = {
        id: 'clerk-user-123',
        email_addresses: [],
        first_name: 'John',
        last_name: 'Doe',
        public_metadata: { role: 'ADMIN' }
      };

      const mockWebhook = {
        verify: jest.fn().mockReturnValue({
          type: 'user.created',
          data: mockUserData
        })
      };

      (Webhook as jest.Mock).mockImplementation(() => mockWebhook);

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        headers: {
          'svix-id': 'test-id',
          'svix-timestamp': '1234567890',
          'svix-signature': 'test-signature'
        },
        body: JSON.stringify(mockUserData)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.message).toBe('Webhook processed successfully');
      expect(mockSupabaseClient.rpc).not.toHaveBeenCalled();
    });
  });

  describe('user.updated event', () => {
    it('should sync updated user data', async () => {
      const mockUserData = {
        id: 'clerk-user-123',
        email_addresses: [{ email_address: 'updated@example.com' }],
        first_name: 'Jane',
        last_name: 'Smith',
        public_metadata: { role: 'USER' }
      };

      const mockWebhook = {
        verify: jest.fn().mockReturnValue({
          type: 'user.updated',
          data: mockUserData
        })
      };

      (Webhook as jest.Mock).mockImplementation(() => mockWebhook);

      mockSupabaseClient.rpc.mockResolvedValue({
        data: 'user-123',
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        headers: {
          'svix-id': 'test-id',
          'svix-timestamp': '1234567890',
          'svix-signature': 'test-signature'
        },
        body: JSON.stringify(mockUserData)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.message).toBe('Webhook processed successfully');
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('sync_clerk_user', {
        p_clerk_user_id: 'clerk-user-123',
        p_email: 'updated@example.com',
        p_name: 'Jane Smith',
        p_metadata: { role: 'USER' }
      });
    });
  });

  describe('user.deleted event', () => {
    it('should deactivate user when deleted', async () => {
      const mockUserData = {
        id: 'clerk-user-123'
      };

      const mockWebhook = {
        verify: jest.fn().mockReturnValue({
          type: 'user.deleted',
          data: mockUserData
        })
      };

      (Webhook as jest.Mock).mockImplementation(() => mockWebhook);

      const mockUpdate = {
        eq: jest.fn().mockResolvedValue({ error: null })
      };

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue(mockUpdate)
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        headers: {
          'svix-id': 'test-id',
          'svix-timestamp': '1234567890',
          'svix-signature': 'test-signature'
        },
        body: JSON.stringify(mockUserData)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.message).toBe('Webhook processed successfully');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('users');
      expect(mockUpdate.eq).toHaveBeenCalledWith('clerk_user_id', 'clerk-user-123');
    });
  });

  describe('error handling', () => {
    it('should return 400 when svix headers are missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should return 400 when webhook verification fails', async () => {
      const mockWebhook = {
        verify: jest.fn().mockImplementation(() => {
          throw new Error('Verification failed');
        })
      };

      (Webhook as jest.Mock).mockImplementation(() => mockWebhook);

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        headers: {
          'svix-id': 'test-id',
          'svix-timestamp': '1234567890',
          'svix-signature': 'test-signature'
        },
        body: JSON.stringify({})
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should return 500 when user sync fails', async () => {
      const mockUserData = {
        id: 'clerk-user-123',
        email_addresses: [{ email_address: 'test@example.com' }],
        first_name: 'John',
        last_name: 'Doe',
        public_metadata: { role: 'ADMIN' }
      };

      const mockWebhook = {
        verify: jest.fn().mockReturnValue({
          type: 'user.created',
          data: mockUserData
        })
      };

      (Webhook as jest.Mock).mockImplementation(() => mockWebhook);

      mockSupabaseClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        headers: {
          'svix-id': 'test-id',
          'svix-timestamp': '1234567890',
          'svix-signature': 'test-signature'
        },
        body: JSON.stringify(mockUserData)
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Failed to process webhook');
    });

    it('should handle unhandled webhook event types', async () => {
      const mockWebhook = {
        verify: jest.fn().mockReturnValue({
          type: 'session.created',
          data: {}
        })
      };

      (Webhook as jest.Mock).mockImplementation(() => mockWebhook);

      const request = new NextRequest('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        headers: {
          'svix-id': 'test-id',
          'svix-timestamp': '1234567890',
          'svix-signature': 'test-signature'
        },
        body: JSON.stringify({})
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.message).toBe('Webhook processed successfully');
    });
  });
});
