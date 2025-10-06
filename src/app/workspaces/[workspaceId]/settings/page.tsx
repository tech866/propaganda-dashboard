'use client';

// =====================================================
// Workspace Settings Page
// Task 20.5: Implement Workspace Management UI Components and Audit Logging
// =====================================================

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useRBAC } from '@/hooks/useRBAC';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Users, 
  UserPlus, 
  Shield, 
  Activity, 
  Trash2,
  Edit,
  Save,
  X,
  AlertTriangle
} from 'lucide-react';
import { 
  AdminOnly, 
  ManagerOrAdmin, 
  MemberManagement,
  WorkspaceManagement 
} from '@/components/rbac/RBACGuard';
import { WorkspaceMembersList } from '@/components/workspace/WorkspaceMembersList';
import { InviteMemberModal } from '@/components/workspace/InviteMemberModal';
import { WorkspaceAnalytics } from '@/components/workspace/WorkspaceAnalytics';
import { AuditLogs } from '@/components/workspace/AuditLogs';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  settings: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const workspaceId = params.workspaceId as string;
  
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: ''
  });
  const [showInviteModal, setShowInviteModal] = useState(false);

  // RBAC permissions
  const rbac = useRBAC({ workspaceId });

  useEffect(() => {
    if (workspaceId) {
      fetchWorkspace();
    }
  }, [workspaceId]);

  const fetchWorkspace = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workspaces/${workspaceId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch workspace');
      }

      const data = await response.json();
      setWorkspace(data.workspace);
      setEditForm({
        name: data.workspace.name,
        description: data.workspace.description || ''
      });
    } catch (error) {
      console.error('Error fetching workspace:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch workspace');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkspace = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update workspace');
      }

      const data = await response.json();
      setWorkspace(data.workspace);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating workspace:', error);
      setError(error instanceof Error ? error.message : 'Failed to update workspace');
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete workspace');
      }

      router.push('/workspaces');
    } catch (error) {
      console.error('Error deleting workspace:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete workspace');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-slate-700 rounded-lg"></div>
                <div className="h-64 bg-slate-700 rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-slate-700 rounded-lg"></div>
                <div className="h-32 bg-slate-700 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-red-900/50 border-red-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <div>
                  <h3 className="text-lg font-semibold text-red-400">Error</h3>
                  <p className="text-red-300">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-foreground">Workspace not found</h3>
              <p className="text-muted-foreground">The workspace you're looking for doesn't exist or you don't have access to it.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Workspace Settings</h1>
            <p className="text-muted-foreground">Manage your workspace configuration and members</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-slate-600 text-foreground">
              {rbac.userRole}
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="general" className="data-[state=active]:bg-primary">
              <Settings className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="members" className="data-[state=active]:bg-primary">
              <Users className="w-4 h-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary">
              <Activity className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-primary">
              <Shield className="w-4 h-4 mr-2" />
              Audit Logs
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-foreground">Workspace Information</CardTitle>
                      <WorkspaceManagement workspaceId={workspaceId}>
                        {isEditing ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleSaveWorkspace}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setIsEditing(false)}
                              className="border-slate-600 text-foreground"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsEditing(true)}
                            className="border-slate-600 text-foreground"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        )}
                      </WorkspaceManagement>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground">Workspace Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-slate-700/50 border-slate-600 text-foreground"
                        />
                      ) : (
                        <p className="text-foreground font-medium">{workspace.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug" className="text-foreground">Workspace Slug</Label>
                      <p className="text-muted-foreground font-mono bg-slate-700/30 px-3 py-2 rounded">
                        {workspace.slug}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-foreground">Description</Label>
                      {isEditing ? (
                        <Textarea
                          id="description"
                          value={editForm.description}
                          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                          className="bg-slate-700/50 border-slate-600 text-foreground"
                          rows={3}
                        />
                      ) : (
                        <p className="text-muted-foreground">
                          {workspace.description || 'No description provided'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground">Status</Label>
                      <Badge 
                        variant={workspace.is_active ? "default" : "destructive"}
                        className={workspace.is_active ? "bg-green-600" : "bg-red-600"}
                      >
                        {workspace.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Quick Stats */}
                <Card className="bg-slate-800/50 backdrop-blur-sm border border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-foreground">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span className="text-foreground">
                        {new Date(workspace.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span className="text-foreground">
                        {new Date(workspace.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <AdminOnly workspaceId={workspaceId}>
                  <Card className="bg-red-900/20 border-red-700">
                    <CardHeader>
                      <CardTitle className="text-red-400">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteWorkspace}
                        className="w-full bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Workspace
                      </Button>
                    </CardContent>
                  </Card>
                </AdminOnly>
              </div>
            </div>
          </TabsContent>

          {/* Members */}
          <TabsContent value="members">
            <WorkspaceMembersList 
              workspaceId={workspaceId}
              onInviteClick={() => setShowInviteModal(true)}
            />
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <WorkspaceAnalytics workspaceId={workspaceId} />
          </TabsContent>

          {/* Audit Logs */}
          <TabsContent value="audit">
            <AuditLogs workspaceId={workspaceId} />
          </TabsContent>
        </Tabs>

        {/* Invite Member Modal */}
        {showInviteModal && (
          <InviteMemberModal
            workspaceId={workspaceId}
            onClose={() => setShowInviteModal(false)}
            onSuccess={() => {
              setShowInviteModal(false);
              // Refresh members list if needed
            }}
          />
        )}
      </div>
    </div>
  );
}
