import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { withErrorHandling } from '@/middleware/errors';
import { getClient } from '@/lib/database';

// GET /api/clients - Get all clients (for filtering)
const getClients = withErrorHandling(async (request: NextRequest, user: User) => {
  const client = await getClient();
  
  try {
    // Get all clients - only Admin and CEO can see all clients
    if (user.role === 'sales') {
      // Sales users can only see their own client
      const result = await client.query(
        'SELECT id, name FROM clients WHERE id = $1',
        [user.clientId]
      );
      
      return NextResponse.json(
        {
          success: true,
          data: result.rows
        },
        { status: 200 }
      );
    } else {
      // Admin and CEO can see all clients
      const result = await client.query(
        'SELECT id, name FROM clients ORDER BY name ASC'
      );
      
      return NextResponse.json(
        {
          success: true,
          data: result.rows
        },
        { status: 200 }
      );
    }
  } finally {
    client.release();
  }
});

// Export the protected handler
export const GET = withAuth(getClients);
