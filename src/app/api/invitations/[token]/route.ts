/**
 * Invitation Details API
 * GET: Get invitation details by token
 */

import { NextRequest, NextResponse } from 'next/server';
import { WorkspaceInvitationService } from '@/lib/services/workspaceInvitationService';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      );
    }

    const result = await WorkspaceInvitationService.getInvitationByToken(token);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      invitation: result.invitation 
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitation' },
      { status: 500 }
    );
  }
}



