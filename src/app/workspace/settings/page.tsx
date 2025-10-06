'use client';

import React from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useRBAC } from '@/hooks/useRBAC';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Users, Shield, Building2 } from 'lucide-react';
import TeamManagement from '@/components/workspace/TeamManagement';
import WorkspaceSwitcher from '@/components/workspace/WorkspaceSwitcher';
import WorkspaceCreation from '@/components/workspace/WorkspaceCreation';

export default function WorkspaceSettingsPage() {
  const { currentWorkspace } = useWorkspace();
  const { checkPermission } = useRBAC({ workspaceId: currentWorkspace?.id });

  const canManageMembers = checkPermission('workspace:members:manage');
  const canManageWorkspace = checkPermission('workspace:manage');

  if (!currentWorkspace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle className="text-foreground">No Workspace Selected</CardTitle>
            <CardDescription>
              Please select a workspace to access settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorkspaceSwitcher />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workspace Settings</h1>
          <p className="text-muted-foreground">
            Manage your workspace settings and team members
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Team</span>
            </TabsTrigger>
            <TabsTrigger value="workspaces" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Workspaces</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Permissions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Workspace Information</CardTitle>
                  <CardDescription>
                    Basic information about your current workspace
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-foreground">{currentWorkspace.name}</p>
                  </div>
                  {currentWorkspace.description && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Description</label>
                      <p className="text-foreground">{currentWorkspace.description}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Your Role</label>
                    <p className="text-foreground capitalize">{currentWorkspace.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p className="text-foreground">
                      {new Date(currentWorkspace.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common workspace management tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {canManageMembers && (
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium text-foreground">Team Management</h4>
                      <p className="text-sm text-muted-foreground">
                        Invite team members and manage roles
                      </p>
                    </div>
                  )}
                  {canManageWorkspace && (
                    <div className="p-3 border rounded-lg">
                      <h4 className="font-medium text-foreground">Workspace Settings</h4>
                      <p className="text-sm text-muted-foreground">
                        Update workspace information and preferences
                      </p>
                    </div>
                  )}
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-foreground">Switch Workspace</h4>
                    <p className="text-sm text-muted-foreground">
                      Change to a different workspace
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            {canManageMembers ? (
              <TeamManagement />
            ) : (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  You don't have permission to manage team members. Contact your workspace administrator for access.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="workspaces" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Switch Workspace</CardTitle>
                  <CardDescription>
                    Select a different workspace to work in
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WorkspaceSwitcher showCreateButton={false} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Create New Workspace</CardTitle>
                  <CardDescription>
                    Set up a new workspace for your team or client
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WorkspaceCreation />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Permissions</CardTitle>
                <CardDescription>
                  View your current permissions in this workspace
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Role: {currentWorkspace.role}</h4>
                    <p className="text-sm text-muted-foreground">
                      Your role determines what actions you can perform in this workspace.
                    </p>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <h5 className="font-medium text-foreground">Available Permissions</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${checkPermission('calls:view') ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          <span>View calls and analytics</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${checkPermission('calls:update') ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          <span>Update calls and pipeline</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${checkPermission('analytics:view') ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          <span>View analytics dashboard</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${checkPermission('workspace:members:manage') ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          <span>Manage team members</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${checkPermission('workspace:manage') ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          <span>Manage workspace settings</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
