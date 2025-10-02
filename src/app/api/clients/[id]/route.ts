import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { withErrorHandling } from '@/middleware/errors';
import { ClientService } from '@/lib/services/clientService';

// GET /api/clients/[id] - Get a specific client by ID
const getClientById = withErrorHandling(async (
  request: NextRequest, 
  user: User, 
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  // Enhanced access control for client management
  if (!['admin', 'ceo'].includes(user.role)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Insufficient permissions. Only admin and CEO users can access client details.',
        code: 'INSUFFICIENT_PERMISSIONS'
      },
      { status: 403 }
    );
  }

  try {
    const clientService = new ClientService(user.clientId || 'default-agency');
    const client = await clientService.getClientById(id);
    
    if (!client) {
      return NextResponse.json(
        {
          success: false,
          error: `Client with ID ${id} not found`,
          code: 'CLIENT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: client,
        meta: {
          userRole: user.role,
          timestamp: new Date().toISOString()
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch client',
        code: 'FETCH_ERROR'
      },
      { status: 500 }
    );
  }
});

// PUT /api/clients/[id] - Update a specific client
const updateClient = withErrorHandling(async (
  request: NextRequest, 
  user: User, 
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  // Enhanced access control for client updates
  if (!['admin', 'ceo'].includes(user.role)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Insufficient permissions. Only admin and CEO users can update clients.',
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

    const clientService = new ClientService(user.clientId || 'default-agency');
    const updatedClient = await clientService.updateClient(id, body);
    
    if (!updatedClient) {
      return NextResponse.json(
        {
          success: false,
          error: `Client with ID ${id} not found`,
          code: 'CLIENT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedClient,
        message: 'Client updated successfully',
        meta: {
          userRole: user.role,
          timestamp: new Date().toISOString()
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update client',
        code: 'UPDATE_ERROR'
      },
      { status: 500 }
    );
  }
});

// DELETE /api/clients/[id] - Delete a specific client
const deleteClient = withErrorHandling(async (
  request: NextRequest, 
  user: User, 
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  // Enhanced access control for client deletion
  if (!['admin', 'ceo'].includes(user.role)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Insufficient permissions. Only admin and CEO users can delete clients.',
        code: 'INSUFFICIENT_PERMISSIONS'
      },
      { status: 403 }
    );
  }

  try {
    const clientService = new ClientService(user.clientId || 'default-agency');
    const success = await clientService.deleteClient(id);
    
    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: `Client with ID ${id} not found`,
          code: 'CLIENT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Client deleted successfully',
        meta: {
          userRole: user.role,
          timestamp: new Date().toISOString()
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete client',
        code: 'DELETE_ERROR'
      },
      { status: 500 }
    );
  }
});

// Export the protected handlers
export const GET = withAuth(getClientById);
export const PUT = withAuth(updateClient);
export const DELETE = withAuth(deleteClient);


