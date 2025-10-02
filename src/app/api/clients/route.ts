import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { withErrorHandling } from '@/middleware/errors';
import { ClientService } from '@/lib/services/clientService';

// GET /api/clients - Get all clients (for filtering)
const getClients = withErrorHandling(async (request: NextRequest, user: User) => {
  // Enhanced access control for client management
  if (!['admin', 'ceo'].includes(user.role)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Insufficient permissions. Only admin and CEO users can access client management.',
        code: 'INSUFFICIENT_PERMISSIONS'
      },
      { status: 403 }
    );
  }

  try {
    // Use ClientService for better data handling
    const clientService = new ClientService(user.clientId || 'default-agency');
    const clients = await clientService.getClients();
    
    return NextResponse.json(
      {
        success: true,
        data: clients,
        meta: {
          total: clients.length,
          userRole: user.role,
          timestamp: new Date().toISOString()
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch clients',
        code: 'FETCH_ERROR'
      },
      { status: 500 }
    );
  }
});

// POST /api/clients - Create a new client
const createClient = withErrorHandling(async (request: NextRequest, user: User) => {
  // Enhanced access control for client creation
  if (!['admin', 'ceo'].includes(user.role)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Insufficient permissions. Only admin and CEO users can create clients.',
        code: 'INSUFFICIENT_PERMISSIONS'
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and email are required fields',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Use ClientService for client creation
    const clientService = new ClientService(user.clientId || 'default-agency');
    const newClient = await clientService.createClient(body);
    
    return NextResponse.json(
      {
        success: true,
        data: newClient,
        message: 'Client created successfully',
        meta: {
          userRole: user.role,
          timestamp: new Date().toISOString()
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create client',
        code: 'CREATE_ERROR'
      },
      { status: 500 }
    );
  }
});

// Export the protected handlers
export const GET = withAuth(getClients);
export const POST = withAuth(createClient);
