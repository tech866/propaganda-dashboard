// Client Workspace Page
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Eye, 
  MousePointer, 
  Target,
  Calendar,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

interface ClientData {
  id: string;
  name: string;
  email: string;
  metaConnected: boolean;
  adAccounts: Array<{
    id: string;
    name: string;
    currency: string;
    status: string;
  }>;
}

interface AdSpendData {
  summary: {
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    averageCpm: number;
    averageCpc: number;
    ctr: number;
  };
  dailyData: Array<{
    date_start: string;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
  }>;
  campaigns: Array<{
    id: string;
    name: string;
    status: string;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
  }>;
}

export default function ClientWorkspace() {
  const params = useParams();
  const clientId = params.clientId as string;
  
  const [client, setClient] = useState<ClientData | null>(null);
  const [adSpendData, setAdSpendData] = useState<AdSpendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAdAccount, setSelectedAdAccount] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  useEffect(() => {
    if (selectedAdAccount) {
      fetchAdSpendData();
    }
  }, [selectedAdAccount, dateRange]);

  const fetchClientData = async () => {
    try {
      // This would fetch from your actual API
      const mockClient: ClientData = {
        id: clientId,
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        metaConnected: true,
        adAccounts: [
          {
            id: 'act_123456789',
            name: 'Acme Corp - Main Account',
            currency: 'USD',
            status: 'ACTIVE'
          }
        ]
      };
      setClient(mockClient);
      if (mockClient.adAccounts.length > 0) {
        setSelectedAdAccount(mockClient.adAccounts[0].id);
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdSpendData = async () => {
    if (!selectedAdAccount) return;
    
    setRefreshing(true);
    try {
      const response = await fetch(
        `/api/meta/ad-spend?adAccountId=${selectedAdAccount}&dateStart=${dateRange.start}&dateStop=${dateRange.end}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setAdSpendData(data.data);
      }
    } catch (error) {
      console.error('Error fetching ad spend data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const connectMetaAccount = async () => {
    try {
      const response = await fetch('/api/meta/auth', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Error connecting Meta account:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p>Client not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Client Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-muted-foreground">{client.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {client.metaConnected ? (
            <Badge variant="default" className="bg-green-600">
              Meta Connected
            </Badge>
          ) : (
            <Button onClick={connectMetaAccount} variant="outline">
              Connect Meta Account
            </Button>
          )}
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
            <Button 
              onClick={fetchAdSpendData} 
              disabled={refreshing}
              variant="outline"
              className="mt-6"
            >
              {refreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ad Spend Summary */}
      {adSpendData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${adSpendData.summary.totalSpend.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impressions</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adSpendData.summary.totalImpressions.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                CPM: ${adSpendData.summary.averageCpm.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clicks</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adSpendData.summary.totalClicks.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                CPC: ${adSpendData.summary.averageCpc.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {adSpendData.summary.totalConversions.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                CTR: {adSpendData.summary.ctr.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaign Performance */}
      {adSpendData && adSpendData.campaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>
              Performance metrics for active campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {adSpendData.campaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-medium">{campaign.name}</h3>
                      <p className="text-sm text-muted-foreground">ID: {campaign.id}</p>
                    </div>
                    <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <p className="font-medium">${campaign.spend.toLocaleString()}</p>
                      <p className="text-muted-foreground">Spend</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{campaign.impressions.toLocaleString()}</p>
                      <p className="text-muted-foreground">Impressions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{campaign.clicks.toLocaleString()}</p>
                      <p className="text-muted-foreground">Clicks</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{campaign.conversions.toLocaleString()}</p>
                      <p className="text-muted-foreground">Conversions</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Performance Chart */}
      {adSpendData && adSpendData.dailyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Performance</CardTitle>
            <CardDescription>
              Daily spend and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {adSpendData.dailyData.slice(-7).map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div className="font-medium">
                    {new Date(day.date_start).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <p className="font-medium">${day.spend.toFixed(2)}</p>
                      <p className="text-muted-foreground">Spend</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{day.impressions.toLocaleString()}</p>
                      <p className="text-muted-foreground">Impressions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{day.clicks.toLocaleString()}</p>
                      <p className="text-muted-foreground">Clicks</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{day.conversions.toLocaleString()}</p>
                      <p className="text-muted-foreground">Conversions</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}








