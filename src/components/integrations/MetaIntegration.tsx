"use client";

import React, { useState, useEffect } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Facebook, 
  Instagram, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  Trash2
} from 'lucide-react';

interface MetaAdAccount {
  id: string;
  name: string;
  account_status: number;
  currency: string;
  timezone_name: string;
}

interface MetaIntegrationProps {
  className?: string;
}

export function MetaIntegration({ className }: MetaIntegrationProps) {
  const { user } = useRole();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [adAccounts, setAdAccounts] = useState<MetaAdAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/meta/status');
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.connected);
        if (data.connected && data.adAccounts) {
          setAdAccounts(data.adAccounts);
        }
      }
    } catch (error) {
      console.error('Error checking Meta connection status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!user?.id) return;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      // Get OAuth URL
      const response = await fetch('/api/meta/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get OAuth URL');
      }

      const { authUrl } = await response.json();
      
      // Redirect to Meta OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting to Meta:', error);
      setError('Failed to connect to Meta. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/meta/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect Meta account');
      }

      setIsConnected(false);
      setAdAccounts([]);
      setSuccess('Meta account disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting Meta account:', error);
      setError('Failed to disconnect Meta account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await checkConnectionStatus();
    setSuccess('Meta account data refreshed');
  };

  const getAccountStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge variant="success">Active</Badge>;
      case 2:
        return <Badge variant="warning">Disabled</Badge>;
      case 3:
        return <Badge variant="destructive">Unsettled</Badge>;
      case 7:
        return <Badge variant="warning">Pending Review</Badge>;
      case 8:
        return <Badge variant="destructive">Prepay</Badge>;
      case 9:
        return <Badge variant="warning">Cancelled</Badge>;
      default:
        return <Badge variant="muted">Unknown</Badge>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Facebook className="h-6 w-6 text-blue-600" />
              <Instagram className="h-6 w-6 text-pink-600" />
            </div>
            <div>
              <CardTitle>Meta Marketing API</CardTitle>
              <CardDescription>
                Connect your Facebook and Instagram ad accounts
              </CardDescription>
            </div>
          </div>
          {isConnected && (
            <Badge variant="success" className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>Connected</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {!isConnected ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your Meta account to access Facebook and Instagram ad data
            </p>
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Connect Meta Account
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Connected Ad Accounts</h4>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {adAccounts.length > 0 ? (
              <div className="space-y-2">
                {adAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h5 className="text-sm font-medium">{account.name}</h5>
                        {getAccountStatusBadge(account.account_status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ID: {account.id} • {account.currency} • {account.timezone_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No ad accounts found. Make sure your Meta account has ad accounts.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
