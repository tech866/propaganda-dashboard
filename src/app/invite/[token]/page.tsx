'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, Mail, Users, Shield } from 'lucide-react';

interface Invitation {
  id: string;
  workspace_id: string;
  email: string;
  role: string;
  invited_by: string;
  expires_at: string;
  workspaces: {
    name: string;
  };
  users: {
    name: string;
  };
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn, user } = useAuth();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const token = params.token as string;

  useEffect(() => {
    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const fetchInvitation = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/invitations/${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch invitation');
      }

      setInvitation(data.invitation);
    } catch (err) {
      console.error('Error fetching invitation:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!isSignedIn) {
      router.push(`/auth/signin?redirect_url=${encodeURIComponent(window.location.href)}`);
      return;
    }

    try {
      setAccepting(true);
      setError(null);

      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation');
      }

      setSuccess(true);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  const formatRoleName = (role: string) => {
    const roleNames: Record<string, string> = {
      admin: 'Administrator',
      manager: 'Manager',
      sales: 'Sales Representative',
      client: 'Client',
      viewer: 'Viewer',
    };
    return roleNames[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      sales: 'bg-green-100 text-green-800',
      client: 'bg-purple-100 text-purple-800',
      viewer: 'bg-gray-100 text-gray-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-foreground">Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => router.push('/')}
              className="w-full"
            >
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-foreground">Welcome to the Team!</CardTitle>
            <CardDescription>
              You've successfully joined {invitation?.workspaces.name}. Redirecting to your dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-foreground">Invitation Not Found</CardTitle>
            <CardDescription>The invitation you're looking for doesn't exist or has expired.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => router.push('/')}
              className="w-full"
            >
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(invitation.expires_at) < new Date();
  const userEmail = user?.emailAddresses[0]?.emailAddress;
  const emailMatches = userEmail?.toLowerCase() === invitation.email.toLowerCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Users className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle className="text-foreground">You're Invited!</CardTitle>
          <CardDescription>
            Join {invitation.workspaces.name} on Propaganda Dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Invited to:</span>
              <span className="text-sm font-medium">{invitation.email}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Role:</span>
              <Badge className={getRoleColor(invitation.role)}>
                {formatRoleName(invitation.role)}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Expires:</span>
              <span className="text-sm font-medium">
                {new Date(invitation.expires_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {isExpired && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                This invitation has expired. Please contact the workspace administrator for a new invitation.
              </AlertDescription>
            </Alert>
          )}

          {!isSignedIn && !isExpired && (
            <Alert>
              <AlertDescription>
                You need to sign in to accept this invitation. Your email must match the invitation email.
              </AlertDescription>
            </Alert>
          )}

          {isSignedIn && !emailMatches && !isExpired && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Your account email ({userEmail}) doesn't match the invitation email ({invitation.email}). 
                Please sign in with the correct account or contact the workspace administrator.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {!isSignedIn ? (
              <Button 
                onClick={() => router.push(`/auth/signin?redirect_url=${encodeURIComponent(window.location.href)}`)}
                className="w-full"
              >
                Sign In to Accept
              </Button>
            ) : !emailMatches ? (
              <Button 
                onClick={() => router.push(`/auth/signin?redirect_url=${encodeURIComponent(window.location.href)}`)}
                variant="outline"
                className="w-full"
              >
                Switch Account
              </Button>
            ) : isExpired ? (
              <Button disabled className="w-full">
                Invitation Expired
              </Button>
            ) : (
              <Button 
                onClick={handleAcceptInvitation}
                disabled={accepting}
                className="w-full"
              >
                {accepting ? 'Accepting...' : 'Accept Invitation'}
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



