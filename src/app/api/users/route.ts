import { NextRequest, NextResponse } from 'next/server';
import { withAuth, User } from '@/middleware/auth';
import { createValidationError, withErrorHandling } from '@/middleware/errors';
import { validateCreateUser } from '@/lib/validation';
import { createServerSupabaseClient } from '@/lib/supabase-client';
import { auth } from '@clerk/nextjs/server';

// GET /api/users - Get all users (RLS automatically filters based on role)
const getUsers = withErrorHandling(async (request: NextRequest, user: User) => {
  try {
    // Get Clerk JWT token for RLS
    const { getToken } = auth();
    const token = await getToken({ template: 'supabase' });
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required'
        },
        { status: 401 }
      );
    }

    // Create Supabase client with JWT token (RLS will automatically apply)
    const supabase = createServerSupabaseClient(token);
    
    // RLS policies will automatically filter data based on user's role and client_id
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        role,
        client_id,
        is_active,
        created_at,
        clients!inner(
          id,
          name
        )
      `)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    // Transform data to match expected format
    const transformedUsers = (users || []).map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clientId: user.client_id,
      isActive: user.is_active,
      createdAt: user.created_at,
      clientName: user.clients?.name
    }));

    return NextResponse.json(
      {
        success: true,
        data: transformedUsers,
        user: { id: user.id, role: user.role, clientId: user.clientId },
        rls_enabled: true
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch users',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});

// POST /api/users - Create a new user (RLS automatically enforces permissions)
const createUser = withErrorHandling(async (request: NextRequest, user: User) => {
  try {
    // Get Clerk JWT token for RLS
    const { getToken } = auth();
    const token = await getToken({ template: 'supabase' });
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required'
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Add clientId from authenticated user
    const bodyWithClientId = {
      ...body,
      clientId: user.clientId
    };
    
    // Validate request body using Yup schema
    const validation = await validateCreateUser(bodyWithClientId);
    
    if (!validation.isValid) {
      throw createValidationError('Validation failed', validation.errors);
    }

    const validatedData = validation.data!;

    // Create Supabase client with JWT token (RLS will automatically enforce permissions)
    const supabase = createServerSupabaseClient(token);
    
    // RLS policies will automatically prevent unauthorized user creation
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        email: validatedData.email,
        name: validatedData.name,
        role: validatedData.role,
        client_id: validatedData.clientId,
        is_active: true
      })
      .select(`
        id,
        email,
        name,
        role,
        client_id,
        is_active,
        created_at
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    // Transform data to match expected format
    const transformedUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      clientId: newUser.client_id,
      isActive: newUser.is_active,
      createdAt: newUser.created_at
    };

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        data: transformedUser,
        rls_enabled: true
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});

// Export the protected handlers
export const GET = withAuth(getUsers);
export const POST = withAuth(createUser);
