// Meta OAuth Authentication API Route
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.json({ error: 'Authorization code required' }, { status: 400 });
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${process.env.META_APP_ID}&` +
      `client_secret=${process.env.META_APP_SECRET}&` +
      `redirect_uri=${process.env.META_REDIRECT_URI}&` +
      `code=${code}`
    );

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;

    // Exchange short-lived token for long-lived token
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${process.env.META_APP_ID}&` +
      `client_secret=${process.env.META_APP_SECRET}&` +
      `fb_exchange_token=${access_token}`
    );

    if (!longLivedResponse.ok) {
      throw new Error('Failed to exchange for long-lived token');
    }

    const longLivedData = await longLivedResponse.json();
    const longLivedToken = longLivedData.access_token;

    // Store the token in database
    const { error: insertError } = await supabase
      .from('meta_tokens')
      .upsert({
        user_id: userId,
        access_token: longLivedToken,
        token_type: 'long_lived',
        expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error storing Meta token:', insertError);
      throw new Error('Failed to store Meta token');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Meta account connected successfully',
      token: longLivedToken // In production, don't return the token
    });

  } catch (error) {
    console.error('Meta auth error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate with Meta' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate OAuth URL for Meta authentication
    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    authUrl.searchParams.set('client_id', process.env.META_APP_ID!);
    authUrl.searchParams.set('redirect_uri', process.env.META_REDIRECT_URI!);
    authUrl.searchParams.set('scope', 'ads_read,ads_management,business_management');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', userId); // Use user ID as state

    return NextResponse.json({ 
      authUrl: authUrl.toString() 
    });

  } catch (error) {
    console.error('Meta auth URL generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}

