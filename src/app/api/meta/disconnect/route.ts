// Meta Integration Disconnect API Route
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createMetaIntegrationService } from '@/lib/services/metaIntegrationService';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const metaService = createMetaIntegrationService(userId);
    
    // Disconnect Meta account
    await metaService.disconnect();

    return NextResponse.json({ 
      success: true,
      message: 'Meta account disconnected successfully'
    });

  } catch (error) {
    console.error('Meta disconnect error:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Meta account' },
      { status: 500 }
    );
  }
}
