// =====================================================
// Workspace Settings Page
// Task 20.2: Workspace Provisioning UI
// =====================================================

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WorkspaceSettingsForm } from '@/components/workspace/WorkspaceSettingsForm';
import { WorkspaceMembers } from '@/components/workspace/WorkspaceMembers';
import { WorkspaceService } from '@/lib/services/workspaceService';
import { auth } from '@clerk/nextjs/server';

interface WorkspaceSettingsPageProps {
  params: {
    workspaceSlug: string;
  };
}

export async function generateMetadata({ params }: WorkspaceSettingsPageProps): Promise<Metadata> {
  const { workspaceSlug } = await params;
  return {
    title: `Workspace Settings | ${workspaceSlug} | Propaganda Dashboard`,
    description: 'Manage your workspace settings and team members',
  };
}

export default async function WorkspaceSettingsPage({ params }: WorkspaceSettingsPageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    notFound();
  }

  try {
    // Get workspace by slug
    const workspace = await WorkspaceService.getWorkspaceBySlug(params.workspaceSlug);
    
    // Check if user has access to workspace
    const access = await WorkspaceService.checkWorkspaceAccess(workspace.id, userId);
    if (!access.hasAccess) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Workspace Settings</h1>
              <p className="text-muted-foreground">Manage your workspace settings and team members</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <WorkspaceSettingsForm workspace={workspace} />
              </div>
              
              <div>
                <WorkspaceMembers workspaceId={workspace.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading workspace settings:', error);
    notFound();
  }
}
