'use client';

// =====================================================
// Workspace Members List Component
// Task 20.5: Implement Workspace Management UI Components and Audit Logging
// =====================================================

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  MoreVertical, 
  Mail, 
  Calendar,
  Shield,
  Trash2,
  Edit,
  UserX
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MemberManagement,
  AdminOnly 
} from '@/components/rbac/RBACGuard';
import { WorkspaceMembership, WorkspaceRole } from '@/lib/types/workspace';

interface WorkspaceMembersListProps {
  workspaceId: string;
  onInviteClick: () => void;
}

interface Member extends WorkspaceMembership {
  user_name: string;
  user_email: string;
  invited_by_name?: string;
}

export function WorkspaceMembersList({ workspaceId, onInviteClick }: WorkspaceMembersListProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, [workspaceId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workspaces/${workspaceId}/members`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }

      const data = await response.json();
      setMembers(data.members);
    } catch (error) {
      console.error('Error fetching members:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (membershipId: string, newRole: WorkspaceRole) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members/${membershipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      // Refresh members list
      fetchMembers();
    } catch (error) {
      console.error('Error updating role:', error);
      setError(error instanceof Error ? error.message : 'Failed to update role');
    }
  };

  const handleRemoveMember = async (membershipId: string, userName: string) => {
    if (!confirm(`Are you sure you want to remove ${userName} from this workspace?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members/${membershipId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove member');
      }

      // Refresh members list
      fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove member');
    }
  };

  const getRoleColor = (role: WorkspaceRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-600 text-white';
      case 'manager':
        return 'bg-blue-600 text-white';
      case 'sales_rep':
        return 'bg-green-600 text-white';
      case 'client':
        return 'bg-purple-600 text-white';
      case 'viewer':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-600 text-white';
      case 'pending':
        return 'bg-yellow-600 text-white';
      case 'suspended':
        return 'bg-red-600 text-white';
      case 'removed':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Users className="w-5 h-5" />
            Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-700 rounded w-1/3"></div>
                </div>
                <div className="h-6 bg-slate-700 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Users className="w-5 h-5" />
            Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <Button 
              onClick={fetchMembers}
              variant="outline"
              className="border-slate-600 text-foreground"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Users className="w-5 h-5" />
            Members ({members.length})
          </CardTitle>
          <MemberManagement workspaceId={workspaceId}>
            <Button
              onClick={onInviteClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </MemberManagement>
        </div>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No members yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your team by inviting members to this workspace.
            </p>
            <MemberManagement workspaceId={workspaceId}>
              <Button
                onClick={onInviteClick}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invite First Member
              </Button>
            </MemberManagement>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold">
                      {member.user_name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{member.user_name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {member.user_email}
                    </div>
                    {member.invited_by_name && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        Invited by {member.invited_by_name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={getRoleColor(member.role)}>
                    {member.role.replace('_', ' ')}
                  </Badge>
                  
                  <Badge className={getStatusColor(member.status)}>
                    {member.status}
                  </Badge>

                  <MemberManagement workspaceId={workspaceId}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                        <DropdownMenuItem
                          onClick={() => handleUpdateRole(member.id, 'admin')}
                          disabled={member.role === 'admin'}
                          className="text-foreground hover:bg-slate-700"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateRole(member.id, 'manager')}
                          disabled={member.role === 'manager'}
                          className="text-foreground hover:bg-slate-700"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Make Manager
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateRole(member.id, 'sales_rep')}
                          disabled={member.role === 'sales_rep'}
                          className="text-foreground hover:bg-slate-700"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Make Sales Rep
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateRole(member.id, 'viewer')}
                          disabled={member.role === 'viewer'}
                          className="text-foreground hover:bg-slate-700"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Make Viewer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-600" />
                        <AdminOnly workspaceId={workspaceId}>
                          <DropdownMenuItem
                            onClick={() => handleRemoveMember(member.id, member.user_name)}
                            className="text-red-400 hover:bg-red-900/20"
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Remove Member
                          </DropdownMenuItem>
                        </AdminOnly>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </MemberManagement>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
