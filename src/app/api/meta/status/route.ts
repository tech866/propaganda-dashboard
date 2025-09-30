// Meta Integration Status API Route
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createMetaIntegrationService } from '@/lib/services/metaIntegrationService';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const metaService = createMetaIntegrationService(userId);
    
    // Check if user has connected Meta account
    const isConnected = await metaService.isConnected();
    
    if (!isConnected) {
      return NextResponse.json({ 
        connected: false,
        message: 'Meta account not connected'
      });
    }

    // Get ad accounts if connected
    let adAccounts = [];
    try {
      adAccounts = await metaService.getAdAccounts();
    } catch (error) {
      console.error('Error fetching ad accounts:', error);
      // Still return connected: true even if we can't fetch accounts
    }

    return NextResponse.json({ 
      connected: true,
      adAccounts: adAccounts,
      message: 'Meta account connected successfully'
    });

  } catch (error) {
    console.error('Meta status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check Meta connection status' },
      { status: 500 }
    );
  }
}
