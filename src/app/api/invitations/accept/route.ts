// =====================================================
// Invitation Acceptance API Endpoint
// Task 20.2: Workspace Provisioning APIs
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { WorkspaceService } from '@/lib/services/workspaceService';

// =====================================================
// POST /api/invitations/accept - Accept workspace invitation
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
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      );
    }

    // Accept invitation
    const result = await WorkspaceService.acceptInvitation(token, userId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        workspaceId: result.workspaceId,
        message: 'Invitation accepted successfully'
      }
    });

  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}
