// =====================================================
// Workspace Invitations API Endpoints
// Task 20.2: Workspace Provisioning APIs
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { WorkspaceService } from '@/lib/services/workspaceService';
import { WorkspaceRole } from '@/lib/types/workspace';

interface RouteParams {
  params: {
    workspaceId: string;
  };
}

// =====================================================
// GET /api/workspaces/[workspaceId]/invitations - Get workspace invitations
// =====================================================

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { workspaceId } = params;

    // Check if user has admin/manager access to workspace
    const access = await WorkspaceService.checkWorkspaceAccess(workspaceId, userId);
    if (!access.hasAccess || !['admin', 'manager'].includes(access.role || '')) {
      return NextResponse.json(
        { error: 'Admin or manager access required' },
        { status: 403 }
      );
    }

    // Get workspace invitations
    const invitations = await WorkspaceService.getWorkspaceInvitations(workspaceId);
    
    return NextResponse.json({
      success: true,
      data: invitations
    });

  } catch (error) {
    console.error('Error fetching workspace invitations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspace invitations' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST /api/workspaces/[workspaceId]/invitations - Send invitation
// =====================================================

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { workspaceId } = params;

    // Check if user has admin/manager access to workspace
    const access = await WorkspaceService.checkWorkspaceAccess(workspaceId, userId);
    if (!access.hasAccess || !['admin', 'manager'].includes(access.role || '')) {
      return NextResponse.json(
        { error: 'Admin or manager access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, role, expires_in_hours } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles: WorkspaceRole[] = ['admin', 'manager', 'sales_rep', 'client', 'viewer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Send invitation
    const token = await WorkspaceService.inviteUser(
      workspaceId,
      {
        email,
        role,
        expires_in_hours: expires_in_hours || 168 // 7 days default
      },
      userId
    );
    
    return NextResponse.json({
      success: true,
      data: {
        token,
        message: 'Invitation sent successfully'
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
