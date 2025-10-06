// =====================================================
// Workspace Management API Endpoints
// Task 20.2: Workspace Provisioning APIs
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { WorkspaceService } from '@/lib/services/workspaceService';
import { CreateWorkspaceRequest, UpdateWorkspaceRequest } from '@/lib/types/workspace';
import { validateWorkspaceData } from '@/lib/validation/workspaceSchemas';

// =====================================================
// GET /api/workspaces - Get user's workspaces
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's workspaces
    const workspaces = await WorkspaceService.getUserWorkspaces(userId);
    
    return NextResponse.json({
      success: true,
      data: workspaces
    });

  } catch (error) {
    console.error('Error fetching user workspaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspaces' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST /api/workspaces - Create new workspace
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate workspace data
    const validationResult = validateWorkspaceData(body);
    if (!validationResult.isValid) {
      return NextResponse.json(
        { error: 'Invalid workspace data', details: validationResult.errors },
        { status: 400 }
      );
    }

    const workspaceData: CreateWorkspaceRequest = {
      name: body.name,
      slug: body.slug,
      description: body.description,
      settings: body.settings || {}
    };

    // Check if slug is available
    const isSlugAvailable = await WorkspaceService.isSlugAvailable(workspaceData.slug);
    if (!isSlugAvailable) {
      return NextResponse.json(
        { error: 'Workspace slug is already taken' },
        { status: 409 }
      );
    }

    // Create workspace
    const workspace = await WorkspaceService.createWorkspace(workspaceData, userId);
    
    return NextResponse.json({
      success: true,
      data: workspace
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json(
      { error: 'Failed to create workspace' },
      { status: 500 }
    );
  }
}
