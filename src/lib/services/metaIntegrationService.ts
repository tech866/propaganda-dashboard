// Meta Integration Service for OAuth and token management
import { supabase } from '@/lib/supabase';
import { createMetaApiService, MetaApiService } from './metaApi';

export interface MetaToken {
  id: string;
  user_id: string;
  access_token: string;
  token_type: 'short_lived' | 'long_lived';
  expires_at: string;
  scope?: string;
  created_at: string;
  updated_at: string;
}

export interface MetaAdAccount {
  id: string;
  name: string;
  account_status: number;
  currency: string;
  timezone_name: string;
}

export interface MetaAdSpendData {
  date_start: string;
  date_stop: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpm: number;
  cpc: number;
  ctr: number;
}

export interface MetaCampaignData {
  id: string;
  name: string;
  status: string;
  objective: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export class MetaIntegrationService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Store Meta token in database
  async storeToken(
    accessToken: string,
    tokenType: 'short_lived' | 'long_lived' = 'long_lived',
    expiresAt?: Date,
    scope?: string
  ): Promise<void> {
    const expiresAtDate = expiresAt || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days default

    const { error } = await supabase
      .from('meta_tokens')
      .upsert({
        user_id: this.userId,
        access_token: accessToken,
        token_type: tokenType,
        expires_at: expiresAtDate.toISOString(),
        scope: scope,
        updated_at: new Date().toISOString()
      });

    if (error) {
      throw new Error(`Failed to store Meta token: ${error.message}`);
    }
  }

  // Get stored Meta token
  async getToken(): Promise<MetaToken | null> {
    const { data, error } = await supabase
      .from('meta_tokens')
      .select('*')
      .eq('user_id', this.userId)
      .eq('token_type', 'long_lived')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data as MetaToken;
  }

  // Check if token is valid and not expired
  async isTokenValid(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;

    const expiresAt = new Date(token.expires_at);
    const now = new Date();
    
    // Check if token expires within 7 days (refresh threshold)
    const refreshThreshold = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return expiresAt > refreshThreshold;
  }

  // Get Meta API service instance
  async getMetaApiService(): Promise<MetaApiService> {
    const token = await this.getToken();
    if (!token) {
      throw new Error('No Meta token found. Please connect your Meta account.');
    }

    if (!(await this.isTokenValid())) {
      throw new Error('Meta token expired. Please reconnect your Meta account.');
    }

    return createMetaApiService(token.access_token);
  }

  // Get user's ad accounts
  async getAdAccounts(): Promise<MetaAdAccount[]> {
    const metaApi = await this.getMetaApiService();
    return await metaApi.getAdAccounts();
  }

  // Get ad spend data for a specific account and date range
  async getAdSpendData(
    adAccountId: string,
    dateStart: string,
    dateStop: string
  ): Promise<MetaAdSpendData[]> {
    const metaApi = await this.getMetaApiService();
    return await metaApi.getAdSpendData(adAccountId, dateStart, dateStop);
  }

  // Get campaign data for a specific account
  async getCampaignData(adAccountId: string): Promise<MetaCampaignData[]> {
    const metaApi = await this.getMetaApiService();
    return await metaApi.getCampaignData(adAccountId);
  }

  // Exchange short-lived token for long-lived token
  async exchangeForLongLivedToken(shortLivedToken: string): Promise<string> {
    const metaApi = createMetaApiService(shortLivedToken);
    const longLivedToken = await metaApi.exchangeForLongLivedToken(shortLivedToken);
    
    // Store the long-lived token
    await this.storeToken(longLivedToken, 'long_lived');
    
    return longLivedToken;
  }

  // Disconnect Meta account (remove token)
  async disconnect(): Promise<void> {
    const { error } = await supabase
      .from('meta_tokens')
      .delete()
      .eq('user_id', this.userId);

    if (error) {
      throw new Error(`Failed to disconnect Meta account: ${error.message}`);
    }
  }

  // Check if user has connected Meta account
  async isConnected(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null && await this.isTokenValid();
  }
}

// Utility function to create Meta integration service instance
export function createMetaIntegrationService(userId: string): MetaIntegrationService {
  return new MetaIntegrationService(userId);
}
