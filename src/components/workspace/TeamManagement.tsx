'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useRBAC } from '@/hooks/useRBAC';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MoreHorizontal,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { WorkspaceRole } from '@/lib/types/workspace';

interface WorkspaceMember {
  id: string;
  user_id: string;
  role: WorkspaceRole;
  joined_at: string;
  users: {
    name: string;
    email: string;
  };
}

interface WorkspaceInvitation {
  id: string;
  email: string;
  role: WorkspaceRole;
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  users: {
    name: string;
  };
}

export default function TeamManagement() {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { checkPermission } = useRBAC({ workspaceId: currentWorkspace?.id });
  
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('viewer');
  const [inviteLoading, setInviteLoading] = useState(false);

  const canManageMembers = checkPermission('workspace:members:manage');

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchTeamData();
    }
  }, [currentWorkspace?.id]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch members and invitations in parallel
      const [membersResponse, invitationsResponse] = await Promise.all([
        fetch(`/api/workspaces/${currentWorkspace?.id}/members`),
        fetch(`/api/workspaces/${currentWorkspace?.id}/invitations`)
      ]);

      if (!membersResponse.ok) {
        throw new Error('Failed to fetch team members');
      }

      if (!invitationsResponse.ok) {
        throw new Error('Failed to fetch invitations');
      }

      const [membersData, invitationsData] = await Promise.all([
        membersResponse.json(),
        invitationsResponse.json()
      ]);

      setMembers(membersData.members || []);
      setInvitations(invitationsData.invitations || []);
    } catch (err) {
      console.error('Error fetching team data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch team data');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail || !inviteRole) {
      setError('Email and role are required');
      return;
    }

    try {
      setInviteLoading(true);
      setError(null);

      const response = await fetch(`/api/workspaces/${currentWorkspace?.id}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation');
      }

      // Refresh invitations list
      await fetchTeamData();
      
      // Reset form
      setInviteEmail('');
      setInviteRole('viewer');
      setInviteDialogOpen(false);
    } catch (err) {
      console.error('Error sending invitation:', err);
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace?.id}/invitations/${invitationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel invitation');
      }

      // Refresh invitations list
      await fetchTeamData();
    } catch (err) {
      console.error('Error canceling invitation:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel invitation');
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/workspaces/${currentWorkspace?.id}/invitations/${invitationId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resend invitation');
      }

      // Show success message (could be a toast notification)
      console.log('Invitation resent successfully');
    } catch (err) {
      console.error('Error resending invitation:', err);
      setError(err instanceof Error ? err.message : 'Failed to resend invitation');
    }
  };

  const formatRoleName = (role: WorkspaceRole) => {
    const roleNames: Record<WorkspaceRole, string> = {
      admin: 'Administrator',
      manager: 'Manager',
      sales: 'Sales Representative',
      client: 'Client',
      viewer: 'Viewer',
    };
    return roleNames[role] || role;
  };

  const getRoleColor = (role: WorkspaceRole) => {
    const colors: Record<WorkspaceRole, string> = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      sales: 'bg-green-100 text-green-800',
      client: 'bg-purple-100 text-purple-800',
      viewer: 'bg-gray-100 text-gray-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const isInvitationExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Team Management</h2>
            <p className="text-muted-foreground">Manage workspace members and invitations</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading team data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Team Management</h2>
          <p className="text-muted-foreground">Manage workspace members and invitations</p>
        </div>
        {canManageMembers && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join {currentWorkspace?.name}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInviteMember} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(value: WorkspaceRole) => setInviteRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="sales">Sales Representative</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {error && (
                  <Alert>
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={inviteLoading}>
                    {inviteLoading ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {error && (
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Team Members ({members.length})
            </CardTitle>
            <CardDescription>
              Current workspace members
            </CardDescription>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No team members found
              </p>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{member.users.name}</div>
                      <div className="text-sm text-muted-foreground">{member.users.email}</div>
                      <div className="text-xs text-muted-foreground">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge className={getRoleColor(member.role)}>
                      {formatRoleName(member.role)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Pending Invitations ({invitations.filter(inv => !inv.accepted_at).length})
            </CardTitle>
            <CardDescription>
              Invitations waiting for acceptance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invitations.filter(inv => !inv.accepted_at).length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No pending invitations
              </p>
            ) : (
              <div className="space-y-3">
                {invitations
                  .filter(inv => !inv.accepted_at)
                  .map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{invitation.email}</div>
                        <div className="text-sm text-muted-foreground">
                          Invited by {invitation.users.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isInvitationExpired(invitation.expires_at) ? (
                            <span className="text-red-600">Expired</span>
                          ) : (
                            `Expires ${new Date(invitation.expires_at).toLocaleDateString()}`
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getRoleColor(invitation.role)}>
                          {formatRoleName(invitation.role)}
                        </Badge>
                        {canManageMembers && (
                          <div className="flex space-x-1">
                            {!isInvitationExpired(invitation.expires_at) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResendInvitation(invitation.id)}
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelInvitation(invitation.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



