// =====================================================
// Workspace Members Management Component
// Task 20.2: Workspace Provisioning UI
// =====================================================

'use client';

import React, { useState, useEffect } from 'react';
import { WorkspaceMembership, WorkspaceRole } from '@/lib/types/workspace';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface WorkspaceMembersProps {
  workspaceId: string;
}

export function WorkspaceMembers({ workspaceId }: WorkspaceMembersProps) {
  const { hasPermission } = useWorkspace();
  const [members, setMembers] = useState<WorkspaceMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);

  const canInvite = hasPermission('members:invite');
  const canManageRoles = hasPermission('members:manage_roles');
  const canRemoveMembers = hasPermission('members:remove');

  // Load workspace members
  useEffect(() => {
    loadMembers();
  }, [workspaceId]);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/workspaces/${workspaceId}/members`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load members');
      }

      setMembers(result.data);
    } catch (error) {
      console.error('Error loading members:', error);
      setError(error instanceof Error ? error.message : 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (membershipId: string, newRole: WorkspaceRole) => {
    if (!canManageRoles) return;

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members/${membershipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update role');
      }

      // Reload members
      loadMembers();
    } catch (error) {
      console.error('Error updating role:', error);
      setError(error instanceof Error ? error.message : 'Failed to update role');
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    if (!canRemoveMembers) return;

    if (!confirm('Are you sure you want to remove this member from the workspace?')) {
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members/${membershipId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to remove member');
      }

      // Reload members
      loadMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove member');
    }
  };

  const getRoleBadgeColor = (role: WorkspaceRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-900/30 text-red-400 border border-red-700/50';
      case 'manager':
        return 'bg-blue-900/30 text-blue-400 border border-blue-700/50';
      case 'sales_rep':
        return 'bg-green-900/30 text-green-400 border border-green-700/50';
      case 'client':
        return 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50';
      case 'viewer':
        return 'bg-slate-700/50 text-slate-300 border border-slate-600/50';
      default:
        return 'bg-slate-700/50 text-slate-300 border border-slate-600/50';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-900/30 text-green-400 border border-green-700/50';
      case 'pending':
        return 'bg-yellow-900/30 text-yellow-400 border border-yellow-700/50';
      case 'suspended':
        return 'bg-red-900/30 text-red-400 border border-red-700/50';
      case 'removed':
        return 'bg-slate-700/50 text-slate-300 border border-slate-600/50';
      default:
        return 'bg-slate-700/50 text-slate-300 border border-slate-600/50';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">Loading members...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Workspace Members</h2>
          <p className="text-muted-foreground">Manage team members and their roles</p>
        </div>
        
        {canInvite && (
          <button
            onClick={() => setShowInviteForm(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          >
            Invite Member
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {members.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No members found in this workspace.</p>
          {canInvite && (
            <button
              onClick={() => setShowInviteForm(true)}
              className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            >
              Invite Your First Member
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {(member as any).user_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-foreground">
                      {(member as any).user_name || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {(member as any).user_email || 'No email'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(member.status)}`}>
                    {member.status}
                  </span>
                  
                  {canManageRoles ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value as WorkspaceRole)}
                      className="bg-slate-700/50 border border-slate-600 text-foreground rounded-lg px-3 py-1 text-sm"
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="sales_rep">Sales Rep</option>
                      <option value="client">Client</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                      {member.role.replace('_', ' ')}
                    </span>
                  )}

                  {canRemoveMembers && member.status === 'active' && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Remove member"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showInviteForm && (
        <InviteMemberForm
          workspaceId={workspaceId}
          onClose={() => setShowInviteForm(false)}
          onSuccess={() => {
            setShowInviteForm(false);
            loadMembers();
          }}
        />
      )}
    </div>
  );
}

// =====================================================
// Invite Member Form Component
// =====================================================

interface InviteMemberFormProps {
  workspaceId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function InviteMemberForm({ workspaceId, onClose, onSuccess }: InviteMemberFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    role: 'viewer' as WorkspaceRole,
    expires_in_hours: 168
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send invitation');
      }

      onSuccess();
    } catch (error) {
      console.error('Error sending invitation:', error);
      setError(error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Invite Team Member</h3>
        
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-700/50 border border-slate-600 text-foreground rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter email address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as WorkspaceRole })}
              className="w-full bg-slate-700/50 border border-slate-600 text-foreground rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="viewer">Viewer</option>
              <option value="client">Client</option>
              <option value="sales_rep">Sales Rep</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Expires In (hours)
            </label>
            <input
              type="number"
              min="1"
              max="720"
              value={formData.expires_in_hours}
              onChange={(e) => setFormData({ ...formData, expires_in_hours: parseInt(e.target.value) })}
              className="w-full bg-slate-700/50 border border-slate-600 text-foreground rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="168 (7 days)"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
