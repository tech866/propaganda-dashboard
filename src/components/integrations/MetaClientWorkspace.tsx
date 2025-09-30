"use client";

import React, { useState, useEffect } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Facebook, 
  Instagram, 
  DollarSign, 
  Eye, 
  MousePointer, 
  Target,
  TrendingUp,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

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

interface MetaClientWorkspaceProps {
  className?: string;
}

export function MetaClientWorkspace({ className }: MetaClientWorkspaceProps) {
  const { user } = useRole();
  const [adAccounts, setAdAccounts] = useState<MetaAdAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [adSpendData, setAdSpendData] = useState<MetaAdSpendData[]>([]);
  const [campaignData, setCampaignData] = useState<MetaCampaignData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30'); // days

  // Load ad accounts on mount
  useEffect(() => {
    loadAdAccounts();
  }, []);

  // Load data when account or date range changes
  useEffect(() => {
    if (selectedAccount) {
      loadAccountData();
    }
  }, [selectedAccount, dateRange]);

  const loadAdAccounts = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/meta/status');
      if (response.ok) {
        const data = await response.json();
        if (data.connected && data.adAccounts) {
          setAdAccounts(data.adAccounts);
          if (data.adAccounts.length > 0) {
            setSelectedAccount(data.adAccounts[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Error loading ad accounts:', error);
      setError('Failed to load ad accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAccountData = async () => {
    if (!selectedAccount || !user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetch(
        `/api/meta/ad-spend?adAccountId=${selectedAccount}&dateStart=${startDate}&dateStop=${endDate}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to load ad spend data');
      }
      
      const data = await response.json();
      setAdSpendData(data.adSpendData || []);
      setCampaignData(data.campaignData || []);
    } catch (error) {
      console.error('Error loading account data:', error);
      setError('Failed to load account data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Calculate totals
  const totals = adSpendData.reduce(
    (acc, item) => ({
      spend: acc.spend + (item.spend || 0),
      impressions: acc.impressions + (item.impressions || 0),
      clicks: acc.clicks + (item.clicks || 0),
      conversions: acc.conversions + (item.conversions || 0),
    }),
    { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
  );

  const selectedAccountData = adAccounts.find(acc => acc.id === selectedAccount);

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Facebook className="h-6 w-6 text-blue-600" />
              <Instagram className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Meta Ad Performance</h2>
              <p className="text-muted-foreground">
                Real-time Facebook and Instagram ad data
              </p>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Account:</label>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select ad account" />
              </SelectTrigger>
              <SelectContent>
                {adAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({account.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Period:</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        {selectedAccountData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totals.spend, selectedAccountData.currency)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last {dateRange} days
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
                  {formatNumber(totals.impressions)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total reach
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
                  {formatNumber(totals.clicks)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total interactions
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
                  {formatNumber(totals.conversions)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total conversions
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Campaign Performance */}
        {campaignData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>
                Top performing campaigns for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaignData.slice(0, 5).map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{campaign.name}</h4>
                        <Badge variant={campaign.status === 'ACTIVE' ? 'success' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {campaign.objective}
                      </p>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(campaign.spend, selectedAccountData?.currency)}
                        </div>
                        <div className="text-muted-foreground">Spend</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatNumber(campaign.impressions)}
                        </div>
                        <div className="text-muted-foreground">Impressions</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatNumber(campaign.clicks)}
                        </div>
                        <div className="text-muted-foreground">Clicks</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatNumber(campaign.conversions)}
                        </div>
                        <div className="text-muted-foreground">Conversions</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading Meta data...</span>
          </div>
        )}
      </div>
    </div>
  );
}
