'use client';

import React, { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  Users, 
  Settings, 
  ChevronRight, 
  Crown,
  Shield,
  User,
  Eye,
  Briefcase
} from 'lucide-react';
import { WorkspaceRole } from '@/lib/types/workspace';

interface Workspace {
  id: string;
  name: string;
  description?: string;
  role: WorkspaceRole;
  member_count: number;
  created_at: string;
}

interface WorkspaceSwitcherProps {
  onWorkspaceSelect?: (workspace: Workspace) => void;
  showCreateButton?: boolean;
}

export default function WorkspaceSwitcher({ 
  onWorkspaceSelect, 
  showCreateButton = true 
}: WorkspaceSwitcherProps) {
  const { workspaces, currentWorkspace, switchWorkspace, loading, error } = useWorkspace();
  const [switching, setSwitching] = useState<string | null>(null);

  const handleWorkspaceSwitch = async (workspace: Workspace) => {
    try {
      setSwitching(workspace.id);
      await switchWorkspace(workspace.id);
      onWorkspaceSelect?.(workspace);
    } catch (err) {
      console.error('Error switching workspace:', err);
    } finally {
      setSwitching(null);
    }
  };

  const getRoleIcon = (role: WorkspaceRole) => {
    const icons: Record<WorkspaceRole, React.ReactNode> = {
      admin: <Crown className="h-4 w-4" />,
      manager: <Shield className="h-4 w-4" />,
      sales: <User className="h-4 w-4" />,
      client: <Briefcase className="h-4 w-4" />,
      viewer: <Eye className="h-4 w-4" />,
    };
    return icons[role] || <User className="h-4 w-4" />;
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Select Workspace
          </CardTitle>
          <CardDescription>
            Choose a workspace to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading workspaces...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Select Workspace
          </CardTitle>
          <CardDescription>
            Choose a workspace to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            No Workspaces Found
          </CardTitle>
          <CardDescription>
            You don't have access to any workspaces yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              You haven't been added to any workspaces yet. Create a new workspace or ask someone to invite you.
            </p>
            {showCreateButton && (
              <Button>
                <Building2 className="h-4 w-4 mr-2" />
                Create Your First Workspace
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="h-5 w-5 mr-2" />
          Select Workspace
        </CardTitle>
        <CardDescription>
          Choose a workspace to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                currentWorkspace?.id === workspace.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border'
              }`}
              onClick={() => handleWorkspaceSwitch(workspace)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-foreground">{workspace.name}</h3>
                    {currentWorkspace?.id === workspace.id && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  
                  {workspace.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {workspace.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      {getRoleIcon(workspace.role)}
                      <span>{formatRoleName(workspace.role)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{workspace.member_count} member{workspace.member_count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={getRoleColor(workspace.role)}>
                    {formatRoleName(workspace.role)}
                  </Badge>
                  {switching === workspace.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {showCreateButton && (
          <div className="mt-6 pt-4 border-t">
            <Button variant="outline" className="w-full">
              <Building2 className="h-4 w-4 mr-2" />
              Create New Workspace
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}



