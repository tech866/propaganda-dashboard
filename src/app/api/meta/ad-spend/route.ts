// Meta Ad Spend Data API Route
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createMetaApiService } from '@/lib/services/metaApi';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const adAccountId = searchParams.get('adAccountId');
    const dateStart = searchParams.get('dateStart') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dateStop = searchParams.get('dateStop') || new Date().toISOString().split('T')[0];

    if (!adAccountId) {
      return NextResponse.json({ error: 'Ad Account ID required' }, { status: 400 });
    }

    // Get stored Meta token for user
    const { data: tokenData, error: tokenError } = await supabase
      .from('meta_tokens')
      .select('access_token, expires_at')
      .eq('user_id', userId)
      .eq('token_type', 'long_lived')
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: 'Meta account not connected' }, { status: 400 });
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Meta token expired' }, { status: 401 });
    }

    const metaToken = tokenData.access_token;

    const metaApi = createMetaApiService(metaToken);
    
    // Fetch ad spend data
    const adSpendData = await metaApi.getAdSpendData(adAccountId, dateStart, dateStop);
    
    // Fetch campaign data
    const campaignData = await metaApi.getCampaignData(adAccountId);

    // Calculate totals
    const totalSpend = adSpendData.reduce((sum, item) => sum + (item.spend || 0), 0);
    const totalImpressions = adSpendData.reduce((sum, item) => sum + (item.impressions || 0), 0);
    const totalClicks = adSpendData.reduce((sum, item) => sum + (item.clicks || 0), 0);
    const totalConversions = adSpendData.reduce((sum, item) => sum + (item.conversions || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalSpend,
          totalImpressions,
          totalClicks,
          totalConversions,
          averageCpm: totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0,
          averageCpc: totalClicks > 0 ? totalSpend / totalClicks : 0,
          ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        },
        dailyData: adSpendData,
        campaigns: campaignData,
        dateRange: {
          start: dateStart,
          end: dateStop
        }
      }
    });

  } catch (error) {
    console.error('Meta ad spend API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ad spend data' },
      { status: 500 }
    );
  }
}

