// =====================================================
// Individual Workspace API Endpoints
// Task 20.2: Workspace Provisioning APIs
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { WorkspaceService } from '@/lib/services/workspaceService';
import { UpdateWorkspaceRequest } from '@/lib/types/workspace';

interface RouteParams {
  params: {
    workspaceId: string;
  };
}

// =====================================================
// GET /api/workspaces/[workspaceId] - Get workspace details
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

    // Check if user has access to workspace
    const access = await WorkspaceService.checkWorkspaceAccess(workspaceId, userId);
    if (!access.hasAccess) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get workspace details
    const workspace = await WorkspaceService.getWorkspaceById(workspaceId);
    
    return NextResponse.json({
      success: true,
      data: workspace
    });

  } catch (error) {
    console.error('Error fetching workspace:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspace' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT /api/workspaces/[workspaceId] - Update workspace
// =====================================================

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { workspaceId } = params;

    // Check if user has admin access to workspace
    const access = await WorkspaceService.checkWorkspaceAccess(workspaceId, userId);
    if (!access.hasAccess || access.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    const updateData: UpdateWorkspaceRequest = {
      name: body.name,
      slug: body.slug,
      description: body.description,
      settings: body.settings,
      is_active: body.is_active
    };

    // If slug is being updated, check availability
    if (updateData.slug) {
      const isSlugAvailable = await WorkspaceService.isSlugAvailable(
        updateData.slug, 
        workspaceId
      );
      if (!isSlugAvailable) {
        return NextResponse.json(
          { error: 'Workspace slug is already taken' },
          { status: 409 }
        );
      }
    }

    // Update workspace
    const workspace = await WorkspaceService.updateWorkspace(workspaceId, updateData);
    
    return NextResponse.json({
      success: true,
      data: workspace
    });

  } catch (error) {
    console.error('Error updating workspace:', error);
    return NextResponse.json(
      { error: 'Failed to update workspace' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE /api/workspaces/[workspaceId] - Delete workspace
// =====================================================

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { workspaceId } = params;

    // Check if user has admin access to workspace
    const access = await WorkspaceService.checkWorkspaceAccess(workspaceId, userId);
    if (!access.hasAccess || access.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Delete workspace (soft delete)
    await WorkspaceService.deleteWorkspace(workspaceId);
    
    return NextResponse.json({
      success: true,
      message: 'Workspace deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting workspace:', error);
    return NextResponse.json(
      { error: 'Failed to delete workspace' },
      { status: 500 }
    );
  }
}
