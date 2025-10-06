// =====================================================
// Workspace Dashboard Page
// Task 20.2: Workspace Provisioning UI
// =====================================================

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WorkspaceService } from '@/lib/services/workspaceService';
import { auth } from '@clerk/nextjs/server';
import { WorkspaceSwitcher } from '@/contexts/WorkspaceContext';
import Link from 'next/link';

interface WorkspaceDashboardPageProps {
  params: {
    workspaceSlug: string;
  };
}

export async function generateMetadata({ params }: WorkspaceDashboardPageProps): Promise<Metadata> {
  const { workspaceSlug } = await params;
  return {
    title: `${workspaceSlug} Dashboard | Propaganda Dashboard`,
    description: 'Your workspace dashboard',
  };
}

export default async function WorkspaceDashboardPage({ params }: WorkspaceDashboardPageProps) {
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

    // Get workspace analytics
    const analytics = await WorkspaceService.getWorkspaceAnalytics(workspace.id);

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{workspace.name}</h1>
                <p className="text-muted-foreground">Welcome to your workspace dashboard</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <WorkspaceSwitcher />
                <Link
                  href={`/workspace/${workspace.slug}/settings`}
                  className="bg-slate-700 hover:bg-slate-600 text-foreground px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                >
                  Settings
                </Link>
              </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Members</h3>
                <p className="text-2xl font-bold text-foreground">{analytics.total_members}</p>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Calls</h3>
                <p className="text-2xl font-bold text-foreground">{analytics.total_calls}</p>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Completed Calls</h3>
                <p className="text-2xl font-bold text-foreground">{analytics.completed_calls}</p>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Revenue</h3>
                <p className="text-2xl font-bold text-foreground">${analytics.total_revenue.toLocaleString()}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Link
                href={`/workspace/${workspace.slug}/calls/new`}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:bg-slate-700/50 transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Log New Call</h3>
                    <p className="text-sm text-muted-foreground">Record a new sales call</p>
                  </div>
                </div>
              </Link>

              <Link
                href={`/workspace/${workspace.slug}/calls`}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:bg-slate-700/50 transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">View All Calls</h3>
                    <p className="text-sm text-muted-foreground">Browse call history</p>
                  </div>
                </div>
              </Link>

              <Link
                href={`/workspace/${workspace.slug}/analytics`}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 hover:bg-slate-700/50 transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Analytics</h3>
                    <p className="text-sm text-muted-foreground">View performance metrics</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent activity to display</p>
                <p className="text-sm text-muted-foreground mt-2">Activity will appear here as you use the workspace</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading workspace dashboard:', error);
    notFound();
  }
}
