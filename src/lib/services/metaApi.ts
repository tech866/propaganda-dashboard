// Meta Marketing API Service
import { NextRequest } from 'next/server';

interface MetaAdAccount {
  id: string;
  name: string;
  account_status: number;
  currency: string;
  timezone_name: string;
}

interface MetaAdSpendData {
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

interface MetaCampaignData {
  id: string;
  name: string;
  status: string;
  objective: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export class MetaApiService {
  private baseUrl = 'https://graph.facebook.com/v18.0';
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // Get client's ad accounts
  async getAdAccounts(): Promise<MetaAdAccount[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/me/adaccounts?fields=id,name,account_status,currency,timezone_name&access_token=${this.accessToken}`
      );
      
      if (!response.ok) {
        throw new Error(`Meta API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching ad accounts:', error);
      throw error;
    }
  }

  // Get ad spend data for a specific date range
  async getAdSpendData(
    adAccountId: string,
    dateStart: string,
    dateStop: string
  ): Promise<MetaAdSpendData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${adAccountId}/insights?` +
        `fields=spend,impressions,clicks,conversions,cpm,cpc,ctr&` +
        `date_preset=last_30d&` +
        `time_range={'since':'${dateStart}','until':'${dateStop}'}&` +
        `access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Meta API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching ad spend data:', error);
      throw error;
    }
  }

  // Get campaign performance data
  async getCampaignData(adAccountId: string): Promise<MetaCampaignData[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${adAccountId}/campaigns?` +
        `fields=id,name,status,objective,spend,impressions,clicks,conversions&` +
        `access_token=${this.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Meta API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching campaign data:', error);
      throw error;
    }
  }

  // Exchange short-lived token for long-lived token
  async exchangeForLongLivedToken(shortLivedToken: string): Promise<string> {
    try {
      const response = await fetch(
        `${this.baseUrl}/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${process.env.META_APP_ID}&` +
        `client_secret=${process.env.META_APP_SECRET}&` +
        `fb_exchange_token=${shortLivedToken}`
      );

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error exchanging token:', error);
      throw error;
    }
  }
}

// Utility function to create Meta API service instance
export function createMetaApiService(accessToken: string): MetaApiService {
  return new MetaApiService(accessToken);
}

